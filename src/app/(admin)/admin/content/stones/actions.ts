"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteStoneImageFile, saveUploadedStoneImage } from "@/lib/product-images";

export async function upsertStoneAction(formData: FormData) {
  await requireAdminUser();

  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string).trim();
  const slug = (formData.get("slug") as string).trim();
  const color = (formData.get("color") as string).trim();
  const colorHex = (formData.get("colorHex") as string).trim();
  const shortDesc = (formData.get("shortDesc") as string).trim();
  const longDesc = (formData.get("longDesc") as string).trim();
  const effectsRaw = (formData.get("effects") as string).trim();
  const origin = (formData.get("origin") as string | null)?.trim() || null;
  const chakra = (formData.get("chakra") as string | null)?.trim() || null;
  const sortOrder = parseInt(formData.get("sortOrder") as string, 10) || 0;
  const removeImage = formData.get("removeImage") === "1";

  const effects = effectsRaw
    ? effectsRaw.split(",").map((e) => e.trim()).filter(Boolean)
    : [];

  let imageUrl: string | null | undefined = undefined; // undefined = no change

  const imageFile = formData.get("stoneImage") as File | null;
  if (imageFile && imageFile.size > 0) {
    // Delete old image if replacing
    if (id) {
      const existing = await db.stone.findUnique({ where: { id }, select: { imageUrl: true } });
      if (existing?.imageUrl) {
        await deleteStoneImageFile(existing.imageUrl, "stone_image_replaced").catch(() => {});
      }
    }
    imageUrl = await saveUploadedStoneImage(imageFile);
  } else if (removeImage && id) {
    const existing = await db.stone.findUnique({ where: { id }, select: { imageUrl: true } });
    if (existing?.imageUrl) {
      await deleteStoneImageFile(existing.imageUrl, "stone_image_cleared").catch(() => {});
    }
    imageUrl = null;
  }

  const data = {
    name, slug, color, colorHex, shortDesc, longDesc, effects, origin, chakra, sortOrder,
    ...(imageUrl !== undefined ? { imageUrl } : {}),
  };

  if (id) {
    await db.stone.update({ where: { id }, data });
  } else {
    await db.stone.create({ data });
  }

  revalidatePath("/stones");
  revalidatePath("/admin/content/stones");
  redirect("/admin/content/stones");
}

export async function deleteStoneAction(formData: FormData) {
  await requireAdminUser();
  const id = formData.get("id") as string;
  const stone = await db.stone.findUnique({ where: { id }, select: { imageUrl: true } });
  if (stone?.imageUrl) {
    await deleteStoneImageFile(stone.imageUrl, "stone_deleted").catch(() => {});
  }
  await db.stone.delete({ where: { id } });
  revalidatePath("/stones");
  revalidatePath("/admin/content/stones");
}
