"use client";

import { AddToCartTextButton } from "@/components/shop/AddToCartButtons";
import { useCountryLanguage } from "@/components/international/CountryLanguageProvider";
import { hasDisplayPriceForCountry, type CountryPricedProduct } from "@/lib/international";

type CountryAwareAddToCartTextButtonProps = {
  product: CountryPricedProduct & { id: string };
  redirectTo?: string;
  disabled?: boolean;
  idleLabel: string;
  addedLabel: string;
  soldOutLabel: string;
  unavailableLabel: string;
  iconClassName?: string;
  baseClassName: string;
  disabledClassName: string;
  addedClassName: string;
  idleClassName: string;
};

export function CountryAwareAddToCartTextButton({
  product,
  disabled = false,
  unavailableLabel,
  ...props
}: CountryAwareAddToCartTextButtonProps) {
  const { country } = useCountryLanguage();
  const missingZonePrice = !hasDisplayPriceForCountry(product, country);

  return (
    <AddToCartTextButton
      {...props}
      productId={product.id}
      disabled={disabled || missingZonePrice}
      soldOutLabel={missingZonePrice ? unavailableLabel : props.soldOutLabel}
    />
  );
}
