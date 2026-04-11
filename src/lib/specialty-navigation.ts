import { db } from "@/lib/db";

export const SPECIALTIES_BASE_PATH = "/kulonlegessegek";

export type SpecialtyView = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  isVisible: boolean;
  sortOrder: number;
  productCount: number;
};

export function getSpecialtyHref(item: Pick<SpecialtyView, "slug">) {
  return `${SPECIALTIES_BASE_PATH}/${item.slug}`;
}

function mapSpecialty(
  specialty: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    isVisible: boolean;
    sortOrder: number;
    _count: { products: number };
  },
): SpecialtyView {
  return {
    id: specialty.id,
    name: specialty.name,
    slug: specialty.slug,
    shortDescription: specialty.shortDescription,
    isVisible: specialty.isVisible,
    sortOrder: specialty.sortOrder,
    productCount: specialty._count.products,
  };
}

export async function getVisibleSpecialties(): Promise<SpecialtyView[]> {
  const specialties = await db.specialty.findMany({
    where: { isVisible: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      isVisible: true,
      sortOrder: true,
      _count: { select: { products: true } },
    },
  });

  return specialties.map(mapSpecialty);
}

export async function getAdminSpecialties(): Promise<SpecialtyView[]> {
  const specialties = await db.specialty.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      isVisible: true,
      sortOrder: true,
      _count: { select: { products: true } },
    },
  });

  return specialties.map(mapSpecialty);
}
