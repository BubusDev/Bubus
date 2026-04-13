"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { HomepageContentBlockKey } from "@prisma/client";

import { requireAdminUser } from "@/lib/auth";
import {
  upsertHomepageBlock,
  upsertHomepagePromoTile,
} from "@/lib/homepage-content";
import { saveUploadedHomepageImage } from "@/lib/product-images";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function readImageFile(formData: FormData) {
  const file = formData.get("imageFile");
  return file instanceof File && file.size > 0 ? file : null;
}

function revalidateHomepageContent() {
  revalidatePath("/");
  revalidatePath("/admin/content/homepage");
}

export async function saveHomepageBlockAction(formData: FormData) {
  await requireAdminUser("/admin/content/homepage");

  const key = readString(formData, "key") as HomepageContentBlockKey;
  if (!["HERO", "INSTAGRAM"].includes(key)) {
    throw new Error("Érvénytelen kezdőlapi blokk.");
  }

  const uploadedImage = await saveUploadedHomepageImage(readImageFile(formData));
  const existingImageUrl = readString(formData, "imageUrl");
  const existingImageAlt = readString(formData, "imageAlt");

  await upsertHomepageBlock(key, {
    title: readString(formData, "title"),
    eyebrow: readString(formData, "eyebrow"),
    body: readString(formData, "body"),
    imageUrl: uploadedImage?.url ?? existingImageUrl,
    imageAlt: uploadedImage?.alt || existingImageAlt,
    buttonText: readString(formData, "buttonText"),
    buttonHref: readString(formData, "buttonHref"),
    isVisible: readCheckbox(formData, "isVisible"),
  });

  revalidateHomepageContent();
  redirect("/admin/content/homepage?saved=block");
}

export async function saveHomepagePromoTileAction(formData: FormData) {
  await requireAdminUser("/admin/content/homepage");

  const slotIndex = Number(readString(formData, "slotIndex"));
  if (!Number.isInteger(slotIndex) || slotIndex < 4 || slotIndex > 8) {
    throw new Error("Érvénytelen promó csempe pozíció.");
  }

  const uploadedImage = await saveUploadedHomepageImage(readImageFile(formData));
  const existingImageUrl = readString(formData, "imageUrl");
  const existingImageAlt = readString(formData, "imageAlt");

  await upsertHomepagePromoTile(slotIndex, {
    title: readString(formData, "title"),
    subtitle: readString(formData, "subtitle"),
    href: readString(formData, "href"),
    imageUrl: uploadedImage?.url ?? existingImageUrl,
    imageAlt: uploadedImage?.alt || existingImageAlt,
    isVisible: readCheckbox(formData, "isVisible"),
  });

  revalidateHomepageContent();
  redirect("/admin/content/homepage?saved=tile");
}
