"use client";

import { createContext, memo, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

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

type InitialSelection = {
  country: SupportedCountry;
  language: SupportedLanguage;
  hasStoredSelection: boolean;
};

type CountryLanguageContextValue = {
  country: SupportedCountry;
  language: SupportedLanguage;
  currency: "HUF" | "EUR";
  isReady: boolean;
  openSelector: () => void;
  saveSelection: (country: SupportedCountry, language?: SupportedLanguage) => void;
};

const CountryLanguageContext = createContext<CountryLanguageContextValue | null>(null);

function persistValue(key: string, value: string) {
  window.localStorage.setItem(key, value);
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

type CountryLanguageSelectorProps = {
  initialCountry: SupportedCountry;
  initialLanguage: SupportedLanguage;
  onSave: (country: SupportedCountry, language?: SupportedLanguage) => void;
};

const countryOptions = supportedCountries;

const CountryLanguageSelector = memo(function CountryLanguageSelector({
  initialCountry,
  initialLanguage,
  onSave,
}: CountryLanguageSelectorProps) {
  const [draftCountry, setDraftCountry] = useState<SupportedCountry>(initialCountry);
  const [draftLanguage, setDraftLanguage] = useState<SupportedLanguage>(initialLanguage);
  const dictionary = useMemo(() => getDictionary(draftLanguage), [draftLanguage]);

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-[#1a1010]/28 px-4 py-4 sm:items-center">
      <div className="w-full max-w-[460px] rounded-[12px] border border-[#efe5df] bg-white p-6 shadow-[0_18px_48px_rgba(45,31,31,0.14)] transition duration-200 ease-out sm:p-7">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-[#A0607A]">Chicks Jewelry</p>
        <h2 className="font-[family:var(--font-display)] text-[2rem] leading-tight text-[#2D1F1F]">
          {dictionary["countryPopup.title"]}
        </h2>
        <p className="mt-4 text-sm leading-7 text-[#4A3A3A]">{dictionary["countryPopup.body"]}</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(draftCountry, draftLanguage);
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-[#A0607A]">
              {dictionary["countryPopup.country"]}
            </span>
            <select
              name="country"
              value={draftCountry}
              onChange={(event) => {
                const nextCountry = validateSupportedCountry(event.target.value);
                setDraftCountry(nextCountry);
                setDraftLanguage(getLanguageForCountry(nextCountry));
              }}
              className="h-11 w-full rounded-[8px] border border-[#E5E0DC] bg-white px-3 text-sm text-[#2D1F1F] outline-none transition focus:border-[#E0157A]"
            >
              {countryOptions.map((code) => (
                <option key={code} value={code}>
                  {getCountryLabel(code, draftLanguage)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-[#A0607A]">
              {dictionary["countryPopup.language"]}
            </span>
            <select
              name="language"
              value={draftLanguage}
              onChange={(event) => setDraftLanguage(validateSupportedLanguage(event.target.value))}
              className="h-11 w-full rounded-[8px] border border-[#E5E0DC] bg-white px-3 text-sm text-[#2D1F1F] outline-none transition focus:border-[#E0157A]"
            >
              <option value="hu">Magyar</option>
              <option value="en">English</option>
            </select>
          </label>
          <button
            type="submit"
            className="h-12 w-full rounded-[8px] bg-[#1A1010] px-5 text-sm font-medium text-white transition hover:bg-[#2D1F1F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0157A] focus-visible:ring-offset-2"
          >
            {dictionary["countryPopup.continue"]}
          </button>
          <p className="text-center text-xs text-[#9A8A8A]">{dictionary["countryPopup.note"]}</p>
        </form>
      </div>
    </div>
  );
});

export function CountryLanguageProvider({
  children,
  initialSelection,
}: {
  children: ReactNode;
  initialSelection: InitialSelection;
}) {
  const router = useRouter();
  const [country, setCountry] = useState<SupportedCountry>(initialSelection.country);
  const [language, setLanguage] = useState<SupportedLanguage>(initialSelection.language);
  const [isSelectorOpen, setIsSelectorOpen] = useState(!initialSelection.hasStoredSelection);

  const openSelector = useCallback(() => setIsSelectorOpen(true), []);

  const saveSelection = useCallback((nextCountry: SupportedCountry, nextLanguage?: SupportedLanguage) => {
    const normalizedCountry = validateSupportedCountry(nextCountry);
    const normalizedLanguage = validateSupportedLanguage(nextLanguage ?? getLanguageForCountry(normalizedCountry));
    const hasChanged = normalizedCountry !== country || normalizedLanguage !== language;

    setCountry(normalizedCountry);
    setLanguage(normalizedLanguage);
    persistValue(COUNTRY_COOKIE_NAME, normalizedCountry);
    persistValue(LANGUAGE_COOKIE_NAME, normalizedLanguage);
    setIsSelectorOpen(false);

    if (hasChanged) {
      window.dispatchEvent(new CustomEvent("chicks-country-language-changed"));
      router.refresh();
    }
  }, [country, language, router]);

  const value = useMemo<CountryLanguageContextValue>(
    () => ({
      country,
      language,
      currency: getCountryConfig(country).currency,
      isReady: true,
      openSelector,
      saveSelection,
    }),
    [country, language, openSelector, saveSelection],
  );

  return (
    <CountryLanguageContext.Provider value={value}>
      {children}
      {isSelectorOpen ? (
        <CountryLanguageSelector initialCountry={country} initialLanguage={language} onSave={saveSelection} />
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
