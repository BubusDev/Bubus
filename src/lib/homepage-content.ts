import type { HomepageContentBlockKey } from "@prisma/client";

import { db } from "@/lib/db";
import { getStorefrontUnavailableProductReason } from "@/lib/homepage-admin-warnings";
import { storefrontProductWhere } from "@/lib/product-lifecycle";
import { productHasStone } from "@/lib/stone-product";

export type HomepageBlockView = {
  id: string;
  key: HomepageContentBlockKey;
  title: string;
  eyebrow: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  buttonText: string;
  buttonHref: string;
  isVisible: boolean;
};

export type HomepagePromoTileView = {
  id: string;
  slotIndex: number;
  title: string;
  subtitle: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
  isVisible: boolean;
};

export type HomepageMaterialPickType = "STONE" | "PRODUCT";

export type HomepageMaterialPickView = {
  id: string;
  type: HomepageMaterialPickType;
  itemId: string;
  legacyItemId: string | null;
  isLegacySource: boolean;
  featuredProductId: string | null;
  storedFeaturedProductId: string | null;
  hasUnavailableFeaturedProduct: boolean;
  unavailableFeaturedProductReason: string | null;
  sortOrder: number;
  title: string;
  subtitle: string;
  href: string;
  imageUrl: string | null;
  imageAlt: string;
  colorHex: string | null;
};

export type HomepageMaterialPickOptions = {
  stoneTypes: {
    id: string;
    name: string;
    slug: string;
  }[];
  products: {
    id: string;
    name: string;
    slug: string;
    stoneTypeId: string;
    stoneSlug: string;
    categoryName: string;
    price: number;
    imageUrl: string | null;
  }[];
};

export type HomepageContentView = {
  hero: HomepageBlockView;
  instagram: HomepageBlockView;
  promoTiles: HomepagePromoTileView[];
  materialPicks: HomepageMaterialPickView[];
};

const defaultBlocks: Record<HomepageContentBlockKey, Omit<HomepageBlockView, "id" | "key">> = {
  HERO: {
    title: "Limitált darabok, váratlan részletekkel",
    eyebrow: "Különleges válogatás",
    body: "Féldrágakövekből, kézzel készített ékszerek szerkesztett kampánya.",
    imageUrl: "/uploads/special-edition/jellyfish-e2a5b467-e672-495e-9248-6a94d4f7d6ad.jpg",
    imageAlt: "Különleges kampányékszer",
    buttonText: "Lepődj meg!",
    buttonHref: "/special-edition",
    isVisible: true,
  },
  INSTAGRAM: {
    title: "@chicksjewelry",
    eyebrow: "Instagram",
    body: "Látogass meg minket és fedezd fel ötleteinket az Instagramon!",
    imageUrl: "/images/book-hands.png",
    imageAlt: "Zöld tónusú Instagram kampánykép",
    buttonText: "Irány az Instagram!",
    buttonHref: "https://instagram.com/chicksjewelry",
    isVisible: true,
  },
};

const defaultPromoTiles = [
  {
    slotIndex: 4,
    title: "Holdfény",
    subtitle: "Finom fényű kövek",
    href: "/special-edition",
    imageUrl: "/seed/opal-necklace.svg",
    imageAlt: "Holdfény kollekció",
    isVisible: true,
  },
  {
    slotIndex: 5,
    title: "Partvonal",
    subtitle: "Karkötők rétegezéshez",
    href: "/bracelets",
    imageUrl: "/uploads/products/bracez-ld-b324c17b-303b-4d3c-9dd6-1edc016ec994.jpg",
    imageAlt: "Partvonal kollekció",
    isVisible: true,
  },
  {
    slotIndex: 6,
    title: "Gyöngy",
    subtitle: "Visszafogott ragyogás",
    href: "/new-in",
    imageUrl: "/seed/pearl-bracelet.svg",
    imageAlt: "Gyöngy kollekció",
    isVisible: true,
  },
  {
    slotIndex: 7,
    title: "Szirom",
    subtitle: "Lágy formák",
    href: "/new-in",
    imageUrl: "/seed/petal-hoops.svg",
    imageAlt: "Szirom kollekció",
    isVisible: true,
  },
  {
    slotIndex: 8,
    title: "Aranyóra",
    subtitle: "Meleg tónusok",
    href: "/sale",
    imageUrl: "/seed/gold-earrings.svg",
    imageAlt: "Aranyóra kollekció",
    isVisible: true,
  },
] satisfies Omit<HomepagePromoTileView, "id">[];

type NullableHomepageBlockInput = {
  id?: string;
  title?: string | null;
  eyebrow?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  buttonText?: string | null;
  buttonHref?: string | null;
  isVisible?: boolean;
};

