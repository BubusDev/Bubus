import { OrderPaymentStatus, type Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import {
  STRIPE_CURRENCY,
  fromStripeAmount,
  getStripeMinimumAmount,
  isStripeAmountBelowMinimum,
  normalizeStoredPrice,
  toStripeAmount,
} from "@/lib/catalog";
import { getAvailableToSell, InsufficientStockError, applyCompletedOrderInventory } from "@/lib/inventory";
import { getStripe } from "@/lib/stripe";

type CheckoutCustomerInput = {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingMethod?: string;
  foxpostPointCode?: string | null;
};

type CheckoutCartItem = {
  productId: string;
  slug: string;
  category: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
};

type CheckoutCartSnapshot = {
  cartId: string;
  items: CheckoutCartItem[];
  subtotal: number;
  total: number;
};

export class CheckoutConfigurationError extends Error {
  constructor(message = "Stripe checkout is not configured.") {
    super(message);
    this.name = "CheckoutConfigurationError";
  }
}

export class CheckoutAmountTooLowError extends Error {
  readonly currency: string;
  readonly minimumStripeAmount: number;
  readonly requestedStripeAmount: number;

  constructor(requestedStripeAmount: number, currency = STRIPE_CURRENCY) {
    super("Checkout total is below Stripe's minimum charge amount.");
    this.name = "CheckoutAmountTooLowError";
    this.currency = currency;
    this.minimumStripeAmount = getStripeMinimumAmount(currency) ?? 0;
    this.requestedStripeAmount = normalizeStoredPrice(requestedStripeAmount);
  }
}

function createOrderNumber() {
  return `CJ-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.floor(
    1000 + Math.random() * 9000,
  )}`;
}

function sanitizeCheckoutCustomer(input: CheckoutCustomerInput) {
  return {
    shippingName: input.shippingName.trim(),
    shippingPhone: input.shippingPhone.trim(),
    shippingAddress: input.shippingAddress.trim(),
  };
}

function normalizeCheckoutPrice(amount: number) {
  return normalizeStoredPrice(amount);
}

async function getCheckoutCartSnapshot(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<CheckoutCartSnapshot> {
  const cart = await tx.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
              },
              category: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("CART_EMPTY");
  }

  const items = cart.items.map((item) => {
    const availableToSell = getAvailableToSell(item.product);
    if (availableToSell <= 0 || item.quantity > availableToSell) {
      throw new InsufficientStockError();
    }

    const coverImage =
      item.product.images.find((image) => image.isCover) ?? item.product.images[0] ?? null;

    return {
      productId: item.productId,
      slug: item.product.slug,
      category: item.product.category.slug,
      name: item.product.name,
      price: normalizeCheckoutPrice(item.product.price),
      quantity: item.quantity,
      imageUrl: coverImage?.url ?? item.product.imageUrl ?? null,
    } satisfies CheckoutCartItem;
  });

  const subtotal = normalizeCheckoutPrice(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  return {
    cartId: cart.id,
    items,
    subtotal,
    total: subtotal,
  };
}

async function upsertPendingOrderRecord(
  tx: Prisma.TransactionClient,
  userId: string,
  input: CheckoutCustomerInput & { orderId?: string | null },
) {
  const customer = sanitizeCheckoutCustomer(input);

  if (!customer.shippingName || !customer.shippingPhone || !customer.shippingAddress) {
    throw new Error("INVALID_SHIPPING");
  }

  const cart = await getCheckoutCartSnapshot(tx, userId);

  const existingOrder = input.orderId
    ? await tx.order.findFirst({
        where: {
          id: input.orderId,
          userId,
          paymentStatus: {
            in: [
              OrderPaymentStatus.PENDING,
              OrderPaymentStatus.PROCESSING,
              OrderPaymentStatus.FAILED,
              OrderPaymentStatus.CANCELED,
              OrderPaymentStatus.STOCK_UNAVAILABLE,
            ],
          },
        },
      })
    : null;

  const orderData = {
    status: "Fizetés folyamatban",
    paymentStatus: OrderPaymentStatus.PENDING,
    subtotal: cart.subtotal,
    total: cart.total,
    currency: "HUF",
    shippingName: customer.shippingName,
    shippingPhone: customer.shippingPhone,
    shippingAddress: customer.shippingAddress,
    shippingMethod: input.shippingMethod ?? "foxpost",
    foxpostPointCode: input.foxpostPointCode ?? null,
    paymentMethod: "Stripe",
    paidAt: null,
    items: {
      deleteMany: existingOrder ? {} : undefined,
      create: cart.items.map((item) => ({
        productId: item.productId,
        productName: item.name,
        productSlug: item.slug,
        imageUrl: item.imageUrl,
        unitPrice: item.price,
        quantity: item.quantity,
      })),
    },
  } satisfies Prisma.OrderUpdateInput;

  const order = existingOrder
    ? await tx.order.update({
        where: { id: existingOrder.id },
        data: orderData,
      })
    : await tx.order.create({
        data: {
          userId,
          orderNumber: createOrderNumber(),
          ...orderData,
        },
      });

  await tx.user.update({
    where: { id: userId },
    data: {
      name: customer.shippingName,
      phone: customer.shippingPhone,
      defaultShippingAddress: customer.shippingAddress,
    },
  });

  return { order, cart };
}

export async function initializeStripeCheckoutForUser(
  userId: string,
  input: CheckoutCustomerInput & { orderId?: string | null },
) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new CheckoutConfigurationError();
  }

  const stripe = getStripe();

  const { order, cart } = await db.$transaction((tx) =>
    upsertPendingOrderRecord(tx, userId, input),
  );

  const amount = toStripeAmount(cart.total, STRIPE_CURRENCY);

  if (isStripeAmountBelowMinimum(amount, STRIPE_CURRENCY)) {
    throw new CheckoutAmountTooLowError(amount, STRIPE_CURRENCY);
  }

  let paymentIntentId = order.stripePaymentIntentId ?? null;
  let clientSecret = "";

  if (paymentIntentId) {
    try {
      const updatedIntent = await stripe.paymentIntents.update(paymentIntentId, {
        amount,
        currency: STRIPE_CURRENCY,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          userId,
        },
      });

      paymentIntentId = updatedIntent.id;
      clientSecret = updatedIntent.client_secret ?? "";
    } catch {
      paymentIntentId = null;
    }
  }

  if (!paymentIntentId || !clientSecret) {
    const createdIntent = await stripe.paymentIntents.create({
      amount,
      currency: STRIPE_CURRENCY,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId,
      },
      receipt_email: undefined,
    });

    paymentIntentId = createdIntent.id;
    clientSecret = createdIntent.client_secret ?? "";
  }

  await db.order.update({
    where: { id: order.id },
    data: {
      stripePaymentIntentId: paymentIntentId,
      paymentStatus: OrderPaymentStatus.PENDING,
    },
  });

  return {
    orderId: order.id,
    clientSecret,
    amount: cart.total,
    currency: "HUF",
  };
}

