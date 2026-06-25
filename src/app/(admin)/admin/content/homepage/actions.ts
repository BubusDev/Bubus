"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { HomepageContentBlockKey } from "@prisma/client";

import { requireAdminUser } from "@/lib/auth";
import { enqueueBlobCleanup } from "@/lib/blob-cleanup";
import { db } from "@/lib/db";
import {
  type HomepageBlockView,
  type HomepageContentView,
  type HomepagePromoTileView,
  getHomepageContent,
  replaceHomepageMaterialPicks,
  upsertHomepageBlock,
  upsertHomepagePromoTile,
} from "@/lib/homepage-content";
import { replaceInlineFeaturedProducts } from "@/lib/homepage-showcase";
import { validateSupportedLanguage, type SupportedLanguage } from "@/lib/international";
import { storefrontProductWhere } from "@/lib/product-lifecycle";
import { productHasStone } from "@/lib/stone-product";
import type { HomepageMaterialPickType } from "@/lib/homepage-content";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function revalidateHomepageContent() {
  revalidatePath("/");
  revalidatePath("/en");
  revalidatePath("/", "layout");
  revalidatePath("/en", "layout");
  revalidatePath("/admin/content/homepage");
  revalidatePath("/admin/content/homepage-showcase");
}

function readStringList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

type InlineHomepageContentInput = Pick<
  HomepageContentView,
  "hero" | "heroFeatureBar" | "categoryGrid" | "featuredSlider" | "instagram" | "newsletter" | "promoTiles"
> & {
  language: SupportedLanguage;
  featuredProductIds?: string[];
  materialProductIds?: string[];
};

function isAllowedHref(value: string) {
  if (!value) return true;
  return value.startsWith("/") && !value.startsWith("//") || value.startsWith("https://");
}

function assertTitle(block: HomepageBlockView, label: string) {
  if (!block.title.trim()) {
    throw new Error(`${label}: a cím nem lehet üres.`);
  }
}

function assertImageUrl(value: string, label: string) {
  if (typeof value !== "string") {
    throw new Error(`${label}: érvénytelen kép URL.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }

  if (trimmed.startsWith("data:")) {
    throw new Error(`${label}: base64/data URL nem menthető, csak feltöltött kép URL.`);
  }

  if (
    !trimmed.startsWith("/") &&
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("http://localhost")
  ) {
    throw new Error(`${label}: csak relatív vagy https:// kép URL menthető.`);
  }
}

function assertMetadataImageUrls(value: unknown, label: string) {
  if (typeof value === "string") {
    assertImageUrl(value, label);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => assertMetadataImageUrls(item, `${label} ${index + 1}`));
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, nestedValue] of Object.entries(value)) {
      if (key.toLowerCase().includes("imageurl")) {
        assertImageUrl(typeof nestedValue === "string" ? nestedValue : "", `${label} ${key}`);
      } else if (Array.isArray(nestedValue) || (nestedValue && typeof nestedValue === "object")) {
        assertMetadataImageUrls(nestedValue, `${label} ${key}`);
      }
    }
  }
}

