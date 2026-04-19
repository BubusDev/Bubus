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

export async function saveHomepageBlockAction(formData: FormData) {
  await requireAdminUser("/admin/content/homepage");

  const key = readString(formData, "key") as HomepageContentBlockKey;
  if (!["HERO", "INSTAGRAM"].includes(key)) {
    throw new Error("Érvénytelen kezdőlapi blokk.");
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
  redirect("/admin/content/homepage?saved=block");
}

export async function saveHomepagePromoTileAction(formData: FormData) {
  await requireAdminUser("/admin/content/homepage");

  const slotIndex = Number(readString(formData, "slotIndex"));
  if (!Number.isInteger(slotIndex) || slotIndex < 4 || slotIndex > 8) {
    throw new Error("Érvénytelen promó csempe pozíció.");
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
  redirect("/admin/content/homepage?saved=tile");
}

export async function saveHomepageMaterialPicksAction(formData: FormData) {
  await requireAdminUser("/admin/content/homepage");

  const seen = new Set<string>();
  const submittedPicks = readStringList(formData, "materialPick")
    .map((value) => {
      const [stoneId, featuredProductId = ""] = value.split(":");
      if (!stoneId) return null;

      if (seen.has(stoneId)) return null;
      seen.add(stoneId);

      return { stoneId, featuredProductId: featuredProductId || null };
    })
    .filter((pick): pick is { stoneId: string; featuredProductId: string | null } => Boolean(pick))
    .slice(0, 4);

  const stoneIds = submittedPicks.map((pick) => pick.stoneId);
  const productIds = submittedPicks
    .map((pick) => pick.featuredProductId)
    .filter((id): id is string => Boolean(id));
  const [stones, products] = await Promise.all([
    stoneIds.length
      ? db.stone.findMany({
          where: { id: { in: stoneIds } },
          select: { id: true, slug: true },
        })
      : [],
    productIds.length
      ? db.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            stoneType: {
              select: { slug: true },
            },
          },
        })
      : [],
  ]);
  const stoneById = new Map(stones.map((stone) => [stone.id, stone]));
  const productById = new Map(products.map((product) => [product.id, product]));

  const picks = submittedPicks
    .map((pick, index) => {
      const stone = stoneById.get(pick.stoneId);
      if (!stone) return null;

      const product = pick.featuredProductId ? productById.get(pick.featuredProductId) : null;
      const compatibleProductId = product && productHasStone(product, stone) ? product.id : null;

      return {
        itemType: "STONE" as HomepageMaterialPickType,
        itemId: stone.id,
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
