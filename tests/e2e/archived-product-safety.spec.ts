import { expect, test } from "@playwright/test";
import { PrismaClient, ProductOptionType, ProductStatus } from "@prisma/client";

import {
  addProductToCart,
  addProductToResolvedCart,
  resolveCart,
} from "../../src/lib/account";
import {
  CheckoutUnavailableProductsError,
  getCheckoutCartSnapshot,
} from "../../src/lib/checkout";
import {
  applyCompletedOrderInventory,
  ProductUnavailableError,
} from "../../src/lib/inventory";

const prisma = new PrismaClient();

type SeededProduct = {
  id: string;
  slug: string;
};

type ProductOptionIds = {
  categoryId: string;
  stoneTypeId: string;
  colorId: string;
  styleId: string;
  occasionId: string;
  availabilityId: string;
  toneId: string;
};

async function createProductOptions(suffix: string): Promise<ProductOptionIds> {
  const createOption = async (type: ProductOptionType, label: string) =>
    prisma.productOption.create({
      data: {
        type,
        name: `Archived safety ${label} ${suffix}`,
        slug: `archived-safety-${label}-${suffix}`,
      },
    });

  const [category, stoneType, color, style, occasion, availability, tone] =
    await Promise.all([
      createOption(ProductOptionType.CATEGORY, "category"),
      createOption(ProductOptionType.STONE_TYPE, "stone"),
      createOption(ProductOptionType.COLOR, "color"),
      createOption(ProductOptionType.STYLE, "style"),
      createOption(ProductOptionType.OCCASION, "occasion"),
      createOption(ProductOptionType.AVAILABILITY, "availability"),
      createOption(ProductOptionType.VISUAL_TONE, "tone"),
    ]);

  return {
    categoryId: category.id,
    stoneTypeId: stoneType.id,
    colorId: color.id,
    styleId: style.id,
    occasionId: occasion.id,
    availabilityId: availability.id,
    toneId: tone.id,
  };
}

async function createProduct(
  suffix: string,
  options: ProductOptionIds,
  input: {
    name: string;
    price: number;
    stockQuantity: number;
    archivedAt?: Date | null;
  },
): Promise<SeededProduct> {
  const product = await prisma.product.create({
    data: {
      slug: `archived-safety-${input.name.toLowerCase().replace(/\s+/g, "-")}-${suffix}`,
      name: `Archived safety ${input.name}`,
      price: input.price,
      shortDescription: "Regression test product.",
      description: "Regression test product.",
      badge: "Test",
      collectionLabel: "Regression",
      imageUrl: "/uploads/products/bracez-ld-b324c17b-303b-4d3c-9dd6-1edc016ec994.jpg",
      stockQuantity: input.stockQuantity,
      reservedQuantity: 0,
      status: input.archivedAt ? ProductStatus.ARCHIVED : ProductStatus.ACTIVE,
      archivedAt: input.archivedAt ?? null,
      archiveReason: input.archivedAt ? "REGRESSION_TEST" : null,
      ...options,
    },
  });

  return {
    id: product.id,
    slug: product.slug,
  };
}

async function createUser(suffix: string) {
  return prisma.user.create({
    data: {
      name: "Archived Safety User",
      email: `archived-safety-${suffix}@test.local`,
      passwordHash: "test-password-hash",
      emailVerifiedAt: new Date(),
    },
  });
}

async function cleanupBySuffix(suffix: string) {
  await prisma.inventoryEvent.deleteMany({
    where: {
      product: {
        slug: {
          contains: suffix,
        },
      },
    },
  });
  await prisma.orderItem.deleteMany({
    where: {
      OR: [
        {
          product: {
            slug: {
              contains: suffix,
            },
          },
        },
        {
          order: {
            orderNumber: {
              contains: suffix,
            },
          },
        },
      ],
    },
  });
  await prisma.order.deleteMany({
    where: {
      OR: [
        { orderNumber: { contains: suffix } },
        { guestEmail: { contains: suffix } },
        { user: { email: { contains: suffix } } },
      ],
    },
  });
  await prisma.cartItem.deleteMany({
    where: {
      OR: [
        {
          product: {
            slug: {
              contains: suffix,
            },
          },
        },
        {
          cart: {
            OR: [
              { guestToken: { contains: suffix } },
              { user: { email: { contains: suffix } } },
            ],
          },
        },
      ],
    },
  });
  await prisma.cart.deleteMany({
    where: {
      OR: [
        { guestToken: { contains: suffix } },
        { user: { email: { contains: suffix } } },
      ],
    },
  });
  await prisma.product.deleteMany({
    where: {
      slug: {
        contains: suffix,
      },
    },
  });
  await prisma.productOption.deleteMany({
    where: {
      slug: {
        contains: suffix,
      },
    },
  });
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: suffix,
      },
    },
  });
}

function checkoutSessionCookie(email: string) {
  return Buffer.from(
    JSON.stringify({
      email,
      isGuest: true,
    }),
    "utf8",
  ).toString("base64");
}

test("add-to-cart rejects archived products for authenticated and guest carts", async () => {
  const suffix = `add-${Date.now()}`;

  try {
    const options = await createProductOptions(suffix);
    const archivedProduct = await createProduct(suffix, options, {
      name: "Archived Add",
      price: 12000,
      stockQuantity: 5,
      archivedAt: new Date(),
    });
    const user = await createUser(suffix);
    const guestToken = `guest-${suffix}`;

    await prisma.cart.create({ data: { userId: user.id } });
    await prisma.cart.create({ data: { guestToken } });

    await expect(addProductToCart(user.id, archivedProduct.id, 1)).resolves.toBe(false);
    await expect(
      addProductToResolvedCart({ guestToken }, archivedProduct.id, 1),
    ).resolves.toBe(false);

    await expect(
      prisma.cartItem.count({ where: { productId: archivedProduct.id } }),
    ).resolves.toBe(0);
  } finally {
    await cleanupBySuffix(suffix);
  }
});