function assertHref(value: string, label: string) {
  if (!isAllowedHref(value)) {
    throw new Error(`${label}: csak / relatív vagy https:// link adható meg.`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function shouldPreserveBaseFieldOnEnglishSave(
  key: string,
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
) {
  return `${key}En` in existing || `${key}En` in incoming;
}

function mergeLocalizedMetadataObject(
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
  language: SupportedLanguage,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...existing };

  for (const [key, incomingValue] of Object.entries(incoming)) {
    const existingValue = existing[key];

    if (key.endsWith("En")) {
      result[key] = language === "en" ? incomingValue : existingValue;
      continue;
    }

    if (language === "en" && shouldPreserveBaseFieldOnEnglishSave(key, existing, incoming)) {
      result[key] = existingValue;
      continue;
    }

    if (Array.isArray(incomingValue)) {
      const existingItems = Array.isArray(existingValue) ? existingValue : [];
      result[key] = incomingValue.map((item, index) => {
        const existingItem = existingItems[index];
        if (isRecord(item)) {
          return mergeLocalizedMetadataObject(isRecord(existingItem) ? existingItem : {}, item, language);
        }
        return language === "en" ? existingItem ?? item : item;
      });
      continue;
    }

    if (isRecord(incomingValue)) {
      result[key] = mergeLocalizedMetadataObject(isRecord(existingValue) ? existingValue : {}, incomingValue, language);
      continue;
    }

    result[key] = incomingValue;
  }

  return result;
}

function mergeLocalizedMetadata(
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
  language: SupportedLanguage,
) {
  return mergeLocalizedMetadataObject(existing, incoming, language);
}

function toBlockValues(block: HomepageBlockView, existingBlock: HomepageBlockView, language: SupportedLanguage) {
  const localizedTextValues = language === "en"
    ? {
        title: existingBlock.title.trim(),
        titleEn: block.titleEn.trim(),
        eyebrow: existingBlock.eyebrow.trim(),
        eyebrowEn: block.eyebrowEn.trim(),
        body: existingBlock.body.trim(),
        bodyEn: block.bodyEn.trim(),
        imageAlt: existingBlock.imageAlt.trim(),
        imageAltEn: block.imageAltEn.trim(),
        buttonText: existingBlock.buttonText.trim(),
        buttonTextEn: block.buttonTextEn.trim(),
      }
    : {
        title: block.title.trim(),
        titleEn: existingBlock.titleEn.trim(),
        eyebrow: block.eyebrow.trim(),
        eyebrowEn: existingBlock.eyebrowEn.trim(),
        body: block.body.trim(),
        bodyEn: existingBlock.bodyEn.trim(),
        imageAlt: block.imageAlt.trim(),
        imageAltEn: existingBlock.imageAltEn.trim(),
        buttonText: block.buttonText.trim(),
        buttonTextEn: existingBlock.buttonTextEn.trim(),
      };

  return {
    ...localizedTextValues,
    imageUrl: block.imageUrl.trim(),
    buttonHref: block.buttonHref.trim(),
    metadata: mergeLocalizedMetadata(existingBlock.metadata, block.metadata, language),
    isVisible: block.isVisible,
  };
}

function toTileValues(tile: HomepagePromoTileView, existingTile: HomepagePromoTileView, language: SupportedLanguage) {
  const localizedTextValues = language === "en"
    ? {
        title: existingTile.title.trim(),
        titleEn: tile.titleEn.trim(),
        subtitle: existingTile.subtitle.trim(),
        subtitleEn: tile.subtitleEn.trim(),
        imageAlt: existingTile.imageAlt.trim(),
        imageAltEn: tile.imageAltEn.trim(),
      }
    : {
        title: tile.title.trim(),
        titleEn: existingTile.titleEn.trim(),
        subtitle: tile.subtitle.trim(),
        subtitleEn: existingTile.subtitleEn.trim(),
        imageAlt: tile.imageAlt.trim(),
        imageAltEn: existingTile.imageAltEn.trim(),
      };

  return {
    ...localizedTextValues,
    href: tile.href.trim(),
    imageUrl: tile.imageUrl.trim(),
    isNew: tile.isNew,
    isVisible: tile.isVisible,
  };
}

function normalizeProductIds(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const ids: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const id = item.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
    if (ids.length >= limit) break;
  }

  return ids;
}

export async function updateHomepageContentAction(
  input: InlineHomepageContentInput,
): Promise<{ ok: boolean; message: string }> {
  await requireAdminUser("/");
  const language = validateSupportedLanguage(input.language);

  try {
    assertTitle(input.hero, "Hero");
    assertTitle(input.categoryGrid, "Kategória blokk");
    assertTitle(input.featuredSlider, "Featured slider");
    assertTitle(input.newsletter, "Newsletter");
    assertHref(input.hero.buttonHref, "Hero elsődleges CTA");
    const secondaryHref = input.hero.metadata.secondaryButtonHref;
    if (typeof secondaryHref === "string") {
      assertHref(secondaryHref, "Hero másodlagos CTA");
    }
    assertHref(input.instagram.buttonHref, "Social CTA");
    const facebookHref = input.instagram.metadata.facebookHref;
    if (typeof facebookHref === "string") {
      assertHref(facebookHref, "Facebook CTA");
    }
    assertImageUrl(input.hero.imageUrl, "Hero kép");
    assertImageUrl(input.instagram.imageUrl, "Social kép");
    assertMetadataImageUrls(input.instagram.metadata, "Social metadata kép");

    for (const tile of input.promoTiles) {
      if (!Number.isInteger(tile.slotIndex) || tile.slotIndex < 4 || tile.slotIndex > 8) {
        throw new Error("Érvénytelen promó csempe pozíció.");
      }
      if (!tile.title.trim()) {
        throw new Error(`Promó csempe ${tile.slotIndex}: a cím nem lehet üres.`);
      }
      assertHref(tile.href, `Promó csempe ${tile.slotIndex} link`);
      assertImageUrl(tile.imageUrl, `Promó csempe ${tile.slotIndex} kép`);
    }

    const shouldUpdateFeaturedProducts = Array.isArray(input.featuredProductIds);
    const shouldUpdateMaterialProducts = Array.isArray(input.materialProductIds);
    const featuredProductIds = shouldUpdateFeaturedProducts
      ? normalizeProductIds(input.featuredProductIds, 12)
      : [];
    const materialProductIds = shouldUpdateMaterialProducts
      ? normalizeProductIds(input.materialProductIds, 5)
      : [];
    const selectedProductIds = Array.from(new Set([...featuredProductIds, ...materialProductIds]));
    const selectedProducts = selectedProductIds.length
      ? await db.product.findMany({
          where: { AND: [storefrontProductWhere, { id: { in: selectedProductIds } }] },
          select: { id: true },
        })
      : [];
    const availableProductIds = new Set(selectedProducts.map((product) => product.id));
    const safeFeaturedProductIds = featuredProductIds.filter((id) => availableProductIds.has(id));
    const safeMaterialProductIds = materialProductIds.filter((id) => availableProductIds.has(id));
    const currentContent = await getHomepageContent();
    const currentTileBySlot = new Map(currentContent.promoTiles.map((tile) => [tile.slotIndex, tile]));

    await Promise.all([
      upsertHomepageBlock("HERO", toBlockValues(input.hero, currentContent.hero, language)),
      upsertHomepageBlock("HERO_FEATURE_BAR", toBlockValues(input.heroFeatureBar, currentContent.heroFeatureBar, language)),
      upsertHomepageBlock("CATEGORY_GRID", toBlockValues(input.categoryGrid, currentContent.categoryGrid, language)),
      upsertHomepageBlock("FEATURED_SLIDER", toBlockValues(input.featuredSlider, currentContent.featuredSlider, language)),
      upsertHomepageBlock("INSTAGRAM", toBlockValues(input.instagram, currentContent.instagram, language)),
      upsertHomepageBlock("NEWSLETTER", toBlockValues(input.newsletter, currentContent.newsletter, language)),
      ...input.promoTiles.map((tile) => {
        const existingTile = currentTileBySlot.get(tile.slotIndex) ?? tile;
        return upsertHomepagePromoTile(tile.slotIndex, toTileValues(tile, existingTile, language));
      }),
      ...(shouldUpdateFeaturedProducts ? [replaceInlineFeaturedProducts(safeFeaturedProductIds)] : []),
      ...(shouldUpdateMaterialProducts
        ? [
            replaceHomepageMaterialPicks(
              safeMaterialProductIds.map((productId, index) => ({
                itemType: "PRODUCT" as HomepageMaterialPickType,
                itemId: productId,
                featuredProductId: productId,
                sortOrder: index + 1,
              })),
            ),
          ]
        : []),
    ]);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "A főoldal mentése nem sikerült.",
    };
  }

  revalidateHomepageContent();
  return { ok: true, message: "Mentve" };
}

