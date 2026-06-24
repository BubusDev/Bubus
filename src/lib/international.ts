export const COUNTRY_COOKIE_NAME = "chicks_country";
export const LANGUAGE_COOKIE_NAME = "chicks_language";

export const supportedCountries = [
  "HU",
  "AT",
  "DE",
  "PL",
  "SK",
  "CZ",
  "SI",
  "HR",
  "RO",
  "NL",
  "BE",
  "FR",
  "IT",
  "ES",
] as const;
export const supportedLanguages = ["hu", "en"] as const;

export type SupportedCountry = (typeof supportedCountries)[number];
export type SupportedLanguage = (typeof supportedLanguages)[number];
export type SupportedCurrency = "HUF" | "EUR";
export type PricingZone = "HU" | "EU";

export type CountryConfig = {
  code: SupportedCountry;
  labelHu: string;
  labelEn: string;
  defaultLanguage: SupportedLanguage;
  pricingZone: PricingZone;
  currency: SupportedCurrency;
  stripeCurrency: "huf" | "eur";
  locale: string;
  shippingMethods: readonly ("foxpost" | "home" | "international")[];
};

export const defaultCountry: SupportedCountry = "HU";
export const defaultLanguage: SupportedLanguage = "hu";

const countryConfigs: Record<SupportedCountry, CountryConfig> = {
  HU: {
    code: "HU",
    labelHu: "Magyarország",
    labelEn: "Hungary",
    defaultLanguage: "hu",
    pricingZone: "HU",
    currency: "HUF",
    stripeCurrency: "huf",
    locale: "hu-HU",
    shippingMethods: ["foxpost", "home"],
  },
  AT: {
    code: "AT",
    labelHu: "Ausztria",
    labelEn: "Austria",
    defaultLanguage: "en",
    pricingZone: "EU",
    currency: "EUR",
    stripeCurrency: "eur",
    locale: "en-AT",
    shippingMethods: ["international"],
  },
  DE: {
    code: "DE",
    labelHu: "Németország",
    labelEn: "Germany",
    defaultLanguage: "en",
    pricingZone: "EU",
    currency: "EUR",
    stripeCurrency: "eur",
    locale: "en-DE",
    shippingMethods: ["international"],
  },
  PL: {
    code: "PL",
    labelHu: "Lengyelország",
    labelEn: "Poland",
    defaultLanguage: "en",
    pricingZone: "EU",
    currency: "EUR",
    stripeCurrency: "eur",
    locale: "en-PL",
    shippingMethods: ["international"],
  },
  SK: {
    code: "SK",
    labelHu: "Szlovákia",
    labelEn: "Slovakia",
    defaultLanguage: "en",
    pricingZone: "EU",
    currency: "EUR",
    stripeCurrency: "eur",
    locale: "en-SK",
    shippingMethods: ["international"],
  },
  CZ: {
    code: "CZ",
    labelHu: "Csehország",
    labelEn: "Czechia",
    defaultLanguage: "en",
    pricingZone: "EU",
    currency: "EUR",
    stripeCurrency: "eur",
    locale: "en-CZ",
    shippingMethods: ["international"],
  },
  SI: {
    code: "SI",
    labelHu: "Szlovénia",
    labelEn: "Slovenia",
    defaultLanguage: "en",
    pricingZone: "EU",
    currency: "EUR",
    stripeCurrency: "eur",
    locale: "en-SI",
    shippingMethods: ["international"],
  },
  HR: {
    code: "HR",
    labelHu: "Horvátország",
    labelEn: "Croatia",
    defaultLanguage: "en",
    pricingZone: "EU",
    currency: "EUR",
    stripeCurrency: "eur",
    locale: "en-HR",
    shippingMethods: ["international"],
  },
  RO: {
    code: "RO",
    labelHu: "Románia",
    labelEn: "Romania",
    defaultLanguage: "en",
    pricingZone: "EU",
    currency: "EUR",
    stripeCurrency: "eur",
    locale: "en-RO",
    shippingMethods: ["international"],
  },
  NL: {
    code: "NL",
    labelHu: "Hollandia",
    labelEn: "Netherlands",
    defaultLanguage: "en",
    pricingZone: "EU",
    currency: "EUR",
    stripeCurrency: "eur",
    locale: "en-NL",
    shippingMethods: ["international"],
  },
  BE: {
    code: "BE",
    labelHu: "Belgium",
    labelEn: "Belgium",
    defaultLanguage: "en",
    pricingZone: "EU",
    currency: "EUR",
    stripeCurrency: "eur",
    locale: "en-BE",
    shippingMethods: ["international"],
  },
  FR: {
    code: "FR",
    labelHu: "Franciaország",
    labelEn: "France",
    defaultLanguage: "en",
    pricingZone: "EU",
    currency: "EUR",
    stripeCurrency: "eur",
    locale: "en-FR",
    shippingMethods: ["international"],
  },
  IT: {
    code: "IT",
    labelHu: "Olaszország",
    labelEn: "Italy",
    defaultLanguage: "en",
    pricingZone: "EU",
    currency: "EUR",
    stripeCurrency: "eur",
    locale: "en-IT",
    shippingMethods: ["international"],
  },
  ES: {
    code: "ES",
    labelHu: "Spanyolország",
    labelEn: "Spain",
    defaultLanguage: "en",
    pricingZone: "EU",
    currency: "EUR",
    stripeCurrency: "eur",
    locale: "en-ES",
    shippingMethods: ["international"],
  },
};

