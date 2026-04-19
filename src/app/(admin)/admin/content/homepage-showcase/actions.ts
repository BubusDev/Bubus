"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import {
  deleteShowcaseTab,
  duplicateShowcaseTab,
  reorderShowcaseTabs,
  upsertShowcaseTab,
} from "@/lib/homepage-showcase";

export type ShowcaseActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type ShowcaseSaveActionState = ShowcaseActionState & {
  tab?: Awaited<ReturnType<typeof upsertShowcaseTab>>;
};

export type ShowcaseDuplicateActionState = ShowcaseActionState & {
  tab?: Awaited<ReturnType<typeof duplicateShowcaseTab>>;
};

const VALID_FILTER_TYPES = ["new_arrivals", "category", "on_sale", "giftable", "manual"];

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readInt(formData: FormData, key: string, fallback: number) {
  const parsed = parseInt(readString(formData, key), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readStringList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/content/homepage-showcase");
}

function readShowcaseTabInput(formData: FormData) {
  const id = readString(formData, "id") || undefined;
  const key = readString(formData, "key");
  const label = readString(formData, "label");
  const sortOrder = readInt(formData, "sortOrder", 0);
  const isActive = formData.get("isActive") === "on";
  const filterType = readString(formData, "filterType");
  const maxItems = readInt(formData, "maxItems", 8);

  if (!key) throw new Error("A key mező kötelező.");
  if (!label) throw new Error("A label mező kötelező.");
  if (!VALID_FILTER_TYPES.includes(filterType)) throw new Error("Érvénytelen filterType.");

  let filterValue: string | null = null;

  if (filterType === "category") {
    filterValue = readString(formData, "categorySlug");
    if (!filterValue) throw new Error("Kategória típusnál válassz kategóriát.");
  }

  if (filterType === "manual") {
    const productIds = Array.from(new Set(readStringList(formData, "manualProductIds")));
    if (productIds.length === 0) throw new Error("Kézi válogatásnál válassz legalább egy terméket.");
    filterValue = JSON.stringify(productIds);
  }

  return { id, key, label, sortOrder, isActive, filterType, filterValue, maxItems };
}

export async function saveShowcaseTabInlineAction(
  _prevState: ShowcaseSaveActionState,
  formData: FormData,
): Promise<ShowcaseSaveActionState> {
  try {
    await requireAdminUser("/admin/content/homepage-showcase");
    const tab = await upsertShowcaseTab(readShowcaseTabInput(formData));

    revalidate();
    return { status: "success", message: "Mentve", tab };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "A tab mentése nem sikerült.",
    };
  }
}

export async function saveShowcaseTabAction(formData: FormData) {
  await requireAdminUser("/admin/content/homepage-showcase");

  await upsertShowcaseTab(readShowcaseTabInput(formData));

  revalidate();
  redirect("/admin/content/homepage-showcase?saved=1");
}

export async function duplicateShowcaseTabInlineAction(
  _prevState: ShowcaseDuplicateActionState,
  formData: FormData,
): Promise<ShowcaseDuplicateActionState> {
  try {
    await requireAdminUser("/admin/content/homepage-showcase");

    const id = readString(formData, "id");
    if (!id) throw new Error("Hiányzó tab azonosító.");

    const tab = await duplicateShowcaseTab(id);
    revalidate();

    return { status: "success", message: "Másolat létrehozva", tab };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "A duplikálás nem sikerült.",
    };
  }
}

export async function reorderShowcaseTabsAction(formData: FormData) {
  await requireAdminUser("/admin/content/homepage-showcase");

  const ids = readStringList(formData, "tabIds");
  if (ids.length === 0) throw new Error("Nincs menthető sorrend.");

  await reorderShowcaseTabs(ids);
  revalidate();
  redirect("/admin/content/homepage-showcase?reordered=1");
}

export async function deleteShowcaseTabAction(formData: FormData) {
  await requireAdminUser("/admin/content/homepage-showcase");

  const id = readString(formData, "id");
  if (!id) throw new Error("Hiányzó tab azonosító.");

  await deleteShowcaseTab(id);
  revalidate();
  redirect("/admin/content/homepage-showcase?deleted=1");
}
