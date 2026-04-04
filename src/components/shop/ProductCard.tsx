"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import {
  addFavouriteAction,
  removeFavouriteAction,
} from "@/app/account/actions";
import { AddToCartForm, AddToCartIcon } from "@/components/shop/AddToCartForm";
import { ProductImageFrame } from "@/components/shop/ProductImageFrame";
import {
  formatPrice,
  getProductAvailabilityLabel,
  isProductOutOfStock,
  type Product,
} from "@/lib/catalog";

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
  const isOutOfStock = isProductOutOfStock(product);

  return (
    <article className="group flex h-full flex-col bg-transparent">
      <Link
        href={productHref}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d45c9c] focus-visible:ring-offset-2"
      >
        <ProductImageFrame
          alt={product.name}
          imageUrl={coverImage}
          soldOut={isOutOfStock}
          palette={[from, via, to]}
          className="relative aspect-[4/5] overflow-hidden bg-[#f4f1ef]"
          imageClassName={`h-full w-full object-cover transition duration-500 ${
            isOutOfStock ? "" : "group-hover:scale-[1.02]"
          }`}
          fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-32 w-32 sm:h-36 sm:w-36">
                <div className="absolute inset-0 rounded-full border-[10px] border-[#f2dfbc]/90" />
                <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/85" />
                <div className="absolute left-1/2 top-[30%] h-4 w-4 -translate-x-1/2 rotate-45 rounded-[0.3rem] bg-white/85" />
              </div>
            </div>
          }
        />
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
        <p className="pt-1 text-[11px] uppercase tracking-[0.18em] text-[#8d6c81]">
          {getProductAvailabilityLabel(product)}
        </p>

        <div className="relative z-10 mt-auto flex items-center justify-between pt-2">
          <AddToCartForm
            productId={product.id}
            quantity={1}
            redirectTo={redirectTo}
            disabled={isOutOfStock}
          >
            {({ isPending, justAdded }) => (
              <button
                type="submit"
                aria-label={isOutOfStock ? `${product.name} elfogyott` : `Kosárba: ${product.name}`}
                disabled={isOutOfStock}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d45c9c] focus-visible:ring-offset-2 ${
                  isOutOfStock
                    ? "cursor-not-allowed bg-[#f5edf1] text-[#b197a7]"
                    : justAdded
                      ? "bg-[#2f2230] text-white"
                      : "text-[#2f2230] hover:bg-[#f8eef4] hover:text-[#d45c9c]"
                } ${isPending ? "scale-[0.96]" : ""}`}
              >
                <AddToCartIcon justAdded={justAdded} className="h-5 w-5" />
              </button>
            )}
          </AddToCartForm>

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
