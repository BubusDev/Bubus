import type {
  HomepagePlacement as DbHomepagePlacement,
  Prisma,
  ProductImage as DbProductImage,
  ProductOption,
  ProductOptionType,
  SpecialEditionCampaign,
} from "@prisma/client";

import { db } from "@/lib/db";
import {
  editorialCategoryDefinitions,
  editorialCategoryOrder,
  filterGroupDefinitions,
  getFilterOptionsForProducts,
  getTonePalette,
  homepagePlacements,
  mainNavigationDefinitions,
  type CategoryDefinition,
  type CategorySlug,
  type FilterGroup,
  type HomepagePlacement,
  type NavigationCategory,
  type Product,
} from "@/lib/catalog";

const productWithImagesAndOptions = {
  images: {
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
  },
  category: true,
  stoneType: true,
  color: true,
  style: true,
  occasion: true,
  availability: true,
  tone: true,
} satisfies Prisma.ProductInclude;

type DbProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productWithImagesAndOptions;
}>;

export type ProductOptionValue = {
  id: string;
  type: ProductOptionType;
  name: string;
  slug: string;
  isActive: boolean;
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

const optionTypeMeta: Record<
  ProductOptionType,
  { label: string; fieldName: ProductOptionGroup["fieldName"] }
> = {
  CATEGORY: { label: "Category", fieldName: "category" },
  STONE_TYPE: { label: "Stone Type", fieldName: "stoneType" },
  COLOR: { label: "Color", fieldName: "color" },
  STYLE: { label: "Style", fieldName: "style" },
  OCCASION: { label: "Occasion", fieldName: "occasion" },
  AVAILABILITY: { label: "Availability", fieldName: "availability" },
  VISUAL_TONE: { label: "Visual Tone", fieldName: "tone" },
};

const homepagePlacementMap: Record<DbHomepagePlacement, HomepagePlacement> = {
  NONE: "none",
  SPOTLIGHT: "spotlight",
  NEW_ARRIVALS: "new_arrivals",
};

const reverseHomepagePlacementMap: Record<HomepagePlacement, DbHomepagePlacement> = {
  none: "NONE",
  spotlight: "SPOTLIGHT",
  new_arrivals: "NEW_ARRIVALS",
};

const canonicalCategorySlugByAlias: Record<string, string> = {
  necklaces: "necklaces",
  nyaklancok: "necklaces",
  "nyakl-ncok": "necklaces",
  bracelets: "bracelets",
  karkotok: "bracelets",
  "kark-t-k": "bracelets",
};

function removeDiacritics(input: string) {
  return input.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizeCategorySlug(slug: string) {
  return canonicalCategorySlugByAlias[slug] ?? slug;
}

function getCategorySlugAliases(categorySlug: string) {
  const normalizedInput = normalizeCategorySlug(categorySlug);

  return Object.entries(canonicalCategorySlugByAlias)
    .filter(([, canonicalSlug]) => canonicalSlug === normalizedInput)
    .map(([alias]) => alias);
}

function mapOption(option: ProductOption): ProductOptionValue {
  return {
    id: option.id,
    type: option.type,
    name: option.name,
    slug: option.slug,
    isActive: option.isActive,
    sortOrder: option.sortOrder,
  };
}

export function slugifyOptionName(input: string) {
  const normalized = removeDiacritics(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return canonicalCategorySlugByAlias[normalized] ?? normalized;
}

function mapImage(image: DbProductImage) {
  return {
    id: image.id,
    url: image.url,
    alt: image.alt,
    isCover: image.isCover,
  };
}

function getMappedImages(product: Pick<DbProductWithRelations, "images" | "imageUrl" | "name">) {
  const mapped = product.images.map(mapImage);

  if (mapped.length > 0) {
    return mapped;
  }

  if (product.imageUrl) {
    return [
      {
        id: `${product.name}-legacy-image`,
        url: product.imageUrl,
        alt: product.name,
        isCover: true,
      },
    ];
  }

  return [];
}

function mapProduct(product: DbProductWithRelations): Product {
  const images = getMappedImages(product);
  const coverImage = images.find((image) => image.isCover) ?? images[0];

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: normalizeCategorySlug(product.category.slug),
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? undefined,
    shortDescription: product.shortDescription,
    description: product.description,
    badge: product.badge,
    collectionLabel: product.collectionLabel,
    stoneType: product.stoneType.slug,
    color: product.color.slug,
    style: product.style.slug,
    occasion: product.occasion.slug,
    availability: product.availability.slug,
    isNew: product.isNew,
    isGiftable: product.isGiftable,
    isOnSale: product.isOnSale,
    tone: product.tone.slug,
    imageUrl: coverImage?.url ?? product.imageUrl,
    images,
    imagePalette: getTonePalette(product.tone.slug),
    homepagePlacement: homepagePlacementMap[product.homepagePlacement],
  };
}

function baseWhereForCategory(categorySlug: CategorySlug): Prisma.ProductWhereInput {
  switch (categorySlug) {
    case "new-in":
      return { isNew: true };
    case "special-edition":
      return { isGiftable: true };
    case "sale":
      return { isOnSale: true };
    default:
      return {
        category: {
          slug: { in: getCategorySlugAliases(categorySlug) },
          type: "CATEGORY",
        },
      };
  }
}

export async function getAllProductSlugs() {
  const products = await db.product.findMany({
    select: { slug: true },
  });

  return products.map((product) => product.slug);
}

export async function getHomepageProducts(
  placement: HomepagePlacement,
  page = 1,
  perPage = 4,
) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const where = {
    homepagePlacement: reverseHomepagePlacementMap[placement],
  } satisfies Prisma.ProductWhereInput;

  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: productWithImagesAndOptions,
      orderBy: [{ isNew: "desc" }, { updatedAt: "desc" }],
      skip: (safePage - 1) * perPage,
      take: perPage,
    }),
  ]);

  return {
    products: products.map(mapProduct),
    page: safePage,
    total,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getProductsForCategory(categorySlug: CategorySlug) {
  const products = await db.product.findMany({
    where: baseWhereForCategory(categorySlug),
    include: productWithImagesAndOptions,
    orderBy: [{ updatedAt: "desc" }],
  });

  return products.map(mapProduct);
}

export async function getFilterOptionsForCategory(categorySlug: CategorySlug) {
  const products = await getProductsForCategory(categorySlug);
  return getFilterOptionsForProducts(products);
}

export async function getProductBySlug(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: productWithImagesAndOptions,
  });

  return product ? mapProduct(product) : null;
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const products = await db.product.findMany({
    where: {
      slug: { not: product.slug },
      OR: [
        { category: { slug: product.category } },
        { occasion: { slug: product.occasion } },
      ],
    },
    include: productWithImagesAndOptions,
    orderBy: [{ isNew: "desc" }, { updatedAt: "desc" }],
    take: limit,
  });

  return products.map(mapProduct);
}

