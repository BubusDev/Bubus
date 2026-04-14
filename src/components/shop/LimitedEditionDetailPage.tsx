import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { addFavouriteAction } from "@/app/(storefront)/account/actions";
import { AddToCartTextButton } from "@/components/shop/AddToCartButtons";
import { LimitedEditionTabs } from "@/components/shop/LimitedEditionTabs";
import { formatPrice, isProductOutOfStock } from "@/lib/catalog";
import type { SpecialEditionEntryView } from "@/lib/products";

type Props = {
  entry: SpecialEditionEntryView;
};

export function LimitedEditionDetailPage({ entry }: Props) {
  const { product } = entry;
  const isOutOfStock = isProductOutOfStock(product);
  const redirectTo = `/limitalt-darabok/${product.slug}`;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#faf9f7] lg:grid lg:grid-cols-2">
      <div className="relative h-[40vh] flex-shrink-0 lg:h-auto">
        {entry.promoImageUrl ? (
          <Image
            src={entry.promoImageUrl}
            alt={entry.promoImageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#faf9f7]" />
        )}
      </div>

      <div className="flex flex-col items-center justify-center bg-[#faf9f7] px-8 py-14 lg:overflow-y-auto lg:px-16 lg:py-20">
        <div className="w-full max-w-[480px] text-center">
          <h1 className="font-serif text-2xl font-light tracking-wide text-[#1a1a1a]">
            {product.name}
          </h1>

          {product.collectionLabel ? (
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gray-400">
              {product.collectionLabel}
            </p>
          ) : (
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gray-400">
              Limitált kiadás
            </p>
          )}

          <p className="mt-2 text-lg font-light text-[#1a1a1a]">
            {formatPrice(product.price)}
          </p>

          <form action={addFavouriteAction} className="mt-4 flex justify-center">
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="redirectTo" value="/favourites" />
            <button
              type="submit"
              aria-label="Kedvencekhez adom"
              className="group text-gray-400 transition-colors hover:text-[#1a1a1a]"
            >
              <Heart
                className="h-5 w-5 fill-transparent transition-colors group-hover:fill-[#1a1a1a]"
                strokeWidth={1.5}
              />
            </button>
          </form>

          {entry.productImageUrl ? (
            <div className="relative mx-auto mt-8 aspect-square w-full max-w-[320px]">
              <Image
                src={entry.productImageUrl}
                alt={entry.productImageAlt}
                fill
                sizes="320px"
                className="object-contain"
              />
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-center gap-6">
            <Link
              href={`/product/${product.slug}`}
              className="text-xs uppercase tracking-widest text-gray-400 transition hover:underline"
            >
              VIEW 360°
            </Link>
            <Link
              href={`/product/${product.slug}`}
              className="text-xs uppercase tracking-widest text-gray-400 transition hover:underline"
            >
              COLOR OPTIONS (6)
            </Link>
          </div>

          <div className="mt-8 w-full">
            <AddToCartTextButton
              productId={product.id}
              redirectTo={redirectTo}
              disabled={isOutOfStock}
              idleLabel="ADD TO CART"
              addedLabel="ADDED TO CART"
              soldOutLabel="SOLD OUT"
              iconClassName="hidden"
              baseClassName="inline-flex h-14 w-full items-center justify-center gap-2 rounded-none text-xs uppercase tracking-widest transition"
              disabledClassName="cursor-not-allowed bg-gray-100 text-gray-400"
              addedClassName="bg-black text-white"
              idleClassName="bg-black text-white hover:bg-[#222]"
            />
          </div>

          <LimitedEditionTabs product={product} />
        </div>
      </div>
    </div>
  );
}
