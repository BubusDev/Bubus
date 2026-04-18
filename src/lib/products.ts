import { ProductStatus } from "@prisma/client";
import type {
  HomepagePlacement as DbHomepagePlacement,
  Prisma,
  ProductImage as DbProductImage,
  ProductOption,
  ProductOptionType,
  SpecialEditionCampaign,
} from "@prisma/client";

import { db } from "@/lib/db";
import { isInStock } from "@/lib/inventory";
import {
  getProductAvailabilitySnapshot,
  isProductPublishReady,
  storefrontProductWhere,
} from "@/lib/product-lifecycle";
import {
  editorialCategoryDefinitions,
  editorialCategoryOrder,
  filterGroupDefinitions,
  getFilterOptionsForProducts,
  getTonePalette,
  homepagePlacements,
  mainNavigationDefinitions,
  toTitleCase,
  type CategoryDefinition,
  type CategorySlug,
  type FilterGroup,
  type HomepagePlacement,
  type NavigationCategory,
  type Product,
} from "@/lib/catalog";
import { getSpecialtyHref } from "@/lib/specialty-links";

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

function buildMerchandisingContext(input: Omit<MerchandisingContext, "storefrontHref" | "storefrontLabel">): MerchandisingContext {
  const destination = resolveMerchandisingStorefrontDestination(input);

  return {
    ...input,
    storefrontHref: destination?.href,
    storefrontLabel: destination?.label,
  };
}

export function resolveMerchandisingStorefrontDestination(
  context: Pick<MerchandisingContext, "href" | "label" | "type">,
) {
  if (!context.href || !context.href.startsWith("/")) {
    return null;
  }

  if (context.type === "homepage") {
    return {
      href: "/#focusban",
      label: "Kezdőlap Fókuszban szekció",
    };
  }

  return {
    href: context.href,
    label: `${context.label} oldal`,
  };
}

const productWithImagesAndOptions = {
  images: {
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
  },
  specialties: {
    select: { specialtyId: true },
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

const optionTypeMeta: Record<
  ProductOptionType,
  { label: string; fieldName: ProductOptionGroup["fieldName"] }
> = {
  CATEGORY: { label: "kategória", fieldName: "category" },
  STONE_TYPE: { label: "kőtípus", fieldName: "stoneType" },
  COLOR: { label: "szín", fieldName: "color" },
  STYLE: { label: "stílus", fieldName: "style" },
  OCCASION: { label: "alkalom", fieldName: "occasion" },
  AVAILABILITY: { label: "elérhetőség", fieldName: "availability" },
  VISUAL_TONE: { label: "vizuális tónus", fieldName: "tone" },
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

function withActiveProducts(where: Prisma.ProductWhereInput = {}): Prisma.ProductWhereInput {
  return {
    archivedAt: null,
    ...where,
  };
}

function withStorefrontProducts(where: Prisma.ProductWhereInput = {}): Prisma.ProductWhereInput {
  return {
    AND: [storefrontProductWhere, where],
  };
}

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
    isStorefrontVisible: option.isStorefrontVisible,
    showInMainNav: option.showInMainNav,
    navSortOrder: option.navSortOrder,
    navLabel: option.navLabel,
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

export function normalizeProductSlug(input: string) {
  return slugifyOptionName(input);
}

export async function assertProductSlugAvailable(slug: string, productId?: string) {
  const [currentProduct, historicalSlug] = await Promise.all([
    db.product.findUnique({
      where: { slug },
      select: { id: true },
    }),
    db.productSlugHistory.findUnique({
      where: { slug },
      select: { productId: true },
    }),
  ]);

  if (currentProduct && currentProduct.id !== productId) {
    throw new Error("Ez a slug már egy másik termék canonical URL-je.");
  }

  if (historicalSlug && historicalSlug.productId !== productId) {
    throw new Error("Ez a slug már egy másik termék korábbi URL-je.");
  }
}

export async function recordProductSlugChange(
  tx: Prisma.TransactionClient,
  input: { productId: string; previousSlug: string; nextSlug: string },
) {
  if (input.previousSlug === input.nextSlug) {
    return;
  }

  await tx.productSlugHistory.deleteMany({
    where: {
      productId: input.productId,
      slug: input.nextSlug,
    },
  });

  await tx.productSlugHistory.upsert({
    where: { slug: input.previousSlug },
    create: {
      productId: input.productId,
      slug: input.previousSlug,
    },
    update: {},
  });
}

function mapImage(image: DbProductImage) {
  return {
    id: image.id,
    url: image.url,
    alt: image.alt,
    isCover: image.isCover,
    cardCropX: image.cardCropX,
    cardCropY: image.cardCropY,
    cardCropZoom: image.cardCropZoom,
    cardCropAspectRatio: image.cardCropAspectRatio,
    cardCropAreaX: image.cardCropAreaX,
    cardCropAreaY: image.cardCropAreaY,
    cardCropAreaWidth: image.cardCropAreaWidth,
    cardCropAreaHeight: image.cardCropAreaHeight,
  };
}

function getSafeString(value: string | null | undefined, fallback: string) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || fallback;
}

function getSafeSlug(value: string | null | undefined, fallback: string) {
  return getSafeString(value, fallback).toLowerCase();
}

function getSafeRelation(
  option: ProductOption | null | undefined,
  fallbackName: string,
  fallbackSlug: string,
) {
  return {
    name: getSafeString(option?.name, fallbackName),
    slug: getSafeSlug(option?.slug, fallbackSlug),
  };
}

function getOptionLabel(name?: string | null, slug?: string | null) {
  const normalizedName = typeof name === "string" ? name.trim() : "";

  if (normalizedName) {
    return normalizedName;
  }

  const normalizedSlug = typeof slug === "string" ? slug.trim() : "";

  if (normalizedSlug) {
    return toTitleCase(normalizedSlug.replace(/-/g, " "));
  }

  return "Nincs megadva";
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
        cardCropX: 50,
        cardCropY: 50,
        cardCropZoom: 1,
        cardCropAspectRatio: 0.75,
        cardCropAreaX: 0,
        cardCropAreaY: 0,
        cardCropAreaWidth: 100,
        cardCropAreaHeight: 100,
      },
    ];
  }

  return [];
}

