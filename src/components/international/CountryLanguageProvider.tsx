"use client";

import { createContext, memo, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { Globe } from "lucide-react";

import {
  COUNTRY_COOKIE_NAME,
  LANGUAGE_COOKIE_NAME,
  getCountryConfig,
  getCountryLabel,
  supportedCountries,
  validateSupportedCountry,
  validateSupportedLanguage,
  type SupportedCountry,
  type SupportedLanguage,
} from "@/lib/international";
import { getDictionary } from "@/lib/i18n";
import { getLocalizedPath } from "@/lib/locale-routing";

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
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Cookies are the source of truth for server rendering; localStorage is only a client convenience.
  }
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
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-[#2D1F1F]/18 px-4 py-4 sm:items-center">
      <div className="mobile-panel-reveal w-full max-w-[480px] rounded-[12px] border border-[#F0E8E2] bg-white px-6 py-7 shadow-[0_18px_40px_rgba(92,57,45,0.14)] sm:px-8 sm:py-8">
        <div className="mb-6 h-px w-16 bg-[#E0157A]" />
        <p className="mb-3 text-[0.75rem] font-medium uppercase tracking-[0.1em] text-[#A0607A]">Chicks Jewelry</p>
        <h2
          className="text-[2.15rem] font-medium leading-[1.08] text-[#2D1F1F] sm:text-[2.45rem]"
          style={{ fontFamily: "var(--font-editorial-display)" }}
        >
          {dictionary["countryPopup.title"]}
        </h2>
        <p className="mt-4 text-[0.95rem] leading-7 text-[#4A3A3A]">{dictionary["countryPopup.body"]}</p>
        <form
          className="mt-7 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(draftCountry, draftLanguage);
          }}
        >
          <label className="block">
            <span className="mb-2 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-[#A0607A]">
              {dictionary["countryPopup.country"]}
            </span>
            <select
              name="country"
              value={draftCountry}
              onChange={(event) => {
                const nextCountry = validateSupportedCountry(event.target.value);
                setDraftCountry(nextCountry);
              }}
              className="h-12 w-full rounded-[8px] border border-[#E5E0DC] bg-white px-4 text-[0.95rem] text-[#2D1F1F] outline-none transition duration-200 hover:border-[#d9d0ca] focus:border-[#E0157A] focus:ring-[3px] focus:ring-[#E0157A]/10"
            >
              {countryOptions.map((code) => (
                <option key={code} value={code}>
                  {getCountryLabel(code, draftLanguage)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-[#A0607A]">
              {dictionary["countryPopup.language"]}
            </span>
            <select
              name="language"
              value={draftLanguage}
              onChange={(event) => setDraftLanguage(validateSupportedLanguage(event.target.value))}
              className="h-12 w-full rounded-[8px] border border-[#E5E0DC] bg-white px-4 text-[0.95rem] text-[#2D1F1F] outline-none transition duration-200 hover:border-[#d9d0ca] focus:border-[#E0157A] focus:ring-[3px] focus:ring-[#E0157A]/10"
            >
              <option value="hu">Magyar</option>
              <option value="en">English</option>
            </select>
          </label>
          <button
            type="submit"
            className="mt-1 h-12 w-full rounded-[8px] bg-[#1A1010] px-5 text-sm font-medium text-white shadow-[0_12px_24px_rgba(26,16,16,0.16)] transition duration-200 hover:bg-[#2D1F1F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0157A] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {dictionary["countryPopup.continue"]}
          </button>
          <p className="px-3 text-center text-xs leading-5 text-[#9A8A8A]">{dictionary["countryPopup.note"]}</p>
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
  const [country, setCountry] = useState<SupportedCountry>(initialSelection.country);
  const [language, setLanguage] = useState<SupportedLanguage>(initialSelection.language);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const openSelector = useCallback(() => setIsSelectorOpen(true), []);

  const saveSelection = useCallback((nextCountry: SupportedCountry, nextLanguage?: SupportedLanguage) => {
    const normalizedCountry = validateSupportedCountry(nextCountry);
    const normalizedLanguage = validateSupportedLanguage(nextLanguage ?? language);
    const hasChanged = normalizedCountry !== country || normalizedLanguage !== language;

    setCountry(normalizedCountry);
    setLanguage(normalizedLanguage);
    persistValue(COUNTRY_COOKIE_NAME, normalizedCountry);
    persistValue(LANGUAGE_COOKIE_NAME, normalizedLanguage);
    setIsSelectorOpen(false);

    if (!hasChanged) return;

    window.dispatchEvent(new CustomEvent("chicks-country-language-changed"));

    const currentPath = `${window.location.pathname}${window.location.search}`;
    const localizedPath = getLocalizedPath(currentPath, normalizedLanguage);
    if (localizedPath !== currentPath) {
      window.location.href = localizedPath;
    }
  }, [country, language]);

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
  const { language, openSelector } = useCountryLanguage();

  return (
    <button
      type="button"
      onClick={openSelector}
      className={className || "flex items-center gap-1 text-[#5f4a51] hover:text-[#9b3d6e] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b5c4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf8f5]"}
      aria-label="Change language"
    >
      <Globe className="w-[1.1rem] h-[1.1rem]" strokeWidth={1.5} />
      <span className="text-xs font-medium uppercase tracking-wide">
        {language === 'en' ? 'EN' : 'HU'}
      </span>
    </button>
  );
}
