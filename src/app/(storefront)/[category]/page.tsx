import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionPage } from "@/components/shop/CollectionPage";
import {
  filterProducts,
  parseCollectionSearchParams,
  sortProducts,
} from "@/lib/catalog";
import {
  getCategoryDefinition,
  getCategorySlugs,
  getFilterGroupsForAvailableFilters,
  getFilterOptionsForCategory,
  getProductsForCategory,
} from "@/lib/products-server";
import { getAlternateLanguages, getLocalizedPath } from "@/lib/locale-routing";
import { getRequestLocale } from "@/lib/request-locale";
import { siteName } from "@/lib/site";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  return (await getCategorySlugs()).map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryDefinition = await getCategoryDefinition(category);

  if (!categoryDefinition) {
    return {};
  }
  const language = await getRequestLocale();
  const canonicalPath = getLocalizedPath(`/${categoryDefinition.slug}`, language);
  const title = language === "en"
    ? `${categoryDefinition.label === "Karkötők" ? "Bracelets" : categoryDefinition.label === "Nyakláncok" ? "Necklaces" : categoryDefinition.title} | ${siteName}`
    : `${categoryDefinition.title} | ${siteName}`;
  const description = language === "en"
    ? `Explore the Chicks Jewelry ${title.replace(` | ${siteName}`, "").toLowerCase()} edit: refined pieces in a curated selection.`
    : categoryDefinition.seoDescription;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: getAlternateLanguages(`/${categoryDefinition.slug}`),
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category } = await params;
  const resolvedSearchParams = await searchParams;
  const categorySlug = category;
  const categoryDefinition = await getCategoryDefinition(categorySlug);
  const categoryQuery = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        categoryQuery.append(key, entry);
      }
    } else if (value) {
      categoryQuery.set(key, value);
    }
  }

  const redirectTo = categoryQuery.toString()
    ? `/${categorySlug}?${categoryQuery.toString()}`
    : `/${categorySlug}`;

  if (!categoryDefinition) {
    notFound();
  }

  const state = parseCollectionSearchParams(resolvedSearchParams);
  const [baseProducts, availableFilters] = await Promise.all([
    getProductsForCategory(categorySlug),
    getFilterOptionsForCategory(categorySlug),
  ]);
  const filteredProducts = filterProducts(baseProducts, state);
  const sortedProducts = sortProducts(filteredProducts, state.sort);
  const filterGroups = await getFilterGroupsForAvailableFilters(availableFilters, baseProducts);

  return (
    <CollectionPage
      products={sortedProducts}
      availableFilters={availableFilters}
      filterGroups={filterGroups}
      state={state}
      redirectTo={redirectTo}
    />
  );
}