type NullableHomepageTileInput = {
  id?: string;
  slotIndex: number;
  title?: string | null;
  subtitle?: string | null;
  href?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  isVisible?: boolean;
};

function normalizeBlock(
  key: HomepageContentBlockKey,
  block?: NullableHomepageBlockInput | null,
): HomepageBlockView {
  const fallback = defaultBlocks[key];

  return {
    id: block?.id ?? key,
    key,
    title: block?.title?.trim() || fallback.title,
    eyebrow: block?.eyebrow?.trim() || fallback.eyebrow,
    body: block?.body?.trim() || fallback.body,
    imageUrl: block?.imageUrl?.trim() || fallback.imageUrl,
    imageAlt: block?.imageAlt?.trim() || fallback.imageAlt,
    buttonText: block?.buttonText?.trim() || fallback.buttonText,
    buttonHref: block?.buttonHref?.trim() || fallback.buttonHref,
    isVisible: block?.isVisible ?? fallback.isVisible,
  };
}

function normalizePromoTile(tile: NullableHomepageTileInput) {
  const fallback =
    defaultPromoTiles.find((defaultTile) => defaultTile.slotIndex === tile.slotIndex) ??
    defaultPromoTiles[0];

  return {
    id: tile.id ?? `slot-${tile.slotIndex}`,
    slotIndex: tile.slotIndex,
    title: tile.title?.trim() || fallback.title,
    subtitle: tile.subtitle?.trim() || fallback.subtitle,
    href: tile.href?.trim() || fallback.href,
    imageUrl: tile.imageUrl?.trim() || fallback.imageUrl,
    imageAlt: tile.imageAlt?.trim() || fallback.imageAlt,
    isVisible: tile.isVisible ?? fallback.isVisible,
  };
}

function getProductImageUrl(product: { imageUrl: string | null; images: { url: string }[] }) {
  return product.imageUrl || product.images[0]?.url || null;
}

async function getHomepageMaterialPicks(): Promise<HomepageMaterialPickView[]> {
  const picks = await db.homepageMaterialPick.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: 4,
  });

  const stoneTypeIds = picks.filter((pick) => pick.itemType === "STONE").map((pick) => pick.itemId);
  const productIds = picks
    .map((pick) => pick.featuredProductId)
    .filter((id): id is string => Boolean(id));
  const [stoneTypes, storefrontProducts, storedProducts] = await Promise.all([
    stoneTypeIds.length
      ? db.productOption.findMany({
          where: { type: "STONE_TYPE", id: { in: stoneTypeIds } },
          select: { id: true, name: true, slug: true },
        })
      : [],
    productIds.length
      ? db.product.findMany({
          where: { AND: [storefrontProductWhere, { id: { in: productIds } }] },
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            collectionLabel: true,
            stoneTypeId: true,
            stoneType: {
              select: { id: true, slug: true },
            },
            images: {
              select: { url: true },
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              take: 1,
            },
          },
        })
      : [],
    productIds.length
      ? db.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            status: true,
            name: true,
            slug: true,
            price: true,
            compareAtPrice: true,
            shortDescription: true,
            description: true,
            badge: true,
            imageUrl: true,
            collectionLabel: true,
            stoneTypeId: true,
            stockQuantity: true,
            reservedQuantity: true,
            archivedAt: true,
            isOnSale: true,
            stoneType: {
              select: { id: true, slug: true },
            },
            images: {
              select: { url: true },
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              take: 1,
            },
          },
        })
      : [],
  ]);
  const stoneTypeById = new Map(stoneTypes.map((stoneType) => [stoneType.id, stoneType]));
  const storefrontProductById = new Map(storefrontProducts.map((product) => [product.id, product]));
  const storedProductById = new Map(storedProducts.map((product) => [product.id, product]));

  return picks
    .map((pick): HomepageMaterialPickView | null => {
      if (pick.itemType === "STONE") {
        const stoneType = stoneTypeById.get(pick.itemId);
        const storefrontProduct = pick.featuredProductId
          ? storefrontProductById.get(pick.featuredProductId)
          : null;
        const storedProduct = pick.featuredProductId
          ? storedProductById.get(pick.featuredProductId)
          : null;
        if (!stoneType) {
          return {
            id: pick.id,
            type: "STONE",
            itemId: "",
            legacyItemId: pick.itemId,
            isLegacySource: true,
            featuredProductId: null,
            storedFeaturedProductId: pick.featuredProductId,
            hasUnavailableFeaturedProduct: Boolean(pick.featuredProductId),
            unavailableFeaturedProductReason: pick.featuredProductId
              ? "régi kő-adatforrásból mentett kőtípus"
              : null,
            sortOrder: pick.sortOrder,
            title: "Kőtípus újraválasztása szükséges",
            subtitle: "Régi kő-adatforrásból mentett elem",
            href: "/new-in",
            imageUrl: null,
            imageAlt: "Kőtípus újraválasztása szükséges",
            colorHex: null,
          };
        }
        const isStoredProductCompatible = Boolean(
          storedProduct && productHasStone(storedProduct, stoneType),
        );
        const unavailableProductReason = storedProduct
          ? isStoredProductCompatible
            ? getStorefrontUnavailableProductReason(storedProduct)
            : "nem ehhez a kőtípushoz tartozik"
          : pick.featuredProductId
            ? getStorefrontUnavailableProductReason(null)
            : null;
        const compatibleProduct =
          storefrontProduct && productHasStone(storefrontProduct, stoneType)
            ? storefrontProduct
            : null;

        return {
          id: pick.id,
          type: "STONE",
          itemId: stoneType.id,
          legacyItemId: null,
          isLegacySource: false,
          featuredProductId: compatibleProduct?.id ?? null,
          storedFeaturedProductId: pick.featuredProductId,
          hasUnavailableFeaturedProduct: Boolean(pick.featuredProductId && !compatibleProduct),
          unavailableFeaturedProductReason: unavailableProductReason,
          sortOrder: pick.sortOrder,
          title: stoneType.name,
          subtitle: compatibleProduct?.name ?? "Kőtípus válogatás",
          href: `/bracelets?stone=${encodeURIComponent(stoneType.slug)}`,
          imageUrl: compatibleProduct ? getProductImageUrl(compatibleProduct) : null,
          imageAlt: compatibleProduct?.name ?? stoneType.name,
          colorHex: null,
        };
      }

      return null;
    })
    .filter((pick): pick is HomepageMaterialPickView => Boolean(pick));
}

