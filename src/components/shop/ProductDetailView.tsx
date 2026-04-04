import { Heart, ShieldCheck, ShoppingBag, Truck } from "lucide-react";

import { addFavouriteAction } from "@/app/account/actions";
import { AddToCartForm } from "@/components/shop/AddToCartForm";
import { ProductBackLink } from "@/components/shop/ProductBackLink";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { formatPrice, type Product } from "@/lib/catalog";

type ProductDetailViewProps = {
  product: Product;
  categoryTitle: string;
  relatedProducts: Product[];
};

function getDisplayValue(value?: string | null, fallback = "Nincs megadva") {
  const normalizedValue = typeof value === "string" ? value.trim() : "";
  return normalizedValue || fallback;
}

function DetailMetaItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-[#efe7eb] py-2 last:border-b-0">
      <p className="text-[9px] uppercase tracking-[0.22em] text-[#ad8098]">
        {label}
      </p>
      <p className="mt-1 text-[13px] text-[#5f4754]">{value}</p>
    </div>
  );
}

export function ProductDetailView({
  product,
  categoryTitle,
  relatedProducts,
}: ProductDetailViewProps) {
  const [from, via, to] = product.imagePalette;
  const galleryImages = product.images.length > 0 ? product.images : [];
  const coverImage =
    galleryImages.find((image) => image.isCover) ?? galleryImages[0];
  const shortDescription = product.shortDescription.trim();
  const description = product.description.trim();
  const introText =
    shortDescription ||
    description ||
    "A termék részletes leírása hamarosan elérhető lesz.";
  const detailText =
    description && description !== introText ? description : null;
  const detailItems = [
    { label: "Kategória", value: categoryTitle || product.labels.category },
    { label: "Kőtípus", value: product.labels.stoneType },
    { label: "Szín", value: product.labels.color },
    { label: "Stílus", value: product.labels.style },
    { label: "Alkalom", value: product.labels.occasion },
    { label: "Elérhetőség", value: product.labels.availability },
    { label: "Hangulat", value: product.labels.tone },
  ];

  return (
    <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <Breadcrumbs
        items={[
          { label: "Főoldal", href: "/" },
          { label: categoryTitle, href: `/${product.category}` },
          { label: product.name },
        ]}
        className="mb-6"
      />

      <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.82fr)] xl:gap-10">
        <div className="space-y-4">
          <div
            className="relative aspect-[4/5] overflow-hidden bg-[#f4f1ef]"
            style={
              coverImage
                ? undefined
                : {
                    background: `linear-gradient(160deg, ${from}, ${via} 58%, ${to})`,
                  }
            }
          >
            {coverImage ? (
              <img
                src={coverImage.url}
                alt={coverImage.alt ?? product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="relative h-44 w-44">
                  <div className="absolute inset-0 rounded-full border-[12px] border-[#f7e4bf]/90 shadow-[0_14px_30px_rgba(118,76,37,0.16)]" />
                  <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/92 shadow-[0_12px_28px_rgba(255,255,255,0.8)]" />
                  <div className="absolute left-1/2 top-[31%] h-6 w-6 -translate-x-1/2 rotate-45 rounded-[0.45rem] bg-white/95 shadow-[0_0_28px_rgba(255,255,255,0.8)]" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {(galleryImages.length > 0
              ? galleryImages.slice(0, 3)
              : ["Front glow", "Detail crop", "Styling angle"]
            ).map((item, index) => (
              <div
                key={typeof item === "string" ? item : item.id}
                className="space-y-1.5"
              >
                {typeof item === "string" ? (
                  <div
                    className="aspect-[4/4.7] overflow-hidden bg-[#f3eef1]"
                    style={{
                      background: `linear-gradient(155deg, ${from}, ${
                        index === 1 ? to : via
                      })`,
                    }}
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.alt ?? product.name}
                    className="aspect-[4/4.7] w-full object-cover"
                  />
                )}
                <p className="text-[10px] leading-4 text-[#7a6070]">
                  {typeof item === "string"
                    ? item
                    : item.alt ?? `Galéria ${index + 1}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-start">
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#fbf1f7] px-2.5 py-1 text-[9px] uppercase tracking-[0.22em] text-[#a45b82]">
                  {product.badge}
                </span>
                <span className="inline-flex items-center rounded-full border border-[#eee3e9] bg-white px-2.5 py-1 text-[9px] uppercase tracking-[0.22em] text-[#8d6c81]">
                  {product.collectionLabel}
                </span>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.26em] text-[#b06b8e]">
                  {categoryTitle}
                </p>
                <h1 className="mt-2 max-w-[12ch] font-[family:var(--font-display)] text-[2rem] leading-[0.94] tracking-[-0.04em] text-[#2f2230] sm:text-[2.25rem]">
                  {product.name}
                </h1>
              </div>

              <div className="flex items-end justify-between gap-3 border-b border-[#efe7eb] pb-4">
                <div>
                  <p className="text-[1.2rem] font-medium leading-none text-[#2f2230]">
                    {formatPrice(product.price)}
                  </p>
                  {product.compareAtPrice ? (
                    <p className="mt-1.5 text-[12px] text-[#bb95ac] line-through">
                      {formatPrice(product.compareAtPrice)}
                    </p>
                  ) : null}
                </div>

                <p className="text-[13px] text-[#7d6272]">
                  {getDisplayValue(product.labels.availability)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="max-w-[58ch] text-[13px] leading-6 text-[#745b6b]">
                {introText}
              </p>
              {detailText ? (
                <p className="max-w-[58ch] text-[13px] leading-6 text-[#745b6b]">
                  {detailText}
                </p>
              ) : null}
            </div>

            <div className="grid gap-1.5">
              {detailItems.map((item) => (
                <DetailMetaItem
                  key={item.label}
                  label={item.label}
                  value={getDisplayValue(item.value)}
                />
              ))}
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <AddToCartForm productId={product.id} redirectTo={`/product/${product.slug}`}>
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 bg-[#2f2230] px-5 text-[13px] font-medium text-white transition hover:opacity-90"
                >
                  <ShoppingBag className="h-4 w-4 translate-y-[1px]" />
                  Kosárba rakom
                </button>
              </AddToCartForm>

              <form action={addFavouriteAction}>
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="redirectTo" value="/favourites" />
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 border border-[#e7dde3] bg-white px-5 text-[13px] font-medium text-[#4d2741] transition hover:border-[#dcb8cc]"
                >
                  <Heart className="h-4 w-4" />
                  Kedvencekhez adom
                </button>
              </form>
            </div>

            <div className="grid gap-3 pt-1 sm:grid-cols-2">
              <div className="border border-[#efe7eb] bg-[#fcfafb] p-3">
                <div className="flex items-center gap-2 text-[#6b425a]">
                  <Truck className="h-3.5 w-3.5" />
                  <span className="text-[13px] font-medium">
                    Gyors és megbízható szállítás
                  </span>
                </div>
              </div>

              <div className="border border-[#efe7eb] bg-[#fcfafb] p-3">
                <div className="flex items-center gap-2 text-[#6b425a]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="text-[13px] font-medium">
                    Ellenőrzött, minőségi alapanyagok
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <ProductBackLink fallbackHref={`/${product.category}`} />
            </div>
          </div>
        </div>
      </section>

      <RelatedProducts
        products={relatedProducts}
        redirectTo={`/product/${product.slug}`}
      />
    </main>
  );
}
