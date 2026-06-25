import type { Metadata } from "next";

import { validateSupportedLanguage, type SupportedLanguage } from "@/lib/international";

export const LOCALE_HEADER_NAME = "x-chicks-locale";
export const PATHNAME_HEADER_NAME = "x-chicks-pathname";

const enStaticPathMap: Record<string, string> = {
  "/en": "/",
  "/en/special-pieces": "/kulonlegessegek",
  "/en/limited-pieces": "/special-edition",
};

const huStaticPathMap: Record<string, string> = {
  "/kulonlegessegek": "/en/special-pieces",
  "/special-edition": "/en/limited-pieces",
};

export function stripLocaleFromPathname(pathname: string) {
  if (pathname === "/en") return "/";
  if (!pathname.startsWith("/en/")) return pathname;
  if (pathname.startsWith("/en/special-pieces/")) {
    return pathname.replace("/en/special-pieces", "/kulonlegessegek");
  }
  if (pathname.startsWith("/en/limited-pieces/")) {
    return pathname.replace("/en/limited-pieces", "/limitalt-darabok");
  }
  return enStaticPathMap[pathname] ?? (pathname.slice(3) || "/");
}

export function getLocaleFromPathname(pathname: string): SupportedLanguage | null {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : null;
}

export function getLocalizedPath(pathname: string, locale: SupportedLanguage) {
  const normalizedLocale = validateSupportedLanguage(locale);
  const [pathAndSearch, hash = ""] = pathname.split("#");
  const [pathOnly, ...searchParts] = pathAndSearch.split("?");
  const pathWithoutLocale = stripLocaleFromPathname(pathOnly || "/");
  const suffix = `${searchParts.length ? `?${searchParts.join("?")}` : ""}${hash ? `#${hash}` : ""}`;

  if (normalizedLocale === "hu") {
    return `${pathWithoutLocale}${suffix}`;
  }

  const mapped = huStaticPathMap[pathWithoutLocale];
  if (mapped) return `${mapped}${suffix}`;
  if (pathWithoutLocale.startsWith("/kulonlegessegek/")) {
    return `${pathWithoutLocale.replace("/kulonlegessegek", "/en/special-pieces")}${suffix}`;
  }
  if (pathWithoutLocale.startsWith("/limitalt-darabok/")) {
    return `${pathWithoutLocale.replace("/limitalt-darabok", "/en/limited-pieces")}${suffix}`;
  }
  if (pathWithoutLocale === "/") return `/en${suffix}`;
  return `/en${pathWithoutLocale}${suffix}`;
}

export function getCanonicalPath(pathname: string, locale: SupportedLanguage) {
  return getLocalizedPath(stripLocaleFromPathname(pathname), locale);
}

export function getAlternateLanguages(pathname: string): NonNullable<Metadata["alternates"]>["languages"] {
  const cleanPath = stripLocaleFromPathname(pathname);
  return {
    hu: getLocalizedPath(cleanPath, "hu"),
    en: getLocalizedPath(cleanPath, "en"),
    "x-default": getLocalizedPath(cleanPath, "hu"),
  };
}

export function getCanonicalUrl(pathname: string, locale: SupportedLanguage) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";

  return new URL(getCanonicalPath(pathname, locale), baseUrl).toString();
}
