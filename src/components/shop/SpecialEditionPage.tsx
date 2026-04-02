import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { addToCartAction } from "@/app/account/actions";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import {
  formatPrice,
  type CategoryDefinition,
} from "@/lib/catalog";
import type { SpecialEditionEntryView } from "@/lib/products";

type SpecialEditionPageProps = {
  category: CategoryDefinition;
  bannerImageUrl?: string;
  bannerImageAlt?: string;
  entries: SpecialEditionEntryView[];
  redirectTo?: string;
};

function PromoPanel({
  entry,
  category,
}: {
  entry: SpecialEditionEntryView;
  category: CategoryDefinition;
}) {
  const coverImage = entry.promoImageUrl;
  const [from, via, to] = entry.product.imagePalette;

  return (
    <div
      className="relative min-h-[420px] overflow-hidden bg-[#f2d8e3] lg:min-h-[760px]"
      style={
        coverImage
          ? undefined
          : {
              background: `linear-gradient(155deg, ${from}, ${via} 58%, ${to})`,
            }
      }
    >
      {coverImage ? (
        <img
          src={coverImage}
          alt={entry.promoImageAlt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(94,0,52,0.03),rgba(94,0,52,0.16))]" />

      <div className="absolute left-0 top-0 p-8 sm:p-10 lg:p-12">
        <div className="max-w-[22rem]">
          <p className="text-[10px] uppercase tracking-[0.38em] text-white/85">
            Limited Campaign Spotlight
          </p>
          <h2 className="mt-5 font-[family:var(--font-display)] text-[2.5rem] leading-[0.9] tracking-[-0.05em] text-white sm:text-[3.4rem]">
            {category.title}
          </h2>
          <p className="mt-5 max-w-[24ch] text-sm leading-7 text-white/80">
            A refined edit of standout pieces presented in a campaign-style
            collection with elevated gifting appeal.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProductEditorialCard({
  entry,
  redirectTo,
}: {
  entry: SpecialEditionEntryView;
  redirectTo: string;
}) {
  const { product } = entry;
  const productHref = `/product/${product.slug}`;
  const coverImage = entry.productImageUrl;
  const [from, via, to] = product.imagePalette;

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-10 text-center sm:px-12 lg:px-16">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#8f6b7d]">
        {product.name}
      </p>

      <p className="mt-2 max-w-[26ch] text-[11px] leading-5 text-[#8a7481]">
        {product.shortDescription}
      </p>

      <Link
        href={productHref}
        className="mt-8 block w-full max-w-[320px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5E0034] focus-visible:ring-offset-2"
      >
        <div
          className="aspect-[4/4.7] w-full overflow-hidden bg-[#f6f2f4]"
          style={
            coverImage
              ? undefined
              : {
                  background: `linear-gradient(155deg, ${from}, ${via} 55%, ${to})`,
                }
          }
        >
          {coverImage ? (
            <img
              src={coverImage}
              alt={entry.productImageAlt}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
      </Link>

      <p className="mt-7 text-[1rem] font-medium tracking-[0.02em] text-[#2f2230]">
        {formatPrice(product.price)}
      </p>

      <form action={addToCartAction} className="mt-7 w-full max-w-[320px]">
        <input type="hidden" name="productId" value={product.id} />
        <input type="hidden" name="quantity" value="1" />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center gap-2 bg-[#121313] px-6 text-[11px] font-medium uppercase tracking-[0.16em] text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5E0034] focus-visible:ring-offset-2"
        >
          <ShoppingBag className="h-4 w-4" />
          Vásárlás
        </button>
      </form>

      <Link
        href={productHref}
        className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[#7b6170] transition hover:text-[#5E0034]"
      >
        Részletek
      </Link>
    </div>
  );
}

export async function SpecialEditionPage({
  category,
  bannerImageUrl,
  bannerImageAlt,
  entries,
  redirectTo = "/special-edition",
}: SpecialEditionPageProps) {
  return (
    <main className="mx-auto max-w-[1560px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <Breadcrumbs
        items={[
          { label: "Főoldal", href: "/" },
          { label: category.title },
        ]}
        className="mb-5"
      />

      <section className="mb-6 border-b border-[#eee4ea] pb-4 sm:mb-8">
        <h1 className="font-[family:var(--font-display)] text-[1.8rem] text-[#4d2741] sm:text-[2.2rem]">
          {category.title}
        </h1>
      </section>

      {bannerImageUrl ? (
        <section className="mb-6 bg-white sm:mb-8">
          <div className="aspect-[16/6] w-full overflow-hidden bg-[#f5f1f3]">
            <img
              src={bannerImageUrl}
              alt={bannerImageAlt || "Special Edition banner"}
              className="h-full w-full object-cover"
            />
          </div>
        </section>
      ) : null}

      <section className="bg-[#5E0034] p-3 sm:p-4 lg:p-5">
        <div className="space-y-4 bg-white p-3 sm:p-4 lg:p-5">
          {entries.length > 0 ? (
            entries.map((entry) => (
              <section
                key={entry.id}
                className="grid min-h-[620px] gap-0 bg-white lg:grid-cols-2"
              >
                <PromoPanel entry={entry} category={category} />
                <ProductEditorialCard
                  entry={entry}
                  redirectTo={redirectTo}
                />
              </section>
            ))
          ) : (
            <section className="flex min-h-[480px] items-center justify-center bg-white px-6 py-16 text-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.34em] text-[#b06b8e]">
                  Special Edition
                </p>
                <h2 className="mt-3 font-[family:var(--font-display)] text-[2.2rem] text-[#4a2037]">
                  Jelenleg nincs hozzárendelt termék
                </h2>
                <p className="mx-auto mt-4 max-w-[34ch] text-sm leading-7 text-[#775767]">
                  Adj hozzá Special Edition termékeket, hogy ez az oldal
                  kampányszerű megjelenéssel feltöltődjön.
                </p>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
