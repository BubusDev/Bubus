import { db } from "@/lib/db";
import { getShowcaseTabProducts } from "@/lib/products";
import { storefrontProductWhere } from "@/lib/product-lifecycle";
import type { Product } from "@/lib/catalog";

export type ShowcaseTab = {
  key: string;
  label: string;
  products: Product[];
};

export type AdminShowcaseTabRow = {
  id: string;
  key: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
  filterType: string;
  filterValue: string | null;
  maxItems: number;
};

export type AdminShowcaseCategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export type AdminShowcaseProductOption = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number;
  categoryName: string;
  categorySlug: string;
  isNew: boolean;
  isOnSale: boolean;
  isGiftable: boolean;
};

export {
  SHOWCASE_FILTER_TYPE_LABELS,
  SHOWCASE_FILTER_TYPES,
  getShowcaseFilterTypeLabel,
} from "@/lib/homepage-showcase-shared";
export type { ShowcaseFilterType } from "@/lib/homepage-showcase-shared";

export async function getHomeShowcaseTabs(): Promise<ShowcaseTab[]> {
  const configs = await db.homeShowcaseTab.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  if (configs.length === 0) return [];

  const tabs = await Promise.all(
    configs.map(async (config) => {
      const products = await getShowcaseTabProducts(
        config.filterType,
        config.filterValue,
        config.maxItems,
      );
      return { key: config.key, label: config.label, products };
    }),
  );

  return tabs.filter((tab) => tab.products.length > 0);
}

export async function getAdminShowcaseTabs(): Promise<AdminShowcaseTabRow[]> {
  return db.homeShowcaseTab.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAdminShowcaseCategories(): Promise<AdminShowcaseCategoryOption[]> {
  return db.productOption.findMany({
    where: { type: "CATEGORY", isActive: true, isStorefrontVisible: true },
    select: { id: true, name: true, slug: true },
    orderBy: [{ showInMainNav: "desc" }, { navSortOrder: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getAdminShowcaseProducts(): Promise<AdminShowcaseProductOption[]> {
  return db.product.findMany({
    where: storefrontProductWhere,
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      price: true,
      isNew: true,
      isOnSale: true,
      isGiftable: true,
      category: { select: { name: true, slug: true } },
    },
    orderBy: [{ name: "asc" }],
  }).then((products) =>
    products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      price: product.price,
      categoryName: product.category.name,
      categorySlug: product.category.slug,
      isNew: product.isNew,
      isOnSale: product.isOnSale,
      isGiftable: product.isGiftable,
    })),
  );
}

export async function upsertShowcaseTab(data: {
  id?: string;
  key: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
  filterType: string;
  filterValue: string | null;
  maxItems: number;
}) {
  if (data.id) {
    return db.homeShowcaseTab.update({
      where: { id: data.id },
      data: {
        key: data.key,
        label: data.label,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        filterType: data.filterType,
        filterValue: data.filterValue,
        maxItems: data.maxItems,
      },
    });
  }

  return db.homeShowcaseTab.create({ data });
}

export async function deleteShowcaseTab(id: string) {
  return db.homeShowcaseTab.delete({ where: { id } });
}

export async function reorderShowcaseTabs(ids: string[]) {
  await db.$transaction(
    ids.map((id, index) =>
      db.homeShowcaseTab.update({
        where: { id },
        data: { sortOrder: index + 1 },
      }),
    ),
  );
}

export async function duplicateShowcaseTab(id: string): Promise<AdminShowcaseTabRow> {
  const original = await db.homeShowcaseTab.findUnique({ where: { id } });
  if (!original) throw new Error("A duplikálandó tab nem található.");

  const existingKeys = await db.homeShowcaseTab.findMany({
    where: { key: { startsWith: `${original.key}-copy` } },
    select: { key: true },
  });
  const usedKeys = new Set(existingKeys.map((entry) => entry.key));
  let key = `${original.key}-copy`;
  let suffix = 2;

  while (usedKeys.has(key)) {
    key = `${original.key}-copy-${suffix}`;
    suffix += 1;
  }

  const [, created] = await db.$transaction([
    db.homeShowcaseTab.updateMany({
      where: { sortOrder: { gt: original.sortOrder } },
      data: { sortOrder: { increment: 1 } },
    }),
    db.homeShowcaseTab.create({
      data: {
        key,
        label: `${original.label} Másolat`,
        sortOrder: original.sortOrder + 1,
        isActive: original.isActive,
        filterType: original.filterType,
        filterValue: original.filterValue,
        maxItems: original.maxItems,
      },
    }),
  ]);

  return created;
}
