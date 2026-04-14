"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizePromoCode } from "@/lib/promo-codes";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalInt(formData: FormData, key: string) {
  const raw = readString(formData, key);
  if (!raw) return null;

  const value = Number(raw);
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : null;
}

function readDate(formData: FormData, key: string) {
  const raw = readString(formData, key);
  if (!raw) return null;

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function redirectWithStatus(status: string): never {
  revalidatePath("/admin/promo-codes");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  redirect(`/admin/promo-codes?status=${status}`);
}

function readPromoCodeInput(formData: FormData) {
  const code = normalizePromoCode(readString(formData, "code"));
  const discountPercent = readOptionalInt(formData, "discountPercent") ?? 0;
  const validFrom = readDate(formData, "validFrom");
  const validUntil = readDate(formData, "validUntil");
  const totalUsageLimit = readOptionalInt(formData, "totalUsageLimit");
  const perCustomerUsageLimit = readOptionalInt(formData, "perCustomerUsageLimit");
  const minimumOrderAmount = readOptionalInt(formData, "minimumOrderAmount");

  if (!code || discountPercent < 1 || discountPercent > 100 || !validFrom) {
    redirectWithStatus("invalid");
  }

  const startsAt = validFrom;

  if (validUntil && validUntil < startsAt) {
    redirectWithStatus("invalid-interval");
  }

  return {
    code,
    discountPercent,
    validFrom: startsAt,
    validUntil,
    isActive: formData.get("isActive") === "on",
    oneTimeUse: formData.get("oneTimeUse") === "on",
    totalUsageLimit: totalUsageLimit && totalUsageLimit > 0 ? totalUsageLimit : null,
    perCustomerUsageLimit:
      perCustomerUsageLimit && perCustomerUsageLimit > 0 ? perCustomerUsageLimit : null,
    minimumOrderAmount:
      minimumOrderAmount && minimumOrderAmount > 0 ? minimumOrderAmount : null,
  };
}

export async function createPromoCodeAction(formData: FormData) {
  await requireAdminUser("/admin/promo-codes");

  try {
    await db.promoCode.create({
      data: readPromoCodeInput(formData),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirectWithStatus("duplicate");
    }
    throw error;
  }

  redirectWithStatus("created");
}

export async function updatePromoCodeAction(formData: FormData) {
  await requireAdminUser("/admin/promo-codes");

  const id = readString(formData, "id");
  if (!id) {
    redirectWithStatus("invalid");
  }

  try {
    await db.promoCode.update({
      where: { id },
      data: readPromoCodeInput(formData),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirectWithStatus("duplicate");
    }
    throw error;
  }

  redirectWithStatus("updated");
}

export async function togglePromoCodeActiveAction(formData: FormData) {
  await requireAdminUser("/admin/promo-codes");

  const id = readString(formData, "id");
  const isActive = readString(formData, "isActive") === "true";

  if (id) {
    await db.promoCode.update({
      where: { id },
      data: { isActive },
    });
  }

  redirectWithStatus(isActive ? "activated" : "deactivated");
}

export async function deletePromoCodeAction(formData: FormData) {
  await requireAdminUser("/admin/promo-codes");

  const id = readString(formData, "id");
  if (!id) {
    redirectWithStatus("invalid");
  }

  const [redemptions, orders, carts] = await Promise.all([
    db.promoCodeRedemption.count({ where: { promoCodeId: id } }),
    db.order.count({ where: { promoCodeId: id } }),
    db.cart.count({ where: { promoCodeId: id } }),
  ]);

  if (redemptions > 0 || orders > 0 || carts > 0) {
    redirectWithStatus("delete-blocked");
  }

  await db.promoCode.delete({
    where: { id },
  });

  redirectWithStatus("deleted");
}
