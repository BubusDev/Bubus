"use client";

import { ChevronDown, CreditCard, Heart, PackageCheck, RotateCcw, Sparkles, Truck } from "lucide-react";
import Link from "next/link";

import { addFavouriteAction } from "@/app/(storefront)/account/actions";
import { StoneInfoButton } from "@/components/product/StoneInfoButton";
import { CountryPrice } from "@/components/international/CountryPrice";
import { CountryAwareAddToCartTextButton } from "@/components/international/CountryAwareAddToCartTextButton";
import { ProductImageGallery } from "@/components/shop/ProductImageGallery";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import {
  formatPrice,
  isProductOutOfStock,
  type Product,
} from "@/lib/catalog";
import { useCountryLanguage } from "@/components/international/CountryLanguageProvider";
import { getDictionary, getLocalizedProduct } from "@/lib/i18n";

type ProductDetailViewProps = {
  product: Product;
  categoryTitle: string;
  relatedProducts: Product[];
};

function getDisplayValue(value?: string | null, fallback = "Nincs megadva") {
  const normalizedValue = typeof value === "string" ? value.trim() : "";
  return normalizedValue || fallback;
}

function getStockTone(product: Product, isOutOfStock: boolean, language: string) {
  const dictionary = getDictionary(language);

  if (isOutOfStock) {
    return {
      label: dictionary["product.soldOut"],
      description: language === "en" ? "This piece is currently unavailable." : "Ez a darab jelenleg nem rendelhető.",
      className: "border-[#ead6dd] bg-[#faf7f8] text-[#7b6f74]",
    };
  }

  if (product.availableToSell > 0 && product.availableToSell <= 3) {
    return {
      label: `Már csak ${product.availableToSell} db`,
      description: "Kis szériás darab, korlátozott készlettel.",
      className: "border-[#ead8c3] bg-[#fff9ef] text-[#7a5631]",
    };
  }

  return {
    label: dictionary["product.inStock"],
    description: language === "en" ? "Available to order with quick processing." : "Rendelhető, gyors feldolgozással.",
    className: "border-[#dbe7dc] bg-[#f6fbf6] text-[#496747]",
  };
}

