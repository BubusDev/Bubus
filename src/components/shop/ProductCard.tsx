"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";

import {
  addFavouriteAction,
  addToCartAction,
  removeFavouriteAction,
} from "@/app/account/actions";
import { formatPrice, type Product } from "@/lib/catalog";

type ProductCardProps = {
  product: Product;
  isFavourite?: boolean;
  redirectTo?: string;
};

export function ProductCard({
  product,
  isFavourite = false,
  redirectTo = "/",
}: ProductCardProps) {
  const [from, via, to] = product.imagePalette;
  const coverImage = product.imageUrl;
  const productHref = `/product/${product.slug}`;
  const favouriteAction = isFavourite ? removeFavouriteAction : addFavouriteAction;

  return (
    <article className="group flex h-full flex-col bg-transparent">
      <Link
        href={productHref}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d45c9c] focus-visible:ring-offset-2"
      >
        <div
          className="relative aspect-[4/5] overflow-hidden bg-[#f4f1ef]"
          style={
            coverImage
              ? undefined
              : {
                  background: `linear-gradient(160deg, ${from}, ${via} 55%, ${to})`,
                }
          }
        >
          {coverImage ? (
            <img
              src={coverImage}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-32 w-32 sm:h-36 sm:w-36">
                <div className="absolute inset-0 rounded-full border-[10px] border-[#f2dfbc]/90" />
                <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/85" />
                <div className="absolute left-1/2 top-[30%] h-4 w-4 -translate-x-1/2 rotate-45 rounded-[0.3rem] bg-white/85" />
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 px-1 pb-1 pt-2">
        <Link
          href={productHref}
          className="line-clamp-2 min-h-[2.8rem] text-[1rem] leading-[1.2] tracking-[-0.02em] text-[#2f2230] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d45c9c] focus-visible:ring-offset-2"
        >
          {product.name}
        </Link>

        <p className="text-[0.95rem] font-medium leading-none text-[#2f2230]">
          {formatPrice(product.price)}
        </p>

        <div className="relative z-10 mt-auto flex items-center justify-between pt-2">
          <form action={addToCartAction}>
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="quantity" value="1" />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button
              type="submit"
              aria-label={`Kosárba: ${product.name}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-[#2f2230] transition hover:bg-[#f8eef4] hover:text-[#d45c9c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d45c9c] focus-visible:ring-offset-2"
            >
              <ShoppingBag className="h-5 w-5" />
            </button>
          </form>

          <form action={favouriteAction}>
            <input type="hidden" name="productId" value={product.id} />
            {!isFavourite ? (
              <input type="hidden" name="redirectTo" value={redirectTo} />
            ) : null}
            <button
              type="submit"
              aria-label={
                isFavourite
                  ? `Eltávolítás a kedvencekből: ${product.name}`
                  : `Kedvencekhez adás: ${product.name}`
              }
              aria-pressed={isFavourite}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-[#2f2230] transition hover:bg-[#f8eef4] hover:text-[#d45c9c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d45c9c] focus-visible:ring-offset-2"
            >
              <Heart
                className={`h-5 w-5 ${isFavourite ? "fill-current text-[#d45c9c]" : ""}`}
              />
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
