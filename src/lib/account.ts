import type { Prisma } from "@prisma/client";

import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { clearGuestCartToken, getGuestCartToken } from "@/lib/cartToken";
import { getAvailableToSell, isInStock } from "@/lib/inventory";
import {
  type AppliedPromo,
  validatePromoCode,
} from "@/lib/promo-codes";

const productInclude = {
  images: {
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
  },
  category: true,
} satisfies Prisma.ProductInclude;

export type FavouriteProduct = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  shortDescription: string;
  price: number;
  collectionLabel: string;
  stockQuantity: number;
  reservedQuantity: number;
  soldOutAt?: Date | null;
  inStock: boolean;
  imageUrl?: string | null;
};

export type CartItemSummary = {
  id: string;
  productId: string;
  slug: string;
  category: string;
  name: string;
  price: number;
  quantity: number;
  stockQuantity: number;
  reservedQuantity: number;
  soldOutAt?: Date | null;
  availableToSell: number;
  isAvailable: boolean;
  exceedsStock: boolean;
  imageUrl?: string | null;
  lineTotal: number;
};

export type CartSummary = {
  id: string;
  items: CartItemSummary[];
  subtotal: number;
  shipping: number;
  discount: number;
  appliedPromo: AppliedPromo | null;
  total: number;
};

export type OrderPreviewItem = {
  id: string;
  productName: string;
  imageUrl: string | null;
  quantity: number;
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  internalStatus: string;
  trackingNumber?: string | null;
  shippingMethod?: string | null;
  statusUpdatedAt?: Date | null;
  total: number;
  createdAt: Date;
  paidAt?: Date | null;
  items: OrderPreviewItem[];
};

type CartOwner =
  | { userId: string; guestToken?: never }
  | { guestToken: string; userId?: never };

