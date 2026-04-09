import { OrderPaymentStatus, type Prisma } from "@prisma/client";

import { createRawToken, hashToken } from "@/lib/auth/tokens";
import { sendOrderConfirmationEmail } from "@/lib/auth/email";
import {
  REUSABLE_DRAFT_STATUSES,
  expireStaleCheckoutOrders,
  getStaleCheckoutCutoff,
} from "@/lib/checkout-cleanup";
import { createDurationTracker, logCheckoutEvent } from "@/lib/checkout-observability";
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
  email: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingMethod?: string;
  foxpostPointCode?: string | null;
};

type CheckoutActor = {
  userId?: string | null;
  guestToken?: string | null;
  email: string;
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

const CONFIRMATION_EMAIL_LOCK_TIMEOUT_MS = 1000 * 60 * 10;
const PENDING_ORDER_PAYMENT_STATUSES = [
  OrderPaymentStatus.PENDING,
  OrderPaymentStatus.PROCESSING,
  OrderPaymentStatus.FINALIZING,
] as const;

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
  actor: CheckoutActor,
): Promise<CheckoutCartSnapshot> {
  const cart = await tx.cart.findUnique({
    where: actor.userId ? { userId: actor.userId } : { guestToken: actor.guestToken ?? "" },
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
  actor: CheckoutActor,
  input: CheckoutCustomerInput & { orderId?: string | null },
  correlationId?: string,
) {
  const duration = createDurationTracker();
  const customer = sanitizeCheckoutCustomer(input);
  const email = input.email.trim().toLowerCase();

  if (!email || !customer.shippingName || !customer.shippingPhone || !customer.shippingAddress) {
    throw new Error("INVALID_SHIPPING");
  }

  const cleanupResult = await expireStaleCheckoutOrders(
    tx,
    actor.userId ? { userId: actor.userId } : { guestEmail: email },
    undefined,
    correlationId,
  );
  const staleCutoff = getStaleCheckoutCutoff();

  const existingOrder = input.orderId
    ? await tx.order.findFirst({
        where: {
          id: input.orderId,
          ...(actor.userId
            ? { userId: actor.userId }
            : {
                userId: null,
                guestEmail: email,
              }),
          paymentStatus: {
            in: [...REUSABLE_DRAFT_STATUSES],
          },
          updatedAt: {
            gte: staleCutoff,
          },
        },
      })
    : null;
  const cart = await getCheckoutCartSnapshot(tx, actor);
  const guestAccessToken = actor.userId
    ? null
    : createRawToken();
  const guestAccessTokenHash = guestAccessToken ? hashToken(guestAccessToken) : null;

  const orderData = {
    status: "Fizetés folyamatban",
    paymentStatus: OrderPaymentStatus.PENDING,
    subtotal: cart.subtotal,
    total: cart.total,
    currency: "HUF",
    guestEmail: actor.userId ? null : email,
    guestAccessTokenHash,
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
          userId: actor.userId ?? null,
          orderNumber: createOrderNumber(),
          ...orderData,
        },
      });

  logCheckoutEvent(
    "log",
    existingOrder ? "draft_order_reused" : "draft_order_created",
    {
      orderId: order.id,
      orderNumber: order.orderNumber,
      actorType: actor.userId ? "authenticated" : "guest",
      result: existingOrder ? "reused" : "created",
      userId: actor.userId ?? null,
      hasGuestEmail: !actor.userId,
      cartId: cart.cartId,
      itemCount: cart.items.length,
      total: cart.total,
      inputOrderId: input.orderId ?? null,
      staleCutoff: staleCutoff.toISOString(),
      expiredOrdersInScope: cleanupResult.expiredOrders,
      durationMs: duration.elapsedMs(),
    },
    { correlationId },
  );

  if (actor.userId) {
    await tx.user.update({
      where: { id: actor.userId },
      data: {
        name: customer.shippingName,
        phone: customer.shippingPhone,
        defaultShippingAddress: customer.shippingAddress,
      },
    });
  }

  return { order, cart, guestAccessToken };
}

