"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { HomepageContentBlockKey } from "@prisma/client";

import { requireAdminUser } from "@/lib/auth";
import {
  upsertHomepageBlock,
  upsertHomepagePromoTile,
} from "@/lib/homepage-content";

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

  revalidateHomepageContent();
  redirect("/admin/content/homepage?saved=tile");
}
