export const SPECIALTIES_BASE_PATH = "/kulonlegessegek";

export type SpecialtyView = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  isVisible: boolean;
  sortOrder: number;
  productCount: number;
};

export function getSpecialtyHref(item: Pick<SpecialtyView, "slug">) {
  return `${SPECIALTIES_BASE_PATH}/${item.slug}`;
}
