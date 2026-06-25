import type { HomepageContentBlockKey, Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { getStorefrontUnavailableProductReason } from "@/lib/homepage-admin-warnings";
import { storefrontProductWhere } from "@/lib/product-lifecycle";
import { productHasStone } from "@/lib/stone-product";

export type HomepageBlockView = {
  id: string;
  key: HomepageContentBlockKey;
  title: string;
  titleEn: string;
  eyebrow: string;
  eyebrowEn: string;
  body: string;
  bodyEn: string;
  imageUrl: string;
  imageAlt: string;
  imageAltEn: string;
  buttonText: string;
  buttonTextEn: string;
  buttonHref: string;
  metadata: Record<string, unknown>;
  isVisible: boolean;
};

export type HomepagePromoTileView = {
  id: string;
  slotIndex: number;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
  imageAltEn: string;
  isNew: boolean;
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
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  href: string;
  imageUrl: string | null;
  imageAlt: string;
  imageAltEn: string;
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
  heroFeatureBar: HomepageBlockView;
  categoryGrid: HomepageBlockView;
  featuredSlider: HomepageBlockView;
  instagram: HomepageBlockView;
  newsletter: HomepageBlockView;
  promoTiles: HomepagePromoTileView[];
  materialPicks: HomepageMaterialPickView[];
};

const defaultBlocks: Record<HomepageContentBlockKey, Omit<HomepageBlockView, "id" | "key">> = {
  HERO: {
    title: "Ne félj extra lenni! Viseld bátran a kiegészítőket!",
    titleEn: "Small-batch jewelry with a little extra presence.",
    eyebrow: "Limitált butik válogatás",
    eyebrowEn: "Limited boutique edit",
    body: "Féldrágakő karkötők és nyakláncok kis szériában - outfitedhez, hangulatodhoz, évszakodhoz.",
    bodyEn: "Gemstone bracelets and necklaces in limited runs, curated for your outfit, mood and season.",
    imageUrl: "/uploads/special-edition/jellyfish-e2a5b467-e672-495e-9248-6a94d4f7d6ad.jpg",
    imageAlt: "Limitált Chicks Jewelry kampányékszer",
    imageAltEn: "Limited Chicks Jewelry campaign jewelry",
    buttonText: "Fedezd fel a válogatást",
    buttonTextEn: "Explore jewelry",
    buttonHref: "/special-edition",
    metadata: {
      secondaryButtonText: "Limitált darabok",
      secondaryButtonTextEn: "Limited pieces",
      secondaryButtonHref: "/special-edition",
    },
    isVisible: true,
  },
  HERO_FEATURE_BAR: {
    title: "Hero feature bar",
    titleEn: "Hero feature bar",
    eyebrow: "",
    eyebrowEn: "",
    body: "",
    bodyEn: "",
    imageUrl: "",
    imageAlt: "",
    imageAltEn: "",
    buttonText: "",
    buttonTextEn: "",
    buttonHref: "",
    metadata: {
      features: [
        {
          label: "Kis széria",
          labelEn: "Small runs",
          text: "Új darabok korlátozott mennyiségben, átgondolt ritmusban.",
          textEn: "New pieces in limited quantities, released at a considered pace.",
        },
        {
          label: "Válogatott anyagok",
          labelEn: "Curated materials",
          text: "Kövek és tónusok, amelyek közelről is szépek.",
          textEn: "Stones and tones that stay beautiful up close.",
        },
        {
          label: "Finom részletek",
          labelEn: "Fine details",
          text: "Nem harsány kiegészítők, mégis emlékezetes karakterrel.",
          textEn: "Quiet pieces with a memorable character.",
        },
      ],
    },
    isVisible: true,
  },
  CATEGORY_GRID: {
    title: "Vonalak, amik együtt is működnek.",
    titleEn: "Pieces that work beautifully together.",
    eyebrow: "Kategóriák",
    eyebrowEn: "Categories",
    body: "Finom tónusok, rétegezhető formák és alkalmi darabok egy képi válogatásban.",
    bodyEn: "Soft tones, layerable shapes and occasion pieces in a curated visual edit.",
    imageUrl: "",
    imageAlt: "",
    imageAltEn: "",
    buttonText: "",
    buttonTextEn: "",
    buttonHref: "",
    metadata: {
      materialEyebrow: "Kurált fókusz",
      materialEyebrowEn: "Curated focus",
      materialTitle: "Kő szerint válogatva.",
      materialTitleEn: "Shop by stone.",
      materialBody:
        "Anyag, árnyalat és hangulat alapján szerkesztett darabok, hogy a választás személyesebb legyen egy egyszerű kategórialistánál.",
      materialBodyEn: "Shop by material, shade and mood to make choosing more personal.",
      newBadgeLabel: "Új",
      newBadgeLabelEn: "New",
    },
    isVisible: true,
  },
  FEATURED_SLIDER: {
    title: "Szerkesztett darabok.",
    titleEn: "Featured pieces.",
    eyebrow: "Fókuszban",
    eyebrowEn: "Featured",
    body: "Újdonságok, ajándéknak választott kedvencek és limitált darabok egy letisztult válogatásban.",
    bodyEn: "New arrivals, giftable favourites and limited pieces in a clean edit.",
    imageUrl: "",
    imageAlt: "",
    imageAltEn: "",
    buttonText: "",
    buttonTextEn: "",
    buttonHref: "",
    metadata: {},
    isVisible: true,
  },
  INSTAGRAM: {
    title: "@chicksjewelry",
    titleEn: "@chicksjewelry",
    eyebrow: "Instagram",
    eyebrowEn: "Instagram",
    body: "Kulisszák, új kövek és viselési ötletek azoknak, akik szeretik közelről látni a részleteket.",
    bodyEn: "Behind the scenes, new stones and styling ideas for people who love the details.",
    imageUrl: "/images/book-hands.png",
    imageAlt: "Zöld tónusú Instagram kampánykép",
    imageAltEn: "Green-toned Instagram campaign image",
    buttonText: "Kövess Instagramon",
    buttonTextEn: "Follow on Instagram",
    buttonHref: "https://instagram.com/chicksjewelry",
    metadata: {
      instagramTabLabel: "Instagram",
      instagramTabLabelEn: "Instagram",
      facebookTabLabel: "Facebook",
      facebookTabLabelEn: "Facebook",
      teamTabLabel: "Csapatunk",
      teamTabLabelEn: "Team",
      teamEyebrow: "Csapatunk",
      teamEyebrowEn: "Team",
      teamTitleStart: "Akik",
      teamTitleStartEn: "Made by",
      teamTitleEmphasis: "készítik.",
      teamTitleEmphasisEn: "our team.",
      facebookBody: "Legyen részed a közösségben - újdonságok, visszajelzések és kulisszák egy helyen.",
      facebookBodyEn: "Join the community for new pieces, feedback and behind-the-scenes notes.",
      facebookCta: "Kövess Facebookon",
      facebookCtaEn: "Follow on Facebook",
      facebookHref: "https://www.facebook.com/chicksjewelry",
      teamMembers: [
        { name: "Bubus", nameEn: "Bubus", role: "Alapító · Tervező", roleEn: "Founder · Designer", imageUrl: "" },
        { name: "Csapatag", nameEn: "Team member", role: "Kézműves", roleEn: "Maker", imageUrl: "" },
        { name: "Csapatag", nameEn: "Team member", role: "Ügyfélszolgálat", roleEn: "Customer care", imageUrl: "" },
      ],
    },
    isVisible: true,
  },
  NEWSLETTER: {
    title: "Elsőként a limitált darabokról.",
    titleEn: "Be first to see limited pieces.",
    eyebrow: "Hírlevél",
    eyebrowEn: "Newsletter",
    body: "Elsőként értesítünk az új kollekciókról, friss színekről és különleges ajánlatokról. Rövid leveleket küldünk, csak akkor, amikor valóban van mit megmutatni.",
    bodyEn: "Get early notes on new collections, fresh colors and special offers. We send short emails only when there is something worth showing.",
    imageUrl: "",
    imageAlt: "",
    imageAltEn: "",
    buttonText: "Feliratkozom",
    buttonTextEn: "Subscribe",
    buttonHref: "",
    metadata: {
      perks: ["Új kollekciók előre", "Limitált darabok", "Különleges ajánlatok"],
      perksEn: ["Early new collections", "Limited pieces", "Special offers"],
      placeholder: "Email címed",
      placeholderEn: "Your email",
      note: "Nincs spam. Bármikor leiratkozhatsz.",
      noteEn: "No spam. Unsubscribe anytime.",
      subscribedMessage: "Köszönjük, a feliratkozásod rögzítettük.",
      subscribedMessageEn: "Thank you, your subscription has been saved.",
      invalidMessage: "Adj meg egy érvényes email címet a feliratkozáshoz.",
      invalidMessageEn: "Enter a valid email address to subscribe.",
    },
    isVisible: true,
  },
};

const legacyDefaultBlockValues: Partial<
  Record<HomepageContentBlockKey, Partial<Omit<HomepageBlockView, "id" | "key" | "isVisible">>>
> = {
  HERO: {
    title: "Limitált darabok, váratlan részletekkel",
    eyebrow: "Különleges válogatás",
    body: "Féldrágakövekből, kézzel készített ékszerek szerkesztett kampánya.",
  },
  INSTAGRAM: {
    body: "Látogass meg minket és fedezd fel ötleteinket az Instagramon!",
    buttonText: "Irány az Instagram!",
  },
};

const defaultPromoTiles = [
  {
    slotIndex: 4,
    title: "Limitált vonalak",
    titleEn: "Limited lines",
    subtitle: "Új darabok kis szériában",
    subtitleEn: "New pieces in small runs",
    href: "/special-edition",
    imageUrl: "/uploads/special-edition/jellyfish-e2a5b467-e672-495e-9248-6a94d4f7d6ad.jpg",
    imageAlt: "Limitált Chicks Jewelry válogatás",
    imageAltEn: "Limited Chicks Jewelry edit",
    isNew: false,
    isVisible: true,
  },
  {
    slotIndex: 5,
    title: "Rétegezhető darabok",
    titleEn: "Layerable pieces",
    subtitle: "Karkötők mindennapi viseléshez",
    subtitleEn: "Bracelets for everyday wear",
    href: "/bracelets",
    imageUrl: "/uploads/products/bracez-ld-b324c17b-303b-4d3c-9dd6-1edc016ec994.jpg",
    imageAlt: "Rétegezhető Chicks Jewelry karkötő",
    imageAltEn: "Layerable Chicks Jewelry bracelet",
    isNew: false,
    isVisible: true,
  },
  {
    slotIndex: 6,
    title: "Újdonságok",
    titleEn: "New arrivals",
    subtitle: "Friss színek és finom részletek",
    subtitleEn: "Fresh colors and fine details",
    href: "/new-in",
    imageUrl: "/uploads/products/8-210510-opacity-armband-blauermarmor-rose-cv-q-23-040c9dc8-6af6-47b8-be1c-ca1d2dd7dda2.jpg",
    imageAlt: "Új Chicks Jewelry karkötő kék márvány tónusban",
    imageAltEn: "New Chicks Jewelry bracelet in blue marble tones",
    isNew: true,
    isVisible: true,
  },
  {
    slotIndex: 7,
    title: "Kövek szerint",
    titleEn: "Shop by stone",
    subtitle: "Válogatás anyag és árnyalat alapján",
    subtitleEn: "A material and shade edit",
    href: "/new-in",
    imageUrl: "/uploads/special-edition/jellyfish-e2a5b467-e672-495e-9248-6a94d4f7d6ad.jpg",
    imageAlt: "Chicks Jewelry anyagválogatás részletfotó",
    imageAltEn: "Chicks Jewelry material edit detail",
    isNew: false,
    isVisible: true,
  },
  {
    slotIndex: 8,
    title: "Kedvezményes darabok",
    titleEn: "Sale pieces",
    subtitle: "Elérhető modellek limitált készletről",
    subtitleEn: "Available models in limited stock",
    href: "/sale",
    imageUrl: "/uploads/products/bracez-ld-b324c17b-303b-4d3c-9dd6-1edc016ec994.jpg",
    imageAlt: "Chicks Jewelry kedvezményes karkötő válogatás",
    imageAltEn: "Chicks Jewelry sale bracelet edit",
    isNew: false,
    isVisible: true,
  },
] satisfies Omit<HomepagePromoTileView, "id">[];

type NullableHomepageBlockInput = {
  id?: string;
  title?: string | null;
  titleEn?: string | null;
  eyebrow?: string | null;
  eyebrowEn?: string | null;
  body?: string | null;
  bodyEn?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageAltEn?: string | null;
  buttonText?: string | null;
  buttonTextEn?: string | null;
  buttonHref?: string | null;
  metadata?: Prisma.JsonValue | null;
  isVisible?: boolean;
};

type HomepageBlockTextField = "title" | "eyebrow" | "body" | "imageUrl" | "imageAlt" | "buttonText" | "buttonHref";

type NullableHomepageTileInput = {
  id?: string;
  slotIndex: number;
  title?: string | null;
  titleEn?: string | null;
  subtitle?: string | null;
  subtitleEn?: string | null;
  href?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageAltEn?: string | null;
  isNew?: boolean;
  isVisible?: boolean;
};

function readMetadata(value: Prisma.JsonValue | null | undefined) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function normalizeBlock(
  key: HomepageContentBlockKey,
  block?: NullableHomepageBlockInput | null,
): HomepageBlockView {
  const fallback = defaultBlocks[key];
  const legacyValues = legacyDefaultBlockValues[key] ?? {};
  const normalizeLegacyText = (value: string) =>
    value
      .toLocaleLowerCase("hu")
      .replace(/\s+/g, " ")
      .trim();
  const isLegacyText = (
    field: HomepageBlockTextField,
    value: string,
  ) => {
    const normalizedValue = normalizeLegacyText(value);
    const legacyValue = legacyValues[field];

    if (legacyValue && normalizedValue === normalizeLegacyText(legacyValue)) {
      return true;
    }

    return (
      (key === "HERO" &&
        ((field === "title" && normalizedValue.includes("váratlan részletekkel")) ||
          (field === "eyebrow" && normalizedValue.includes("különleges válogatás")) ||
          (field === "body" && normalizedValue.includes("szerkesztett kampánya")) ||
          (field === "buttonText" && normalizedValue.includes("lepődj")))) ||
      (key === "INSTAGRAM" &&
        ((field === "body" && normalizedValue.includes("ötleteinket az instagramon")) ||
          (field === "buttonText" && normalizedValue.includes("irány az instagram"))))
    );
  };
  const readText = (
    field: HomepageBlockTextField,
    value: string | null | undefined,
  ) => {
    const trimmed = value?.trim();

    if (!trimmed || isLegacyText(field, trimmed)) {
      return fallback[field];
    }

    return trimmed;
  };

  return {
    id: block?.id ?? key,
    key,
    title: readText("title", block?.title),
    titleEn: block?.titleEn?.trim() || fallback.titleEn,
    eyebrow: readText("eyebrow", block?.eyebrow),
    eyebrowEn: block?.eyebrowEn?.trim() || fallback.eyebrowEn,
    body: readText("body", block?.body),
    bodyEn: block?.bodyEn?.trim() || fallback.bodyEn,
    imageUrl: readText("imageUrl", block?.imageUrl),
    imageAlt: readText("imageAlt", block?.imageAlt),
    imageAltEn: block?.imageAltEn?.trim() || fallback.imageAltEn,
    buttonText: readText("buttonText", block?.buttonText),
    buttonTextEn: block?.buttonTextEn?.trim() || fallback.buttonTextEn,
    buttonHref: readText("buttonHref", block?.buttonHref),
    metadata: { ...fallback.metadata, ...readMetadata(block?.metadata) },
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
    titleEn: tile.titleEn?.trim() || fallback.titleEn,
    subtitle: tile.subtitle?.trim() || fallback.subtitle,
    subtitleEn: tile.subtitleEn?.trim() || fallback.subtitleEn,
    href: tile.href?.trim() || fallback.href,
    imageUrl: tile.imageUrl?.trim() || fallback.imageUrl,
    imageAlt: tile.imageAlt?.trim() || fallback.imageAlt,
    imageAltEn: tile.imageAltEn?.trim() || fallback.imageAltEn,
    isNew: tile.isNew ?? fallback.isNew,
    isVisible: tile.isVisible ?? fallback.isVisible,
  };
}

function getProductImageUrl(product: { imageUrl: string | null; images: { url: string }[] }) {
  return product.images[0]?.url ?? product.imageUrl ?? null;
}

async function getHomepageMaterialPicks(): Promise<HomepageMaterialPickView[]> {
  const picks = await db.homepageMaterialPick.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: 5,
  });

  if (picks.length === 0) {
    return getFallbackHomepageMaterialPicks();
  }

  const stoneTypeIds = picks.filter((pick) => pick.itemType === "STONE").map((pick) => pick.itemId);
  const productIds = picks
    .flatMap((pick) => [pick.featuredProductId, pick.itemType === "PRODUCT" ? pick.itemId : null])
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
            nameEn: true,
            slug: true,
            imageUrl: true,
            collectionLabel: true,
            stoneTypeId: true,
            stoneType: {
              select: { id: true, name: true, slug: true },
            },
            images: {
              select: { url: true },
              orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
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
            nameEn: true,
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
              select: { id: true, name: true, slug: true },
            },
            images: {
              select: { url: true },
              orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
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
            titleEn: "Stone type needs to be reselected",
            subtitle: "Régi kő-adatforrásból mentett elem",
            subtitleEn: "Saved from an old stone data source",
            href: "/new-in",
            imageUrl: null,
            imageAlt: "Kőtípus újraválasztása szükséges",
            imageAltEn: "Stone type needs to be reselected",
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
          titleEn: stoneType.name,
          subtitle: compatibleProduct?.name ?? "Kőtípus válogatás",
          subtitleEn: compatibleProduct?.nameEn?.trim() || compatibleProduct?.name || "Stone edit",
          href: `/bracelets?stone=${encodeURIComponent(stoneType.slug)}`,
          imageUrl: compatibleProduct ? getProductImageUrl(compatibleProduct) : null,
          imageAlt: compatibleProduct?.name ?? stoneType.name,
          imageAltEn: compatibleProduct?.nameEn?.trim() || compatibleProduct?.name || stoneType.name,
          colorHex: null,
        };
      }

      if (pick.itemType === "PRODUCT") {
        const product = storefrontProductById.get(pick.itemId) ?? null;
        if (!product) return null;

        return {
          id: pick.id,
          type: "PRODUCT",
          itemId: product.id,
          legacyItemId: null,
          isLegacySource: false,
          featuredProductId: product.id,
          storedFeaturedProductId: pick.itemId,
          hasUnavailableFeaturedProduct: false,
          unavailableFeaturedProductReason: null,
          sortOrder: pick.sortOrder,
          title: product.stoneType?.name ?? "Termék",
          titleEn: product.stoneType?.name ?? "Product",
          subtitle: product.name,
          subtitleEn: product.nameEn?.trim() || product.name,
          href: `/product/${product.slug}`,
          imageUrl: getProductImageUrl(product),
          imageAlt: product.name,
          imageAltEn: product.nameEn?.trim() || product.name,
          colorHex: null,
        };
      }

      return null;
    })
    .filter((pick): pick is HomepageMaterialPickView => Boolean(pick));
}

