"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteProductImageFile } from "@/lib/product-images";

export async function restoreProduct(id: string) {
  await requireAdminUser("/admin/products/archive");

  await db.product.update({
    where: { id },
    data: { archivedAt: null, archiveReason: null },
  });

  revalidatePath("/admin/products/archive");
  revalidatePath("/admin/products");
}

export async function permanentlyDeleteProduct(id: string) {
  await requireAdminUser("/admin/products/archive");

  const product = await db.product.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!product) return;

  await db.product.delete({ where: { id } });
  await Promise.all(product.images.map((img) => deleteProductImageFile(img.url)));

  revalidatePath("/admin/products/archive");
}

export async function restoreAllProducts() {
  await requireAdminUser("/admin/products/archive");

  await db.product.updateMany({
    where: { archivedAt: { not: null } },
    data: { archivedAt: null, archiveReason: null },
  });

  revalidatePath("/admin/products/archive");
  revalidatePath("/admin/products");
}
