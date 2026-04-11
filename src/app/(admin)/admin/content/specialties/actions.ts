"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
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

function readProductIds(formData: FormData) {
  return [
    ...new Set(
      formData
        .getAll("productIds")
        .filter((value): value is string => typeof value === "string" && value.length > 0),
    ),
  ];
}

async function readSpecialtyFormData(formData: FormData) {
  const name = readString(formData, "name");
  const slug = slugifyOptionName(readString(formData, "slug") || name);

  if (!name || !slug) {
    redirectWithError("A név és a slug megadása kötelező.");
  }

  const productIds = readProductIds(formData);
  const products = productIds.length > 0
    ? await db.product.findMany({
        where: { id: { in: productIds }, archivedAt: null },
        select: { id: true },
      })
    : [];
  const validProductIds = new Set(products.map((product) => product.id));

  if (productIds.some((productId) => !validProductIds.has(productId))) {
    redirectWithError("Érvénytelen termék-hozzárendelés.");
  }

  return {
    specialty: {
      name,
      slug,
      shortDescription: readString(formData, "shortDescription") || null,
      sortOrder: readSortOrder(formData),
      isVisible: formData.get("isVisible") === "on",
    },
    productIds,
  };
}

function specialtyProductCreates(productIds: string[]) {
  return productIds.map((productId) => ({
    productId,
  }));
}

function revalidateSpecialties() {
  revalidatePath("/admin/content/specialties");
  revalidatePath("/kulonlegessegek");
  revalidatePath("/kulonlegessegek/[slug]", "page");
  revalidatePath("/", "layout");
}

function redirectWithError(message: string): never {
  redirect(`/admin/content/specialties?error=${encodeURIComponent(message)}`);
}

export async function createSpecialtyAction(formData: FormData) {
  await requireAdminUser("/admin/content/specialties");

  const { specialty, productIds } = await readSpecialtyFormData(formData);

  try {
    await db.specialty.create({
      data: {
        ...specialty,
        products: {
          create: specialtyProductCreates(productIds),
        },
      },
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
  const { specialty, productIds } = await readSpecialtyFormData(formData);

  if (!id) {
    redirectWithError("Hiányzó különlegesség azonosító.");
  }

  try {
    await db.specialty.update({
      where: { id },
      data: {
        ...specialty,
        products: {
          deleteMany: {},
          create: specialtyProductCreates(productIds),
        },
      },
    });
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

  await db.specialty.delete({ where: { id } });

  revalidateSpecialties();
  redirect("/admin/content/specialties");
}
