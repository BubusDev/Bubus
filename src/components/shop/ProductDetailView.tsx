import { ChevronDown, CreditCard, Heart, RotateCcw, Sparkles, Truck } from "lucide-react";
import Link from "next/link";

import { addFavouriteAction } from "@/app/(storefront)/account/actions";
import { StoneInfoButton } from "@/components/product/StoneInfoButton";
import { AddToCartTextButton } from "@/components/shop/AddToCartButtons";
import { ProductImageGallery } from "@/components/shop/ProductImageGallery";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import {
  formatPrice,
  getProductAvailabilityLabel,
  isProductOutOfStock,
  type Product,
} from "@/lib/catalog";

type ProductDetailViewProps = {
  product: Product;
  categoryTitle: string;
  relatedProducts: Product[];
};

function getDisplayValue(value?: string | null, fallback = "Nincs megadva") {
  const normalizedValue = typeof value === "string" ? value.trim() : "";
  return normalizedValue || fallback;
}

export function ProductDetailView({
  product,
  categoryTitle,
  relatedProducts,
}: ProductDetailViewProps) {
  const galleryImages = product.images.length > 0 ? product.images : [];
  const isOutOfStock = isProductOutOfStock(product);
  const availabilityLabel = getProductAvailabilityLabel(product);
  const shortDescription = product.shortDescription.trim();
  const description = product.description.trim();
  const introText =
    shortDescription ||
    description ||
    "A termék részletes leírása hamarosan elérhető lesz.";
  const detailText =
    description && description !== introText ? description : null;

  const metaRows = [
    { label: "Szín", value: product.labels.color, clickable: false },
    { label: "Stílus", value: product.labels.style, clickable: false },
    { label: "Alkalom", value: product.labels.occasion, clickable: false },
  ].filter((r) => r.value);
  const reassuranceItems = [
    { label: "2–4 napos szállítás", icon: Truck },
    { label: "14 napos visszaküldés", icon: RotateCcw },
    { label: "Biztonságos fizetés", icon: CreditCard },
    { label: "Kézzel készült, limitált darabok", icon: Sparkles },
  ];

  return (
    <main className="mx-auto max-w-[1300px] px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
      <div className="grid gap-5 sm:gap-7 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">

        {/* Kép szekció (bal + közép) */}
        <div className="mx-auto w-full max-w-[520px] sm:max-w-[620px] xl:max-w-none">
          <ProductImageGallery
            images={galleryImages}
            productName={product.name}
            soldOut={isOutOfStock}
          />
        </div>

        {/* Termék info (jobb) */}
        <div className="space-y-4 sm:space-y-5 xl:pt-1">

          {/* 1. Fejléc */}
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-[.22em] text-[#888] sm:tracking-[.28em]">
              {categoryTitle}
            </p>
            <h1 className="font-[family:var(--font-display)] text-[1.55rem] leading-[1.12] tracking-[-0.03em] text-[#1a1a1a] sm:text-[1.9rem]">
              {product.name}
            </h1>
          </div>

          {/* 2. Ár */}
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-semibold text-[#1a1a1a] sm:text-xl">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-[#888] line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* 3. Szállítás */}
          <div
            className="flex min-h-10 items-center gap-2 px-3 py-2 text-[13px] text-[#555] sm:min-h-11 sm:text-sm"
            style={{ border: "1px solid #e8e5e0" }}
          >
            <Truck className="h-4 w-4 flex-shrink-0 text-[#888]" />
            <span>Ingyenes szállítás · 3–5 munkanap</span>
          </div>

          {/* 4. Kosárba */}
          <div className="flex flex-col gap-2">
            <AddToCartTextButton
              productId={product.id}
              redirectTo={`/product/${product.slug}`}
              disabled={isOutOfStock}
              idleLabel="Kosárba rakom"
              addedLabel="Kosárban"
              soldOutLabel="Elfogyott"
              iconClassName="h-4 w-4"
              baseClassName="inline-flex h-12 w-full items-center justify-center gap-2 text-[13px] font-medium transition"
              disabledClassName="cursor-not-allowed bg-[#ebe5e8] text-[#7e7278]"
              addedClassName="bg-[#4d2741] text-white"
              idleClassName="bg-[#1a1a1a] text-white hover:bg-[#333]"
            />

            <form action={addFavouriteAction}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="redirectTo" value="/favourites" />
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 text-[13px] font-medium text-[#4d2741] transition hover:text-[#1a1a1a]"
                style={{ border: "1px solid #e7dde3", background: "white" }}
              >
                <Heart className="h-4 w-4" />
                Kedvencekhez adom
              </button>
            </form>

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
          <div className="border-t border-[#e8e5e0] pt-4 space-y-2">
            {/* Kőtípus */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#888]">Kő</span>
              <StoneInfoButton
                stoneSlug={product.stoneType}
                stoneLabel={getDisplayValue(product.labels.stoneType)}
              />
            </div>

            {metaRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-[#888]">{row.label}</span>
                <span className="font-medium text-[#1a1a1a]">
                  {getDisplayValue(row.value)}
                </span>
              </div>
            ))}

            {availabilityLabel && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#888]">Elérhetőség</span>
                <span
                  className={`font-medium ${
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
              Termékleírás
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
                <p className="text-[10px] uppercase tracking-[.3em] text-[#888] mb-1">Ajánlott</p>
                <h2 className="font-[family:var(--font-display)] text-2xl text-[#1a1a1a]">
                  Ez is érdekelheti Önt
                </h2>
              </div>
              <Link href="/new-in" className="inline-flex min-h-10 items-center text-sm text-[#888] transition hover:text-[#1a1a1a]">
                Összes termék →
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
