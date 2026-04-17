"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import Image from "next/image";

import { AddToCartIconButton } from "@/components/shop/AddToCartButtons";
import {
  formatPrice,
  isProductOutOfStock,
  type Product,
} from "@/lib/catalog";
import { getBrowserDisplayImageUrl } from "@/lib/image-safety";

type ProductCardProps = {
  product: Product;
  isFavourite?: boolean;
  isFavouritePending?: boolean;
  onFavouriteToggle?: (productId: string, isFavourite: boolean) => Promise<void> | void;
  redirectTo?: string;
  showAddToCart?: boolean;
  wishlistPlacement?: "inline" | "image";
};

function getProductCardDifferentiator(product: Product) {
  const stoneLabel = product.labels.stoneType?.trim();

  if (stoneLabel && stoneLabel.toLowerCase() !== "nincs megadva") {
    return stoneLabel;
  }

  if (product.category === "special-edition" || product.specialtyKey) {
    return "Limitált";
  }

  if (product.isNew) {
    return "Új";
  }

  if (product.isGiftable) {
    return "Ajándéknak";
  }

  return null;
}

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
  const [brokenImageUrls, setBrokenImageUrls] = useState<Set<string>>(new Set());
  const safeImages = useMemo(
    () =>
      product.images
        .map((image) => ({ ...image, displayUrl: getBrowserDisplayImageUrl(image.url) }))
        .filter(
          (image): image is typeof image & { displayUrl: string } => {
            const displayUrl = image.displayUrl;
            return displayUrl !== null && !brokenImageUrls.has(displayUrl);
          },
        ),
    [brokenImageUrls, product.images],
  );
  const productImageUrl = getBrowserDisplayImageUrl(product.imageUrl);
  const coverImage =
    productImageUrl && !brokenImageUrls.has(productImageUrl)
      ? productImageUrl
      : safeImages[0]?.displayUrl ?? null;
  const secondaryImage = safeImages.find((image) => image.displayUrl !== coverImage);
  const secondaryImageUrl = secondaryImage?.displayUrl ?? null;
  const productHref = `/product/${product.slug}`;
  const isOutOfStock = isProductOutOfStock(product);
  const isHeartPending = isFavouritePending || isWishlistPending;
  const differentiator = getProductCardDifferentiator(product);
  const imageStateClass = isOutOfStock
    ? "saturate-[0.78] brightness-[0.96]"
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
            ? "h-8 w-8 rounded-md border border-white/70 bg-white/90 text-[#2d2829] shadow-[0_8px_18px_rgba(20,20,20,0.06)] hover:bg-white"
            : "h-10 w-10 -m-2 rounded-full"
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
            wishlistPlacement === "image" ? "h-3.5 w-3.5" : "h-3.5 w-3.5"
          } ${isFavourite ? "fill-current" : ""}`}
        />
      </button>
    </form>
  );
  const imageFallback = (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: `linear-gradient(155deg, ${product.imagePalette[0]}, ${product.imagePalette[2]})`,
      }}
    >
      <span className="px-4 text-center font-[family:var(--font-display)] text-lg leading-tight text-[#5e5358]/70">
        {product.name}
      </span>
    </div>
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
                sizes="(max-width: 640px) 25vw, (max-width: 1024px) 33vw, 25vw"
                onError={() => {
                  setBrokenImageUrls((current) => new Set(current).add(coverImage));
                }}
              />
              {secondaryImageUrl ? (
                <Image
                  src={secondaryImageUrl}
                  alt={secondaryImage?.alt ?? product.name}
                  fill
                  className={`object-cover opacity-0 transition-[opacity,transform,filter] delay-100 duration-500 ease-out group-hover:scale-[1.03] group-hover:opacity-100 group-focus-within:scale-[1.03] group-focus-within:opacity-100 ${imageStateClass}`}
                  sizes="(max-width: 640px) 25vw, (max-width: 1024px) 33vw, 25vw"
                  onError={() => {
                    setBrokenImageUrls((current) => new Set(current).add(secondaryImageUrl));
                  }}
                />
              ) : null}
            </>
          ) : (
            imageFallback
          )}
          {isOutOfStock && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-start bg-gradient-to-t from-white/55 via-white/18 to-transparent p-2.5 sm:p-3">
              <span className="rounded-md border border-white/70 bg-white/72 px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] text-[#6f666b] shadow-[0_8px_18px_rgba(82,73,79,0.08)] backdrop-blur-sm">
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
      <div className="mt-1 flex-1 sm:mt-2.5">
        <p className="mb-0.5 text-[7px] uppercase tracking-[.15em] text-[#888] sm:mb-1 sm:text-[10px] sm:tracking-[.22em]">
          {product.collectionLabel}
        </p>
        <Link
          href={productHref}
          className="block text-[10px] font-medium leading-snug text-[#1a1a1a] transition hover:text-[#555] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] sm:text-[13px] sm:text-sm"
        >
          {product.name}
        </Link>
        {differentiator ? (
          <p className="mt-0.5 text-[9px] leading-snug text-[#7f7379] sm:mt-1 sm:text-[11px]">
            {differentiator}
          </p>
        ) : null}
        <p className="mt-0.5 text-[10px] font-semibold text-[#1a1a1a] sm:mt-1 sm:text-[13px] sm:text-sm">{formatPrice(product.price)}</p>
        <div className="hidden sm:flex mt-1.5 min-h-9 items-center justify-between opacity-100 transition-[opacity,transform] duration-300 ease-out sm:min-h-10 sm:opacity-75 sm:group-hover:-translate-y-px sm:group-hover:opacity-100 sm:group-focus-within:-translate-y-px sm:group-focus-within:opacity-100">
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
              baseClassName="inline-flex h-10 w-10 -m-2 items-center justify-center rounded-full transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85]"
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
