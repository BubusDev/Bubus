"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { enqueueBlobCleanup } from "@/lib/blob-cleanup";
import { db } from "@/lib/db";
import { slugifyOptionName } from "@/lib/products";

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
  const clearImage = formData.get("clearImage") === "on";
  const imageUrl = clearImage ? null : readString(formData, "imageUrl") || null;

  if (!name || !slug) {
    redirectWithError("A név és a slug megadása kötelező.");
  }

  return {
    name,
    slug,
    shortDescription: readString(formData, "shortDescription") || null,
    imageUrl,
    imageAlt: imageUrl ? readString(formData, "imageAlt") || null : null,
    sortOrder: readSortOrder(formData),
    isVisible: formData.get("isVisible") === "on",
  };
}

function revalidateSpecialties() {
  revalidatePath("/admin/content/specialties");
  revalidatePath("/kulonlegessegek/[slug]", "page");
  revalidatePath("/", "layout");
}

function redirectWithError(message: string): never {
  redirect(`/admin/content/specialties?error=${encodeURIComponent(message)}`);
}

export async function createSpecialtyAction(formData: FormData) {
  await requireAdminUser("/admin/content/specialties");

  const specialty = readSpecialtyFormData(formData);

  try {
    await db.specialty.create({
      data: specialty,
    });
  } catch {
    redirectWithError("Nem sikerült létrehozni. Ellenőrizd, hogy a slug egyedi-e.");
  }

  revalidateSpecialties();
  redirect("/admin/content/specialties");
}

export async function updateSpecialtyAction(formData: FormData) {
  await requireAdminUser("/admin/content/specialties");

  const id = readString(formData, "id");
  const specialty = readSpecialtyFormData(formData);

  if (!id) {
    redirectWithError("Hiányzó különlegesség azonosító.");
  }

  try {
    const existingSpecialty = await db.specialty.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    await db.specialty.update({
      where: { id },
      data: specialty,
    });

    if (
      existingSpecialty?.imageUrl &&
      existingSpecialty.imageUrl !== specialty.imageUrl
    ) {
      await enqueueBlobCleanup(existingSpecialty.imageUrl, {
        reason: specialty.imageUrl
          ? "specialty_preview_image_replaced"
          : "specialty_preview_image_cleared",
      });
    }
  } catch {
    redirectWithError("Nem sikerült menteni. Ellenőrizd, hogy a slug egyedi-e.");
  }

  revalidateSpecialties();
  redirect("/admin/content/specialties");
}

export async function deleteSpecialtyAction(formData: FormData) {
  await requireAdminUser("/admin/content/specialties");

  const id = readString(formData, "id");
  if (!id) {
    redirectWithError("Hiányzó különlegesség azonosító.");
  }

  const existingSpecialty = await db.specialty.findUnique({
    where: { id },
    select: { imageUrl: true },
  });

  await db.specialty.delete({ where: { id } });

  if (existingSpecialty?.imageUrl) {
    await enqueueBlobCleanup(existingSpecialty.imageUrl, {
      reason: "specialty_deleted",
    });
  }

  revalidateSpecialties();
  redirect("/admin/content/specialties");
}