function createEmptyCart(): CartSummary {
  return {
    id: "",
    items: [],
    subtotal: 0,
    shipping: 0,
    discount: 0,
    appliedPromo: null,
    total: 0,
  };
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readPositiveInt(formData: FormData, key: string, fallback = 1) {
  const raw = Number(readString(formData, key));
  if (!Number.isFinite(raw)) {
    return fallback;
  }

  return Math.max(1, Math.floor(raw));
}

function getCoverImage(product: {
  imageUrl?: string | null;
  images: { id: string; url: string; alt?: string | null; isCover: boolean }[];
}) {
  return product.images.find((image) => image.isCover) ?? product.images[0] ?? null;
}

export function formatDate(value: Date) {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}

export async function getHeaderCounts(userId?: string) {
  const guestToken = userId ? null : await getGuestCartToken();

  if (!userId && !guestToken) {
    return { favourites: 0, cartItems: 0 };
  }

  const [favourites, cart] = await Promise.all([
    userId ? db.favourite.count({ where: { userId } }) : Promise.resolve(0),
    db.cart.findUnique({
      where: userId ? { userId } : { guestToken: guestToken! },
      select: {
        items: {
          select: { quantity: true },
        },
      },
    }),
  ]);

  return {
    favourites,
    cartItems: cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  };
}

function getCartWhereUnique(owner: CartOwner): Prisma.CartWhereUniqueInput {
  if ("userId" in owner) {
    return { userId: owner.userId };
  }

  return { guestToken: owner.guestToken };
}

async function getCartSummaryForOwner(owner: CartOwner, createIfMissing = true) {
  if (createIfMissing) {
    await getOrCreateCart(owner);
  }

  const cart = await db.cart.findUnique({
    where: getCartWhereUnique(owner),
    include: {
      promoCode: true,
      items: {
        include: {
          product: {
            include: productInclude,
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!cart) {
    return createEmptyCart();
  }

  const items = cart.items.map((item): CartItemSummary => {
    const coverImage = getCoverImage(item.product);
    return {
      id: item.id,
      productId: item.productId,
      slug: item.product.slug,
      category: item.product.category.slug,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      stockQuantity: item.product.stockQuantity,
      reservedQuantity: item.product.reservedQuantity,
      soldOutAt: item.product.soldOutAt,
      availableToSell: getAvailableToSell(item.product),
      isAvailable: isInStock(item.product),
      exceedsStock: item.quantity > getAvailableToSell(item.product),
      imageUrl: coverImage?.url ?? item.product.imageUrl,
      lineTotal: item.product.price * item.quantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = 0;
  let discount = 0;
  let appliedPromo: AppliedPromo | null = null;

  if (cart.promoCode) {
    const validation = await db.$transaction((tx) =>
      validatePromoCode(tx, {
        code: cart.promoCode!.code,
        subtotal,
        identity: "userId" in owner ? { userId: owner.userId } : undefined,
      }),
    );

    if (validation.ok) {
      discount = validation.discountAmount;
      appliedPromo = {
        id: validation.promoCode.id,
        code: validation.promoCode.code,
        discountPercent: validation.promoCode.discountPercent,
        discountAmount: validation.discountAmount,
      };
    }
  }

  return {
    id: cart.id,
    items,
    subtotal,
    shipping,
    discount,
    appliedPromo,
    total: Math.max(0, subtotal + shipping - discount),
  } satisfies CartSummary;
}

export async function getFavouriteProducts(userId: string) {
  const favourites = await db.favourite.findMany({
    where: { userId },
    include: {
      product: {
        include: productInclude,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return favourites.map((entry): FavouriteProduct => {
    const coverImage = getCoverImage(entry.product);
    return {
      id: entry.id,
      productId: entry.product.id,
      slug: entry.product.slug,
      name: entry.product.name,
      shortDescription: entry.product.shortDescription,
      price: entry.product.price,
      collectionLabel: entry.product.collectionLabel,
      stockQuantity: entry.product.stockQuantity,
      reservedQuantity: entry.product.reservedQuantity,
      soldOutAt: entry.product.soldOutAt,
      inStock: isInStock(entry.product),
      imageUrl: coverImage?.url ?? entry.product.imageUrl,
    };
  });
}

export async function getOrCreateCart(input: { userId?: string | null; guestToken?: string | null }) {
  if (input.userId) {
    return db.cart.upsert({
      where: { userId: input.userId },
      update: {},
      create: { userId: input.userId },
    });
  }

  if (input.guestToken) {
    return db.cart.upsert({
      where: { guestToken: input.guestToken },
      update: {},
      create: { guestToken: input.guestToken },
    });
  }

  throw new Error("CART_OWNER_REQUIRED");
}

export async function mergeGuestCartIntoUserCart(userId: string, guestToken: string) {
  const [guestCart, userCart] = await Promise.all([
    db.cart.findUnique({
      where: { guestToken },
      include: {
        items: true,
      },
    }),
    getOrCreateCart({ userId }),
  ]);

  if (!guestCart || guestCart.id === userCart.id) {
    await clearGuestCartToken();
    return userCart;
  }

  await db.$transaction(async (tx) => {
    const userCartItems = await tx.cartItem.findMany({
      where: { cartId: userCart.id },
    });

    const userCartItemsByProductId = new Map(
      userCartItems.map((item) => [item.productId, item] as const),
    );

    for (const guestItem of guestCart.items) {
      const product = await tx.product.findUnique({
        where: { id: guestItem.productId },
        select: { stockQuantity: true, reservedQuantity: true },
      });

      const availableToSell = product ? getAvailableToSell(product) : 0;

      if (availableToSell <= 0) {
        continue;
      }

      const existingUserItem = userCartItemsByProductId.get(guestItem.productId);
      const mergedQuantity = Math.min(
        availableToSell,
        (existingUserItem?.quantity ?? 0) + guestItem.quantity,
      );

      if (existingUserItem) {
        await tx.cartItem.update({
          where: { id: existingUserItem.id },
          data: { quantity: mergedQuantity },
        });
        continue;
      }

      const createdItem = await tx.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: guestItem.productId,
          quantity: mergedQuantity,
        },
      });

      userCartItemsByProductId.set(guestItem.productId, createdItem);
    }

    await tx.cart.delete({
      where: { id: guestCart.id },
    });
  });

  await clearGuestCartToken();

  return userCart;
}

export async function getCartForUser(userId: string) {
  return getCartSummaryForOwner({ userId });
}

export async function getCartForGuest(guestToken: string) {
  return getCartSummaryForOwner({ guestToken });
}

export async function resolveCart(
  input: {
    userId?: string | null;
    guestToken?: string | null;
    createIfMissing?: boolean;
  } = {},
) {
  const owner = input.userId
    ? ({ userId: input.userId } satisfies CartOwner)
    : input.guestToken
      ? ({ guestToken: input.guestToken } satisfies CartOwner)
      : null;

  if (!owner) {
    return { owner: null, cart: createEmptyCart() };
  }

  const cart = await getCartSummaryForOwner(owner, input.createIfMissing ?? false);
  return { owner, cart };
}

export async function resolveRequestCart(createIfMissing = false) {
  const currentUser = await getCurrentUser();
  const guestToken = currentUser ? null : await getGuestCartToken();

  return resolveCart({
    userId: currentUser?.id,
    guestToken,
    createIfMissing,
  });
}

export async function getOrdersForUser(userId: string) {
  const orders = await db.order.findMany({
    where: { userId },
    include: {
      items: {
        take: 3,
        orderBy: { id: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order): OrderSummary => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    internalStatus: order.internalStatus,
    trackingNumber: order.trackingNumber,
    shippingMethod: order.shippingMethod,
    statusUpdatedAt: order.statusUpdatedAt,
    total: order.total,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    items: order.items,
  }));
}

export async function getOrderForUser(userId: string, orderId: string) {
  return db.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: true,
    },
  });
}

export async function addProductToCart(
  userId: string,
  productId: string,
  quantity = 1,
) {
  const cart = await getOrCreateCart({ userId });
  return db.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { stockQuantity: true, reservedQuantity: true },
    });

    const availableToSell = product ? getAvailableToSell(product) : 0;

    if (!product || availableToSell <= 0) {
      return false;
    }

    const existing = await tx.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    const nextQuantity = Math.min(
      availableToSell,
      (existing?.quantity ?? 0) + Math.max(1, Math.floor(quantity)),
    );

    if (existing) {
      await tx.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQuantity },
      });
      return true;
    }

    await tx.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: nextQuantity,
      },
    });
    return true;
  });
}

