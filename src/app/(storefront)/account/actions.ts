"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addProductToCart,
  addProductToResolvedCart,
  getOrderForUser,
  getOrCreateCart,
  resolveRequestCart,
} from "@/lib/account";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { requestEmailChange } from "@/lib/auth/email-change";
import { hashPassword, verifyPassword } from "@/lib/auth/passwords";
import { resendVerificationEmail } from "@/lib/auth/resend-verification";
import { ensureGuestCartToken } from "@/lib/cartToken";
import { getCheckoutSession } from "@/lib/checkoutSession";
import { grantCurrentNewsletterCouponForUser } from "@/lib/coupon-grants";
import { db } from "@/lib/db";
import { getAvailableToSell } from "@/lib/inventory";
import {
  normalizePromoCode,
  promoValidationMessages,
  validatePromoCode,
  type PromoValidationErrorCode,
} from "@/lib/promo-codes";

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

export async function addToCartAction(formData: FormData) {
  const redirectTo = readString(formData, "redirectTo") || "/";
  const user = await getCurrentUser();
  const productId = readString(formData, "productId");
  const quantity = readPositiveInt(formData, "quantity");

  if (!productId) {
    return { added: false };
  }

  const guestToken = user ? null : await ensureGuestCartToken();
  const added = await addProductToResolvedCart(
    {
      userId: user?.id,
      guestToken,
    },
    productId,
    quantity,
  );

  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/cart");
  revalidatePath("/favourites");
  if (redirectTo === "/cart") {
    revalidatePath(redirectTo);
  }
  return { added };
}

export async function updateCartItemQuantityAction(formData: FormData) {
  const itemId = readString(formData, "itemId");
  const quantity = readPositiveInt(formData, "quantity");
  const { owner, cart } = await resolveRequestCart(false);

  if (!owner || !cart.id) {
    revalidatePath("/cart");
    return;
  }

  const persistedCart = await getOrCreateCart(owner);
  const cartItem = await db.cartItem.findFirst({
    where: { id: itemId, cartId: persistedCart.id },
    include: {
      product: {
        select: { stockQuantity: true, reservedQuantity: true },
      },
    },
  });

  if (!cartItem) {
    revalidatePath("/cart");
    return;
  }

  const availableToSell = getAvailableToSell(cartItem.product);

  if (availableToSell <= 0) {
    await db.cartItem.delete({
      where: { id: cartItem.id },
    });
    revalidatePath("/");
    revalidatePath("/cart");
    return;
  }

  await db.cartItem.updateMany({
    where: { id: itemId, cartId: persistedCart.id },
    data: { quantity: Math.min(quantity, availableToSell) },
  });

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function removeCartItemAction(formData: FormData) {
  const itemId = readString(formData, "itemId");
  const { owner, cart } = await resolveRequestCart(false);

  if (!owner || !cart.id) {
    revalidatePath("/cart");
    return;
  }

  const persistedCart = await getOrCreateCart(owner);

  await db.cartItem.deleteMany({
    where: { id: itemId, cartId: persistedCart.id },
  });

  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export type PromoCodeActionState = {
  status: "idle" | "success" | "invalid" | "not_eligible" | "error";
  message: string;
  code?: PromoValidationErrorCode;
};

export async function applyPromoCodeAction(
  _previousState: PromoCodeActionState,
  formData: FormData,
): Promise<PromoCodeActionState> {
  const code = normalizePromoCode(readString(formData, "promoCode"));
  const [user, checkoutSession] = await Promise.all([
    getCurrentUser(),
    getCheckoutSession(),
  ]);
  const { owner, cart } = await resolveRequestCart(false);

  if (!owner || !cart.id || cart.items.length === 0) {
    return {
      status: "invalid",
      code: "invalid_code",
      message: "A kód használatához előbb tegyél terméket a kosaradba.",
    };
  }

  const result = await db.$transaction((tx) =>
    validatePromoCode(tx, {
      code,
      subtotal: cart.subtotal,
      identity: {
        userId: user?.emailVerifiedAt ? user.id : null,
        email: user?.emailVerifiedAt ? user.email : checkoutSession?.email,
      },
    }),
  );

  if (!result.ok) {
    const status =
      result.error === "login_required" || result.error === "not_assigned"
        ? "not_eligible"
        : result.error === "invalid_code"
          ? "invalid"
          : "error";

    return {
      status,
      code: result.error,
      message: promoValidationMessages[result.error],
    };
  }

  await db.cart.updateMany({
    where: owner,
    data: {
      promoCodeId: result.promoCode.id,
    },
  });

  revalidatePath("/cart");
  revalidatePath("/checkout");

  return {
    status: "success",
    message: `${result.promoCode.code} kód alkalmazva.`,
  };
}

export async function removePromoCodeAction() {
  const { owner, cart } = await resolveRequestCart(false);

  if (!owner || !cart.id) {
    revalidatePath("/cart");
    return;
  }

  await db.cart.updateMany({
    where: owner,
    data: {
      promoCodeId: null,
    },
  });

  revalidatePath("/cart");
  revalidatePath("/checkout");
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
  const subscribed = formData.get("newsletterSubscribed") === "on";

  await db.user.update({
    where: { id: user.id },
    data: {
      newsletterSubscribed: subscribed,
    },
  });

  if (subscribed) {
    await grantCurrentNewsletterCouponForUser(user.id);
  }

  revalidatePath("/settings");
  revalidatePath("/profile");
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