export async function initializeStripeCheckout(
  actor: CheckoutActor,
  input: CheckoutCustomerInput & { orderId?: string | null },
  options: { correlationId?: string } = {},
) {
  const duration = createDurationTracker();
  const { correlationId } = options;

  logCheckoutEvent(
    "log",
    "payment_intent_initialization_started",
    {
      actorType: actor.userId ? "authenticated" : "guest",
      status: "started",
      userId: actor.userId ?? null,
      hasGuestToken: Boolean(actor.guestToken),
      hasEmail: Boolean(actor.email),
      orderId: input.orderId ?? null,
    },
    { correlationId },
  );

  if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new CheckoutConfigurationError();
  }

  const stripe = getStripe();

  const { order, cart, guestAccessToken } = await db.$transaction((tx) =>
    upsertPendingOrderRecord(tx, actor, input, correlationId),
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
          correlationId: correlationId ?? "",
          userId: actor.userId ?? "",
          guestToken: actor.guestToken ?? "",
          cartId: cart.cartId,
        },
      });

      paymentIntentId = updatedIntent.id;
      clientSecret = updatedIntent.client_secret ?? "";
      logCheckoutEvent(
        "log",
        "payment_intent_reused",
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          paymentIntentId,
          actorType: actor.userId ? "authenticated" : "guest",
          result: "reused",
          cartId: cart.cartId,
          amount: cart.total,
        },
        { correlationId },
      );
    } catch {
      logCheckoutEvent(
        "warn",
        "payment_intent_reuse_failed",
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          paymentIntentId,
          actorType: actor.userId ? "authenticated" : "guest",
          result: "reuse_failed",
          cartId: cart.cartId,
        },
        { correlationId },
      );
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
        correlationId: correlationId ?? "",
        userId: actor.userId ?? "",
        guestToken: actor.guestToken ?? "",
        cartId: cart.cartId,
      },
      receipt_email: input.email,
    });

    paymentIntentId = createdIntent.id;
    clientSecret = createdIntent.client_secret ?? "";
    logCheckoutEvent(
      "log",
      "payment_intent_created",
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentIntentId,
        actorType: actor.userId ? "authenticated" : "guest",
        result: "created",
        cartId: cart.cartId,
        amount: cart.total,
      },
      { correlationId },
    );
  }

  await db.order.update({
    where: { id: order.id },
    data: {
      stripePaymentIntentId: paymentIntentId,
      paymentStatus: OrderPaymentStatus.PENDING,
    },
  });

  logCheckoutEvent(
    "log",
    "payment_intent_initialization_completed",
    {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentIntentId,
      cartId: cart.cartId,
      amount: cart.total,
      currency: STRIPE_CURRENCY,
      actorType: actor.userId ? "authenticated" : "guest",
      status: "completed",
      result: paymentIntentId ? "ready" : "missing_payment_intent",
      durationMs: duration.elapsedMs(),
    },
    { correlationId },
  );

  return {
    orderId: order.id,
    clientSecret,
    amount: cart.total,
    currency: "HUF",
    guestOrderAccessToken: actor.userId ? null : guestAccessToken,
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

async function claimOrderConfirmationEmailSend(orderId: string, correlationId?: string) {
  const staleLockThreshold = new Date(Date.now() - CONFIRMATION_EMAIL_LOCK_TIMEOUT_MS);
  const orderState = await db.order.findUnique({
    where: { id: orderId },
    select: {
      confirmationEmailSentAt: true,
      confirmationEmailSendingAt: true,
      paidAt: true,
    },
  });
  const claimed = await db.order.updateMany({
    where: {
      id: orderId,
      paidAt: {
        not: null,
      },
      confirmationEmailSentAt: null,
      OR: [
        {
          confirmationEmailSendingAt: null,
        },
        {
          confirmationEmailSendingAt: {
            lt: staleLockThreshold,
          },
        },
      ],
    },
    data: {
      confirmationEmailSendingAt: new Date(),
    },
  });

  if (claimed.count > 0) {
    const claimType =
      orderState?.confirmationEmailSendingAt &&
      orderState.confirmationEmailSendingAt < staleLockThreshold
        ? "reclaim"
        : "claim";

    logCheckoutEvent(
      "log",
      "confirmation_email_send_claimed",
      {
        orderId,
        result: claimType,
        claimType,
        hadPriorSendingLock: Boolean(orderState?.confirmationEmailSendingAt),
        alreadySent: Boolean(orderState?.confirmationEmailSentAt),
        isPaid: Boolean(orderState?.paidAt),
      },
      { correlationId },
    );
  } else {
    logCheckoutEvent(
      "log",
      "confirmation_email_send_skipped",
      {
        orderId,
        result: "skipped",
        reason: orderState?.confirmationEmailSentAt
          ? "already_sent"
          : orderState?.confirmationEmailSendingAt
            ? "active_lock"
            : orderState?.paidAt
              ? "claim_failed"
              : "not_paid_or_missing",
        hadPriorSendingLock: Boolean(orderState?.confirmationEmailSendingAt),
      },
      { correlationId },
    );
  }

  return claimed.count > 0;
}

async function sendOrderConfirmationEmailIfNeeded(orderId: string, correlationId?: string) {
  const duration = createDurationTracker();
  const claimed = await claimOrderConfirmationEmailSend(orderId, correlationId);

  if (!claimed) {
    return false;
  }

  logCheckoutEvent(
    "log",
    "confirmation_email_send_started",
    { orderId, status: "started" },
    { correlationId },
  );

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      items: {
        orderBy: { id: "asc" },
      },
    },
  });

  if (!order) {
    logCheckoutEvent(
      "warn",
      "confirmation_email_send_aborted",
      {
        orderId,
        result: "aborted",
        reason: "missing_order",
        durationMs: duration.elapsedMs(),
      },
      { correlationId },
    );
    return false;
  }

  const recipientEmail = order.user?.email ?? order.guestEmail;

  if (!recipientEmail) {
    await db.order.update({
      where: { id: orderId },
      data: {
        confirmationEmailSendingAt: null,
      },
    });
    logCheckoutEvent(
      "warn",
      "confirmation_email_send_aborted",
      {
        orderId,
        orderNumber: order.orderNumber,
        actorType: order.userId ? "authenticated" : "guest",
        result: "aborted",
        reason: "missing_recipient",
        durationMs: duration.elapsedMs(),
      },
      { correlationId },
    );
    return false;
  }

  try {
    await sendOrderConfirmationEmail({
      email: recipientEmail,
      accessModel: order.userId ? "authenticated" : "guest",
      orderNumber: order.orderNumber,
      totalLabel: new Intl.NumberFormat("hu-HU", {
        style: "currency",
        currency: order.currency,
        maximumFractionDigits: 0,
      }).format(order.total),
      createdAtLabel: new Intl.DateTimeFormat("hu-HU", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(order.createdAt),
      shippingName: order.shippingName,
      shippingAddress: order.shippingAddress,
      items: order.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        unitPriceLabel: new Intl.NumberFormat("hu-HU", {
          style: "currency",
          currency: order.currency,
          maximumFractionDigits: 0,
        }).format(item.unitPrice),
        lineTotalLabel: new Intl.NumberFormat("hu-HU", {
          style: "currency",
          currency: order.currency,
          maximumFractionDigits: 0,
        }).format(item.unitPrice * item.quantity),
      })),
    });

    await db.order.update({
      where: { id: orderId },
      data: {
        confirmationEmailSendingAt: null,
        confirmationEmailSentAt: new Date(),
      },
    });

    logCheckoutEvent(
      "log",
      "confirmation_email_send_succeeded",
      {
        orderId,
        orderNumber: order.orderNumber,
        actorType: order.userId ? "authenticated" : "guest",
        status: "completed",
        result: "sent",
        itemCount: order.items.length,
        durationMs: duration.elapsedMs(),
      },
      { correlationId },
    );

    return true;
  } catch (error) {
    logCheckoutEvent(
      "error",
      "confirmation_email_send_failed",
      {
        orderId,
        orderNumber: order.orderNumber,
        actorType: order.userId ? "authenticated" : "guest",
        result: "failed",
        error,
        durationMs: duration.elapsedMs(),
      },
      { correlationId },
    );

    await db.order.update({
      where: { id: orderId },
      data: {
        confirmationEmailSendingAt: null,
      },
    });

    return false;
  }
}

