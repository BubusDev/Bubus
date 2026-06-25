import { cookies, headers } from "next/headers";

import { LANGUAGE_COOKIE_NAME, validateSupportedLanguage, type SupportedLanguage } from "@/lib/international";
import { LOCALE_HEADER_NAME, PATHNAME_HEADER_NAME, getLocaleFromPathname } from "@/lib/locale-routing";

export async function getRequestLocale(): Promise<SupportedLanguage> {
  const headerStore = await headers();
  const headerLocale = headerStore.get(LOCALE_HEADER_NAME);
  if (headerLocale) return validateSupportedLanguage(headerLocale);

  const pathname = headerStore.get(PATHNAME_HEADER_NAME);
  const pathLocale = pathname ? getLocaleFromPathname(pathname) : null;
  if (pathLocale) return pathLocale;
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  if (cookieLocale) return validateSupportedLanguage(cookieLocale);
  if (pathname) return "hu";

  return "hu";
}

export async function getRequestPathname() {
  const headerStore = await headers();
  return headerStore.get(PATHNAME_HEADER_NAME) ?? "/";
}
