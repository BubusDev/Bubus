"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import {
  deleteShowcaseTab,
  upsertShowcaseTab,
} from "@/lib/homepage-showcase";

const VALID_FILTER_TYPES = ["new_arrivals", "category", "on_sale", "giftable", "manual"];

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readInt(formData: FormData, key: string, fallback: number) {
  const parsed = parseInt(readString(formData, key), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/content/homepage-showcase");
}

export async function saveShowcaseTabAction(formData: FormData) {
  await requireAdminUser("/admin/content/homepage-showcase");

  const id = readString(formData, "id") || undefined;
  const key = readString(formData, "key");
  const label = readString(formData, "label");
  const sortOrder = readInt(formData, "sortOrder", 0);
  const isActive = formData.get("isActive") === "on";
  const filterType = readString(formData, "filterType");
  const rawFilterValue = readString(formData, "filterValue");
  const maxItems = readInt(formData, "maxItems", 8);

  if (!key) throw new Error("A key mező kötelező.");
  if (!label) throw new Error("A label mező kötelező.");
  if (!VALID_FILTER_TYPES.includes(filterType)) throw new Error("Érvénytelen filterType.");

  const filterValue = rawFilterValue || null;

  if (filterType === "manual" && filterValue) {
    try {
      const parsed = JSON.parse(filterValue);
      if (!Array.isArray(parsed)) throw new Error();
    } catch {
      throw new Error("A kézi válogatásnál a filterValue JSON tömb kell (pl. [\"id1\",\"id2\"]).");
    }
  }

  await upsertShowcaseTab({ id, key, label, sortOrder, isActive, filterType, filterValue, maxItems });

  revalidate();
  redirect("/admin/content/homepage-showcase?saved=1");
}

export async function deleteShowcaseTabAction(formData: FormData) {
  await requireAdminUser("/admin/content/homepage-showcase");

  const id = readString(formData, "id");
  if (!id) throw new Error("Hiányzó tab azonosító.");

  await deleteShowcaseTab(id);
  revalidate();
  redirect("/admin/content/homepage-showcase?deleted=1");
}
