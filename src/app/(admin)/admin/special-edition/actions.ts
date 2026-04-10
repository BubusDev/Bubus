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

// Re-export check for Next.js redirect errors so we can re-throw them properly
function isRedirectError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "digest" in e &&
    typeof (e as { digest?: unknown }).digest === "string" &&
    (e as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

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
  if (!(file instanceof File) || file.size === 0) return null;
  const [uploadedImage] = await saveUploadedProductImages([file]);
  return uploadedImage ?? null;
}

async function readUploadedCampaignImage(formData: FormData, key: string) {
  const file = formData.get(key);
  if (!(file instanceof File) || file.size === 0) return null;
  const [uploadedImage] = await saveUploadedSpecialEditionImages([file]);
  return uploadedImage ?? null;
}

function hasUploadedFile(formData: FormData, key: string) {
  const file = formData.get(key);
  return file instanceof File && file.size > 0;
}

function errorRedirect(message: string) {
  redirect(`/admin/special-edition?error=${encodeURIComponent(message)}`);
}

export async function updateSpecialEditionCampaignStateAction(formData: FormData) {
  await requireAdminUser("/admin/special-edition");
  try {
    const campaign = await getOrCreateSpecialEditionCampaign();
    await db.specialEditionCampaign.update({
      where: { id: campaign.id },
      data: { isActive: formData.get("isActive") === "on" },
    });
    revalidateSpecialEditionPaths();
    redirect("/admin/special-edition");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    errorRedirect("Hiba a kampány állapot mentésekor.");
  }
}

export async function updateSpecialEditionBannerAction(formData: FormData) {
  await requireAdminUser("/admin/special-edition");
  try {
    const campaign = await getOrCreateSpecialEditionCampaign();
    const currentBannerImageUrl = readString(formData, "currentBannerImageUrl");
    const bannerAlt = readString(formData, "bannerImageAlt");
    const nextBannerImage = await readUploadedCampaignImage(formData, "bannerImage");

    const bannerImageUrl = nextBannerImage?.url || currentBannerImageUrl || null;
    const bannerImageAlt = bannerImageUrl
      ? bannerAlt || nextBannerImage?.alt || "Special Edition banner"
      : null;

    await db.specialEditionCampaign.update({
      where: { id: campaign.id },
      data: { bannerImageUrl, bannerImageAlt },
    });

    if (nextBannerImage && currentBannerImageUrl && currentBannerImageUrl !== nextBannerImage.url) {
      await deleteSpecialEditionImageFile(currentBannerImageUrl);
    }

    revalidateSpecialEditionPaths();
    redirect("/admin/special-edition");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    errorRedirect("Hiba a banner kép mentésekor.");
  }
}

export async function createSpecialEditionEntryAction(formData: FormData) {
  await requireAdminUser("/admin/special-edition");
  try {
    const campaign = await getOrCreateSpecialEditionCampaign();
    const productId = readString(formData, "productId");
    const sortOrder = readNumber(formData, "sortOrder");
    const promoAlt = readString(formData, "promoImageAlt");
    const productAlt = readString(formData, "productImageAlt");

    if (!productId) {
      errorRedirect("Terméket kötelező megadni.");
      return;
    }

    const product = await db.product.findFirst({
      where: { id: productId, archivedAt: null },
      select: { id: true, name: true },
    });

    if (!product) {
      errorRedirect("A kiválasztott termék nem található.");
      return;
    }

    if (!hasUploadedFile(formData, "promoImage") || !hasUploadedFile(formData, "productImage")) {
      errorRedirect("Mindkét képet (promo és termék) kötelező feltölteni.");
      return;
    }

    const [promoImage, productImage] = await Promise.all([
      readUploadedImage(formData, "promoImage"),
      readUploadedImage(formData, "productImage"),
    ]);

    if (!promoImage || !productImage) {
      errorRedirect("Hiba a képfeltöltés során. Próbáld újra.");
      return;
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
  } catch (e) {
    if (isRedirectError(e)) throw e;
    errorRedirect("Hiba az elem létrehozásakor. Ellenőrizd a feltöltött fájlokat.");
  }
}

export async function updateSpecialEditionEntryAction(formData: FormData) {
  await requireAdminUser("/admin/special-edition");
  try {
    const entryId = readString(formData, "entryId");
    const productId = readString(formData, "productId");
    const currentPromoImageUrl = readString(formData, "currentPromoImageUrl");
    const currentProductImageUrl = readString(formData, "currentProductImageUrl");
    const sortOrder = readNumber(formData, "sortOrder");
    const promoAlt = readString(formData, "promoImageAlt");
    const productAlt = readString(formData, "productImageAlt");

    if (!entryId || !productId) {
      errorRedirect("Hiányzó elem azonosító vagy termék.");
      return;
    }

    const [existingEntry, product, nextPromoImage, nextProductImage] = await Promise.all([
      db.specialEditionEntry.findUnique({
        where: { id: entryId },
        select: { id: true, promoImageUrl: true, productImageUrl: true },
      }),
      db.product.findFirst({
        where: { id: productId, archivedAt: null },
        select: { id: true, name: true },
      }),
      readUploadedImage(formData, "promoImage"),
      readUploadedImage(formData, "productImage"),
    ]);

    if (!existingEntry) {
      errorRedirect("A Special Edition elem nem található.");
      return;
    }

    if (!product) {
      errorRedirect("A kiválasztott termék nem található.");
      return;
    }

    const promoImageUrl =
      nextPromoImage?.url || currentPromoImageUrl || existingEntry.promoImageUrl;
    const productImageUrl =
      nextProductImage?.url || currentProductImageUrl || existingEntry.productImageUrl;

    if (!promoImageUrl || !productImageUrl) {
      errorRedirect("Mindkét kép szükséges.");
      return;
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
      nextPromoImage &&
      existingEntry.promoImageUrl !== promoImageUrl &&
      existingEntry.promoImageUrl !== productImageUrl
        ? deleteProductImageFile(existingEntry.promoImageUrl)
        : Promise.resolve(),
      nextProductImage &&
      existingEntry.productImageUrl !== productImageUrl &&
      existingEntry.productImageUrl !== promoImageUrl
        ? deleteProductImageFile(existingEntry.productImageUrl)
        : Promise.resolve(),
    ]);

    revalidateSpecialEditionPaths();
    redirect("/admin/special-edition");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    errorRedirect("Hiba az elem frissítésekor.");
  }
}

export async function deleteSpecialEditionEntryAction(formData: FormData) {
  await requireAdminUser("/admin/special-edition");
  try {
    const entryId = readString(formData, "entryId");

    if (!entryId) {
      errorRedirect("Hiányzó elem azonosító.");
      return;
    }

    const entry = await db.specialEditionEntry.findUnique({
      where: { id: entryId },
      select: { id: true, promoImageUrl: true, productImageUrl: true },
    });

    if (!entry) {
      errorRedirect("A Special Edition elem nem található.");
      return;
    }

    await db.specialEditionEntry.delete({ where: { id: entryId } });

    await Promise.all([
      deleteProductImageFile(entry.promoImageUrl),
      entry.productImageUrl !== entry.promoImageUrl
        ? deleteProductImageFile(entry.productImageUrl)
        : Promise.resolve(),
    ]);

    revalidateSpecialEditionPaths();
    redirect("/admin/special-edition");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    errorRedirect("Hiba az elem törlésekor.");
  }
}
