import type { MetadataRoute } from "next";

import { getAlternateLanguages, getLocalizedPath } from "@/lib/locale-routing";
import { getAllProductSlugs, getCategorySlugs } from "@/lib/products-server";
import { siteUrl } from "@/lib/site";

function absolute(pathname: string) {
  return new URL(pathname, siteUrl).toString();
}

function sitemapEntry(pathname: string, locale: "hu" | "en"): MetadataRoute.Sitemap[number] {
  const urlPath = getLocalizedPath(pathname, locale);
  const alternates = getAlternateLanguages(pathname);

  return {
    url: absolute(urlPath),
    alternates: {
      languages: Object.fromEntries(
        Object.entries(alternates ?? {})
          .filter((entry): entry is [string, string] => typeof entry[1] === "string")
          .map(([language, path]) => [language, absolute(path)]),
      ),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productSlugs, categorySlugs] = await Promise.all([
    getAllProductSlugs(),
    getCategorySlugs(),
  ]);
  const staticPaths = [
    "/",
    "/cart",
    "/checkout",
    "/favourites",
    "/orders",
    "/contact",
    "/privacy",
    "/terms",
    "/shipping",
    "/cookies",
    "/special-edition",
    "/kulonlegessegek",
  ];
  const categoryPaths = categorySlugs.map((slug) => `/${slug}`);
  const productPaths = productSlugs.map((slug) => `/product/${slug}`);
  const paths = Array.from(new Set([...staticPaths, ...categoryPaths, ...productPaths]));

  return paths.flatMap((path) => [sitemapEntry(path, "hu"), sitemapEntry(path, "en")]);
}