function getOrderPaths(order: {
  id: string;
  items: { productSlug: string; product: { category: { slug: string } } }[];
}) {
  const paths = new Set<string>([
    "/",
    "/cart",
    "/checkout",
    "/orders",
    `/orders/${order.id}`,
    `/checkout/confirmation/${order.id}`,
  ]);

  for (const item of order.items) {
    paths.add(`/product/${item.productSlug}`);
    paths.add(`/${item.product.category.slug}`);
  }

  return [...paths];
}

export async function markOrderPaymentState(
  paymentIntentId: string,
  state: OrderPaymentStatus,
  statusLabel: string,
) {
  await db.order.updateMany({
    where: {
      stripePaymentIntentId: paymentIntentId,
      paymentStatus: {
        not: OrderPaymentStatus.PAID,
      },
    },
    data: {
      paymentStatus: state,
      status: statusLabel,
    },
  });
}

type FinalizePaidOrderInput = {
  paymentIntentId: string;
  stripeAmount?: number;
  orderId?: string | null;
};

async function findOrderForFinalization(
  tx: Prisma.TransactionClient,
  { paymentIntentId, orderId }: Pick<FinalizePaidOrderInput, "paymentIntentId" | "orderId">,
) {
  const include = {
    items: {
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    },
  } satisfies Prisma.OrderInclude;

  const byPaymentIntent = await tx.order.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
    include,
  });

  if (byPaymentIntent) {
    console.log("[stripe-webhook] order lookup", {
      paymentIntentId,
      metadataOrderId: orderId ?? null,
      foundBy: "payment_intent",
      orderId: byPaymentIntent.id,
      paymentStatus: byPaymentIntent.paymentStatus,
      stripePaymentIntentId: byPaymentIntent.stripePaymentIntentId,
    });
    return byPaymentIntent;
  }

  if (!orderId) {
    console.log("[stripe-webhook] order lookup", {
      paymentIntentId,
      metadataOrderId: null,
      foundBy: null,
      orderId: null,
      paymentStatus: null,
      stripePaymentIntentId: null,
    });
    return null;
  }

  const byOrderId = await tx.order.findUnique({
    where: { id: orderId },
    include,
  });

  if (!byOrderId) {
    console.log("[stripe-webhook] order lookup", {
      paymentIntentId,
      metadataOrderId: orderId,
      foundBy: "order_id",
      orderId: null,
      paymentStatus: null,
      stripePaymentIntentId: null,
    });
    return null;
  }

  if (byOrderId.paymentStatus !== OrderPaymentStatus.PAID) {
    await tx.order.updateMany({
      where: { id: byOrderId.id },
      data: {
        stripePaymentIntentId: paymentIntentId,
      },
    });
  }

  console.log("[stripe-webhook] order lookup", {
    paymentIntentId,
    metadataOrderId: orderId,
    foundBy: "order_id",
    orderId: byOrderId.id,
    paymentStatus: byOrderId.paymentStatus,
    stripePaymentIntentId: byOrderId.stripePaymentIntentId ?? paymentIntentId,
  });

  return {
    ...byOrderId,
    stripePaymentIntentId: paymentIntentId,
  };
}

