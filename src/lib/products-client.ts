import type { ProductOptionType, ProductStatus } from "@prisma/client";

import type { HomepagePlacement, Product } from "@/lib/catalog";

export type MerchandisingListingType = "category" | "editorial" | "homepage" | "specialty";

export type MerchandisingContext = {
  key: string;
  type: MerchandisingListingType;
  label: string;
  description: string;
  href: string;
  storefrontHref?: string;
  storefrontLabel?: string;
  categoryId?: string;
  specialtyId?: string;
};

export type ProductOptionValue = {
  id: string;
  type: ProductOptionType;
  name: string;
  slug: string;
  isActive: boolean;
  isStorefrontVisible: boolean;
  showInMainNav: boolean;
  navSortOrder: number;
  navLabel: string | null;
  sortOrder: number;
};

export type ProductOptionGroup = {
  type: ProductOptionType;
  label: string;
  fieldName:
    | "category"
    | "stoneType"
    | "color"
    | "style"
    | "occasion"
    | "availability"
    | "tone";
  options: ProductOptionValue[];
};

export type SpecialtyOptionValue = {
  id: string;
  name: string;
  slug: string;
  isVisible: boolean;
  sortOrder: number;
};

export type AdminProductImageValue = {
  id: string;
  url: string;
  alt: string;
  isCover: boolean;
  cardCropX: number;
  cardCropY: number;
  cardCropZoom: number;
  cardCropAspectRatio: number;
  cardCropAreaX: number;
  cardCropAreaY: number;
  cardCropAreaWidth: number;
  cardCropAreaHeight: number;
};

export type AdminProductFormValues = {
  id: string;
  slug: string;
  status: ProductStatus;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  compareAtPrice: string;
  shortDescription: string;
  description: string;
  badge: string;
  collectionLabel: string;
  stoneType: string;
  color: string;
  style: string;
  occasion: string;
  availability: string;
  isNew: boolean;
  isGiftable: boolean;
  isOnSale: boolean;
  specialtyKey: string;
  specialtyIds: string[];
  tone: string;
  homepagePlacement: HomepagePlacement;
  images: AdminProductImageValue[];
};

export type AdminProductFormOptions = {
  statuses: ProductStatus[];
  categories: ProductOptionValue[];
  stoneTypes: ProductOptionValue[];
  colors: ProductOptionValue[];
  styles: ProductOptionValue[];
  occasions: ProductOptionValue[];
  availability: ProductOptionValue[];
  tones: ProductOptionValue[];
  specialties: SpecialtyOptionValue[];
  homepagePlacements: readonly HomepagePlacement[];
};

export type SpecialEditionEntryView = {
  id: string;
  promoImageUrl: string;
  promoImageAlt: string;
  productImageUrl: string;
  productImageAlt: string;
  sortOrder: number;
  product: Product;
};

export type SpecialEditionCampaignView = {
  id: string;
  slug: string;
  isActive: boolean;
  bannerImageUrl?: string;
  bannerImageAlt?: string;
  entries: SpecialEditionEntryView[];
};

export type AdminSpecialEditionEntryValue = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  promoImageUrl: string;
  promoImageAlt: string;
  productImageUrl: string;
  productImageAlt: string;
  sortOrder: number;
};

export type AdminSpecialEditionCampaignValues = {
  id: string;
  slug: string;
  isActive: boolean;
  bannerImageUrl: string;
  bannerImageAlt: string;
  entries: AdminSpecialEditionEntryValue[];
};
