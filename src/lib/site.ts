export const siteName = "Chicks Jewelry";

export const siteDescription =
  "Editorial boutique jewelry storefront with curated collections, premium product storytelling, and route-driven category shopping.";

export const siteUrl = process.env.AUTH_URL ?? "http://localhost:3000";

export function getAbsoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}