export async function getAdminProducts() {
  return db.product.findMany({
    include: productWithImagesAndOptions,
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getAdminProductById(id: string) {
  return db.product.findUnique({
    where: { id },
    include: productWithImagesAndOptions,
  });
}

export async function getProductOptions(includeInactive = false) {
  return db.productOption.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getProductOptionGroups(includeInactive = false): Promise<ProductOptionGroup[]> {
  const options = await getProductOptions(includeInactive);

  return Object.entries(optionTypeMeta).map(([type, meta]) => ({
    type: type as ProductOptionType,
    label: meta.label,
    fieldName: meta.fieldName,
    options: options.filter((option) => option.type === type).map(mapOption),
  }));
}

export async function getNavigationCategories(): Promise<NavigationCategory[]> {
  const specialEditionCampaign = await getSpecialEditionCampaign();

  return mainNavigationDefinitions
    .filter((item) => !item.requiresSpecialEdition || specialEditionCampaign?.isActive)
    .map(({ slug, label, href }) => ({
      slug,
      label,
      href,
    }));
}

export async function getCategoryDefinition(slug: string): Promise<CategoryDefinition | null> {
  const canonicalSlug = normalizeCategorySlug(slug);
  const editorial = editorialCategoryDefinitions.find((category) => category.slug === slug);
  if (editorial) {
    if (slug === "special-edition") {
      const specialEditionCampaign = await getSpecialEditionCampaign();

      if (!specialEditionCampaign?.isActive) {
        return null;
      }
    }

    return editorial;
  }

  const category = await db.productOption.findFirst({
    where: { type: "CATEGORY", slug: { in: getCategorySlugAliases(canonicalSlug) }, isActive: true },
  });

  if (!category) {
    return null;
  }

  return {
    slug: canonicalSlug,
    label: category.name,
    title: category.name,
    seoDescription: `Fedezd fel a Chicks Jewelry ${category.name.toLocaleLowerCase("hu-HU")} kollekcióját: kifinomult darabok szerkesztett válogatásban.`,
  };
}

export async function getCategorySlugs() {
  const dynamicSlugs = await db.productOption.findMany({
    where: { type: "CATEGORY", isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { slug: true },
  });

  const specialEditionCampaign = await getSpecialEditionCampaign();
  const editorialSlugs = editorialCategoryOrder.filter(
    (slug) => slug !== "special-edition" || specialEditionCampaign?.isActive,
  );

  return [...editorialSlugs, ...new Set(dynamicSlugs.map((item) => normalizeCategorySlug(item.slug)))];
}

export async function getFilterGroupsForAvailableFilters(
  availableFilters: Awaited<ReturnType<typeof getFilterOptionsForCategory>>,
): Promise<FilterGroup[]> {
  const optionGroups = await getProductOptionGroups();
  const optionsByType = new Map(optionGroups.map((group) => [group.type, group.options]));

  const pickOptions = (type: ProductOptionType, values: string[]) => {
    const options = optionsByType.get(type) ?? [];
    const selectedValues = new Set(values);
    return options
      .filter((option) => selectedValues.has(option.slug))
      .map((option) => ({ label: option.name, value: option.slug }));
  };

  return filterGroupDefinitions.map((group) => ({
    ...group,
    options:
      group.key === "category"
        ? pickOptions("CATEGORY", availableFilters.categories)
        : group.key === "stone"
          ? pickOptions("STONE_TYPE", availableFilters.stones)
          : group.key === "color"
            ? pickOptions("COLOR", availableFilters.colors)
            : group.key === "style"
              ? pickOptions("STYLE", availableFilters.styles)
              : group.key === "occasion"
                ? pickOptions("OCCASION", availableFilters.occasions)
                : pickOptions("AVAILABILITY", availableFilters.availability),
  }));
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function readNumber(formData: FormData, key: string) {
  const raw = readString(formData, key);
  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : NaN;
}

function requireNonEmptyString(formData: FormData, key: string, message: string) {
  const value = readString(formData, key);
  if (!value) {
    throw new Error(message);
  }

  return value;
}

export type AdminProductImageValue = {
  id: string;
  url: string;
  alt: string;
  isCover: boolean;
};

export type AdminProductFormValues = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
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
  tone: string;
  homepagePlacement: HomepagePlacement;
  images: AdminProductImageValue[];
};

export type AdminProductFormOptions = {
  categories: ProductOptionValue[];
  stoneTypes: ProductOptionValue[];
  colors: ProductOptionValue[];
  styles: ProductOptionValue[];
  occasions: ProductOptionValue[];
  availability: ProductOptionValue[];
  tones: ProductOptionValue[];
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

export async function getAdminProductFormOptions(): Promise<AdminProductFormOptions> {
  const groups = await getProductOptionGroups();
  const byField = new Map(groups.map((group) => [group.fieldName, group.options]));

  return {
    categories: byField.get("category") ?? [],
    stoneTypes: byField.get("stoneType") ?? [],
    colors: byField.get("color") ?? [],
    styles: byField.get("style") ?? [],
    occasions: byField.get("occasion") ?? [],
    availability: byField.get("availability") ?? [],
    tones: byField.get("tone") ?? [],
    homepagePlacements,
  };
}

export function toAdminProductFormValues(
  product: DbProductWithRelations | null,
  options: AdminProductFormOptions,
): AdminProductFormValues {
  if (!product) {
    return {
      id: "",
      slug: "",
      name: "",
      category: options.categories[0]?.id ?? "",
      price: 0,
      compareAtPrice: "",
      shortDescription: "",
      description: "",
      badge: "",
      collectionLabel: "",
      stoneType: options.stoneTypes[0]?.id ?? "",
      color: options.colors[0]?.id ?? "",
      style: options.styles[0]?.id ?? "",
      occasion: options.occasions[0]?.id ?? "",
      availability: options.availability[0]?.id ?? "",
      isNew: false,
      isGiftable: false,
      isOnSale: false,
      tone: options.tones[0]?.id ?? "",
      homepagePlacement: "none",
      images: [],
    };
  }

  const images: AdminProductImageValue[] = getMappedImages(product).map((image) => ({
    id: image.id,
    url: image.url,
    alt: image.alt ?? product.name,
    isCover: image.isCover,
  }));

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.categoryId,
    price: product.price,
    compareAtPrice:
      typeof product.compareAtPrice === "number" ? String(product.compareAtPrice) : "",
    shortDescription: product.shortDescription,
    description: product.description,
    badge: product.badge,
    collectionLabel: product.collectionLabel,
    stoneType: product.stoneTypeId,
    color: product.colorId,
    style: product.styleId,
    occasion: product.occasionId,
    availability: product.availabilityId,
    isNew: product.isNew,
    isGiftable: product.isGiftable,
    isOnSale: product.isOnSale,
    tone: product.toneId,
    homepagePlacement: homepagePlacementMap[product.homepagePlacement],
    images,
  };
}

async function requireOption(optionId: string, type: ProductOptionType) {
  const option = await db.productOption.findFirst({
    where: { id: optionId, type, isActive: true },
    select: { id: true },
  });

  if (!option) {
    throw new Error(`Invalid ${optionTypeMeta[type].label.toLowerCase()}.`);
  }

  return option.id;
}

export async function parseProductFormData(
  formData: FormData,
): Promise<Prisma.ProductUncheckedCreateInput> {
  const slug = requireNonEmptyString(formData, "slug", "Slug is required.");
  const name = requireNonEmptyString(formData, "name", "Name is required.");
  const badge = requireNonEmptyString(formData, "badge", "Badge is required.");
  const collectionLabel = requireNonEmptyString(
    formData,
    "collectionLabel",
    "Collection label is required.",
  );
  const shortDescription = requireNonEmptyString(
    formData,
    "shortDescription",
    "Short description is required.",
  );
  const description = requireNonEmptyString(formData, "description", "Description is required.");
  const price = readNumber(formData, "price");
  const compareAtPrice = readString(formData, "compareAtPrice");
  const homepagePlacement = requireNonEmptyString(
    formData,
    "homepagePlacement",
    "Homepage placement is required.",
  );

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Price must be a valid positive number.");
  }

  if (!homepagePlacements.includes(homepagePlacement as HomepagePlacement)) {
    throw new Error("Invalid homepage placement.");
  }

  const compareAtPriceNumber =
    compareAtPrice.length > 0 ? Number(compareAtPrice) : undefined;

  if (
    typeof compareAtPriceNumber === "number" &&
    (!Number.isFinite(compareAtPriceNumber) || compareAtPriceNumber < 0)
  ) {
    throw new Error("Compare-at price must be empty or a valid positive number.");
  }

  const [
    categoryId,
    stoneTypeId,
    colorId,
    styleId,
    occasionId,
    availabilityId,
    toneId,
  ] = await Promise.all([
    requireOption(readString(formData, "category"), "CATEGORY"),
    requireOption(readString(formData, "stoneType"), "STONE_TYPE"),
    requireOption(readString(formData, "color"), "COLOR"),
    requireOption(readString(formData, "style"), "STYLE"),
    requireOption(readString(formData, "occasion"), "OCCASION"),
    requireOption(readString(formData, "availability"), "AVAILABILITY"),
    requireOption(readString(formData, "tone"), "VISUAL_TONE"),
  ]);

  return {
    slug,
    name,
    categoryId,
    price,
    compareAtPrice: compareAtPriceNumber,
    shortDescription,
    description,
    badge,
    collectionLabel,
    stoneTypeId,
    colorId,
    styleId,
    occasionId,
    availabilityId,
    isNew: readBoolean(formData, "isNew"),
    isGiftable: readBoolean(formData, "isGiftable"),
    isOnSale: readBoolean(formData, "isOnSale"),
    toneId,
    homepagePlacement: reverseHomepagePlacementMap[homepagePlacement as HomepagePlacement],
  };
}

async function ensureSpecialEditionCampaignRecord() {
  const existing = await db.specialEditionCampaign.findUnique({
    where: { slug: "gifts" },
  });

  if (existing) {
    return existing;
  }

  return db.specialEditionCampaign.create({
    data: {
      slug: "gifts",
      isActive: false,
    },
  });
}

type DbSpecialEditionCampaignWithEntries = Prisma.SpecialEditionCampaignGetPayload<{
  include: {
    entries: {
      include: {
        product: {
          include: typeof productWithImagesAndOptions;
        };
      };
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }];
    };
  };
}>;

function mapSpecialEditionCampaign(
  campaign: DbSpecialEditionCampaignWithEntries,
): SpecialEditionCampaignView {
  return {
    id: campaign.id,
    slug: campaign.slug,
    isActive: campaign.isActive,
    bannerImageUrl: campaign.bannerImageUrl ?? undefined,
    bannerImageAlt: campaign.bannerImageAlt ?? undefined,
    entries: campaign.entries.map((entry) => ({
      id: entry.id,
      promoImageUrl: entry.promoImageUrl,
      promoImageAlt: entry.promoImageAlt ?? entry.product.name,
      productImageUrl: entry.productImageUrl,
      productImageAlt: entry.productImageAlt ?? entry.product.name,
      sortOrder: entry.sortOrder,
      product: mapProduct(entry.product),
    })),
  };
}

export async function getSpecialEditionCampaign(): Promise<SpecialEditionCampaignView | null> {
  const campaign = await db.specialEditionCampaign.findUnique({
    where: { slug: "gifts" },
    include: {
      entries: {
        include: {
          product: {
            include: productWithImagesAndOptions,
          },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return campaign ? mapSpecialEditionCampaign(campaign) : null;
}

export async function getOrCreateSpecialEditionCampaign(): Promise<SpecialEditionCampaign> {
  return ensureSpecialEditionCampaignRecord();
}

export async function getAdminSpecialEditionCampaign(): Promise<AdminSpecialEditionCampaignValues> {
  const campaign = await db.specialEditionCampaign.findUnique({
    where: { slug: "gifts" },
    include: {
      entries: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!campaign) {
    const created = await ensureSpecialEditionCampaignRecord();

    return {
      id: created.id,
      slug: created.slug,
      isActive: created.isActive,
      bannerImageUrl: "",
      bannerImageAlt: "",
      entries: [],
    };
  }

  return {
    id: campaign.id,
    slug: campaign.slug,
    isActive: campaign.isActive,
    bannerImageUrl: campaign.bannerImageUrl ?? "",
    bannerImageAlt: campaign.bannerImageAlt ?? "",
    entries: campaign.entries.map((entry) => ({
      id: entry.id,
      productId: entry.productId,
      productName: entry.product.name,
      productSlug: entry.product.slug,
      promoImageUrl: entry.promoImageUrl,
      promoImageAlt: entry.promoImageAlt ?? entry.product.name,
      productImageUrl: entry.productImageUrl,
      productImageAlt: entry.productImageAlt ?? entry.product.name,
      sortOrder: entry.sortOrder,
    })),
  };
}

export async function getAdminSelectableProducts() {
  return db.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: [{ name: "asc" }],
  });
}
