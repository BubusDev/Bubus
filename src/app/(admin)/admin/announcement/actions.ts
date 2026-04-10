"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AnnouncementVariant } from "@prisma/client";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";

const allowedVariants = new Set<AnnouncementVariant>([
  "DEFAULT",
  "SALE",
  "SPECIAL_EDITION",
  "NEW_COLLECTION",
]);

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function revalidateAnnouncementPaths() {
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/announcement");
}

export async function saveAnnouncementBarAction(formData: FormData) {
  await requireAdminUser("/admin/announcement");

  const id = readString(formData, "id");
  const text = readString(formData, "text");
  const href = readString(formData, "href");
  const variantValue = readString(formData, "variant");
  const variant = allowedVariants.has(variantValue as AnnouncementVariant)
    ? (variantValue as AnnouncementVariant)
    : "DEFAULT";
  const isActive = formData.get("isActive") === "on" && text.length > 0;

  await db.$transaction(async (tx) => {
    if (isActive) {
      await tx.announcementBar.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    if (id) {
      await tx.announcementBar.update({
        where: { id },
        data: {
          text,
          href: href || null,
          isActive,
          variant,
        },
      });

      return;
    }

    await tx.announcementBar.create({
      data: {
        text,
        href: href || null,
        isActive,
        variant,
      },
    });
  });

  revalidateAnnouncementPaths();
  redirect("/admin/announcement");
}
