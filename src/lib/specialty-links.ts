export const SPECIALTIES_BASE_PATH = "/kulonlegessegek";

export type SpecialtyView = {
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
  productCount: number;
};

export function getSpecialtyHref(item: Pick<SpecialtyView, "slug" | "destinationHref">) {
  return item.destinationHref?.trim() || `${SPECIALTIES_BASE_PATH}/${item.slug}`;
}
