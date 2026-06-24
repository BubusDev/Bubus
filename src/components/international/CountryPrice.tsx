"use client";

import { useMemo } from "react";

import { useCountryLanguage } from "@/components/international/CountryLanguageProvider";
import {
  formatPriceForCountry,
  getDisplayPriceForCountry,
  getFreeShippingLabel,
  type CountryPricedProduct,
} from "@/lib/international";

type CountryPriceProps = {
  product: CountryPricedProduct;
  className?: string;
  showFreeShipping?: boolean;
};

export function CountryPrice({ product, className, showFreeShipping = false }: CountryPriceProps) {
  const { country, language } = useCountryLanguage();
  const displayPrice = useMemo(() => getDisplayPriceForCountry(product, country), [product, country]);
  const price = useMemo(
    () => displayPrice == null ? null : formatPriceForCountry(displayPrice, country),
    [country, displayPrice],
  );
  const freeShippingLabel = useMemo(() => getFreeShippingLabel(language), [language]);

  return (
    <>
      <span className={className}>
        {price ?? (language === "en" ? "Not available for EU delivery" : "EU szállításhoz még nem elérhető")}
      </span>
      {showFreeShipping ? (
        <span className="block text-xs font-normal tracking-normal text-[#756a70]">
          {freeShippingLabel}
        </span>
      ) : null}
    </>
  );
}
