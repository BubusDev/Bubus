import {
  PromoCodeApplicabilityScope,
  PromoCodeEligibilityRule,
  type Prisma,
} from "@prisma/client";

import { db } from "@/lib/db";
import { clearGuestCartToken, getGuestCartToken } from "@/lib/cartToken";
import {
  isInStock,
} from "@/lib/inventory";
import type { ImageCropArea } from "@/lib/image-crop";
import { getProductAvailabilitySnapshot, storefrontProductWhere } from "@/lib/product-lifecycle";
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
  cardCropArea?: ImageCropArea | null;
};

export type CartItemSummary = {
  id: string;
  productId: string;
  slug: string;
  categoryId: string;
  category: string;
  name: string;
  price: number;
  quantity: number;
  stockQuantity: number;
  reservedQuantity: number;
  archivedAt?: Date | null;
  unavailableReason: "archived" | "incomplete" | "out_of_stock" | null;
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

export type AccountCouponStatus = "active" | "expired" | "used" | "upcoming";

export type AccountCouponSummary = {
  id: string;
  code: string;
  label: string;
  discountPercent: number;
  validFrom: Date;
  validUntil: Date | null;
  minimumOrderAmount: number | null;
  status: AccountCouponStatus;
  currentlyUsable: boolean;
  usedCount: number;
};

export type HeaderCouponPreview = {
  id: string;
  code: string;
  discountPercent: number;
  validUntil: string | null;
  daysRemaining: number | null;
};

export type HeaderCouponProductPreview = {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl?: string | null;
};

export type HeaderCouponDropdownPreview = {
  activeCoupons: HeaderCouponPreview[];
  eligibleProducts: HeaderCouponProductPreview[];
  recommendationLabel: string | null;
};

function getAccountCouponLabel(code: string, source?: string) {
  if (source === "welcome" || code === "UDVNALUNK") {
    return "Személyes kupon";
  }

  if (source === "newsletter_monthly" || code.startsWith("HIRLEVEL")) {
    return "Hírlevél kupon";
  }

  return "Személyes kupon";
}

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
  images: {
    id: string;
    url: string;
    alt?: string | null;
    isCover: boolean;
    cardCropAreaX?: number;
    cardCropAreaY?: number;
    cardCropAreaWidth?: number;
    cardCropAreaHeight?: number;
  }[];
}) {
  return product.images.find((image) => image.isCover) ?? product.images[0] ?? null;
}

function getProductCardCropArea(
  image: ReturnType<typeof getCoverImage>,
): ImageCropArea | null {
  if (!image) {
    return null;
  }

  return {
    x: image.cardCropAreaX ?? 0,
    y: image.cardCropAreaY ?? 0,
    width: image.cardCropAreaWidth ?? 100,
    height: image.cardCropAreaHeight ?? 100,
  };
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
    const availability = getProductAvailabilitySnapshot(item.product);
    const unavailableReason =
      availability.lifecycleStatus === "archived"
        ? "archived"
        : availability.lifecycleStatus === "draft" || availability.lifecycleStatus === "incomplete"
          ? "incomplete"
          : availability.lifecycleStatus === "sold_out"
            ? "out_of_stock"
            : null;
    const isAvailable = availability.isPurchasable;
    return {
      id: item.id,
      productId: item.productId,
      slug: item.product.slug,
      categoryId: item.product.categoryId,
      category: item.product.category.slug,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      stockQuantity: item.product.stockQuantity,
      reservedQuantity: item.product.reservedQuantity,
      archivedAt: item.product.archivedAt,
      unavailableReason,
      soldOutAt: item.product.soldOutAt,
      availableToSell: availability.availableToSell,
      isAvailable,
      exceedsStock: unavailableReason !== "archived" && item.quantity > availability.availableToSell,
      imageUrl: coverImage?.url ?? item.product.imageUrl,
      lineTotal: isAvailable ? item.product.price * item.quantity : 0,
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
        cartLines: items.map((item) => ({
          productId: item.productId,
          categoryId: item.categoryId,
          lineTotal: item.isAvailable && !item.exceedsStock ? item.lineTotal : 0,
        })),
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
        applicableSubtotal: validation.applicableSubtotal,
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
      cardCropArea: getProductCardCropArea(coverImage),
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
        select: {
          archivedAt: true,
          status: true,
          name: true,
          slug: true,
          price: true,
          compareAtPrice: true,
          shortDescription: true,
          description: true,
          badge: true,
          collectionLabel: true,
          stockQuantity: true,
          reservedQuantity: true,
          imageUrl: true,
          images: { select: { url: true } },
          isOnSale: true,
        },
      });

      const availability = product ? getProductAvailabilitySnapshot(product) : null;

      if (!product || !availability?.isPurchasable) {
        continue;
      }

      const existingUserItem = userCartItemsByProductId.get(guestItem.productId);
      const mergedQuantity = Math.min(
        availability.availableToSell,
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
  const { getCurrentUser } = await import("@/lib/auth/current-user");
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

export async function getCouponsForUser(userId: string) {
  const now = new Date();
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true },
  });
  const normalizedEmail = user.email.trim().toLowerCase();

  const coupons = await db.promoCode.findMany({
    where: {
      eligibilityRule: {
        in: [
          PromoCodeEligibilityRule.ALL_USERS,
          PromoCodeEligibilityRule.REGISTERED_USERS_ONLY,
        ],
      },
      AND: [
        {
          OR: [
            { grants: { none: {} } },
            { grants: { some: { userId } } },
          ],
        },
        {
          OR: [
            { isActive: true },
            {
              redemptions: {
                some: {
                  OR: [{ userId }, { customerEmail: normalizedEmail }],
                },
              },
            },
          ],
        },
      ],
    },
    include: {
      grants: {
        where: { userId },
        select: { source: true },
        take: 1,
      },
      redemptions: {
        where: {
          OR: [{ userId }, { customerEmail: normalizedEmail }],
        },
        select: { id: true },
      },
    },
    orderBy: [{ validFrom: "asc" }, { createdAt: "desc" }],
  });

  return coupons
    .map((coupon): AccountCouponSummary | null => {
      const usedCount = coupon.redemptions.length;
      const customerLimit = coupon.oneTimeUse ? 1 : coupon.perCustomerUsageLimit;
      const customerLimitReached =
        customerLimit != null && customerLimit > 0 && usedCount >= customerLimit;
      const totalLimitReached =
        coupon.totalUsageLimit != null && coupon.redeemedCount >= coupon.totalUsageLimit;

      let status: AccountCouponStatus = "active";
      if (customerLimitReached) {
        status = "used";
      } else if (coupon.validFrom > now) {
        status = "upcoming";
      } else if (coupon.validUntil && coupon.validUntil < now) {
        status = "expired";
      }

      const currentlyUsable =
        coupon.isActive &&
        status === "active" &&
        !totalLimitReached &&
        !customerLimitReached;

      if (!currentlyUsable && status === "active" && totalLimitReached && usedCount === 0) {
        return null;
      }

      return {
        id: coupon.id,
        code: coupon.code,
        label: getAccountCouponLabel(coupon.code, coupon.grants[0]?.source),
        discountPercent: coupon.discountPercent,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        minimumOrderAmount: coupon.minimumOrderAmount,
        status,
        currentlyUsable,
        usedCount,
      };
    })
    .filter((coupon): coupon is AccountCouponSummary => coupon !== null);
}