export async function addProductToResolvedCart(
  owner: { userId?: string | null; guestToken?: string | null },
  productId: string,
  quantity = 1,
) {
  const cart = await getOrCreateCart(owner);
  return db.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { stockQuantity: true, reservedQuantity: true },
    });

    const availableToSell = product ? getAvailableToSell(product) : 0;

    if (!product || availableToSell <= 0) {
      return false;
    }

    const existing = await tx.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    const nextQuantity = Math.min(
      availableToSell,
      (existing?.quantity ?? 0) + Math.max(1, Math.floor(quantity)),
    );

    if (existing) {
      await tx.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQuantity },
      });
      return true;
    }

    await tx.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: nextQuantity,
      },
    });
    return true;
  });
}

export async function getCheckoutContext(userId?: string | null) {
  const guestToken = userId ? null : await getGuestCartToken();
  const { cart } = await resolveCart({
    userId,
    guestToken,
    createIfMissing: false,
  });

  if (!userId) {
    return { user: null, cart };
  }

  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });

  return { user, cart };
}

export async function getRequestCart() {
  return resolveRequestCart(false);
}

export async function getFavouriteProductIds(userId: string) {
  const favourites = await db.favourite.findMany({
    where: { userId },
    select: { productId: true },
  });

  return new Set(favourites.map((item) => item.productId));
}
