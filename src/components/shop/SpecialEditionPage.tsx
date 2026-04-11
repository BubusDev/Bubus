import Image from "next/image";
import Link from "next/link";

import { AddToCartTextButton } from "@/components/shop/AddToCartButtons";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ProductImageFrame } from "@/components/shop/ProductImageFrame";
import {
  formatPrice,
  isProductOutOfStock,
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
      className="relative min-h-[360px] overflow-hidden bg-[#f2d8e3] lg:min-h-[520px]"
      style={
        coverImage
          ? undefined
          : {
              background: `linear-gradient(155deg, ${from}, ${via} 58%, ${to})`,
            }
      }
    >
      {coverImage ? (
        <Image
          src={coverImage}
          alt={entry.promoImageAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="absolute inset-0 object-cover"
        />
      ) : null}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.06),rgba(17,17,17,0.22))]" />

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
        <div className="max-w-[28rem]">
          <p className="text-[10px] uppercase tracking-[0.34em] text-white/78">
            Special Edition
          </p>
          <h2 className="mt-3 font-[family:var(--font-display)] text-[2rem] leading-[0.95] tracking-[-0.04em] text-white sm:text-[2.7rem]">
            {entry.product.name}
          </h2>
          <p className="mt-4 max-w-[28ch] text-sm leading-7 text-white/82">
            {category.seoDescription}
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
  const isOutOfStock = isProductOutOfStock(product);

  return (
    <div className="flex h-full flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#8f7b85]">
        {product.collectionLabel}
      </p>

      <h3 className="mt-3 font-[family:var(--font-display)] text-[2rem] leading-none tracking-[-0.03em] text-[#1a1a1a] sm:text-[2.3rem]">
        {product.name}
      </h3>

      <p className="mt-4 max-w-[34ch] text-sm leading-7 text-[#666]">
        {product.shortDescription}
      </p>

      <Link
        href={productHref}
        className="mt-8 block w-full max-w-[340px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
      >
        <ProductImageFrame
          alt={entry.productImageAlt}
          imageUrl={coverImage}
          soldOut={isOutOfStock}
          palette={[from, via, to]}
          className="relative aspect-[4/4.9] w-full overflow-hidden bg-[#f5f3f0]"
        />
      </Link>

      <p className="mt-6 text-[1rem] font-medium tracking-[0.02em] text-[#1a1a1a]">
        {formatPrice(product.price)}
      </p>

      {isOutOfStock ? (
        <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-[#888]">
          Elfogyott
        </p>
      ) : null}

      <AddToCartTextButton
        productId={product.id}
        quantity={1}
        redirectTo={redirectTo}
        disabled={isOutOfStock}
        idleLabel="Vásárlás"
        addedLabel="Kosárban"
        soldOutLabel="Elfogyott"
        iconClassName="h-4 w-4"
        baseClassName="mt-7 inline-flex h-11 w-full max-w-[340px] items-center justify-center gap-2 border border-[#1a1a1a] px-6 text-[11px] font-medium uppercase tracking-[0.16em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
        disabledClassName="cursor-not-allowed border-[#ddd7d1] bg-[#efebe6] text-[#8a8480]"
        addedClassName="border-[#c45a85] bg-[#c45a85] text-white"
        idleClassName="bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]"
      />

      <Link
        href={productHref}
        className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[#888] transition hover:text-[#1a1a1a]"
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
    <main className="mx-auto max-w-[1450px] pb-24">
      <header className="border-b border-[#e8e5e0] px-6 py-8 sm:px-8 sm:py-12">
        <Breadcrumbs
          items={[
            { label: "Főoldal", href: "/" },
            { label: category.title },
          ]}
          className="mb-5"
        />
        <h1 className="font-[family:var(--font-display)] text-[2.8rem] leading-none tracking-[-0.03em] text-[#1a1a1a] sm:text-[3.2rem]">
          {category.title}
        </h1>
      </header>

      <div className="px-6 pt-6 sm:px-8">
        {bannerImageUrl ? (
          <section className="mb-8">
            <div className="relative aspect-[16/6] overflow-hidden bg-[#f5f3f0]">
              <Image
                src={bannerImageUrl}
                alt={bannerImageAlt || "Special Edition banner"}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </section>
        ) : null}

        <section className="space-y-8">
          {entries.length > 0 ? (
            entries.map((entry, index) => (
              <section
                key={entry.id}
                className="overflow-hidden border border-[#e8e5e0] bg-white xl:grid xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]"
              >
                <div className={index % 2 === 1 ? "xl:order-2" : undefined}>
                  <PromoPanel entry={entry} category={category} />
                </div>
                <ProductEditorialCard
                  entry={entry}
                  redirectTo={redirectTo}
                />
              </section>
            ))
          ) : (
            <section className="flex min-h-[420px] items-center justify-center border border-[#e8e5e0] bg-white px-6 py-16 text-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.3em] text-[#888]">
                  Special Edition
                </p>
                <h2 className="mt-3 font-[family:var(--font-display)] text-[2rem] text-[#1a1a1a]">
                  Jelenleg nincs hozzárendelt termék
                </h2>
                <p className="mx-auto mt-3 max-w-[38ch] text-sm leading-7 text-[#666]">
                  Adj hozzá Special Edition termékeket, hogy ez az oldal
                  kampányszerű megjelenéssel feltöltődjön.
                </p>
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