export async function saveHomepageBlockAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireAdminUser("/admin/content/homepage");

  const key = readString(formData, "key") as HomepageContentBlockKey;
  if (!["HERO", "INSTAGRAM"].includes(key)) {
    return { ok: false, message: "Érvénytelen kezdőlapi blokk." };
  }

  // newImageUrl is set by the client-side Blob upload (AdminBlobImageInput).
  // If no new image was uploaded the field is empty — fall back to imageUrl (existing).
  const newImageUrl = readString(formData, "newImageUrl");
  const existingImageUrl = readString(formData, "imageUrl");
  const finalImageUrl = newImageUrl || existingImageUrl;
  const imageAlt = readString(formData, "imageAlt");

  await upsertHomepageBlock(key, {
    title: readString(formData, "title"),
    titleEn: readString(formData, "titleEn"),
    eyebrow: readString(formData, "eyebrow"),
    eyebrowEn: readString(formData, "eyebrowEn"),
    body: readString(formData, "body"),
    bodyEn: readString(formData, "bodyEn"),
    imageUrl: finalImageUrl,
    imageAlt,
    imageAltEn: readString(formData, "imageAltEn"),
    buttonText: readString(formData, "buttonText"),
    buttonTextEn: readString(formData, "buttonTextEn"),
    buttonHref: readString(formData, "buttonHref"),
    metadata: {},
    isVisible: readCheckbox(formData, "isVisible"),
  });

  if (existingImageUrl && existingImageUrl !== finalImageUrl) {
    await enqueueBlobCleanup(existingImageUrl, {
      reason: "homepage_block_image_replaced",
    });
  }

  revalidateHomepageContent();
  return { ok: true, message: "A kezdőlapi blokk mentve." };
}