export async function getHomepageContent(): Promise<HomepageContentView> {
  const [blocks, tiles, materialPicks] = await Promise.all([
    db.homepageContentBlock.findMany(),
    db.homepagePromoTile.findMany({
      orderBy: [{ slotIndex: "asc" }, { createdAt: "asc" }],
    }),
    getHomepageMaterialPicks(),
  ]);
  const blockByKey = new Map(blocks.map((block) => [block.key, block]));
  const tileBySlot = new Map(tiles.map((tile) => [tile.slotIndex, tile]));

  return {
    hero: normalizeBlock("HERO", blockByKey.get("HERO")),
    instagram: normalizeBlock("INSTAGRAM", blockByKey.get("INSTAGRAM")),
    promoTiles: defaultPromoTiles.map((defaultTile) =>
      normalizePromoTile(tileBySlot.get(defaultTile.slotIndex) ?? defaultTile),
    ),
    materialPicks,
  };
}

export async function getHomepageMaterialPickOptions(): Promise<HomepageMaterialPickOptions> {
  const [stoneTypes, products] = await Promise.all([
    db.productOption.findMany({
      where: { type: "STONE_TYPE", isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    db.product.findMany({
      where: storefrontProductWhere,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        imageUrl: true,
        stoneTypeId: true,
        stoneType: {
          select: { id: true, slug: true },
        },
        category: {
          select: { name: true },
        },
        images: {
          select: { url: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          take: 1,
        },
      },
      orderBy: [{ name: "asc" }],
    }),
  ]);

  return {
    stoneTypes,
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      stoneTypeId: product.stoneTypeId,
      stoneSlug: product.stoneType.slug,
      categoryName: product.category?.name ?? "Kategória nélkül",
      price: product.price,
      imageUrl: getProductImageUrl(product),
    })),
  };
}

export async function upsertHomepageBlock(
  key: HomepageContentBlockKey,
  values: Omit<HomepageBlockView, "id" | "key">,
) {
  return db.homepageContentBlock.upsert({
    where: { key },
    create: { key, ...values },
    update: values,
  });
}

export async function upsertHomepagePromoTile(
  slotIndex: number,
  values: Omit<HomepagePromoTileView, "id" | "slotIndex">,
) {
  return db.homepagePromoTile.upsert({
    where: { slotIndex },
    create: { slotIndex, ...values },
    update: values,
  });
}

export async function replaceHomepageMaterialPicks(
  picks: {
    itemType: HomepageMaterialPickType;
    itemId: string;
    featuredProductId?: string | null;
    sortOrder: number;
  }[],
) {
  await db.$transaction([
    db.homepageMaterialPick.deleteMany(),
    ...picks.slice(0, 4).map((pick) =>
      db.homepageMaterialPick.create({
        data: pick,
      }),
    ),
  ]);
}
