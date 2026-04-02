"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { addProductToCart, getCartForUser, getOrderForUser, getOrCreateCart } from "@/lib/account";
import { requireUser } from "@/lib/auth";
import { requestEmailChange } from "@/lib/auth/email-change";
import { hashPassword, verifyPassword } from "@/lib/auth/passwords";
import { resendVerificationEmail } from "@/lib/auth/resend-verification";
import { db } from "@/lib/db";

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

type CartItemValue = Awaited<ReturnType<typeof getCartForUser>>["items"][number];

export async function addToCartAction(formData: FormData) {
  const user = await requireUser("/cart");
  const productId = readString(formData, "productId");
  const quantity = readPositiveInt(formData, "quantity");
  const redirectTo = readString(formData, "redirectTo") || "/cart";

  if (!productId) {
    redirect(redirectTo);
  }

  await addProductToCart(user.id, productId, quantity);
  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/favourites");
  redirect(redirectTo);
}

export async function updateCartItemQuantityAction(formData: FormData) {
  const user = await requireUser("/cart");
  const itemId = readString(formData, "itemId");
  const quantity = readPositiveInt(formData, "quantity");

  const cart = await getOrCreateCart(user.id);

  await db.cartItem.updateMany({
    where: { id: itemId, cartId: cart.id },
    data: { quantity },
  });

  revalidatePath("/cart");
}

export async function removeCartItemAction(formData: FormData) {
  const user = await requireUser("/cart");
  const itemId = readString(formData, "itemId");
  const cart = await getOrCreateCart(user.id);

  await db.cartItem.deleteMany({
    where: { id: itemId, cartId: cart.id },
  });

  revalidatePath("/");
  revalidatePath("/cart");
}

export async function addFavouriteAction(formData: FormData) {
  const user = await requireUser("/favourites");
  const productId = readString(formData, "productId");
  const redirectTo = readString(formData, "redirectTo") || "/favourites";

  if (productId) {
    await db.favourite.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
      update: {},
      create: { userId: user.id, productId },
    });
  }

  revalidatePath("/");
  revalidatePath("/favourites");
  redirect(redirectTo);
}

export async function removeFavouriteAction(formData: FormData) {
  const user = await requireUser("/favourites");
  const productId = readString(formData, "productId");

  await db.favourite.deleteMany({
    where: {
      userId: user.id,
      productId,
    },
  });

  revalidatePath("/");
  revalidatePath("/favourites");
}

export async function moveFavouriteToCartAction(formData: FormData) {
  const user = await requireUser("/favourites");
  const productId = readString(formData, "productId");

  if (productId) {
    await addProductToCart(user.id, productId, 1);
  }

  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/favourites");
}