function mapProduct(product: DbProductWithRelations, manualSortOrder?: number | null): Product {
  const category = getSafeRelation(product.category, "Egyéb", "other");
  const stoneType = getSafeRelation(product.stoneType, "Nincs megadva", "unspecified");
  const color = getSafeRelation(product.color, "Nincs megadva", "unspecified");
  const style = getSafeRelation(product.style, "Nincs megadva", "unspecified");
  const occasion = getSafeRelation(product.occasion, "Nincs megadva", "unspecified");
  const availability = getSafeRelation(
    product.availability,
    product.stockQuantity > 0 ? "Elérhető" : "Elfogyott",
    product.stockQuantity > 0 ? "in-stock" : "out-of-stock",
  );
  const tone = getSafeRelation(product.tone, "Alap", "default");
  const hasIncompleteOptionData = [
    product.category,
    product.stoneType,
    product.color,
    product.style,
    product.occasion,
    product.availability,
    product.tone,
  ].some((option) => !option?.name?.trim() || !option?.slug?.trim());

  if (hasIncompleteOptionData) {
    console.warn("[products] Incomplete product option data detected.", {
      productId: product.id,
      slug: product.slug,
    });
  }

  const images = getMappedImages(product);
  const coverImage = images.find((image) => image.isCover) ?? images[0];
  const shortDescription = getSafeString(
    product.shortDescription,
    "A termék leírása hamarosan érkezik.",
  );

  const availabilitySnapshot = getProductAvailabilitySnapshot(product);

  return {
    id: product.id,
    slug: product.slug,
    status: product.status,
    name: getSafeString(product.name, "Névtelen termék"),
    category: normalizeCategorySlug(category.slug),
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? undefined,
    shortDescription,
    description: getSafeString(product.description, shortDescription),
    badge: getSafeString(product.badge, product.isOnSale ? "Akció" : product.isNew ? "Újdonság" : "Kiemelt"),
    collectionLabel: getSafeString(product.collectionLabel, "Kollekció"),
    stockQuantity: product.stockQuantity,
    reservedQuantity: product.reservedQuantity,
    soldOutAt: product.soldOutAt,
    archivedAt: product.archivedAt,
    inStock: isInStock(product),
    availableToSell: availabilitySnapshot.availableToSell,
    stoneType: stoneType.slug,
    color: color.slug,
    style: style.slug,
    occasion: occasion.slug,
    availability: availability.slug,
    isNew: product.isNew,
    isGiftable: product.isGiftable,
    isOnSale: product.isOnSale,
    specialtyKey: product.specialtyKey,
    tone: tone.slug,
    imageUrl: coverImage?.url ?? product.imageUrl,
    images,
    imagePalette: getTonePalette(tone.slug),
    homepagePlacement: homepagePlacementMap[product.homepagePlacement],
    manualSortOrder: manualSortOrder ?? null,
    labels: {
      category: getOptionLabel(category.name, category.slug),
      stoneType: getOptionLabel(stoneType.name, stoneType.slug),
      color: getOptionLabel(color.name, color.slug),
      style: getOptionLabel(style.name, style.slug),
      occasion: getOptionLabel(occasion.name, occasion.slug),
      availability: getOptionLabel(availability.name, availability.slug),
      tone: getOptionLabel(tone.name, tone.slug),
    },
  };
}

