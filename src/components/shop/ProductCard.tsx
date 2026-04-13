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
  showAddToCart?: boolean;
  wishlistPlacement?: "inline" | "image";
};

export function ProductCard({
  product,
  isFavourite = false,
  isFavouritePending = false,
  onFavouriteToggle,
  redirectTo = "/",
  showAddToCart = true,
  wishlistPlacement = "inline",
}: ProductCardProps) {
  const [isWishlistPending, startWishlistTransition] = useTransition();
  const coverImage = product.imageUrl;
  const secondaryImage = product.images.find((image) => image.url !== coverImage);
  const secondaryImageUrl = secondaryImage?.url ?? null;
  const productHref = `/product/${product.slug}`;
  const isOutOfStock = isProductOutOfStock(product);
  const isHeartPending = isFavouritePending || isWishlistPending;
  const imageStateClass = isOutOfStock
    ? "saturate-[0.6] brightness-[0.9]"
    : "";
  const imageHoverClass = !isOutOfStock
    ? "group-hover:scale-[1.04] group-focus-within:scale-[1.04]"
    : "";
  const wishlistButton = (
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
        className={`inline-flex items-center justify-center transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] ${
          wishlistPlacement === "image"
            ? "h-9 w-9 rounded-md border border-white/70 bg-white/92 text-[#2d2829] shadow-[0_10px_24px_rgba(20,20,20,0.08)] hover:bg-white"
            : "h-5 w-5"
        } ${
          isFavourite
            ? "text-[#c45a85]"
            : wishlistPlacement === "image"
              ? "hover:text-[#6f7f5c]"
              : "text-[#888] hover:text-[#1a1a1a] sm:group-hover:text-[#555]"
        } ${isHeartPending ? "opacity-60" : ""}`}
      >
        <Heart
          className={`transition-all duration-200 ${
            wishlistPlacement === "image" ? "h-4 w-4" : "h-4 w-4"
          } ${isFavourite ? "fill-current" : ""}`}
        />
      </button>
    </form>
  );

  return (
    <article className="group flex flex-col">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f3f0]">
        <Link
          href={productHref}
          className="absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
        >
          {coverImage ? (
            <>
              <Image
                src={coverImage}
                alt={product.name}
                fill
                className={`object-cover transition-[opacity,transform,filter] duration-500 ease-out ${
                  secondaryImageUrl
                    ? "delay-100 group-hover:opacity-0 group-focus-within:opacity-0"
                    : imageHoverClass
                } ${imageStateClass}`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {secondaryImageUrl ? (
                <Image
                  src={secondaryImageUrl}
                  alt={secondaryImage?.alt ?? product.name}
                  fill
                  className={`object-cover opacity-0 transition-[opacity,transform,filter] delay-100 duration-500 ease-out group-hover:scale-[1.03] group-hover:opacity-100 group-focus-within:scale-[1.03] group-focus-within:opacity-100 ${imageStateClass}`}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : null}
            </>
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
        {wishlistPlacement === "image" ? (
          <div className="absolute right-3 top-3 z-10">{wishlistButton}</div>
        ) : null}
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
        <div className="mt-2 flex min-h-5 items-center justify-between opacity-100 transition-[opacity,transform] duration-300 ease-out sm:opacity-75 sm:group-hover:-translate-y-px sm:group-hover:opacity-100 sm:group-focus-within:-translate-y-px sm:group-focus-within:opacity-100">
          {wishlistPlacement === "inline" ? wishlistButton : <span aria-hidden="true" />}

          {showAddToCart ? (
            <AddToCartIconButton
              productId={product.id}
              quantity={1}
              redirectTo={redirectTo}
              disabled={isOutOfStock}
              ariaLabel={`Kosárba: ${product.name}`}
              soldOutAriaLabel={`${product.name} elfogyott`}
              iconClassName="h-4 w-4"
              baseClassName="inline-flex h-5 w-5 items-center justify-center transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85]"
              disabledClassName="cursor-not-allowed text-[#ccc]"
              addedClassName="text-[#c45a85]"
              idleClassName="text-[#888] hover:text-[#1a1a1a] sm:group-hover:text-[#555]"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