async function getFallbackHomepageMaterialPicks(): Promise<HomepageMaterialPickView[]> {
  const products = await db.product.findMany({
    where: storefrontProductWhere,
    select: {
      id: true,
      name: true,
      nameEn: true,
      slug: true,
      imageUrl: true,
      stoneTypeId: true,
      stoneType: {
        select: { id: true, name: true },
      },
      images: {
        select: { url: true },
        orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
      },
    },
    orderBy: [{ isNew: "desc" }, { createdAt: "desc" }],
    take: 30,
  });
  const usedStoneTypeIds = new Set<string>();
  const fallbackProducts: typeof products = [];

  for (const product of products) {
    if (usedStoneTypeIds.has(product.stoneTypeId)) continue;
    usedStoneTypeIds.add(product.stoneTypeId);
    fallbackProducts.push(product);
    if (fallbackProducts.length >= 5) break;
  }

  return fallbackProducts.map((product, index) => ({
    id: `fallback-product-${product.id}`,
    type: "PRODUCT",
    itemId: product.id,
    legacyItemId: null,
    isLegacySource: false,
    featuredProductId: product.id,
    storedFeaturedProductId: product.id,
    hasUnavailableFeaturedProduct: false,
    unavailableFeaturedProductReason: null,
    sortOrder: index + 1,
    title: product.stoneType?.name ?? "Termék",
    titleEn: product.stoneType?.name ?? "Product",
    subtitle: product.name,
    subtitleEn: product.nameEn?.trim() || product.name,
    href: `/product/${product.slug}`,
    imageUrl: getProductImageUrl(product),
    imageAlt: product.name,
    imageAltEn: product.nameEn?.trim() || product.name,
    colorHex: null,
  }));
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
    heroFeatureBar: normalizeBlock("HERO_FEATURE_BAR", blockByKey.get("HERO_FEATURE_BAR")),
    categoryGrid: normalizeBlock("CATEGORY_GRID", blockByKey.get("CATEGORY_GRID")),
    featuredSlider: normalizeBlock("FEATURED_SLIDER", blockByKey.get("FEATURED_SLIDER")),
    instagram: normalizeBlock("INSTAGRAM", blockByKey.get("INSTAGRAM")),
    newsletter: normalizeBlock("NEWSLETTER", blockByKey.get("NEWSLETTER")),
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
          orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
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
  values: Omit<HomepageBlockView, "id" | "key" | "metadata"> & {
    metadata?: Record<string, unknown>;
  },
) {
  const data = {
    ...values,
    metadata: (values.metadata ?? {}) as Prisma.InputJsonValue,
  };

  return db.homepageContentBlock.upsert({
    where: { key },
    create: { key, ...data },
    update: data,
  });
}

export async function upsertHomepagePromoTile(
  slotIndex: number,
  values: Omit<HomepagePromoTileView, "id" | "slotIndex" | "isNew"> & {
    isNew?: boolean;
  },
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
    ...picks.slice(0, 5).map((pick) =>
      db.homepageMaterialPick.create({
        data: pick,
      }),
    ),
  ]);
}