export async function saveHomepagePromoTileAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireAdminUser("/admin/content/homepage");

  const slotIndex = Number(readString(formData, "slotIndex"));
  if (!Number.isInteger(slotIndex) || slotIndex < 4 || slotIndex > 8) {
    return { ok: false, message: "Érvénytelen promó csempe pozíció." };
  }

  const newImageUrl = readString(formData, "newImageUrl");
  const existingImageUrl = readString(formData, "imageUrl");
  const finalImageUrl = newImageUrl || existingImageUrl;
  const imageAlt = readString(formData, "imageAlt");

  await upsertHomepagePromoTile(slotIndex, {
    title: readString(formData, "title"),
    titleEn: readString(formData, "titleEn"),
    subtitle: readString(formData, "subtitle"),
    subtitleEn: readString(formData, "subtitleEn"),
    href: readString(formData, "href"),
    imageUrl: finalImageUrl,
    imageAlt,
    imageAltEn: readString(formData, "imageAltEn"),
    isVisible: readCheckbox(formData, "isVisible"),
  });

  if (existingImageUrl && existingImageUrl !== finalImageUrl) {
    await enqueueBlobCleanup(existingImageUrl, {
      reason: "homepage_promo_tile_image_replaced",
    });
  }

  revalidateHomepageContent();
  return { ok: true, message: "A promó csempe mentve." };
}

export async function saveHomepageMaterialPicksAction(formData: FormData) {
  await requireAdminUser("/admin/content/homepage");

  const seen = new Set<string>();
  const submittedPicks = readStringList(formData, "materialPick")
    .map((value) => {
      const [stoneTypeId, featuredProductId = ""] = value.split(":");
      if (!stoneTypeId) return null;

      if (seen.has(stoneTypeId)) return null;
      seen.add(stoneTypeId);

      return { stoneTypeId, featuredProductId: featuredProductId || null };
    })
    .filter(
      (pick): pick is { stoneTypeId: string; featuredProductId: string | null } => Boolean(pick),
    )
    .slice(0, 4);

  const stoneTypeIds = submittedPicks.map((pick) => pick.stoneTypeId);
  const productIds = submittedPicks
    .map((pick) => pick.featuredProductId)
    .filter((id): id is string => Boolean(id));
  const [stoneTypes, products] = await Promise.all([
    stoneTypeIds.length
      ? db.productOption.findMany({
          where: { type: "STONE_TYPE", id: { in: stoneTypeIds } },
          select: { id: true, slug: true },
        })
      : [],
    productIds.length
      ? db.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            stoneTypeId: true,
            stoneType: {
              select: { id: true, slug: true },
            },
          },
        })
      : [],
  ]);
  const stoneTypeById = new Map(stoneTypes.map((stoneType) => [stoneType.id, stoneType]));
  const productById = new Map(products.map((product) => [product.id, product]));

  const picks = submittedPicks
    .map((pick, index) => {
      const stoneType = stoneTypeById.get(pick.stoneTypeId);
      if (!stoneType) return null;

      const product = pick.featuredProductId ? productById.get(pick.featuredProductId) : null;
      const compatibleProductId =
        product && productHasStone(product, stoneType) ? product.id : null;

      return {
        itemType: "STONE" as HomepageMaterialPickType,
        itemId: stoneType.id,
        featuredProductId: compatibleProductId,
        sortOrder: index + 1,
      };
    })
    .filter(
      (
        pick,
      ): pick is {
        itemType: HomepageMaterialPickType;
        itemId: string;
        featuredProductId: string | null;
        sortOrder: number;
      } => Boolean(pick),
    );

  await replaceHomepageMaterialPicks(picks);

  revalidateHomepageContent();
  redirect("/admin/content/homepage?saved=materials");
}
