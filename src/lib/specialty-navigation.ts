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
    previewImageCropX: number;
    previewImageCropY: number;
    previewImageZoom: number;
    previewImageAspectRatio: number;
    cardImageUrl: string | null;
    cardImageAlt: string | null;
    cardImageCropX: number;
    cardImageCropY: number;
    cardImageZoom: number;
    cardImageAspectRatio: number;
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
    previewImageCropX: specialty.previewImageCropX,
    previewImageCropY: specialty.previewImageCropY,
    previewImageZoom: specialty.previewImageZoom,
    previewImageAspectRatio: specialty.previewImageAspectRatio,
    cardImageUrl: specialty.cardImageUrl,
    cardImageAlt: specialty.cardImageAlt,
    cardImageCropX: specialty.cardImageCropX,
    cardImageCropY: specialty.cardImageCropY,
    cardImageZoom: specialty.cardImageZoom,
    cardImageAspectRatio: specialty.cardImageAspectRatio,
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
      previewImageCropX: true,
      previewImageCropY: true,
      previewImageZoom: true,
      previewImageAspectRatio: true,
      cardImageUrl: true,
      cardImageAlt: true,
      cardImageCropX: true,
      cardImageCropY: true,
      cardImageZoom: true,
      cardImageAspectRatio: true,
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
      previewImageCropX: true,
      previewImageCropY: true,
      previewImageZoom: true,
      previewImageAspectRatio: true,
      cardImageUrl: true,
      cardImageAlt: true,
      cardImageCropX: true,
      cardImageCropY: true,
      cardImageZoom: true,
      cardImageAspectRatio: true,
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
