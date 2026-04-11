"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCategoryDefinition, slugifyOptionName } from "@/lib/products";
import { DEFAULT_SPECIALTY_LISTING_HREF } from "@/lib/specialty-navigation";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readSortOrder(formData: FormData) {
  const sortOrder = Number(readString(formData, "sortOrder"));
  return Number.isFinite(sortOrder) ? sortOrder : 0;
}

function normalizeListingHref(href: string) {
  const value = href || DEFAULT_SPECIALTY_LISTING_HREF;

  if (!value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  const url = new URL(value, "https://chicks-jewelry.local");

  return `${url.pathname}${url.search}`;
}

function getListingSlug(href: string) {
  const pathname = new URL(href, "https://chicks-jewelry.local").pathname;
  const segments = pathname.split("/").filter(Boolean);

  return segments.length === 1 ? segments[0] : null;
}

async function readSpecialtyNavigationItemFormData(formData: FormData) {
  const label = readString(formData, "label");
  const href = normalizeListingHref(readString(formData, "href"));
  const filterKey = slugifyOptionName(readString(formData, "filterKey") || label);

  if (!label || !href || !filterKey) {
    redirectWithError("A név, a létező lista URL és a szűrő kulcs megadása kötelező.");
  }

  const listingSlug = getListingSlug(href);
  const listing = listingSlug ? await getCategoryDefinition(listingSlug) : null;

  if (!listing) {
    redirectWithError("A Különlegesség elem célja csak létező terméklista lehet, például /bracelets vagy /anklets.");
  }

  return {
    label,
    href,
    filterKey,
    sortOrder: readSortOrder(formData),
    isVisible: formData.get("isVisible") === "on",
  };
}

function revalidateSpecialtyNavigation() {
  revalidatePath("/admin/content/specialties");
  revalidatePath("/", "layout");
}

function redirectWithError(message: string): never {
  redirect(`/admin/content/specialties?error=${encodeURIComponent(message)}`);
}

export async function createSpecialtyNavigationItemAction(formData: FormData) {
  await requireAdminUser("/admin/content/specialties");

  const item = await readSpecialtyNavigationItemFormData(formData);

  await db.specialtyNavigationItem.create({
    data: item,
  });

  revalidateSpecialtyNavigation();
  redirect("/admin/content/specialties");
}

export async function updateSpecialtyNavigationItemAction(formData: FormData) {
  await requireAdminUser("/admin/content/specialties");

  const id = readString(formData, "id");
  const item = await readSpecialtyNavigationItemFormData(formData);

  if (!id) {
    redirectWithError("Hiányzó navigációs elem azonosító.");
  }

  await db.specialtyNavigationItem.update({
    where: { id },
    data: item,
  });

  revalidateSpecialtyNavigation();
  redirect("/admin/content/specialties");
}

export async function deleteSpecialtyNavigationItemAction(formData: FormData) {
  await requireAdminUser("/admin/content/specialties");

  const id = readString(formData, "id");
  if (!id) {
    redirectWithError("Hiányzó navigációs elem azonosító.");
  }

  await db.specialtyNavigationItem.delete({ where: { id } });

  revalidateSpecialtyNavigation();
  redirect("/admin/content/specialties");
}