export async function finalizePaidOrder({
  paymentIntentId,
  stripeAmount,
  orderId,
}: FinalizePaidOrderInput) {
  const result = await db.$transaction(async (tx) => {
    const order = await findOrderForFinalization(tx, { paymentIntentId, orderId });

    if (!order) {
      console.log("[stripe-webhook] finalization stopped", {
        paymentIntentId,
        metadataOrderId: orderId ?? null,
        reason: "missing_order",
      });
      return { type: "missing" as const };
    }

    if (order.paymentStatus === OrderPaymentStatus.PAID) {
      console.log("[stripe-webhook] finalization skipped", {
        paymentIntentId,
        orderId: order.id,
        reason: "already_paid",
      });
      return { type: "already_paid" as const, paths: getOrderPaths(order) };
    }

    const claimed = await tx.order.updateMany({
      where: {
        id: order.id,
        paymentStatus: {
          in: [
            OrderPaymentStatus.PENDING,
            OrderPaymentStatus.PROCESSING,
            OrderPaymentStatus.FAILED,
          ],
        },
      },
      data: {
        paymentStatus: OrderPaymentStatus.FINALIZING,
        status: "Fizetés véglegesítése",
      },
    });

    console.log("[stripe-webhook] finalization claim", {
      paymentIntentId,
      orderId: order.id,
      previousPaymentStatus: order.paymentStatus,
      claimedCount: claimed.count,
    });

    if (claimed.count === 0) {
      const currentOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      if (!currentOrder) {
        console.log("[stripe-webhook] finalization stopped", {
          paymentIntentId,
          orderId: order.id,
          reason: "missing_order_after_claim",
        });
        return { type: "missing" as const };
      }

      console.log("[stripe-webhook] finalization stopped", {
        paymentIntentId,
        orderId: currentOrder.id,
        reason:
          currentOrder.paymentStatus === OrderPaymentStatus.PAID
            ? "already_paid"
            : "already_processing",
        currentPaymentStatus: currentOrder.paymentStatus,
      });

      return currentOrder.paymentStatus === OrderPaymentStatus.PAID
        ? { type: "already_paid" as const, paths: getOrderPaths(currentOrder) }
        : { type: "already_processing" as const, paths: getOrderPaths(currentOrder) };
    }

    const expectedStripeAmount = toStripeAmount(order.total, STRIPE_CURRENCY);

    console.log("[stripe-webhook] amount check", {
      paymentIntentId,
      orderId: order.id,
      stripeAmount: stripeAmount ?? null,
      expectedStripeAmount,
      matches: stripeAmount == null ? null : stripeAmount === expectedStripeAmount,
    });

    if (stripeAmount != null && stripeAmount !== expectedStripeAmount) {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: OrderPaymentStatus.FAILED,
          status: "Összegeltérés",
        },
      });

      console.log("[stripe-webhook] finalization stopped", {
        paymentIntentId,
        orderId: order.id,
        reason: "amount_mismatch",
        stripeAmount,
        expectedStripeAmount,
      });

      return { type: "amount_mismatch" as const, paths: getOrderPaths(order) };
    }

    try {
      await applyCompletedOrderInventory(tx, {
        orderId: order.id,
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
    } catch (error) {
      if (error instanceof InsufficientStockError) {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: OrderPaymentStatus.STOCK_UNAVAILABLE,
            status: "Készlethiány",
          },
        });

        console.log("[stripe-webhook] finalization stopped", {
          paymentIntentId,
          orderId: order.id,
          reason: "stock_unavailable",
        });

        return { type: "stock_unavailable" as const, paths: getOrderPaths(order) };
      }

      throw error;
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: OrderPaymentStatus.PAID,
        status: "Fizetve",
        paymentMethod: "Stripe",
        stripePaymentIntentId: paymentIntentId,
        paidAt: new Date(),
        subtotal: normalizeStoredPrice(order.subtotal),
        total: stripeAmount != null ? fromStripeAmount(stripeAmount, STRIPE_CURRENCY) : normalizeStoredPrice(order.total),
      },
    });

    await tx.cartItem.deleteMany({
      where: {
        cart: {
          userId: order.userId,
        },
      },
    });

    console.log("[stripe-webhook] finalization completed", {
      paymentIntentId,
      orderId: order.id,
      cartCleared: true,
      inventoryAdjusted: true,
    });

    return { type: "paid" as const, paths: getOrderPaths(order) };
  });

  return result;
}