export function ProductDetailView({
  product,
  categoryTitle,
  relatedProducts,
}: ProductDetailViewProps) {
  const { language } = useCountryLanguage();
  const dictionary = getDictionary(language);
  const localizedProduct = getLocalizedProduct(product, language);
  const galleryImages = product.images.length > 0 ? product.images : [];
  const isOutOfStock = isProductOutOfStock(product);
  const availabilityLabel = isOutOfStock ? dictionary["product.soldOut"] : product.labels.availability;
  const shortDescription = localizedProduct.shortDescription.trim();
  const description = localizedProduct.description.trim();
  const introText =
    shortDescription ||
    description ||
    language === "en" ? "Product details will be available soon." : "A termék részletes leírása hamarosan elérhető lesz.";
  const detailText =
    description && description !== introText ? description : null;
  const stockTone = getStockTone(product, isOutOfStock, language);
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const metaRows = [
    { label: dictionary["product.category"], value: product.labels.category || categoryTitle, clickable: false },
    { label: dictionary["product.collection"], value: localizedProduct.collectionLabel, clickable: false },
    { label: dictionary["product.stone"], value: product.labels.stoneType, clickable: false },
    { label: dictionary["product.color"], value: product.labels.color, clickable: false },
    { label: dictionary["product.style"], value: product.labels.style, clickable: false },
    { label: dictionary["product.occasion"], value: product.labels.occasion, clickable: false },
  ].filter((r) => r.value);
  const reassuranceItems = [
    { label: language === "en" ? "2-4 business day delivery" : "2-4 munkanapos szállítás", icon: Truck },
    { label: language === "en" ? "14-day return on unworn non-custom pieces" : "14 napos visszaküldés nem egyedi darabokra", icon: RotateCcw },
    { label: language === "en" ? "Secure Stripe payment" : "Biztonságos Stripe fizetés", icon: CreditCard },
    { label: language === "en" ? "Small-batch curation" : "Kis szériás válogatás", icon: Sparkles },
  ];

  return (
    <main className="mx-auto max-w-[1300px] px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
      <div className="grid gap-5 sm:gap-7 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">

        {/* Kép szekció (bal + közép) */}
        <div className="mx-auto w-full max-w-[520px] sm:max-w-[620px] xl:max-w-none">
          <ProductImageGallery
            images={galleryImages}
            productName={localizedProduct.name}
            soldOut={isOutOfStock}
          />
        </div>

        {/* Termék info (jobb) */}
        <div className="space-y-4 sm:space-y-5 xl:pt-1">

          {/* 1. Fejléc */}
          <div className="space-y-3">
            <p className="mb-1 text-[10px] uppercase tracking-[.22em] text-[#888] sm:tracking-[.28em]">
              {categoryTitle}
            </p>
            <h1 className="font-[family:var(--font-display)] text-[1.55rem] leading-[1.12] tracking-[-0.03em] text-[#1a1a1a] sm:text-[1.9rem]">
              {localizedProduct.name}
            </h1>
            <p className="max-w-[48ch] text-sm leading-7 text-[#5f555a]">
              {introText}
            </p>
          </div>

          {/* 2. Ár */}
          <div className="rounded-lg border border-[#e8e5e0] bg-white px-4 py-3">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-semibold tracking-[-0.04em] text-[#1a1a1a] sm:text-[1.7rem]">
                <CountryPrice product={product} />
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-[#888] line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              {discountPercent ? (
                <span className="rounded-full bg-[#4d2741] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white">
                  -{discountPercent}%
                </span>
              ) : product.isOnSale ? (
                <span className="rounded-full bg-[#4d2741] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white">
                  {language === "en" ? "Sale" : "Akció"}
                </span>
              ) : null}
            </div>
            <div className={`mt-3 rounded-md border px-3 py-2 text-sm ${stockTone.className}`}>
              <div className="flex items-start gap-2">
                <PackageCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">{stockTone.label}</p>
                  <p className="mt-0.5 text-xs opacity-85">{stockTone.description}</p>
                </div>
              </div>
            </div>
          </div>

          {(product.badge || product.collectionLabel || product.specialtyKey) && (
            <div className="flex flex-wrap gap-2">
              {product.badge ? (
                <span className="rounded-full border border-[#e7dde3] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#6d5964]">
                  {localizedProduct.badge}
                </span>
              ) : null}
              {product.collectionLabel ? (
                <span className="rounded-full border border-[#e7dde3] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#6d5964]">
                  {localizedProduct.collectionLabel}
                </span>
              ) : null}
              {product.specialtyKey ? (
                <span className="rounded-full border border-[#e7dde3] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#6d5964]">
                  {language === "en" ? "Limited selection" : "Limitált válogatás"}
                </span>
              ) : null}
            </div>
          )}

          {/* 3. Szállítás */}
          <div
            className="flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-[#555] sm:min-h-11 sm:text-sm"
            style={{ border: "1px solid #e8e5e0" }}
          >
            <Truck className="h-4 w-4 flex-shrink-0 text-[#888]" />
            <CountryPrice product={product} showFreeShipping className="sr-only" />
          </div>

          {/* 4. Kosárba */}
          <div className="flex flex-col gap-2 sm:sticky sm:top-24">
            <div className="rounded-lg border border-[#e8e5e0] bg-white p-3">
              <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                <span className="text-[#756a70]">{dictionary["product.quantity"]}</span>
                <span className="font-medium text-[#1a1a1a]">1 db</span>
              </div>
              <CountryAwareAddToCartTextButton
                product={product}
                redirectTo={`/product/${product.slug}`}
                disabled={isOutOfStock}
                idleLabel={dictionary["product.addToCart"]}
                addedLabel={language === "en" ? "In cart" : "Kosárban"}
                soldOutLabel={dictionary["product.soldOut"]}
                unavailableLabel={dictionary["product.notAvailableEu"]}
                iconClassName="h-4 w-4"
                baseClassName="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md text-[13px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
                disabledClassName="cursor-not-allowed bg-[#ebe5e8] text-[#7e7278]"
                addedClassName="bg-[#4d2741] text-white"
                idleClassName="bg-[#1a1a1a] text-white hover:bg-[#333]"
              />
            </div>

            <form action={addFavouriteAction}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="redirectTo" value="/favourites" />
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md text-[13px] font-medium text-[#4d2741] transition hover:text-[#1a1a1a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
                style={{ border: "1px solid #e7dde3", background: "white" }}
              >
                <Heart className="h-4 w-4" />
                {dictionary["product.addToFavourites"]}
              </button>
            </form>

            <p className="text-xs leading-5 text-[#756a70]">
              {language === "en"
                ? "Secure payment and a clear checkout flow. We will also send an order confirmation by email."
                : "Biztonságos fizetés, átlátható rendelési folyamat. A rendelésedről emailben is küldünk visszaigazolást."}
            </p>

            <div className="grid gap-2 border-t border-[#e8e5e0] pt-3 sm:grid-cols-2">
              {reassuranceItems.map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2 text-[12px] leading-5 text-[#666]">
                  <Icon className="h-3.5 w-3.5 flex-shrink-0 text-[#8c7f86]" aria-hidden="true" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Kőtípus + attribútumok */}
          <div className="space-y-2 border-t border-[#e8e5e0] pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#888]">{dictionary["product.stone"]}</span>
              <StoneInfoButton
                stoneSlug={product.stoneType}
                stoneLabel={getDisplayValue(product.labels.stoneType)}
              />
            </div>

            {metaRows
              .filter((row) => row.label !== dictionary["product.stone"])
              .map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-[#888]">{row.label}</span>
                  <span className="text-right font-medium text-[#1a1a1a]">
                    {getDisplayValue(row.value)}
                  </span>
                </div>
              ))}

            {availabilityLabel && (
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-[#888]">{language === "en" ? "Availability" : "Elérhetőség"}</span>
                <span
                  className={`text-right font-medium ${
                    isOutOfStock ? "text-[#7f7078]" : "text-[#1a1a1a]"
                  }`}
                >
                  {availabilityLabel}
                </span>
              </div>
            )}
          </div>

          {/* 6. Leírás — accordion */}
          <details
            id="details"
            className="group scroll-mt-32 border-t border-[#e8e5e0] pt-4"
          >
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-medium text-[#1a1a1a]">
              {dictionary["product.description"]}
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-[#888] transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-[1.85] text-[#555]">{introText}</p>
            {detailText && (
              <p className="mt-2 text-sm leading-[1.85] text-[#555]">{detailText}</p>
            )}
          </details>
        </div>
      </div>

      {/* Ajánlott termékek */}
      {relatedProducts.length > 0 && (
        <section className="mt-14 -mx-4 border-t border-[#e8e5e0] bg-white px-4 py-12 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:mt-20 xl:py-14">
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[.3em] text-[#888] mb-1">{language === "en" ? "Recommended" : "Ajánlott"}</p>
                <h2 className="font-[family:var(--font-display)] text-2xl text-[#1a1a1a]">
                  {language === "en" ? "More from the collection" : "További darabok a kollekcióból"}
                </h2>
              </div>
              <Link href="/new-in" className="inline-flex min-h-10 items-center text-sm text-[#888] transition hover:text-[#1a1a1a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2">
                {language === "en" ? "All jewelry ->" : "Összes termék →"}
              </Link>
            </div>
            <RelatedProducts
              products={relatedProducts}
              redirectTo={`/product/${product.slug}`}
            />
          </div>
        </section>
      )}
    </main>
  );
}
