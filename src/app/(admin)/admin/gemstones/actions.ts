"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteStoneImageFile, saveUploadedStoneImage } from "@/lib/product-images";

const chakraColor: Record<string, string> = {
  crown: "#f4edf8",
  "third-eye": "#8f78c8",
  throat: "#77bad7",
  heart: "#91bc84",
  "solar-plexus": "#e8c85b",
  sacral: "#e98f61",
  root: "#8e3545",
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseJsonArray(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.map((item) => String(item).trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

async function getUniqueSlug(title: string, currentId?: string) {
  const base = toSlug(title) || "dragako";
  let slug = base;
  let suffix = 2;

  while (true) {
    const existing = await db.stone.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === currentId) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

function revalidateGemstones() {
  revalidatePath("/gemstones");
  revalidatePath("/admin/gemstones");
}

export async function upsertGemstoneAction(formData: FormData) {
  await requireAdminUser();

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const subtitle = String(formData.get("subtitle") || "").trim();
  const category = String(formData.get("category") || "Féldrágakő").trim();
  const shortPersonality = String(formData.get("short_personality") || "").trim();
  const longPersonality = String(formData.get("long_personality") || "").trim();
  const submittedAccentColor = String(formData.get("accent_color") || "").trim();
  const accentColor = /^#[0-9a-fA-F]{6}$/.test(submittedAccentColor)
    ? submittedAccentColor
    : null;
  const effects = parseJsonArray(formData.get("effects"));
  const chakras = parseJsonArray(formData.get("chakras"));

  if (!title || !shortPersonality || !longPersonality) {
    return { ok: false, message: "A cím, rövid és hosszú leírás kötelező." };
  }

  const image = formData.get("image") as File | null;
  let imageUrl: string | null | undefined = undefined;

  if (image && image.size > 0) {
    if (id) {
      const existing = await db.stone.findUnique({ where: { id }, select: { imageUrl: true } });
      if (existing?.imageUrl) {
        await deleteStoneImageFile(existing.imageUrl, "gemstone_image_replaced").catch(() => {});
      }
    }
    imageUrl = await saveUploadedStoneImage(image);
  }

  const slug = await getUniqueSlug(title, id || undefined);
  const firstChakra = chakras[0]?.toLowerCase();
  const colorHex = firstChakra ? chakraColor[firstChakra] ?? "#f3bdc8" : "#f3bdc8";
  const maxOrder = await db.stone.aggregate({ _max: { sortOrder: true } });

  const data = {
    name: title,
    slug,
    color: category,
    colorHex,
    shortDesc: shortPersonality,
    longDesc: longPersonality,
    effects,
    origin: subtitle || null,
    chakra: chakras.join(", ") || null,
    accentColor,
    ...(imageUrl !== undefined ? { imageUrl } : {}),
  };

  if (id) {
    await db.stone.update({ where: { id }, data });
  } else {
    await db.stone.create({
      data: {
        ...data,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });
  }

  revalidateGemstones();
  return { ok: true, message: id ? "Drágakő frissítve." : "Drágakő létrehozva." };
}

export async function updateGemstoneOrderAction(ids: string[]) {
  await requireAdminUser();

  await db.$transaction(
    ids.map((id, index) =>
      db.stone.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidateGemstones();
  return { ok: true };
}

export async function deleteGemstoneAction(id: string) {
  await requireAdminUser();

  const stone = await db.stone.findUnique({ where: { id }, select: { imageUrl: true } });
  if (stone?.imageUrl) {
    await deleteStoneImageFile(stone.imageUrl, "gemstone_deleted").catch(() => {});
  }

  await db.stone.delete({ where: { id } });
  revalidateGemstones();
  return { ok: true, message: "Drágakő törölve." };
}
