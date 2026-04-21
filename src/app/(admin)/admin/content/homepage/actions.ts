"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { HomepageContentBlockKey } from "@prisma/client";

import { requireAdminUser } from "@/lib/auth";
import { enqueueBlobCleanup } from "@/lib/blob-cleanup";
import { db } from "@/lib/db";
import {
  replaceHomepageMaterialPicks,
  upsertHomepageBlock,
  upsertHomepagePromoTile,
} from "@/lib/homepage-content";
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
  revalidatePath("/admin/content/homepage");
}

function readStringList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
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
    eyebrow: readString(formData, "eyebrow"),
    body: readString(formData, "body"),
    imageUrl: finalImageUrl,
    imageAlt,
    buttonText: readString(formData, "buttonText"),
    buttonHref: readString(formData, "buttonHref"),
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
    subtitle: readString(formData, "subtitle"),
    href: readString(formData, "href"),
    imageUrl: finalImageUrl,
    imageAlt,
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
