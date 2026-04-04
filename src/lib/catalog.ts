export const editorialCategoryOrder = ["new-in", "special-edition", "sale"] as const;

export const homepagePlacements = ["none", "spotlight", "new_arrivals"] as const;

export type CategorySlug = string;
export type ProductBaseCategory = string;
export type StoneType = string;
export type MetalColor = string;
export type StyleType = string;
export type OccasionType = string;
export type Availability = string;
export type ProductTone = string;
export type HomepagePlacement = (typeof homepagePlacements)[number];
export type UserRole = "user" | "admin";

export type ProductOptionLabels = {
  category: string;
  stoneType: string;
  color: string;
  style: string;
  occasion: string;
  availability: string;
  tone: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductBaseCategory;
  price: number;
  compareAtPrice?: number;
  shortDescription: string;
  description: string;
  badge: string;
  collectionLabel: string;
  stockQuantity: number;
  stoneType: StoneType;
  color: MetalColor;
  style: StyleType;
  occasion: OccasionType;
  availability: Availability;
  isNew: boolean;
  isGiftable: boolean;
  isOnSale: boolean;
  tone: ProductTone;
  imageUrl?: string | null;
  images: {
    id: string;
    url: string;
    alt?: string | null;
    isCover: boolean;
  }[];
  imagePalette: [string, string, string];
  homepagePlacement: HomepagePlacement;
  labels: ProductOptionLabels;
};

export function isProductOutOfStock(product: Pick<Product, "stockQuantity">) {
  return product.stockQuantity <= 0;
}

export function getProductAvailabilityLabel(
  product: Pick<Product, "labels" | "stockQuantity">,
) {
  return isProductOutOfStock(product) ? "Elfogyott" : product.labels.availability;
}

export type CategoryDefinition = {
  slug: CategorySlug;
  label: string;
  title: string;
  seoDescription: string;
  isEditorial?: boolean;
};

export type NavigationCategory = {
  slug: string;
  label: string;
  href: string;
};

export type MainNavigationItemDefinition = {
  slug: string;
  label: string;
  href: string;
  requiresSpecialEdition?: boolean;
};

export type FilterKey =
  | "category"
  | "stone"
  | "color"
  | "style"
  | "occasion"
  | "availability";

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterGroup = {
  key: FilterKey;
  label: string;
  options: FilterOption[];
};

export type CatalogFilters = {
  categories: ProductBaseCategory[];
  stones: StoneType[];
  colors: MetalColor[];
  styles: StyleType[];
  occasions: OccasionType[];
  availability: Availability[];
  priceRange: [number, number];
};

export const editorialCategoryDefinitions: CategoryDefinition[] = [
  {
    slug: "new-in",
    label: "New In",
    title: "Újdonságok",
    seoDescription:
      "Fedezd fel a Chicks Jewelry legújabb darabjait: friss nyakláncok, karkötők és különleges ékszerek szerkesztett válogatásban.",
    isEditorial: true,
  },
  {
    slug: "special-edition",
    label: "Special Edition",
    title: "Limitált darabok",
    seoDescription:
      "Limitált és kiemelt Chicks Jewelry darabok editoriális válogatásban, ajándékozáshoz és alkalmi megjelenésekhez.",
    isEditorial: true,
  },
  {
    slug: "sale",
    label: "Sale",
    title: "Akció",
    seoDescription:
      "Akciós Chicks Jewelry ékszerek válogatása kedvezőbb áron, a márka kifinomult stílusához igazítva.",
    isEditorial: true,
  },
];

export const mainNavigationDefinitions: MainNavigationItemDefinition[] = [
  {
    slug: "new-in",
    label: "Újdonságok",
    href: "/new-in",
  },
  {
    slug: "special-edition",
    label: "Limitált darabok",
    href: "/special-edition",
    requiresSpecialEdition: true,
  },
  {
    slug: "sale",
    label: "Akció",
    href: "/sale",
  },
  {
    slug: "necklaces",
    label: "Nyakláncok",
    href: "/necklaces",
  },
  {
    slug: "bracelets",
    label: "Karkötők",
    href: "/bracelets",
  },
] as const;

export const filterGroupDefinitions: Omit<FilterGroup, "options">[] = [
  { key: "category", label: "Kategória" },
  { key: "stone", label: "Kőtípus" },
  { key: "color", label: "Szín" },
  { key: "style", label: "Stílus" },
  { key: "occasion", label: "Alkalom" },
  { key: "availability", label: "Elérhetőség" },
];