export async function markOrderPaymentState(
  paymentIntentId: string,
  state: OrderPaymentStatus,
  statusLabel: string,
  correlationId?: string,
) {
  const result = await db.order.updateMany({
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

  logCheckoutEvent(
    "log",
    "webhook_payment_state_marked",
    {
      paymentIntentId,
      status: state,
      result: result.count > 0 ? "updated" : "no_match",
      paymentStatus: state,
      statusLabel,
      updatedOrders: result.count,
    },
    { correlationId },
  );
}

type FinalizePaidOrderInput = {
  paymentIntentId: string;
  stripeAmount?: number;
  orderId?: string | null;
  cartId?: string | null;
};

async function findOrderForFinalization(
  tx: Prisma.TransactionClient,
  { paymentIntentId, orderId }: Pick<FinalizePaidOrderInput, "paymentIntentId" | "orderId">,
  correlationId?: string,
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
    logCheckoutEvent("log", "webhook_order_lookup", {
      paymentIntentId,
      metadataOrderId: orderId ?? null,
      orderId: byPaymentIntent.id,
      result: "found_by_payment_intent",
      foundBy: "payment_intent",
      paymentStatus: byPaymentIntent.paymentStatus,
      stripePaymentIntentId: byPaymentIntent.stripePaymentIntentId,
    }, { correlationId });
    return byPaymentIntent;
  }

  if (!orderId) {
    logCheckoutEvent("log", "webhook_order_lookup", {
      paymentIntentId,
      metadataOrderId: null,
      result: "missing_metadata_order_id",
      foundBy: null,
      orderId: null,
      paymentStatus: null,
      stripePaymentIntentId: null,
    }, { correlationId });
    return null;
  }

  const byOrderId = await tx.order.findUnique({
    where: { id: orderId },
    include,
  });

  if (!byOrderId) {
    logCheckoutEvent("log", "webhook_order_lookup", {
      paymentIntentId,
      metadataOrderId: orderId,
      result: "missing_order",
      foundBy: "order_id",
      orderId: null,
      paymentStatus: null,
      stripePaymentIntentId: null,
    }, { correlationId });
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

  logCheckoutEvent("log", "webhook_order_lookup", {
    paymentIntentId,
    metadataOrderId: orderId,
    orderId: byOrderId.id,
    result: "found_by_order_id",
    foundBy: "order_id",
    paymentStatus: byOrderId.paymentStatus,
    stripePaymentIntentId: byOrderId.stripePaymentIntentId ?? paymentIntentId,
  }, { correlationId });

  return {
    ...byOrderId,
    stripePaymentIntentId: paymentIntentId,
  };
}

export async function finalizePaidOrder({
  paymentIntentId,
  stripeAmount,
  orderId,
  cartId,
}: FinalizePaidOrderInput, correlationId?: string) {
  const duration = createDurationTracker();
  const result = await db.$transaction(async (tx) => {
    const order = await findOrderForFinalization(tx, { paymentIntentId, orderId }, correlationId);

    if (!order) {
      logCheckoutEvent("warn", "webhook_finalization_stopped", {
        paymentIntentId,
        metadataOrderId: orderId ?? null,
        result: "missing_order",
        reason: "missing_order",
        durationMs: duration.elapsedMs(),
      }, { correlationId });
      return { type: "missing" as const };
    }

    if (order.paymentStatus === OrderPaymentStatus.PAID) {
      logCheckoutEvent("log", "webhook_finalization_skipped", {
        paymentIntentId,
        orderId: order.id,
        result: "already_paid",
        reason: "already_paid",
        durationMs: duration.elapsedMs(),
      }, { correlationId });
      return { type: "already_paid" as const, paths: getOrderPaths(order), orderId: order.id };
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

    logCheckoutEvent("log", "webhook_finalization_claim", {
      paymentIntentId,
      orderId: order.id,
      status: "claimed",
      result: claimed.count > 0 ? "claimed" : "claim_failed",
      previousPaymentStatus: order.paymentStatus,
      claimedCount: claimed.count,
    }, { correlationId });

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
        logCheckoutEvent("warn", "webhook_finalization_stopped", {
          paymentIntentId,
          orderId: order.id,
          result: "missing_order_after_claim",
          reason: "missing_order_after_claim",
          durationMs: duration.elapsedMs(),
        }, { correlationId });
        return { type: "missing" as const };
      }

      logCheckoutEvent("log", "webhook_finalization_stopped", {
        paymentIntentId,
        orderId: currentOrder.id,
        result:
          currentOrder.paymentStatus === OrderPaymentStatus.PAID
            ? "already_paid"
            : "already_processing",
        reason:
          currentOrder.paymentStatus === OrderPaymentStatus.PAID
            ? "already_paid"
            : "already_processing",
        currentPaymentStatus: currentOrder.paymentStatus,
        durationMs: duration.elapsedMs(),
      }, { correlationId });

      return currentOrder.paymentStatus === OrderPaymentStatus.PAID
        ? { type: "already_paid" as const, paths: getOrderPaths(currentOrder), orderId: currentOrder.id }
        : { type: "already_processing" as const, paths: getOrderPaths(currentOrder) };
    }

    const expectedStripeAmount = toStripeAmount(order.total, STRIPE_CURRENCY);

    logCheckoutEvent("log", "webhook_amount_check", {
      paymentIntentId,
      orderId: order.id,
      result: stripeAmount == null ? "not_provided" : stripeAmount === expectedStripeAmount ? "match" : "mismatch",
      stripeAmount: stripeAmount ?? null,
      expectedStripeAmount,
      matches: stripeAmount == null ? null : stripeAmount === expectedStripeAmount,
    }, { correlationId });

    if (stripeAmount != null && stripeAmount !== expectedStripeAmount) {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: OrderPaymentStatus.FAILED,
          status: "Összegeltérés",
        },
      });

      logCheckoutEvent("warn", "webhook_finalization_stopped", {
        paymentIntentId,
        orderId: order.id,
        result: "amount_mismatch",
        reason: "amount_mismatch",
        stripeAmount,
        expectedStripeAmount,
        durationMs: duration.elapsedMs(),
      }, { correlationId });

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

        logCheckoutEvent("warn", "webhook_finalization_stopped", {
          paymentIntentId,
          orderId: order.id,
          result: "stock_unavailable",
          reason: "stock_unavailable",
          durationMs: duration.elapsedMs(),
        }, { correlationId });

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

    if (cartId) {
      await tx.cartItem.deleteMany({
        where: { cartId },
      });
    } else if (order.userId) {
      await tx.cartItem.deleteMany({
        where: {
          cart: {
            userId: order.userId,
          },
        },
      });
    }

    logCheckoutEvent("log", "webhook_finalization_completed", {
      paymentIntentId,
      orderId: order.id,
      status: "completed",
      result: "paid",
      cartCleared: true,
      inventoryAdjusted: true,
      durationMs: duration.elapsedMs(),
    }, { correlationId });

    return { type: "paid" as const, paths: getOrderPaths(order), orderId: order.id };
  });

  if ((result.type === "paid" || result.type === "already_paid") && "orderId" in result) {
    await sendOrderConfirmationEmailIfNeeded(result.orderId, correlationId);
  }

  return result;
}

