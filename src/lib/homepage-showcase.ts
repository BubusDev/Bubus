import { db } from "@/lib/db";
import { getShowcaseTabProducts } from "@/lib/products";
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

export const SHOWCASE_FILTER_TYPES = [
  { value: "new_arrivals", label: "Újdonságok (isNew)" },
  { value: "category", label: "Kategória" },
  { value: "on_sale", label: "Akciós termékek" },
  { value: "giftable", label: "Ajándékozható" },
  { value: "manual", label: "Kézi válogatás (product IDs)" },
] as const;

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
