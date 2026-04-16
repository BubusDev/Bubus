"use server";

import { revalidatePath } from "next/cache";
import { ProductStatus } from "@prisma/client";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteProductImageFile } from "@/lib/product-images";

export async function restoreProduct(id: string) {
  await requireAdminUser("/admin/products/archive");

  const product = await db.product.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!product) return;

  await db.product.update({
    where: { id },
    data: { status: ProductStatus.DRAFT, archivedAt: null, archiveReason: null },
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

  const products = await db.product.findMany({
    where: {
      OR: [{ status: ProductStatus.ARCHIVED }, { archivedAt: { not: null } }],
    },
    select: { id: true },
  });

  await db.product.updateMany({
    where: { id: { in: products.map((product) => product.id) } },
    data: { status: ProductStatus.DRAFT, archivedAt: null, archiveReason: null },
  });

  revalidatePath("/admin/products/archive");
  revalidatePath("/admin/products");
}