export async function saveProfileAction(formData: FormData) {
  const user = await requireUser("/profile");
  const name = readString(formData, "name");

  if (name.length < 2) {
    redirect("/profile?status=error");
  }

  const birthDate = readString(formData, "birthDate");
  const parsedBirthDate = birthDate ? new Date(`${birthDate}T00:00:00.000Z`) : null;

  await db.user.update({
    where: { id: user.id },
    data: {
      name,
      phone: readString(formData, "phone") || null,
      birthDate: parsedBirthDate,
      profileImageUrl: readString(formData, "profileImageUrl") || null,
      defaultShippingAddress: readString(formData, "defaultShippingAddress") || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/profile");
  redirect("/profile?status=saved");
}

export async function resendVerificationAction(formData: FormData) {
  const email = readString(formData, "email");
  const redirectTo = readString(formData, "redirectTo") || "/verify-email";

  const result = await resendVerificationEmail(email);
  const nextUrl = new URL(redirectTo, "http://localhost");

  nextUrl.searchParams.set(
    "status",
    result.status === "cooldown" ? "verification-cooldown" : "verification-sent",
  );

  if (result.previewUrl && process.env.NODE_ENV !== "production") {
    nextUrl.searchParams.set("preview", result.previewUrl);
  }

  redirect(`${nextUrl.pathname}${nextUrl.search}`);
}

export async function requestEmailChangeAction(formData: FormData) {
  const user = await requireUser("/account");
  const currentPassword = readString(formData, "currentPassword");
  const newEmail = readString(formData, "newEmail");

  const result = await requestEmailChange({
    userId: user.id,
    currentPassword,
    newEmail,
  });

  const nextUrl = new URL("/account", "http://localhost");

  nextUrl.searchParams.set("emailStatus", result.status);

  if ("previewUrl" in result && result.previewUrl && process.env.NODE_ENV !== "production") {
    nextUrl.searchParams.set("emailPreview", result.previewUrl);
  }

  redirect(`${nextUrl.pathname}${nextUrl.search}`);
}

export async function updatePasswordAction(formData: FormData) {
  const user = await requireUser("/settings");
  const currentPassword = readString(formData, "currentPassword");
  const newPassword = readString(formData, "newPassword");

  const fullUser = await db.user.findUniqueOrThrow({ where: { id: user.id } });

  if (!(await verifyPassword(currentPassword, fullUser.passwordHash))) {
    redirect("/settings?status=password-invalid");
  }

  if (newPassword.length < 8) {
    redirect("/settings?status=password-short");
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  redirect("/settings?status=password-saved");
}

export async function updateNewsletterAction(formData: FormData) {
  const user = await requireUser("/settings");

  await db.user.update({
    where: { id: user.id },
    data: {
      newsletterSubscribed: formData.get("newsletterSubscribed") === "on",
    },
  });

  revalidatePath("/settings");
  redirect("/settings?status=newsletter-saved");
}

export async function deleteAccountAction(formData: FormData) {
  const user = await requireUser("/settings");
  const confirmation = readString(formData, "confirmation");

  if (confirmation !== "T\u00d6RL\u00c9S") {
    redirect("/settings?status=delete-error");
  }

  await db.user.delete({
    where: { id: user.id },
  });

  redirect("/auth/logout");
}

export async function placeOrderAction(formData: FormData) {
  const user = await requireUser("/checkout");
  const cart = await getCartForUser(user.id);

  if (cart.items.length === 0) {
    redirect("/cart");
  }

  const shippingName = readString(formData, "shippingName");
  const shippingPhone = readString(formData, "shippingPhone");
  const shippingAddress = readString(formData, "shippingAddress");
  const paymentMethod = readString(formData, "paymentMethod") || "Bankk\u00e1rtya";

  if (!shippingName || !shippingPhone || !shippingAddress) {
    redirect("/checkout?status=error");
  }

  const order = await db.order.create({
    data: {
      userId: user.id,
      orderNumber: `CJ-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.floor(
        1000 + Math.random() * 9000,
      )}`,
      status: "Visszaigazolva",
      subtotal: cart.subtotal,
      total: cart.total,
      shippingName,
      shippingPhone,
      shippingAddress,
      paymentMethod,
      items: {
        create: cart.items.map((item: CartItemValue) => ({
          productId: item.productId,
          productName: item.name,
          productSlug: item.slug,
          imageUrl: item.imageUrl,
          unitPrice: item.price,
          quantity: item.quantity,
        })),
      },
    },
  });

  await db.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  await db.user.update({
    where: { id: user.id },
    data: {
      name: shippingName,
      phone: shippingPhone,
      defaultShippingAddress: shippingAddress,
    },
  });

  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/orders");
  redirect(`/checkout/confirmation/${order.id}`);
}

export async function reorderAction(formData: FormData) {
  const user = await requireUser("/orders");
  const orderId = readString(formData, "orderId");
  const order = await getOrderForUser(user.id, orderId);

  if (!order) {
    redirect("/orders");
  }

  for (const item of order.items) {
    await addProductToCart(user.id, item.productId, item.quantity);
  }

  revalidatePath("/cart");
  redirect("/cart");
}
