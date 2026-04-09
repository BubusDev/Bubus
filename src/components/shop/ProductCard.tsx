"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import Image from "next/image";

import { AddToCartIconButton } from "@/components/shop/AddToCartButtons";
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
  const coverImage = product.imageUrl;
  const productHref = `/product/${product.slug}`;
  const isOutOfStock = isProductOutOfStock(product);
  const isHeartPending = isFavouritePending || isWishlistPending;

  return (
    <article className="group flex flex-col">
      {/* Image + hover overlay */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f3f0]">
        <Link
          href={productHref}
          className="absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
        >
          {coverImage ? (
            <Image
              src={coverImage}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-500 ${
                isOutOfStock
                  ? "saturate-[0.6] brightness-[0.9]"
                  : "group-hover:scale-[1.03]"
              }`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(155deg, ${product.imagePalette[0]}, ${product.imagePalette[2]})`,
              }}
            />
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-end p-3">
              <span className="bg-white/90 px-2.5 py-1 text-[10px] uppercase tracking-[.18em] text-[#555]">
                Elfogyott
              </span>
            </div>
          )}
        </Link>

      </div>

      {/* Info */}
      <div className="mt-3 flex-1">
        <p className="mb-1 text-[10px] uppercase tracking-[.22em] text-[#888]">
          {product.collectionLabel}
        </p>
        <Link
          href={productHref}
          className="block text-sm font-medium leading-snug text-[#1a1a1a] transition hover:text-[#555] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85]"
        >
          {product.name}
        </Link>
        <p className="mt-1 text-sm text-[#444]">{formatPrice(product.price)}</p>
      </div>

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        <AddToCartIconButton
          productId={product.id}
          quantity={1}
          redirectTo={redirectTo}
          disabled={isOutOfStock}
          ariaLabel={`Kosárba: ${product.name}`}
          soldOutAriaLabel={`${product.name} elfogyott`}
          iconClassName="h-4 w-4"
          baseClassName="flex h-9 w-9 items-center justify-center border border-[#e8e5e0] transition hover:border-[#1a1a1a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85]"
          disabledClassName="cursor-not-allowed text-[#ccc]"
          addedClassName="text-[#c45a85]"
          idleClassName="text-[#888] hover:text-[#1a1a1a]"
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
            className={`flex h-9 w-9 items-center justify-center border border-[#e8e5e0] transition hover:border-[#c45a85] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] ${
              isFavourite ? "text-[#c45a85]" : "text-[#888]"
            } ${isHeartPending ? "opacity-60" : ""}`}
          >
            <Heart
              className={`h-4 w-4 transition-all duration-200 ${
                isFavourite ? "fill-current" : ""
              }`}
            />
          </button>
        </form>
      </div>
    </article>
  );
}
