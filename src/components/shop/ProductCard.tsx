"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

import { AddToCartIconButton } from "@/components/shop/AddToCartButtons";
import { ProductImageFrame } from "@/components/shop/ProductImageFrame";
import {
  formatPrice,
  isProductOutOfStock,
  type Product,
} from "@/lib/catalog";

type ProductCardProps = {
  product: Product;
  isFavourite?: boolean;
  isFavouritePending?: boolean;
  onFavouriteToggle?: (productId: string, isFavourite: boolean) => Promise<void> | void;
  redirectTo?: string;
};

export function ProductCard({
  product,
  isFavourite = false,
  isFavouritePending = false,
  onFavouriteToggle,
  redirectTo = "/",
}: ProductCardProps) {
  const [isWishlistPending, startWishlistTransition] = useTransition();
  const [from, via, to] = product.imagePalette;
  const coverImage = product.imageUrl;
  const productHref = `/product/${product.slug}`;
  const isOutOfStock = isProductOutOfStock(product);
  const isHeartPending = isFavouritePending || isWishlistPending;

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
        {isOutOfStock ? (
          <p className="pt-1 text-[11px] uppercase tracking-[0.18em] text-[#8d6c81]">
            Elfogyott
          </p>
        ) : null}

        <div className="relative z-10 mt-auto flex items-center justify-between pt-2">
          <AddToCartIconButton
            productId={product.id}
            quantity={1}
            redirectTo={redirectTo}
            disabled={isOutOfStock}
            ariaLabel={`Kosárba: ${product.name}`}
            soldOutAriaLabel={`${product.name} elfogyott`}
            iconClassName="h-[1.1rem] w-[1.1rem]"
            baseClassName="inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-transparent transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d45c9c] focus-visible:ring-offset-2"
            disabledClassName="cursor-not-allowed border-[#f0e6eb] bg-[#fbf7f9] text-[#b197a7]"
            addedClassName="border-[#ead9e1] bg-[#fff8fb] text-[#7d4a69]"
            idleClassName="text-[#2f2230] hover:border-[#ead9e1] hover:bg-[#fff8fb] hover:text-[#d45c9c]"
          />

          <form
            action={() => {
              startWishlistTransition(async () => {
                await onFavouriteToggle?.(product.id, isFavourite);
              });
            }}
          >
            <button
              type="submit"
              aria-label={
                isFavourite
                  ? `Eltávolítás a kedvencekből: ${product.name}`
                  : `Kedvencekhez adás: ${product.name}`
              }
              aria-pressed={isFavourite}
              disabled={isHeartPending}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-transparent transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d45c9c] focus-visible:ring-offset-2 ${
                isFavourite
                  ? "border-[#ead9e1] bg-[#fff8fb] text-[#d45c9c]"
                  : "text-[#2f2230] hover:border-[#ead9e1] hover:bg-[#fff8fb] hover:text-[#d45c9c]"
              } ${isHeartPending ? "opacity-75" : ""}`}
            >
              <Heart
                className={`h-5 w-5 transition duration-200 ${
                  isFavourite ? "fill-current text-[#d45c9c]" : ""
                }`}
              />
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
