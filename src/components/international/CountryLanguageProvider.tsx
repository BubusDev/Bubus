"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import {
  COUNTRY_COOKIE_NAME,
  LANGUAGE_COOKIE_NAME,
  getCountryConfig,
  getCountryLabel,
  getLanguageForCountry,
  supportedCountries,
  validateSupportedCountry,
  validateSupportedLanguage,
  type SupportedCountry,
  type SupportedLanguage,
} from "@/lib/international";
import { getDictionary } from "@/lib/i18n";

type CountryLanguageContextValue = {
  country: SupportedCountry;
  language: SupportedLanguage;
  currency: "HUF" | "EUR";
  isReady: boolean;
  openSelector: () => void;
  saveSelection: (country: SupportedCountry, language?: SupportedLanguage) => void;
};

const CountryLanguageContext = createContext<CountryLanguageContextValue | null>(null);

function getStoredValue(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function persistValue(key: string, value: string) {
  window.localStorage.setItem(key, value);
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

function getInitialSelection() {
  const storedCountry = getStoredValue(COUNTRY_COOKIE_NAME);
  const storedLanguage = getStoredValue(LANGUAGE_COOKIE_NAME);
  const country = validateSupportedCountry(storedCountry);
  const language = storedLanguage
    ? validateSupportedLanguage(storedLanguage)
    : getLanguageForCountry(country);

  return {
    country,
    language,
    hasSelection: Boolean(storedCountry),
  };
}

export function CountryLanguageProvider({ children }: { children: ReactNode }) {
  const initialSelection = getInitialSelection();
  const [country, setCountry] = useState<SupportedCountry>(initialSelection.country);
  const [language, setLanguage] = useState<SupportedLanguage>(initialSelection.language);
  const [isSelectorOpen, setIsSelectorOpen] = useState(!initialSelection.hasSelection);

  function saveSelection(nextCountry: SupportedCountry, nextLanguage?: SupportedLanguage) {
    const normalizedCountry = validateSupportedCountry(nextCountry);
    const normalizedLanguage = validateSupportedLanguage(nextLanguage ?? getLanguageForCountry(normalizedCountry));
    setCountry(normalizedCountry);
    setLanguage(normalizedLanguage);
    persistValue(COUNTRY_COOKIE_NAME, normalizedCountry);
    persistValue(LANGUAGE_COOKIE_NAME, normalizedLanguage);
    setIsSelectorOpen(false);
    window.dispatchEvent(new CustomEvent("chicks-country-language-changed"));
    window.location.reload();
  }

  const value = useMemo<CountryLanguageContextValue>(
    () => ({
      country,
      language,
      currency: getCountryConfig(country).currency,
      isReady: true,
      openSelector: () => setIsSelectorOpen(true),
      saveSelection,
    }),
    [country, language],
  );

  const dictionary = getDictionary(language);

  return (
    <CountryLanguageContext.Provider value={value}>
      {children}
      {isSelectorOpen ? (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#1f1a17]/35 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-[460px] rounded-lg border border-[#eaded9] bg-[#fffdfb] p-6 shadow-[0_24px_80px_rgba(57,39,47,0.18)] sm:p-7">
            <p className="mb-2 text-[10px] uppercase tracking-[0.32em] text-[#a56f87]">Chicks Jewelry</p>
            <h2 className="font-[family:var(--font-display)] text-[2rem] leading-none text-[#4d2741]">
              {dictionary["countryPopup.title"]}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#6f5d65]">{dictionary["countryPopup.body"]}</p>
            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                saveSelection(
                  validateSupportedCountry(formData.get("country")),
                  validateSupportedLanguage(formData.get("language")),
                );
              }}
            >
              <label className="block">
                <span className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-[#8c7f86]">{dictionary["countryPopup.country"]}</span>
                <select
                  name="country"
                  value={country}
                  onChange={(event) => {
                    const nextCountry = validateSupportedCountry(event.target.value);
                    setCountry(nextCountry);
                    setLanguage(getLanguageForCountry(nextCountry));
                  }}
                  className="h-11 w-full rounded-md border border-[#d8c9cf] bg-white px-3 text-sm text-[#24191e] outline-none focus:border-[#8f5367]"
                >
                  {supportedCountries.map((code) => (
                    <option key={code} value={code}>
                      {getCountryLabel(code, language)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-[#8c7f86]">{dictionary["countryPopup.language"]}</span>
                <select
                  name="language"
                  value={language}
                  onChange={(event) => setLanguage(validateSupportedLanguage(event.target.value))}
                  className="h-11 w-full rounded-md border border-[#d8c9cf] bg-white px-3 text-sm text-[#24191e] outline-none focus:border-[#8f5367]"
                >
                  <option value="hu">Magyar</option>
                  <option value="en">English</option>
                </select>
              </label>
              <button
                type="submit"
                className="h-12 w-full rounded-md bg-[#1f1a17] px-5 text-sm font-medium text-white transition hover:bg-[#332821] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b5c4] focus-visible:ring-offset-2"
              >
                {dictionary["countryPopup.continue"]}
              </button>
              <p className="text-center text-xs text-[#8c7f86]">{dictionary["countryPopup.note"]}</p>
            </form>
          </div>
        </div>
      ) : null}
    </CountryLanguageContext.Provider>
  );
}

export function useCountryLanguage() {
  const context = useContext(CountryLanguageContext);
  if (!context) {
    throw new Error("useCountryLanguage must be used within CountryLanguageProvider.");
  }
  return context;
}

export function CountryLanguageButton({ className = "" }: { className?: string }) {
  const { country, language, openSelector } = useCountryLanguage();
  const label = getDictionary(language)["nav.countryLanguage"];

  return (
    <button type="button" onClick={openSelector} className={className}>
      {label}: {country} / {language.toUpperCase()}
    </button>
  );
}
