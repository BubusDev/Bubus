"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readSortOrder(formData: FormData) {
  const sortOrder = Number(readString(formData, "sortOrder"));
  return Number.isFinite(sortOrder) ? sortOrder : 0;
}

function normalizeHref(href: string) {
  if (href.startsWith("/") || href.startsWith("https://") || href.startsWith("http://")) {
    return href;
  }

  return `/${href.replace(/^\/+/, "")}`;
}

function revalidateSpecialtyNavigation() {
  revalidatePath("/admin/content/specialties");
  revalidatePath("/", "layout");
}

function redirectWithError(message: string) {
  redirect(`/admin/content/specialties?error=${encodeURIComponent(message)}`);
}

export async function createSpecialtyNavigationItemAction(formData: FormData) {
  await requireAdminUser("/admin/content/specialties");

  const label = readString(formData, "label");
  const href = normalizeHref(readString(formData, "href"));

  if (!label || !href || href === "/") {
    redirectWithError("A név és a cél URL megadása kötelező.");
  }

  await db.specialtyNavigationItem.create({
    data: {
      label,
      href,
      sortOrder: readSortOrder(formData),
      isVisible: formData.get("isVisible") === "on",
    },
  });

  revalidateSpecialtyNavigation();
  redirect("/admin/content/specialties");
}

export async function updateSpecialtyNavigationItemAction(formData: FormData) {
  await requireAdminUser("/admin/content/specialties");

  const id = readString(formData, "id");
  const label = readString(formData, "label");
  const href = normalizeHref(readString(formData, "href"));

  if (!id || !label || !href || href === "/") {
    redirectWithError("A név és a cél URL megadása kötelező.");
  }

  await db.specialtyNavigationItem.update({
    where: { id },
    data: {
      label,
      href,
      sortOrder: readSortOrder(formData),
      isVisible: formData.get("isVisible") === "on",
    },
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