test("cart summary marks archived lines unavailable and only totals active products", async () => {
  const suffix = `cart-${Date.now()}`;

  try {
    const options = await createProductOptions(suffix);
    const activeProduct = await createProduct(suffix, options, {
      name: "Active Cart",
      price: 10000,
      stockQuantity: 5,
    });
    const archivedProduct = await createProduct(suffix, options, {
      name: "Archived Cart",
      price: 20000,
      stockQuantity: 5,
      archivedAt: new Date(),
    });
    const guestToken = `guest-${suffix}`;
    const cart = await prisma.cart.create({ data: { guestToken } });

    await prisma.cartItem.createMany({
      data: [
        { cartId: cart.id, productId: activeProduct.id, quantity: 2 },
        { cartId: cart.id, productId: archivedProduct.id, quantity: 3 },
      ],
    });

    const result = await resolveCart({ guestToken, createIfMissing: false });
    const activeLine = result.cart.items.find((item) => item.productId === activeProduct.id);
    const archivedLine = result.cart.items.find((item) => item.productId === archivedProduct.id);

    expect(activeLine).toMatchObject({
      isAvailable: true,
      unavailableReason: null,
      quantity: 2,
      lineTotal: 20000,
    });
    expect(archivedLine).toMatchObject({
      isAvailable: false,
      unavailableReason: "archived",
      availableToSell: 0,
      quantity: 3,
      lineTotal: 0,
    });
    expect(result.cart.subtotal).toBe(20000);
    expect(result.cart.total).toBe(20000);
  } finally {
    await cleanupBySuffix(suffix);
  }
});

test("checkout snapshot hard-stops a mixed cart that contains an archived product", async () => {
  const suffix = `snapshot-${Date.now()}`;

  try {
    const options = await createProductOptions(suffix);
    const activeProduct = await createProduct(suffix, options, {
      name: "Active Snapshot",
      price: 10000,
      stockQuantity: 5,
    });
    const archivedProduct = await createProduct(suffix, options, {
      name: "Archived Snapshot",
      price: 20000,
      stockQuantity: 5,
      archivedAt: new Date(),
    });
    const user = await createUser(suffix);
    const cart = await prisma.cart.create({ data: { userId: user.id } });

    await prisma.cartItem.createMany({
      data: [
        { cartId: cart.id, productId: activeProduct.id, quantity: 1 },
        { cartId: cart.id, productId: archivedProduct.id, quantity: 1 },
      ],
    });

    const error = await prisma.$transaction((tx) =>
      getCheckoutCartSnapshot(tx, {
        userId: user.id,
        email: user.email,
      }),
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(CheckoutUnavailableProductsError);
    expect(error).toMatchObject({
      code: "UNAVAILABLE_CART_ITEMS",
      items: [
        {
          productId: archivedProduct.id,
          name: "Archived safety Archived Snapshot",
          reason: "archived",
        },
      ],
    });
  } finally {
    await cleanupBySuffix(suffix);
  }
});

test("payment intent route returns a structured conflict for archived guest carts", async ({
  request,
}) => {
  const suffix = `intent-${Date.now()}`;

  try {
    const options = await createProductOptions(suffix);
    const archivedProduct = await createProduct(suffix, options, {
      name: "Archived Intent",
      price: 20000,
      stockQuantity: 5,
      archivedAt: new Date(),
    });
    const guestToken = `guest-${suffix}`;
    const cart = await prisma.cart.create({ data: { guestToken } });

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: archivedProduct.id,
        quantity: 1,
      },
    });

    const email = `guest-${suffix}@test.local`;
    const response = await request.post("/api/checkout/payment-intent", {
      headers: {
        cookie: [
          `guest_cart_token=${guestToken}`,
          `checkout_session=${checkoutSessionCookie(email)}`,
        ].join("; "),
      },
      data: {
        shippingName: "Archived Safety Guest",
        shippingPhone: "+36301234567",
        shippingAddress: "1111 Budapest, Teszt utca 1.",
        shippingMethod: "home",
      },
    });

    expect(response.status()).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: "UNAVAILABLE_CART_ITEMS",
      items: [
        {
          productId: archivedProduct.id,
          reason: "archived",
        },
      ],
    });
  } finally {
    await cleanupBySuffix(suffix);
  }
});

test("inventory finalization throws and does not decrement archived products", async () => {
  const suffix = `inventory-${Date.now()}`;

  try {
    const options = await createProductOptions(suffix);
    const archivedProduct = await createProduct(suffix, options, {
      name: "Archived Inventory",
      price: 20000,
      stockQuantity: 5,
      archivedAt: new Date(),
    });

    const error = await prisma.$transaction((tx) =>
      applyCompletedOrderInventory(tx, {
        orderId: `order-${suffix}`,
        items: [{ productId: archivedProduct.id, quantity: 2 }],
      }),
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ProductUnavailableError);
    expect(error).toMatchObject({
      code: "PRODUCT_UNAVAILABLE",
      productId: archivedProduct.id,
    });

    const productAfter = await prisma.product.findUniqueOrThrow({
      where: { id: archivedProduct.id },
      select: { stockQuantity: true },
    });

    expect(productAfter.stockQuantity).toBe(5);
  } finally {
    await cleanupBySuffix(suffix);
  }
});

test.afterAll(async () => {
  await prisma.$disconnect();
});