export async function getHeaderCouponDropdownPreview(
  userId?: string | null,
): Promise<HeaderCouponDropdownPreview> {
  if (!userId) {
    return { activeCoupons: [], eligibleProducts: [], recommendationLabel: null };
  }

  const now = Date.now();
  const coupons = await getCouponsForUser(userId);
  const activeCoupons = coupons
    .filter((coupon) => coupon.currentlyUsable)
    .slice(0, 5)
    .map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      validUntil: coupon.validUntil?.toISOString() ?? null,
      daysRemaining: coupon.validUntil
        ? Math.max(0, Math.ceil((coupon.validUntil.getTime() - now) / 86400000))
        : null,
    }));

  const scopedCoupons = activeCoupons.length
    ? await db.promoCode.findMany({
        where: { id: { in: activeCoupons.map((coupon) => coupon.id) } },
        select: {
          applicabilityScope: true,
          applicableCategories: { select: { categoryId: true } },
          applicableProducts: { select: { productId: true } },
        },
      })
    : [];
  const productIds = new Set<string>();
  const categoryIds = new Set<string>();

  for (const coupon of scopedCoupons) {
    if (coupon.applicabilityScope === PromoCodeApplicabilityScope.PRODUCTS) {
      for (const product of coupon.applicableProducts) {
        productIds.add(product.productId);
      }
    }

    if (coupon.applicabilityScope === PromoCodeApplicabilityScope.CATEGORIES) {
      for (const category of coupon.applicableCategories) {
        categoryIds.add(category.categoryId);
      }
    }
  }

  const productWhere: Prisma.ProductWhereInput | null =
    productIds.size > 0
      ? { id: { in: Array.from(productIds) } }
      : categoryIds.size > 0
        ? { categoryId: { in: Array.from(categoryIds) } }
        : activeCoupons.length > 0
          ? {}
          : null;
  const recommendationLabel =
    productIds.size > 0
      ? "Kuponnal érintett darabok"
      : categoryIds.size > 0
        ? "Ajánlott darabok ezekből a kategóriákból"
        : activeCoupons.length > 0
          ? "Ajánlott darabok ehhez a kuponhoz"
          : null;
  const products = productWhere
    ? await db.product.findMany({
        where: {
          AND: [storefrontProductWhere, productWhere, { stockQuantity: { gt: 0 } }],
        },
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          imageUrl: true,
          images: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: { url: true, isCover: true },
            take: 4,
          },
        },
        orderBy: [
          { isOnSale: "desc" },
          { isGiftable: "desc" },
          { isNew: "desc" },
          { updatedAt: "desc" },
        ],
        take: 3,
      })
    : [];

  return {
    activeCoupons,
    eligibleProducts: products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      imageUrl:
        product.images.find((image) => image.isCover)?.url ??
        product.images[0]?.url ??
        product.imageUrl,
    })),
    recommendationLabel,
  };
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
      select: {
        archivedAt: true,
        status: true,
        name: true,
        slug: true,
        price: true,
        compareAtPrice: true,
        shortDescription: true,
        description: true,
        badge: true,
        collectionLabel: true,
        stockQuantity: true,
        reservedQuantity: true,
        imageUrl: true,
        images: { select: { url: true } },
        isOnSale: true,
      },
    });

    const availability = product ? getProductAvailabilitySnapshot(product) : null;

    if (!product || !availability?.isPurchasable) {
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
      availability.availableToSell,
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
      select: {
        archivedAt: true,
        status: true,
        name: true,
        slug: true,
        price: true,
        compareAtPrice: true,
        shortDescription: true,
        description: true,
        badge: true,
        collectionLabel: true,
        stockQuantity: true,
        reservedQuantity: true,
        imageUrl: true,
        images: { select: { url: true } },
        isOnSale: true,
      },
    });

    const availability = product ? getProductAvailabilitySnapshot(product) : null;

    if (!product || !availability?.isPurchasable) {
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
      availability.availableToSell,
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
