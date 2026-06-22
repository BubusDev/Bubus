import { getAuthBaseUrl } from "@/lib/env";

export const siteName = "Chicks Jewelry";

export const siteDescription =
  "Limitált ékszerek, gondosan válogatott anyagokból, kis szériában készítve.";

export const siteUrl = getAuthBaseUrl();

export function getAbsoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}