function mapStorefrontProducts(products: DbProductWithRelations[], manualSortOrders?: Map<string, number>) {
  return products
    .filter(isProductPublishReady)
    .map((product) => mapProduct(product, manualSortOrders?.get(product.id) ?? null));
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

function getEditorialListingKey(slug: string) {
  return `editorial:${slug}`;
}

function getCategoryListingKey(slug: string) {
  return `category:${normalizeCategorySlug(slug)}`;
}

function getHomepageListingKey(placement: HomepagePlacement) {
  return `homepage:${placement}`;
}

function getSpecialtyListingKey(slug: string) {
  return `specialty:${slug}`;
}

function getListingKeyForCategory(categorySlug: CategorySlug) {
  return editorialCategoryDefinitions.some((category) => category.slug === categorySlug)
    ? getEditorialListingKey(categorySlug)
    : getCategoryListingKey(categorySlug);
}

async function getManualSortOrdersForListing<T extends { id: string }>(
  listingKey: string,
  items: T[],
) {
  const placements = await db.productListingPlacement.findMany({
    where: { listingKey, isVisible: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { productId: true },
  });

  if (placements.length === 0) {
    return null;
  }

  const itemIds = new Set(items.map((item) => item.id));
  const orderedIds = placements
    .map((placement) => placement.productId)
    .filter((productId) => itemIds.has(productId));
  const placedIds = new Set(orderedIds);

  for (const item of items) {
    if (!placedIds.has(item.id)) {
      orderedIds.push(item.id);
    }
  }

  return new Map(orderedIds.map((productId, index) => [productId, index]));
}

function sortByManualSortOrders<T extends { id: string }>(items: T[], manualSortOrders: Map<string, number> | null) {
  if (!manualSortOrders) {
    return items;
  }

  return [...items].sort(
    (a, b) =>
      (manualSortOrders.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
      (manualSortOrders.get(b.id) ?? Number.MAX_SAFE_INTEGER),
  );
}

export async function getAllProductSlugs() {
  const products = await db.product.findMany({
    where: withStorefrontProducts(),
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
  const where = withStorefrontProducts({
    homepagePlacement: reverseHomepagePlacementMap[placement],
  });

  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: productWithImagesAndOptions,
      orderBy: [{ isNew: "desc" }, { updatedAt: "desc" }],
    }),
  ]);
  const manualSortOrders = await getManualSortOrdersForListing(getHomepageListingKey(placement), products);
  const orderedProducts = sortByManualSortOrders(products, manualSortOrders);
  const pagedProducts = orderedProducts.slice((safePage - 1) * perPage, safePage * perPage);

  return {
    products: mapStorefrontProducts(pagedProducts, manualSortOrders ?? undefined),
    page: safePage,
    total,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getProductsForCategory(categorySlug: CategorySlug) {
  const products = await db.product.findMany({
    where: withStorefrontProducts(baseWhereForCategory(categorySlug)),
    include: productWithImagesAndOptions,
    orderBy: [{ updatedAt: "desc" }],
  });
  const manualSortOrders = await getManualSortOrdersForListing(getListingKeyForCategory(categorySlug), products);

  return mapStorefrontProducts(sortByManualSortOrders(products, manualSortOrders), manualSortOrders ?? undefined);
}

export async function getSpecialtyBySlug(slug: string, visibleOnly = true) {
  const specialty = await db.specialty.findFirst({
    where: {
      slug,
      ...(visibleOnly ? { isVisible: true } : {}),
    },
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

  return specialty
    ? {
        id: specialty.id,
        name: specialty.name,
        slug: specialty.slug,
        shortDescription: specialty.shortDescription,
        isVisible: specialty.isVisible,
        sortOrder: specialty.sortOrder,
        productCount: specialty._count.products,
      }
    : null;
}

export async function getProductsForSpecialty(slug: string) {
  const productSpecialties = await db.productSpecialty.findMany({
    where: {
      specialty: {
        slug,
        isVisible: true,
      },
      product: storefrontProductWhere,
    },
    include: {
      product: {
        include: productWithImagesAndOptions,
      },
    },
    orderBy: [{ product: { updatedAt: "desc" } }],
  });
  const products = productSpecialties.map((entry) => entry.product);
  const manualSortOrders = await getManualSortOrdersForListing(getSpecialtyListingKey(slug), products);

  return mapStorefrontProducts(sortByManualSortOrders(products, manualSortOrders), manualSortOrders ?? undefined);
}

export async function getFilterOptionsForCategory(categorySlug: CategorySlug) {
  const products = await getProductsForCategory(categorySlug);
  return getFilterOptionsForProducts(products);
}

export async function getProductBySlug(slug: string) {
  const product = await db.product.findFirst({
    where: withStorefrontProducts({ slug }),
    include: productWithImagesAndOptions,
  });

  return product && isProductPublishReady(product) ? mapProduct(product) : null;
}

export async function resolveProductBySlug(slug: string) {
  const currentProduct = await db.product.findFirst({
    where: withStorefrontProducts({ slug }),
    include: productWithImagesAndOptions,
  });

  if (currentProduct && isProductPublishReady(currentProduct)) {
    return {
      product: mapProduct(currentProduct),
      redirectToSlug: null,
    };
  }

  const historicalSlug = await db.productSlugHistory.findUnique({
    where: { slug },
    include: {
      product: {
        include: productWithImagesAndOptions,
      },
    },
  });

  if (!historicalSlug) {
    return null;
  }

  const product = historicalSlug.product;
  const availability = getProductAvailabilitySnapshot(product);

  if (!availability.isPdpAvailable || !isProductPublishReady(product)) {
    return null;
  }

  return {
    product: mapProduct(product),
    redirectToSlug: product.slug === slug ? null : product.slug,
  };
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const products = await db.product.findMany({
    where: withStorefrontProducts({
      slug: { not: product.slug },
      OR: [
        { category: { slug: { in: getCategorySlugAliases(product.category) } } },
        { occasion: { slug: product.occasion } },
      ],
    }),
    include: productWithImagesAndOptions,
    orderBy: [{ isNew: "desc" }, { updatedAt: "desc" }],
    take: limit,
  });

  return mapStorefrontProducts(products);
}

export async function getCuratedProductRecommendations(
  excludedProductIds: string[],
  limit = 4,
) {
  if (limit <= 0) {
    return [];
  }

  const selectedIds = new Set(excludedProductIds);
  const picks: Product[] = [];
  const bucketFilters: Prisma.ProductWhereInput[] = [
    { isOnSale: true },
    { isGiftable: true },
    { isNew: true },
  ];

  for (const bucketWhere of bucketFilters) {
    if (picks.length >= limit) {
      break;
    }

    const bucket = await db.product.findMany({
      where: withStorefrontProducts({
        ...bucketWhere,
        id: { notIn: Array.from(selectedIds) },
      }),
      include: productWithImagesAndOptions,
      orderBy: [
        { homepagePlacement: "desc" },
        { isOnSale: "desc" },
        { isGiftable: "desc" },
        { isNew: "desc" },
        { updatedAt: "desc" },
      ],
      take: Math.max(limit * 2, 6),
    });

    for (const candidate of mapStorefrontProducts(bucket)) {
      if (selectedIds.has(candidate.id) || !candidate.inStock) {
        continue;
      }

      selectedIds.add(candidate.id);
      picks.push(candidate);

      if (picks.length >= limit) {
        break;
      }
    }
  }

  return picks;
}

export async function getAdminProducts() {
  return db.product.findMany({
    where: withActiveProducts(),
    include: productWithImagesAndOptions,
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getAdminProductById(id: string) {
  return db.product.findFirst({
    where: withActiveProducts({ id }),
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
  const [specialEditionCampaign, dynamicCategories] = await Promise.all([
    getSpecialEditionCampaign(),
    db.productOption.findMany({
      where: {
        type: "CATEGORY",
        isActive: true,
        isStorefrontVisible: true,
        showInMainNav: true,
      },
      orderBy: [{ navSortOrder: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  const editorialItems = mainNavigationDefinitions
    .filter((item) => !item.requiresSpecialEdition || specialEditionCampaign?.isActive)
    .map(({ slug, label, href }) => ({
      slug,
      label,
      href,
    }));

  const existingSlugs = new Set(editorialItems.map((item) => item.slug));
  const dynamicItems = dynamicCategories
    .map((category) => {
      const slug = normalizeCategorySlug(category.slug);

      return {
        slug,
        label: category.navLabel?.trim() || category.name,
        href: `/${slug}`,
      };
    })
    .filter((item) => !existingSlugs.has(item.slug));

  return [...editorialItems, ...dynamicItems];
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
    where: {
      type: "CATEGORY",
      slug: { in: getCategorySlugAliases(canonicalSlug) },
      isActive: true,
      isStorefrontVisible: true,
    },
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
    where: { type: "CATEGORY", isActive: true, isStorefrontVisible: true },
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

export async function getMerchandisingContexts(): Promise<MerchandisingContext[]> {
  const [categories, specialties] = await Promise.all([
    db.productOption.findMany({
      where: { type: "CATEGORY", isActive: true, isStorefrontVisible: true },
      orderBy: [{ showInMainNav: "desc" }, { navSortOrder: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    db.specialty.findMany({
      where: { isVisible: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, shortDescription: true, destinationHref: true },
    }),
  ]);

  const editorialContexts = editorialCategoryDefinitions
    .filter((category) => category.slug !== "special-edition")
    .map((category) => buildMerchandisingContext({
      key: getEditorialListingKey(category.slug),
      type: "editorial" as const,
      label: category.title,
      description: category.seoDescription,
      href: `/${category.slug}`,
    }));

  const categoryContexts = categories.map((category) => {
    const slug = normalizeCategorySlug(category.slug);

    return buildMerchandisingContext({
      key: getCategoryListingKey(slug),
      type: "category" as const,
      label: category.name,
      description: `A ${category.name} kategória storefront sorrendje.`,
      href: `/${slug}`,
      categoryId: category.id,
    });
  });

  const homepageContexts = [
    buildMerchandisingContext({
      key: getHomepageListingKey("spotlight"),
      type: "homepage" as const,
      label: "Kezdőlap - Fókuszban",
      description: "A kezdőlapi Fókuszban / Újdonságok terméksor sorrendje.",
      href: "/",
    }),
  ];

  const specialtyContexts = specialties.map((specialty) => {
    const specialtyHref = getSpecialtyHref({
      slug: specialty.slug,
      destinationHref: specialty.destinationHref,
    });

    return buildMerchandisingContext({
      key: getSpecialtyListingKey(specialty.slug),
      type: "specialty" as const,
      label: `Különlegesség - ${specialty.name}`,
      description: specialty.shortDescription ?? `A ${specialty.name} különlegesség terméksorrendje.`,
      href: specialtyHref.startsWith("/") ? specialtyHref : `/kulonlegessegek/${specialty.slug}`,
      specialtyId: specialty.id,
    });
  });

  return [...categoryContexts, ...editorialContexts, ...homepageContexts, ...specialtyContexts];
}

function getContextBaseWhere(context: MerchandisingContext): Prisma.ProductWhereInput {
  if (context.key === getEditorialListingKey("new-in")) {
    return { isNew: true };
  }

  if (context.key === getEditorialListingKey("sale")) {
    return { isOnSale: true };
  }

  if (context.key === getHomepageListingKey("spotlight")) {
    return { homepagePlacement: "SPOTLIGHT" };
  }

  if (context.type === "category") {
    const slug = context.href.replace(/^\//, "");
    return baseWhereForCategory(slug);
  }

  return {};
}

export async function getAdminMerchandisingBoard(selectedKey?: string) {
  const contexts = await getMerchandisingContexts();
  const selectedContext =
    contexts.find((context) => context.key === selectedKey) ??
    contexts[0] ??
    null;

  if (!selectedContext) {
    return {
      contexts,
      selectedContext: null,
      products: [],
      hasManualOrder: false,
    };
  }

  const products =
    selectedContext.type === "specialty"
      ? (
          await db.productSpecialty.findMany({
            where: {
              specialtyId: selectedContext.specialtyId,
              product: storefrontProductWhere,
            },
            include: {
              product: {
                include: productWithImagesAndOptions,
              },
            },
            orderBy: [{ product: { updatedAt: "desc" } }],
          })
        ).map((entry) => entry.product)
      : await db.product.findMany({
          where: withStorefrontProducts(getContextBaseWhere(selectedContext)),
          include: productWithImagesAndOptions,
          orderBy:
            selectedContext.type === "homepage"
              ? [{ isNew: "desc" }, { updatedAt: "desc" }]
              : [{ updatedAt: "desc" }],
        });

  const placements = await db.productListingPlacement.findMany({
    where: { listingKey: selectedContext.key, isVisible: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { productId: true, sortOrder: true, isPinned: true, isFeatured: true },
  });
  const manualSortOrders = placements.length
    ? await getManualSortOrdersForListing(selectedContext.key, products)
    : null;

  return {
    contexts,
    selectedContext,
    products: mapStorefrontProducts(sortByManualSortOrders(products, manualSortOrders), manualSortOrders ?? undefined),
    hasManualOrder: placements.length > 0,
  };
}

export async function saveMerchandisingOrder(input: {
  listingKey: string;
  orderedProductIds: string[];
}) {
  const contexts = await getMerchandisingContexts();
  const context = contexts.find((item) => item.key === input.listingKey);

  if (!context) {
    throw new Error("Ismeretlen merchandising kontextus.");
  }

  if (input.orderedProductIds.length !== new Set(input.orderedProductIds).size) {
    throw new Error("Duplikált termékazonosító érkezett.");
  }

  const board = await getAdminMerchandisingBoard(context.key);
  const currentIds = new Set(board.products.map((product) => product.id));

  if (
    input.orderedProductIds.length !== currentIds.size ||
    input.orderedProductIds.some((productId) => !currentIds.has(productId))
  ) {
    throw new Error("A terméklista időközben megváltozott. Frissítsd az oldalt, majd ments újra.");
  }

  await db.$transaction(async (tx) => {
    await tx.productListingPlacement.deleteMany({
      where: {
        listingKey: context.key,
        productId: { notIn: input.orderedProductIds },
      },
    });

    await Promise.all(
      input.orderedProductIds.map((productId, index) =>
        tx.productListingPlacement.upsert({
          where: {
            listingKey_productId: {
              listingKey: context.key,
              productId,
            },
          },
          create: {
            productId,
            listingKey: context.key,
            listingType: context.type,
            categoryId: context.categoryId,
            specialtyId: context.specialtyId,
            sortOrder: index,
          },
          update: {
            listingType: context.type,
            categoryId: context.categoryId,
            specialtyId: context.specialtyId,
            sortOrder: index,
            isVisible: true,
          },
        }),
      ),
    );
  });

  return context;
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

export type SpecialtyOptionValue = {
  id: string;
  name: string;
  slug: string;
  isVisible: boolean;
  sortOrder: number;
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
  const [groups, specialties] = await Promise.all([
    getProductOptionGroups(),
    db.specialty.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        isVisible: true,
        sortOrder: true,
      },
    }),
  ]);
  const byField = new Map(groups.map((group) => [group.fieldName, group.options]));

  return {
    statuses: [ProductStatus.DRAFT, ProductStatus.ACTIVE],
    categories: byField.get("category") ?? [],
    stoneTypes: byField.get("stoneType") ?? [],
    colors: byField.get("color") ?? [],
    styles: byField.get("style") ?? [],
    occasions: byField.get("occasion") ?? [],
    availability: byField.get("availability") ?? [],
    tones: byField.get("tone") ?? [],
    specialties,
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
      status: ProductStatus.ACTIVE,
      name: "",
      category: options.categories[0]?.id ?? "",
      price: 0,
      stockQuantity: 0,
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
      specialtyKey: "",
      specialtyIds: [],
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
    cardCropX: image.cardCropX,
    cardCropY: image.cardCropY,
    cardCropZoom: image.cardCropZoom,
    cardCropAspectRatio: image.cardCropAspectRatio,
    cardCropAreaX: image.cardCropAreaX,
    cardCropAreaY: image.cardCropAreaY,
    cardCropAreaWidth: image.cardCropAreaWidth,
    cardCropAreaHeight: image.cardCropAreaHeight,
  }));

  return {
    id: product.id,
    slug: product.slug,
    status: product.status,
    name: product.name,
    category: product.categoryId,
    price: product.price,
    stockQuantity: product.stockQuantity,
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
    specialtyKey: product.specialtyKey ?? "",
    specialtyIds: product.specialties.map((entry) => entry.specialtyId),
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
    throw new Error(`Érvénytelen ${optionTypeMeta[type].label}.`);
  }

  return option.id;
}

async function readProductSpecialtyIds(formData: FormData) {
  const selectedIds = [
    ...new Set(
      formData
        .getAll("specialtyIds")
        .filter((value): value is string => typeof value === "string" && value.length > 0),
    ),
  ];

  if (selectedIds.length === 0) {
    return [];
  }

  const specialties = await db.specialty.findMany({
    where: { id: { in: selectedIds } },
    select: { id: true },
  });
  const validIds = new Set(specialties.map((specialty) => specialty.id));

  if (selectedIds.some((id) => !validIds.has(id))) {
    throw new Error("Érvénytelen különlegesség besorolás.");
  }

  return selectedIds;
}

export async function parseProductFormData(
  formData: FormData,
): Promise<{ data: Prisma.ProductUncheckedCreateInput; specialtyIds: string[] }> {
  const slug = normalizeProductSlug(requireNonEmptyString(formData, "slug", "A slug kötelező."));
  const name = requireNonEmptyString(formData, "name", "A termék neve kötelező.");
  const statusInput = readString(formData, "status");
  const status =
    statusInput === ProductStatus.DRAFT || statusInput === ProductStatus.ACTIVE
      ? statusInput
      : ProductStatus.ACTIVE;
  const badge = readString(formData, "badge");
  const collectionLabel = readString(formData, "collectionLabel");
  const shortDescription = readString(formData, "shortDescription");
  const description = readString(formData, "description");
  const price = readNumber(formData, "price");
  const stockQuantity = readNumber(formData, "stockQuantity");
  const compareAtPrice = readString(formData, "compareAtPrice");
  const homepagePlacement = requireNonEmptyString(
    formData,
    "homepagePlacement",
    "A kezdőlapi kihelyezés kötelező.",
  );

  if (!slug) {
    throw new Error("A slug kötelező.");
  }

  if (!Number.isInteger(price) || price < 0 || (status === ProductStatus.ACTIVE && price <= 0)) {
    throw new Error(
      status === ProductStatus.ACTIVE
        ? "Az aktív termék ára legyen pozitív egész Ft összeg."
        : "Az ár legyen nem negatív egész Ft összeg.",
    );
  }

  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    throw new Error("A készlet legyen érvényes, nem negatív egész szám.");
  }

  if (!homepagePlacements.includes(homepagePlacement as HomepagePlacement)) {
    throw new Error("Érvénytelen kezdőlapi kihelyezés.");
  }

  const compareAtPriceNumber =
    compareAtPrice.length > 0 ? Number(compareAtPrice) : undefined;

  if (
    typeof compareAtPriceNumber === "number" &&
    (!Number.isInteger(compareAtPriceNumber) || compareAtPriceNumber <= price)
  ) {
    throw new Error("Az eredeti ár mező legyen üres vagy a termékárnál magasabb egész Ft összeg.");
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

  const specialtyIds = await readProductSpecialtyIds(formData);

  return {
    data: {
      slug,
      status,
      name,
      categoryId,
      price,
      stockQuantity,
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
      specialtyKey: null,
      toneId,
      homepagePlacement: reverseHomepagePlacementMap[homepagePlacement as HomepagePlacement],
    },
    specialtyIds,
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
    where: withStorefrontProducts(),
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: [{ name: "asc" }],
  });
}
