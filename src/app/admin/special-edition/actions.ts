"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  deleteProductImageFile,
  deleteSpecialEditionImageFile,
  saveUploadedProductImages,
  saveUploadedSpecialEditionImages,
} from "@/lib/product-images";
import { getOrCreateSpecialEditionCampaign } from "@/lib/products";

function revalidateSpecialEditionPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/special-edition");
  revalidatePath("/special-edition");
  revalidatePath("/", "layout");
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(formData: FormData, key: string) {
  const value = Number(readString(formData, key));
  return Number.isFinite(value) ? value : NaN;
}

async function readUploadedImage(formData: FormData, key: string) {
  const file = formData.get(key);

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const [uploadedImage] = await saveUploadedProductImages([file]);
  return uploadedImage ?? null;
}

async function readUploadedCampaignImage(formData: FormData, key: string) {
  const file = formData.get(key);

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const [uploadedImage] = await saveUploadedSpecialEditionImages([file]);
  return uploadedImage ?? null;
}

function hasUploadedFile(formData: FormData, key: string) {
  const file = formData.get(key);
  return file instanceof File && file.size > 0;
}

export async function updateSpecialEditionCampaignStateAction(formData: FormData) {
  await requireAdminUser("/admin/special-edition");
  const campaign = await getOrCreateSpecialEditionCampaign();

  await db.specialEditionCampaign.update({
    where: { id: campaign.id },
    data: {
      isActive: formData.get("isActive") === "on",
    },
  });

  revalidateSpecialEditionPaths();
  redirect("/admin/special-edition");
}

export async function updateSpecialEditionBannerAction(formData: FormData) {
  await requireAdminUser("/admin/special-edition");

  const campaign = await getOrCreateSpecialEditionCampaign();
  const currentBannerImageUrl = readString(formData, "currentBannerImageUrl");
  const bannerAlt = readString(formData, "bannerImageAlt");
  const nextBannerImage = await readUploadedCampaignImage(formData, "bannerImage");

  const bannerImageUrl = nextBannerImage?.url || currentBannerImageUrl || null;
  const bannerImageAlt = bannerImageUrl ? bannerAlt || nextBannerImage?.alt || "Special Edition banner" : null;

  await db.specialEditionCampaign.update({
    where: { id: campaign.id },
    data: {
      bannerImageUrl,
      bannerImageAlt,
    },
  });

  if (
    nextBannerImage &&
    currentBannerImageUrl &&
    currentBannerImageUrl !== nextBannerImage.url
  ) {
    await deleteSpecialEditionImageFile(currentBannerImageUrl);
  }

  revalidateSpecialEditionPaths();
  redirect("/admin/special-edition");
}

export async function createSpecialEditionEntryAction(formData: FormData) {
  await requireAdminUser("/admin/special-edition");
  const campaign = await getOrCreateSpecialEditionCampaign();
  const productId = readString(formData, "productId");
  const sortOrder = readNumber(formData, "sortOrder");
  const promoAlt = readString(formData, "promoImageAlt");
  const productAlt = readString(formData, "productImageAlt");

  if (!productId) {
    throw new Error("Product is required.");
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true },
  });

  if (!product) {
    throw new Error("Selected product was not found.");
  }

  if (!hasUploadedFile(formData, "promoImage") || !hasUploadedFile(formData, "productImage")) {
    throw new Error("Both promo and product images are required.");
  }

  const [promoImage, productImage] = await Promise.all([
    readUploadedImage(formData, "promoImage"),
    readUploadedImage(formData, "productImage"),
  ]);

  if (!promoImage || !productImage) {
    throw new Error("Both promo and product images are required.");
  }

  await db.specialEditionEntry.create({
    data: {
      campaignId: campaign.id,
      productId: product.id,
      promoImageUrl: promoImage.url,
      promoImageAlt: promoAlt || product.name,
      productImageUrl: productImage.url,
      productImageAlt: productAlt || product.name,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });

  revalidateSpecialEditionPaths();
  redirect("/admin/special-edition");
}

export async function updateSpecialEditionEntryAction(formData: FormData) {
  await requireAdminUser("/admin/special-edition");

  const entryId = readString(formData, "entryId");
  const productId = readString(formData, "productId");
  const currentPromoImageUrl = readString(formData, "currentPromoImageUrl");
  const currentProductImageUrl = readString(formData, "currentProductImageUrl");
  const sortOrder = readNumber(formData, "sortOrder");
  const promoAlt = readString(formData, "promoImageAlt");
  const productAlt = readString(formData, "productImageAlt");

  if (!entryId || !productId) {
    throw new Error("Entry id and product are required.");
  }

  const [existingEntry, product, nextPromoImage, nextProductImage] = await Promise.all([
    db.specialEditionEntry.findUnique({
      where: { id: entryId },
      select: {
        id: true,
        promoImageUrl: true,
        productImageUrl: true,
      },
    }),
    db.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    }),
    readUploadedImage(formData, "promoImage"),
    readUploadedImage(formData, "productImage"),
  ]);

  if (!existingEntry) {
    throw new Error("Special Edition entry not found.");
  }

  if (!product) {
    throw new Error("Selected product was not found.");
  }

  const promoImageUrl = nextPromoImage?.url || currentPromoImageUrl || existingEntry.promoImageUrl;
  const productImageUrl =
    nextProductImage?.url || currentProductImageUrl || existingEntry.productImageUrl;

  if (!promoImageUrl || !productImageUrl) {
    throw new Error("Both promo and product images are required.");
  }

  await db.specialEditionEntry.update({
    where: { id: entryId },
    data: {
      productId: product.id,
      promoImageUrl,
      promoImageAlt: promoAlt || product.name,
      productImageUrl,
      productImageAlt: productAlt || product.name,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });

  await Promise.all([
    nextPromoImage && existingEntry.promoImageUrl !== promoImageUrl
      && existingEntry.promoImageUrl !== productImageUrl
      ? deleteProductImageFile(existingEntry.promoImageUrl)
      : Promise.resolve(),
    nextProductImage && existingEntry.productImageUrl !== productImageUrl
      && existingEntry.productImageUrl !== promoImageUrl
      ? deleteProductImageFile(existingEntry.productImageUrl)
      : Promise.resolve(),
  ]);

  revalidateSpecialEditionPaths();
  redirect("/admin/special-edition");
}

export async function deleteSpecialEditionEntryAction(formData: FormData) {
  await requireAdminUser("/admin/special-edition");

  const entryId = readString(formData, "entryId");

  if (!entryId) {
    throw new Error("Entry id is required.");
  }

  const entry = await db.specialEditionEntry.findUnique({
    where: { id: entryId },
    select: {
      id: true,
      promoImageUrl: true,
      productImageUrl: true,
    },
  });

  if (!entry) {
    throw new Error("Special Edition entry not found.");
  }

  await db.specialEditionEntry.delete({
    where: { id: entryId },
  });

  await Promise.all([
    deleteProductImageFile(entry.promoImageUrl),
    entry.productImageUrl !== entry.promoImageUrl
      ? deleteProductImageFile(entry.productImageUrl)
      : Promise.resolve(),
  ]);

  revalidateSpecialEditionPaths();
  redirect("/admin/special-edition");
}
