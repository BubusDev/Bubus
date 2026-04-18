import { db } from "@/lib/db";
export {
  getSpecialtyHref,
  SPECIALTIES_BASE_PATH,
  type SpecialtyView,
} from "@/lib/specialty-links";
import type { SpecialtyView } from "@/lib/specialty-links";

function mapSpecialty(
  specialty: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    imageUrl: string | null;
    imageAlt: string | null;
    previewImageUrl: string | null;
    previewImageAlt: string | null;
    cardImageUrl: string | null;
    cardImageAlt: string | null;
    cardTitle: string | null;
    cardDescription: string | null;
    ctaLabel: string | null;
    destinationHref: string | null;
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
    imageUrl: specialty.imageUrl,
    imageAlt: specialty.imageAlt,
    previewImageUrl: specialty.previewImageUrl,
    previewImageAlt: specialty.previewImageAlt,
    cardImageUrl: specialty.cardImageUrl,
    cardImageAlt: specialty.cardImageAlt,
    cardTitle: specialty.cardTitle,
    cardDescription: specialty.cardDescription,
    ctaLabel: specialty.ctaLabel,
    destinationHref: specialty.destinationHref,
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
      imageUrl: true,
      imageAlt: true,
      previewImageUrl: true,
      previewImageAlt: true,
      cardImageUrl: true,
      cardImageAlt: true,
      cardTitle: true,
      cardDescription: true,
      ctaLabel: true,
      destinationHref: true,
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
      imageUrl: true,
      imageAlt: true,
      previewImageUrl: true,
      previewImageAlt: true,
      cardImageUrl: true,
      cardImageAlt: true,
      cardTitle: true,
      cardDescription: true,
      ctaLabel: true,
      destinationHref: true,
      isVisible: true,
      sortOrder: true,
      _count: { select: { products: true } },
    },
  });

  return specialties.map(mapSpecialty);
}
