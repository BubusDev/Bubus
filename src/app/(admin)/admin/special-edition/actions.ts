"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  deleteSpecialEditionImageFile,
} from "@/lib/product-images";
import { storefrontProductWhere } from "@/lib/product-lifecycle";
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

/** Reads a pre-uploaded Vercel Blob URL from a hidden form input. */
function readPreUploadedUrl(formData: FormData, key: string): string | null {
  const url = formData.get(key);
  return typeof url === "string" && url.trim() ? url.trim() : null;
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
    const newBannerImageUrl = readPreUploadedUrl(formData, "newBannerImageUrl");

    const bannerImageUrl = newBannerImageUrl || currentBannerImageUrl || null;
    const bannerImageAlt = bannerImageUrl
      ? bannerAlt || "Special Edition banner"
      : null;

    await db.specialEditionCampaign.update({
      where: { id: campaign.id },
      data: { bannerImageUrl, bannerImageAlt },
    });

    if (newBannerImageUrl && currentBannerImageUrl && currentBannerImageUrl !== newBannerImageUrl) {
      await deleteSpecialEditionImageFile(currentBannerImageUrl, "special_edition_banner_replaced");
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
      where: { AND: [storefrontProductWhere, { id: productId }] },
      select: { id: true, name: true },
    });

    if (!product) {
      errorRedirect("A kiválasztott termék nem található.");
      return;
    }

    const promoImageUrl = readPreUploadedUrl(formData, "promoImageUrl");
    const productImageUrl = readPreUploadedUrl(formData, "productImageUrl");

    if (!promoImageUrl || !productImageUrl) {
      errorRedirect("Mindkét képet (promo és termék) kötelező feltölteni.");
      return;
    }

    await db.specialEditionEntry.create({
      data: {
        campaignId: campaign.id,
        productId: product.id,
        promoImageUrl,
        promoImageAlt: promoAlt || product.name,
        productImageUrl,
        productImageAlt: productAlt || product.name,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      },
    });

    revalidateSpecialEditionPaths();
    redirect("/admin/special-edition");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    errorRedirect("Hiba az elem létrehozásakor. Ellenőrizd a feltöltött képeket.");
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

    const newPromoImageUrl = readPreUploadedUrl(formData, "newPromoImageUrl");
    const newProductImageUrl = readPreUploadedUrl(formData, "newProductImageUrl");

    const [existingEntry, product] = await Promise.all([
      db.specialEditionEntry.findUnique({
        where: { id: entryId },
        select: { id: true, promoImageUrl: true, productImageUrl: true },
      }),
      db.product.findFirst({
        where: { AND: [storefrontProductWhere, { id: productId }] },
        select: { id: true, name: true },
      }),
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
      newPromoImageUrl || currentPromoImageUrl || existingEntry.promoImageUrl;
    const productImageUrl =
      newProductImageUrl || currentProductImageUrl || existingEntry.productImageUrl;

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
      newPromoImageUrl &&
      existingEntry.promoImageUrl !== promoImageUrl &&
      existingEntry.promoImageUrl !== productImageUrl
        ? deleteSpecialEditionImageFile(existingEntry.promoImageUrl, "special_edition_promo_replaced")
        : Promise.resolve(),
      newProductImageUrl &&
      existingEntry.productImageUrl !== productImageUrl &&
      existingEntry.productImageUrl !== promoImageUrl
        ? deleteSpecialEditionImageFile(existingEntry.productImageUrl, "special_edition_product_image_replaced")
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
      deleteSpecialEditionImageFile(entry.promoImageUrl, "special_edition_entry_deleted"),
      entry.productImageUrl !== entry.promoImageUrl
        ? deleteSpecialEditionImageFile(entry.productImageUrl, "special_edition_entry_deleted")
        : Promise.resolve(),
    ]);

    revalidateSpecialEditionPaths();
    redirect("/admin/special-edition");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    errorRedirect("Hiba az elem törlésekor.");
  }
}
