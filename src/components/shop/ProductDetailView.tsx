import { ChevronDown, Heart, Info, Truck } from "lucide-react";

import { addFavouriteAction } from "@/app/account/actions";
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

  return (
    <main className="mx-auto max-w-[1300px] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">

        {/* Kép szekció (bal + közép) */}
        <div>
          <ProductImageGallery
            images={galleryImages}
            productName={product.name}
            soldOut={isOutOfStock}
          />
        </div>

        {/* Termék info (jobb) */}
        <div className="space-y-5">

          {/* 1. Fejléc */}
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-[.28em] text-[#888]">
              {categoryTitle}
            </p>
            <h1 className="font-[family:var(--font-display)] text-[1.8rem] leading-[1.1] tracking-[-0.03em] text-[#1a1a1a]">
              {product.name}
            </h1>
          </div>

          {/* 2. Ár */}
          <div className="flex items-baseline gap-3">
            <span className="text-xl font-medium text-[#1a1a1a]">
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
            className="flex items-center gap-2 text-sm text-[#555] px-3 py-2"
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
          <details className="group border-t border-[#e8e5e0] pt-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-[#1a1a1a]">
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
        <section className="mt-20 -mx-4 sm:-mx-6 lg:-mx-8 bg-white border-t border-[#e8e5e0] px-4 sm:px-6 lg:px-8 py-14">
          <div className="mx-auto max-w-[1100px]">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-[.3em] text-[#888] mb-1">Ajánlott</p>
                <h2 className="font-[family:var(--font-display)] text-2xl text-[#1a1a1a]">
                  Ez is érdekelheti Önt
                </h2>
              </div>
              <a href="/new-in" className="text-sm text-[#888] hover:text-[#1a1a1a] transition">
                Összes termék →
              </a>
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
