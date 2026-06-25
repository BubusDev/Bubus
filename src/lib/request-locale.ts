import { cookies, headers } from "next/headers";

import { LANGUAGE_COOKIE_NAME, validateSupportedLanguage, type SupportedLanguage } from "@/lib/international";
import { LOCALE_HEADER_NAME, PATHNAME_HEADER_NAME, getLocaleFromPathname } from "@/lib/locale-routing";

function getLocaleFromUrlSignal(pathname: string): SupportedLanguage | null {
  if (pathname === "/hu" || pathname.startsWith("/hu/")) return "hu";
  return getLocaleFromPathname(pathname);
}

function getLocaleFromAcceptLanguage(acceptLanguage: string | null): SupportedLanguage | null {
  if (!acceptLanguage) return null;

  const languages = acceptLanguage
    .split(",")
    .map((entry) => {
      const [languageRange = "", ...params] = entry.trim().split(";");
      const qParam = params.find((param) => param.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;

      return {
        language: languageRange.toLowerCase(),
        q: Number.isFinite(q) ? q : 0,
      };
    })
    .filter(({ language, q }) => language && q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { language } of languages) {
    const baseLanguage = language.split("-")[0];
    if (baseLanguage === "en" || baseLanguage === "hu") return baseLanguage;
  }

  return null;
}

export async function getRequestLocale(): Promise<SupportedLanguage> {
  const headerStore = await headers();
  const pathname = headerStore.get(PATHNAME_HEADER_NAME);
  const pathLocale = pathname ? getLocaleFromUrlSignal(pathname) : null;
  if (pathLocale) return pathLocale;

  const headerLocale = headerStore.get(LOCALE_HEADER_NAME);
  if (headerLocale) return validateSupportedLanguage(headerLocale);

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  if (cookieLocale) return validateSupportedLanguage(cookieLocale);

  const acceptLanguageLocale = getLocaleFromAcceptLanguage(headerStore.get("accept-language"));
  if (acceptLanguageLocale) return acceptLanguageLocale;

  return "hu";
}

export async function getRequestPathname() {
  const headerStore = await headers();
  return headerStore.get(PATHNAME_HEADER_NAME) ?? "/";
}
