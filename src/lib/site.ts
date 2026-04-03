import { getAuthBaseUrl } from "@/lib/env";

export const siteName = "Chicks Jewelry";

export const siteDescription =
  "Editorial boutique jewelry storefront with curated collections, premium product storytelling, and route-driven category shopping.";

export const siteUrl = getAuthBaseUrl();

export function getAbsoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}
