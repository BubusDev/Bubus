"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { enqueueBlobCleanup } from "@/lib/blob-cleanup";
import { db } from "@/lib/db";
import { slugifyOptionName } from "@/lib/products-server";

export type SpecialtyActionResult =
  | { ok: true; saved: "created" | "updated" | "deleted"; savedId?: string }
  | { ok: false; error: string };

class SpecialtyFormError extends Error {}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readSortOrder(formData: FormData) {
  const sortOrder = Number(readString(formData, "sortOrder"));
  return Number.isFinite(sortOrder) ? sortOrder : 0;
}

function readSpecialtyFormData(formData: FormData) {
  const name = readString(formData, "name");
  const slug = slugifyOptionName(readString(formData, "slug") || name);
  const clearPreviewImage = formData.get("clearPreviewImage") === "on";
  const clearCardImage = formData.get("clearCardImage") === "on";
  const previewImageUrl = clearPreviewImage ? null : readString(formData, "previewImageUrl") || null;
  const cardImageUrl = clearCardImage ? null : readString(formData, "cardImageUrl") || null;
  const previewImageCrop = {
    previewImageCropX: 50,
    previewImageCropY: 50,
    previewImageZoom: 1,
    previewImageAspectRatio: 4 / 5,
  };
  const cardImageCrop = {
    cardImageCropX: 50,
    cardImageCropY: 50,
    cardImageZoom: 1,
    cardImageAspectRatio: 4 / 3,
  };
  const cardDescription = readString(formData, "cardDescription");
  const shortDescription = readString(formData, "shortDescription");

  if (!name || !slug) {
    throw new SpecialtyFormError("A név és a slug megadása kötelező.");
  }

  return {
    name,
    slug,
    shortDescription: shortDescription || null,
    imageUrl: previewImageUrl,
    imageAlt: previewImageUrl ? readString(formData, "previewImageAlt") || null : null,
    previewImageUrl,
    previewImageAlt: previewImageUrl ? readString(formData, "previewImageAlt") || null : null,
    ...previewImageCrop,
    cardImageUrl,
    cardImageAlt: cardImageUrl ? readString(formData, "cardImageAlt") || null : null,
    ...cardImageCrop,
    cardTitle: readString(formData, "cardTitle") || null,
    cardDescription: cardDescription || shortDescription || null,
    ctaLabel: readString(formData, "ctaLabel") || null,
    destinationHref: readString(formData, "destinationHref") || null,
    sortOrder: readSortOrder(formData),
    isVisible: formData.get("isVisible") === "on",
  };
}

function revalidateSpecialties() {
  revalidatePath("/admin/content/specialties");
  revalidatePath("/kulonlegessegek");
  revalidatePath("/kulonlegessegek/[slug]", "page");
  revalidatePath("/", "layout");
}

function redirectWithError(message: string): never {
  redirect(`/admin/content/specialties?error=${encodeURIComponent(message)}`);
}

function isClientSubmit(formData: FormData) {
  return formData.get("_clientSubmit") === "1";
}

function actionFailure(formData: FormData, message: string): SpecialtyActionResult {
  if (isClientSubmit(formData)) {
    return { ok: false, error: message };
  }

  redirectWithError(message);
}

export async function createSpecialtyAction(formData: FormData): Promise<SpecialtyActionResult> {
  await requireAdminUser("/admin/content/specialties");

  let createdSpecialtyId = "";

  try {
    const specialty = readSpecialtyFormData(formData);
    const createdSpecialty = await db.specialty.create({
      data: specialty,
      select: { id: true },
    });
    createdSpecialtyId = createdSpecialty.id;
  } catch (error) {
    return actionFailure(
      formData,
      error instanceof SpecialtyFormError
        ? error.message
        : "Nem sikerült létrehozni. Ellenőrizd, hogy a slug egyedi-e.",
    );
  }

  revalidateSpecialties();
  if (isClientSubmit(formData)) {
    return { ok: true, saved: "created", savedId: createdSpecialtyId };
  }

  redirect(`/admin/content/specialties?saved=created&savedId=${encodeURIComponent(createdSpecialtyId)}#specialty-${createdSpecialtyId}`);
}

export async function updateSpecialtyAction(formData: FormData): Promise<SpecialtyActionResult> {
  await requireAdminUser("/admin/content/specialties");

  const id = readString(formData, "id");

  if (!id) {
    return actionFailure(formData, "Hiányzó különlegesség azonosító.");
  }

  try {
    const specialty = readSpecialtyFormData(formData);
    const existingSpecialty = await db.specialty.findUnique({
      where: { id },
      select: { imageUrl: true, previewImageUrl: true, cardImageUrl: true },
    });

    await db.specialty.update({
      where: { id },
      data: specialty,
    });

    const previousUrls = [
      existingSpecialty?.previewImageUrl,
      existingSpecialty?.imageUrl,
      existingSpecialty?.cardImageUrl,
    ].filter((url): url is string => Boolean(url));
    const nextUrls = new Set([specialty.previewImageUrl, specialty.imageUrl, specialty.cardImageUrl].filter(Boolean));

    for (const url of new Set(previousUrls)) {
      if (!nextUrls.has(url)) {
        await enqueueBlobCleanup(url, {
          reason: "specialty_image_replaced_or_cleared",
        });
      }
    }
  } catch (error) {
    return actionFailure(
      formData,
      error instanceof SpecialtyFormError
        ? error.message
        : "Nem sikerült menteni. Ellenőrizd, hogy a slug egyedi-e.",
    );
  }

  revalidateSpecialties();
  if (isClientSubmit(formData)) {
    return { ok: true, saved: "updated", savedId: id };
  }

  redirect(`/admin/content/specialties?saved=updated&savedId=${encodeURIComponent(id)}#specialty-${id}`);
}

export async function deleteSpecialtyAction(formData: FormData) {
  await requireAdminUser("/admin/content/specialties");

  const id = readString(formData, "id");
  if (!id) {
    redirectWithError("Hiányzó különlegesség azonosító.");
  }

  const existingSpecialty = await db.specialty.findUnique({
    where: { id },
    select: { imageUrl: true, previewImageUrl: true, cardImageUrl: true },
  });

  await db.specialty.delete({ where: { id } });

  const urls = [
    existingSpecialty?.previewImageUrl,
    existingSpecialty?.imageUrl,
    existingSpecialty?.cardImageUrl,
  ].filter((url): url is string => Boolean(url));

  for (const url of new Set(urls)) {
    await enqueueBlobCleanup(url, {
      reason: "specialty_deleted",
    });
  }

  revalidateSpecialties();
  redirect("/admin/content/specialties?saved=deleted");
}
