import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { getAvailableToSell, isInStock } from "@/lib/inventory";

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
  total: number;
  createdAt: Date;
  items: OrderPreviewItem[];
};

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
  if (!userId) {
    return { favourites: 0, cartItems: 0 };
  }

  const [favourites, cart] = await Promise.all([
    db.favourite.count({ where: { userId } }),
    db.cart.findUnique({
      where: { userId },
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

export async function getOrCreateCart(userId: string) {
  return db.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getCartForUser(userId: string) {
  await getOrCreateCart(userId);

  const cart = await db.cart.findUniqueOrThrow({
    where: { userId },
    include: {
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

  return {
    id: cart.id,
    items,
    subtotal,
    total: subtotal,
  } satisfies CartSummary;
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
    total: order.total,
    createdAt: order.createdAt,
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
  const cart = await getOrCreateCart(userId);
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

export async function getCheckoutContext(userId: string) {
  const [user, cart] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: userId } }),
    getCartForUser(userId),
  ]);

  return { user, cart };
}

export async function getFavouriteProductIds(userId: string) {
  const favourites = await db.favourite.findMany({
    where: { userId },
    select: { productId: true },
  });

  return new Set(favourites.map((item) => item.productId));
}
