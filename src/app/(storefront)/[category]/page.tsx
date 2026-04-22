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

  return {
    title: `${categoryDefinition.title} | ${siteName}`,
    description: categoryDefinition.seoDescription,
    alternates: {
      canonical: `/${categoryDefinition.slug}`,
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
