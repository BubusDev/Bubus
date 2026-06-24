"use client";

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
  const displayPrice = getDisplayPriceForCountry(product, country);
  const price = displayPrice == null ? null : formatPriceForCountry(displayPrice, country);

  return (
    <>
      <span className={className}>
        {price ?? (language === "en" ? "Not available for EU delivery" : "EU szállításhoz még nem elérhető")}
      </span>
      {showFreeShipping ? (
        <span className="block text-xs font-normal tracking-normal text-[#756a70]">
          {getFreeShippingLabel(language)}
        </span>
      ) : null}
    </>
  );
}