export const homepagePlacementLabels: Record<HomepagePlacement, string> = {
  none: "Nincs kiemelés",
  spotlight: "Fókusz szekció",
  new_arrivals: "Újdonságok szekció",
};

export const tonePalettes: Record<string, [string, string, string]> = {
  petal: ["#fff7fc", "#f7d4ea", "#d98fbc"],
  champagne: ["#fffaf4", "#f5e0ca", "#d7af7f"],
  blush: ["#fffafe", "#efe0f3", "#b796c6"],
  pearl: ["#fffefc", "#f1ece8", "#c4b9b4"],
};

export function getTonePalette(slug: string): [string, string, string] {
  return tonePalettes[slug] ?? ["#fff8fb", "#f1dde8", "#b7839d"];
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export type ParsedCollectionState = {
  selected: {
    category: string[];
    stone: string[];
    color: string[];
    style: string[];
    occasion: string[];
    availability: string[];
  };
  priceMin?: number;
  priceMax?: number;
  sort: string;
};

export function parseCollectionSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ParsedCollectionState {
  const readMany = (key: string) => {
    const raw = searchParams[key];
    if (!raw) {
      return [];
    }

    return Array.isArray(raw) ? raw : [raw];
  };

  const readNumber = (key: string) => {
    const value = Array.isArray(searchParams[key])
      ? searchParams[key]?.[0]
      : searchParams[key];
    const parsed = value ? Number(value) : undefined;
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const sort = Array.isArray(searchParams.sort)
    ? searchParams.sort[0]
    : searchParams.sort;

  return {
    selected: {
      category: readMany("category"),
      stone: readMany("stone"),
      color: readMany("color"),
      style: readMany("style"),
      occasion: readMany("occasion"),
      availability: readMany("availability"),
    },
    priceMin: readNumber("priceMin"),
    priceMax: readNumber("priceMax"),
    sort: sort ?? "featured",
  };
}

export function filterProducts(
  inputProducts: Product[],
  state: ParsedCollectionState,
) {
  return inputProducts.filter((product) => {
    if (
      state.selected.category.length > 0 &&
      !state.selected.category.includes(product.category)
    ) {
      return false;
    }

    if (
      state.selected.stone.length > 0 &&
      !state.selected.stone.includes(product.stoneType)
    ) {
      return false;
    }

    if (
      state.selected.color.length > 0 &&
      !state.selected.color.includes(product.color)
    ) {
      return false;
    }

    if (
      state.selected.style.length > 0 &&
      !state.selected.style.includes(product.style)
    ) {
      return false;
    }

    if (
      state.selected.occasion.length > 0 &&
      !state.selected.occasion.includes(product.occasion)
    ) {
      return false;
    }

    if (
      state.selected.availability.length > 0 &&
      !state.selected.availability.includes(product.availability)
    ) {
      return false;
    }

    if (typeof state.priceMin === "number" && product.price < state.priceMin) {
      return false;
    }

    if (typeof state.priceMax === "number" && product.price > state.priceMax) {
      return false;
    }

    return true;
  });
}

export function sortProducts(inputProducts: Product[], sort: string) {
  const productsCopy = [...inputProducts];

  switch (sort) {
    case "price-asc":
      return productsCopy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return productsCopy.sort((a, b) => b.price - a.price);
    case "newest":
      return productsCopy.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    case "name":
      return productsCopy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return productsCopy.sort((a, b) => {
        const scoreA =
          Number(a.isNew) * 3 + Number(a.isGiftable) * 2 + Number(a.isOnSale);
        const scoreB =
          Number(b.isNew) * 3 + Number(b.isGiftable) * 2 + Number(b.isOnSale);
        return scoreB - scoreA;
      });
  }
}

export function getFilterOptionsForProducts(products: Product[]): CatalogFilters {
  if (products.length === 0) {
    return {
      categories: [],
      stones: [],
      colors: [],
      styles: [],
      occasions: [],
      availability: [],
      priceRange: [0, 0],
    };
  }

  const unique = <T extends string>(values: T[]) => [...new Set(values)];

  return {
    categories: unique(products.map((product) => product.category)),
    stones: unique(products.map((product) => product.stoneType)),
    colors: unique(products.map((product) => product.color)),
    styles: unique(products.map((product) => product.style)),
    occasions: unique(products.map((product) => product.occasion)),
    availability: unique(products.map((product) => product.availability)),
    priceRange: [
      Math.min(...products.map((product) => product.price)),
      Math.max(...products.map((product) => product.price)),
    ],
  };
}

export function toTitleCase(value: string) {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
