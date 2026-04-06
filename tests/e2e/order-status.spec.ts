import { expect, test, type Page } from "@playwright/test";
import { OrderPaymentStatus, PrismaClient } from "@prisma/client";

import { hashPassword } from "../../src/lib/auth/passwords";

const prisma = new PrismaClient();

type SeededOrder = {
  email: string;
  password: string;
  orderId: string;
};

async function signIn(page: Page, email: string, password: string, next = "/orders") {
  await page.goto(`/sign-in?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function createPaidOrder(): Promise<SeededOrder> {
  const base = await prisma.product.findFirstOrThrow();
  const suffix = Date.now().toString();
  const password = "order1234";
  const user = await prisma.user.create({
    data: {
      name: "Order Status User",
      email: `order-status-${suffix}@test.local`,
      passwordHash: await hashPassword(password),
      emailVerifiedAt: new Date(),
      defaultShippingAddress: "1111 Budapest, Teszt utca 1.",
      phone: "+36301234567",
    },
  });

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      orderNumber: `CJ-STATUS-${suffix}`,
      status: "Fizetve",
      paymentStatus: OrderPaymentStatus.PAID,
      subtotal: base.price,
      total: base.price,
      currency: "HUF",
      shippingName: user.name,
      shippingPhone: user.phone ?? "+36301234567",
      shippingAddress: user.defaultShippingAddress ?? "1111 Budapest, Teszt utca 1.",
      paymentMethod: "Stripe",
      paidAt: new Date(),
      stripePaymentIntentId: `pi_ui_${suffix}`,
      items: {
        create: [
          {
            productId: base.id,
            productName: base.name,
            productSlug: base.slug,
            unitPrice: base.price,
            quantity: 1,
          },
        ],
      },
    },
  });

  return {
    email: user.email,
    password,
    orderId: order.id,
  };
}

async function cleanupOrder(seed: SeededOrder) {
  const user = await prisma.user.findUnique({ where: { email: seed.email } });
  if (!user) {
    return;
  }

  await prisma.orderItem.deleteMany({
    where: {
      order: {
        userId: user.id,
      },
    },
  });
  await prisma.order.deleteMany({ where: { userId: user.id } });
  await prisma.cartItem.deleteMany({
    where: {
      cart: {
        userId: user.id,
      },
    },
  });
  await prisma.cart.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
}

test("paid confirmation and order detail pages show the final paid state", async ({ page }) => {
  const seed = await createPaidOrder();

  try {
    await signIn(page, seed.email, seed.password, `/checkout/confirmation/${seed.orderId}`);
    await expect(page.getByText("Fizetés sikeres")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Köszönjük a rendelésedet" })).toBeVisible();

    await page.goto(`/orders/${seed.orderId}`);
    await expect(page.getByRole("heading", { name: "Fizetve" })).toBeVisible();
    await expect(
      page.getByText("A Stripe sikeresen visszaigazolta a fizetést."),
    ).toBeVisible();
  } finally {
    await cleanupOrder(seed);
  }
});

test.afterAll(async () => {
  await prisma.$disconnect();
});