export async function syncPendingOrderPaymentStatus(orderId: string, correlationId?: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      paymentStatus: true,
      status: true,
      internalStatus: true,
      stripePaymentIntentId: true,
    },
  });

  if (!order) {
    return null;
  }

  if (
    !PENDING_ORDER_PAYMENT_STATUSES.includes(order.paymentStatus) ||
    !order.stripePaymentIntentId
  ) {
    return order;
  }

  try {
    const paymentIntent = await getStripe().paymentIntents.retrieve(order.stripePaymentIntentId);

    logCheckoutEvent("log", "confirmation_status_reconciled_with_stripe", {
      orderId: order.id,
      paymentIntentId: paymentIntent.id,
      paymentStatus: order.paymentStatus,
      stripePaymentIntentStatus: paymentIntent.status,
      stripeAmountReceived: paymentIntent.amount_received,
      result: "retrieved",
    }, { correlationId });

    switch (paymentIntent.status) {
      case "succeeded":
        await finalizePaidOrder({
          paymentIntentId: paymentIntent.id,
          stripeAmount: paymentIntent.amount_received,
          orderId,
          cartId:
            typeof paymentIntent.metadata.cartId === "string"
              ? paymentIntent.metadata.cartId
              : null,
        }, correlationId);
        break;
      case "processing":
        await markOrderPaymentState(
          paymentIntent.id,
          OrderPaymentStatus.PROCESSING,
          "Fizetés feldolgozás alatt",
          correlationId,
        );
        break;
      case "requires_payment_method":
        await markOrderPaymentState(
          paymentIntent.id,
          OrderPaymentStatus.FAILED,
          "Sikertelen fizetés",
          correlationId,
        );
        break;
      case "canceled":
        await markOrderPaymentState(
          paymentIntent.id,
          OrderPaymentStatus.CANCELED,
          "Megszakított fizetés",
          correlationId,
        );
        break;
      default:
        break;
    }
  } catch (error) {
    logCheckoutEvent("warn", "confirmation_status_reconciliation_failed", {
      orderId: order.id,
      paymentIntentId: order.stripePaymentIntentId,
      paymentStatus: order.paymentStatus,
      result: "stripe_lookup_failed",
      error,
    }, { correlationId });
  }

  return db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      paymentStatus: true,
      status: true,
      internalStatus: true,
      stripePaymentIntentId: true,
    },
  });
}