export type CountryPricedProduct = {
  price: number;
  priceEur?: number | null;
};

export function validateSupportedCountry(value: unknown): SupportedCountry {
  return supportedCountries.includes(value as SupportedCountry)
    ? (value as SupportedCountry)
    : defaultCountry;
}

export function validateSupportedLanguage(value: unknown): SupportedLanguage {
  return supportedLanguages.includes(value as SupportedLanguage)
    ? (value as SupportedLanguage)
    : defaultLanguage;
}

export function getCountryConfig(countryCode: unknown) {
  return countryConfigs[validateSupportedCountry(countryCode)];
}

export function getDisplayCurrencyForCountry(countryCode: unknown): SupportedCurrency {
  return getCountryConfig(countryCode).currency;
}

export function getPricingZoneForCountry(countryCode: unknown): PricingZone {
  return getCountryConfig(countryCode).pricingZone;
}

export function getLanguageForCountry(countryCode: unknown): SupportedLanguage {
  return getCountryConfig(countryCode).defaultLanguage;
}

export function getDisplayPriceForCountry(product: CountryPricedProduct, countryCode: unknown) {
  const config = getCountryConfig(countryCode);

  if (config.currency === "HUF") {
    return product.price;
  }

  if (typeof product.priceEur === "number" && Number.isFinite(product.priceEur) && product.priceEur > 0) {
    return Math.round(product.priceEur);
  }

  return null;
}

const priceFormatterCache = new Map<string, Intl.NumberFormat>();

export function formatPriceForCountry(amount: number, countryCode: unknown) {
  const config = getCountryConfig(countryCode);
  const maximumFractionDigits = config.currency === "HUF" ? 0 : amount % 1 === 0 ? 0 : 2;
  const cacheKey = `${config.locale}:${config.currency}:${maximumFractionDigits}`;
  const cachedFormatter = priceFormatterCache.get(cacheKey);

  if (cachedFormatter) {
    return cachedFormatter.format(amount);
  }

  const formatter = new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    maximumFractionDigits,
  });

  priceFormatterCache.set(cacheKey, formatter);
  return formatter.format(amount);
}

export function getFreeShippingLabel(language: unknown) {
  return validateSupportedLanguage(language) === "en" ? "Free shipping" : "Ingyenes szállítás";
}

export function getShippingLineValue(language: unknown) {
  return validateSupportedLanguage(language) === "en" ? "Free" : "Ingyenes";
}

export function getCountryLabel(countryCode: unknown, language: unknown) {
  const config = getCountryConfig(countryCode);
  return validateSupportedLanguage(language) === "en" ? config.labelEn : config.labelHu;
}

export function hasDisplayPriceForCountry(product: CountryPricedProduct, countryCode: unknown) {
  return getDisplayPriceForCountry(product, countryCode) !== null;
}

export function requireDisplayPriceForCountry(product: CountryPricedProduct, countryCode: unknown) {
  const price = getDisplayPriceForCountry(product, countryCode);

  if (price == null) {
    throw new Error("MISSING_EU_PRICE");
  }

  return price;
}

export function isShippingMethodAllowedForCountry(method: string | null | undefined, countryCode: unknown) {
  return getCountryConfig(countryCode).shippingMethods.includes(method as "foxpost" | "home" | "international");
}
