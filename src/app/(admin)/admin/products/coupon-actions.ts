"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function addCouponToProductAction(formData: FormData) {
  await requireAdminUser("/admin");

  const productId = readString(formData, "productId");
  const promoCodeId = readString(formData, "promoCodeId");

  if (!productId || !promoCodeId) return;

  await db.promoCodeProduct.upsert({
    where: { promoCodeId_productId: { promoCodeId, productId } },
    create: { promoCodeId, productId },
    update: {},
  });

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/admin/promo-codes");
}

export async function removeCouponFromProductAction(formData: FormData) {
  await requireAdminUser("/admin");

  const productId = readString(formData, "productId");
  const promoCodeId = readString(formData, "promoCodeId");

  if (!productId || !promoCodeId) return;

  await db.promoCodeProduct.deleteMany({
    where: { promoCodeId, productId },
  });

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/admin/promo-codes");
}
