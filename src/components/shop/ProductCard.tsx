"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

import { AddToCartForm } from "@/components/shop/AddToCartForm";
import {
  isProductOutOfStock,
  type Product,
} from "@/lib/catalog";
import { useCountryLanguage } from "@/components/international/CountryLanguageProvider";
import { getCenteredBackgroundFillStyle } from "@/lib/image-crop";
import { getBrowserDisplayImageUrl } from "@/lib/image-safety";
import {
  formatPriceForCountry,
  getDisplayPriceForCountry,
  getFreeShippingLabel,
} from "@/lib/international";
import { getDictionary, getLocalizedProduct } from "@/lib/i18n";
import { getLocalizedPath } from "@/lib/locale-routing";

// Minimal structural type accepted by both "grid" and "saved" variants.
// Product satisfies this structurally.
// FavouriteProduct maps to this via { id: item.productId, slug, name, ... }
export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  nameEn?: string | null;
  price: number;
  priceEur?: number | null;
  collectionLabel: string;
  collectionLabelEn?: string | null;
  stockQuantity: number;
  reservedQuantity: number;
  imageUrl?: string | null;
  archivedAt?: Date | null;
  // Enriched fields used only by the "grid" variant:
  images?: Product["images"];
  imagePalette?: [string, string, string];
  labels?: { stoneType?: string | null };
  category?: string;
  specialtyKey?: string | null;
  isNew?: boolean;
  isGiftable?: boolean;
};

type ProductCardProps = {
  product: ProductCardData;
  variant?: "grid" | "saved";
  redirectTo?: string;
  initialLiked?: boolean;
  onWishlistToggle?: (id: string, liked: boolean) => Promise<void> | void;
  // "grid" variant — wishlist heart toggle
  isFavourite?: boolean;
  isFavouritePending?: boolean;
  onFavouriteToggle?: (productId: string, isFavourite: boolean) => Promise<void> | void;
  // "grid" variant — display control (backward compat for carousel / cart page)
  showAddToCart?: boolean;
  showWishlistToggle?: boolean;
  wishlistPlacement?: "inline" | "image";
  // "saved" variant — action callbacks
  onAddToCart?: (id?: string) => Promise<void> | void;
  onRemove?: () => Promise<void> | void;
};

type CartState = "idle" | "adding" | "added";

function getProductCardDifferentiator(product: ProductCardData) {
  const stoneLabel = product.labels?.stoneType?.trim();

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
  variant = "grid",
  initialLiked,
  isFavourite = false,
  isFavouritePending = false,
  onWishlistToggle,
  onFavouriteToggle,
  redirectTo = "/",
  showAddToCart = true,
  showWishlistToggle = true,
  wishlistPlacement = "inline",
  onAddToCart,
  onRemove,
}: ProductCardProps) {
  const { country, language } = useCountryLanguage();
  const dictionary = useMemo(() => getDictionary(language), [language]);
  const localizedProduct = useMemo(() => getLocalizedProduct(product, language), [product, language]);
  const [isWishlistPending, startWishlistTransition] = useTransition();
  const [isAddToCartPending, startAddToCartTransition] = useTransition();
  const [isRemovePending, startRemoveTransition] = useTransition();
  const [brokenImageUrls, setBrokenImageUrls] = useState<Set<string>>(new Set());
  const [liked, setLiked] = useState(initialLiked ?? isFavourite);
  const [hasLocalLikedChange, setHasLocalLikedChange] = useState(false);
  const [heartAnimationKey, setHeartAnimationKey] = useState(0);
  const [cartState, setCartState] = useState<CartState>("idle");
  const cartAddedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (cartAddedTimerRef.current) {
        clearTimeout(cartAddedTimerRef.current);
      }
      if (cartIdleTimerRef.current) {
        clearTimeout(cartIdleTimerRef.current);
      }
    };
  }, []);

  const safeImages = useMemo(
    () =>
      (product.images ?? [])
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
    safeImages.find((image) => image.isCover) ??
    safeImages[0] ??
    (productImageUrl && !brokenImageUrls.has(productImageUrl)
      ? {
          cardCropX: 50,
          cardCropY: 50,
          cardCropZoom: 1,
          cardCropAspectRatio: 0.75,
          cardCropAreaX: 0,
          cardCropAreaY: 0,
          cardCropAreaWidth: 100,
          cardCropAreaHeight: 100,
          displayUrl: productImageUrl,
          id: "legacy-cover",
          isCover: true,
          url: productImageUrl,
        }
      : null);
  const secondaryImage = safeImages.find((image) => image.displayUrl !== coverImage?.displayUrl);
  const coverImageUrl = coverImage?.displayUrl ?? null;
  const secondaryImageUrl = secondaryImage?.displayUrl ?? null;
  const productHref = getLocalizedPath(`/product/${product.slug}`, language);
  const resolvedRedirectTo = redirectTo.startsWith("/") ? getLocalizedPath(redirectTo, language) : redirectTo;
  const isOutOfStock = isProductOutOfStock(product);
  const isHeartPending = isFavouritePending || isWishlistPending;
  const differentiator = useMemo(() => getProductCardDifferentiator(localizedProduct), [localizedProduct]);
  const displayPrice = useMemo(() => getDisplayPriceForCountry(product, country), [product, country]);
  const displayedPrice = useMemo(
    () => displayPrice == null
      ? dictionary["product.notAvailableEu"]
      : formatPriceForCountry(displayPrice, country),
    [country, dictionary, displayPrice],
  );
  const freeShippingLabel = useMemo(() => getFreeShippingLabel(language), [language]);
  const isMissingZonePrice = displayPrice == null;
  const imageStateClass = isOutOfStock
    ? "saturate-[0.78] brightness-[0.96]"
    : "";
  const imageHoverClass = !isOutOfStock
    ? "group-hover:scale-[1.04] group-focus-within:scale-[1.04]"
    : "";
  const displayedLiked = hasLocalLikedChange ? liked : initialLiked ?? isFavourite;
  const handleHeart = () => {
    const nextLiked = !displayedLiked;

    setHasLocalLikedChange(true);
    setLiked(nextLiked);
    if (nextLiked) {
      setHeartAnimationKey((currentKey) => currentKey + 1);
    }

    startWishlistTransition(async () => {
      await onWishlistToggle?.(product.id, nextLiked);
      await onFavouriteToggle?.(product.id, displayedLiked);
    });
  };
  const handleCart = () => {
    if (cartState !== "idle" || isOutOfStock) {
      return;
    }

    setCartState("adding");

    if (cartAddedTimerRef.current) {
      clearTimeout(cartAddedTimerRef.current);
    }
    if (cartIdleTimerRef.current) {
      clearTimeout(cartIdleTimerRef.current);
    }

    cartAddedTimerRef.current = setTimeout(() => {
      setCartState("added");
      // TODO: call addToCart API here
      void onAddToCart?.(product.id);
      cartIdleTimerRef.current = setTimeout(() => setCartState("idle"), 1200);
    }, 650);
  };

  const imageFallback = (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: product.imagePalette
          ? `linear-gradient(155deg, ${product.imagePalette[0]}, ${product.imagePalette[2]})`
          : "linear-gradient(155deg, #f5f3f0, #ece8e3)",
      }}
    >
      <span className="px-4 text-center font-[family:var(--font-display)] text-lg leading-tight text-[#5e5358]/70">
        {localizedProduct.name}
      </span>
    </div>
  );

  // ── Saved variant ──────────────────────────────────────────────────────────
  if (variant === "saved") {
    const savedHref = resolvedRedirectTo
      ? `${productHref}?redirectTo=${encodeURIComponent(resolvedRedirectTo)}`
      : productHref;

    return (
      <article className="group flex flex-col">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f3f0]">
          <Link
            href={savedHref}
            className="absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
          >
            {coverImageUrl ? (
              <div
                aria-label={localizedProduct.name}
                role="img"
                className={`absolute inset-0 bg-[#f5f3f0] transition-[opacity,transform,filter] duration-500 ease-out ${imageHoverClass} ${imageStateClass}`}
                style={getCenteredBackgroundFillStyle(coverImageUrl)}
              />
            ) : (
              imageFallback
            )}
            {isOutOfStock && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-start bg-gradient-to-t from-white/55 via-white/18 to-transparent p-2.5 sm:p-3">
                <span className="rounded-md border border-white/70 bg-white/72 px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] text-[#6f666b] shadow-[0_8px_18px_rgba(82,73,79,0.08)] backdrop-blur-sm">
                  {dictionary["product.soldOut"]}
                </span>
              </div>
            )}
          </Link>
          {/* Static filled heart — indicates this item is saved */}
          <div className="pointer-events-none absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#c45a85] shadow-[0_6px_14px_rgba(196,90,133,0.18)]">
            <Heart className="h-3 w-3 fill-current" />
          </div>
        </div>

        {/* Info */}
        <div className="mt-1 flex-1 sm:mt-2.5">
          <p className="mb-0.5 text-[7px] uppercase tracking-[.15em] text-[#888] sm:mb-1 sm:text-[10px] sm:tracking-[.22em]">
            {localizedProduct.collectionLabel}
          </p>
          <Link
            href={savedHref}
            className="block text-[10px] font-medium leading-snug text-[#1a1a1a] transition hover:text-[#555] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] sm:text-[13px] sm:text-sm"
          >
            {localizedProduct.name}
          </Link>
          <p className="mt-0.5 text-[10px] font-semibold text-[#1a1a1a] sm:mt-1 sm:text-[13px] sm:text-sm">
            {displayedPrice}
          </p>
          <p className="mt-0.5 text-[9px] text-[#8a7a82] sm:text-[11px]">{freeShippingLabel}</p>
        </div>

        {/* Action row */}
        <div className="mt-3 flex items-center justify-between border-t border-[#f0e2e8] pt-2.5">
          <button
            type="button"
            onClick={() => {
              startAddToCartTransition(async () => {
                await onAddToCart?.();
              });
            }}
            disabled={isOutOfStock || isMissingZonePrice || isAddToCartPending}
            aria-label={`${dictionary["product.addToCart"]}: ${localizedProduct.name}`}
            className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-[11px] uppercase tracking-[0.14em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] ${
              isOutOfStock || isMissingZonePrice || isAddToCartPending
                ? "cursor-not-allowed text-[#b69dad]"
                : "bg-[#fff7fa] text-[#6b425a] hover:bg-[#fbe6f0] hover:text-[#b84777]"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {dictionary["product.addToCart"]}
          </button>

          <button
            type="button"
            onClick={() => {
              startRemoveTransition(async () => {
                await onRemove?.();
              });
            }}
            disabled={isRemovePending}
            aria-label={`${dictionary["cart.remove"]}: ${localizedProduct.name}`}
            className={`flex min-h-8 min-w-8 items-center justify-center rounded-full transition hover:bg-[#fff7fa] hover:text-[#9b476f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] ${
              isRemovePending ? "text-[#ccc]" : "text-[#bca3b0]"
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </article>
    );
  }

  // ── Grid variant (default) ─────────────────────────────────────────────────
  const wishlistButton = (
    <button
      type="button"
      aria-label={
        displayedLiked
          ? `${dictionary["cart.remove"]}: ${localizedProduct.name}`
          : `${dictionary["product.addToFavourites"]}: ${localizedProduct.name}`
      }
      aria-pressed={displayedLiked}
      disabled={isHeartPending}
      onClick={handleHeart}
      className={`relative inline-flex items-center justify-center overflow-visible transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] ${
        wishlistPlacement === "image"
          ? "h-8 w-8 rounded-md border border-white/70 bg-white/90 text-[#2d2829] shadow-[0_8px_18px_rgba(20,20,20,0.06)] hover:bg-white"
          : "h-10 w-10 -m-2 rounded-full"
      } ${
        displayedLiked
          ? "text-[#E0157A]"
          : wishlistPlacement === "image"
            ? "hover:text-[#6f7f5c]"
            : "text-[#888] hover:text-[#1a1a1a] sm:group-hover:text-[#555]"
      } ${isHeartPending ? "opacity-60" : ""}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="22"
        height="22"
        className="overflow-visible"
      >
        <defs>
          <clipPath id={`heart-clip-${product.id}`}>
            <path d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z" />
          </clipPath>
        </defs>
        <path
          fill="#E0157A"
          clipPath={`url(#heart-clip-${product.id})`}
          style={{
            transformOrigin: "50% 60%",
            transform: displayedLiked ? "scale(1)" : "scale(0)",
            transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z"
        />
        <path
          fill="none"
          stroke={displayedLiked ? "#E0157A" : "#C4857A"}
          strokeWidth="1.5"
          style={{ transition: "stroke 0.2s" }}
          d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z"
        />
      </svg>
      <div
        key={heartAnimationKey}
        style={{
          position: "absolute",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#E0157A",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(0)",
          opacity: 0,
          animation: displayedLiked ? "heartPop 0.5s ease forwards" : "none",
          pointerEvents: "none",
        }}
      />
    </button>
  );

  return (
    <article className="group flex flex-col">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f3f0]">
        <Link
          href={productHref}
          className="absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
        >
          {coverImageUrl ? (
            <>
              <div
                aria-label={localizedProduct.name}
                role="img"
                className={`absolute inset-0 bg-[#f5f3f0] transition-[opacity,transform,filter] duration-500 ease-out ${
                  secondaryImageUrl
                    ? "delay-100 group-hover:opacity-0 group-focus-within:opacity-0"
                    : imageHoverClass
                } ${imageStateClass}`}
                style={getCenteredBackgroundFillStyle(coverImageUrl)}
              />
              {secondaryImage && secondaryImageUrl ? (
                <div
                  aria-label={secondaryImage?.alt ?? localizedProduct.name}
                  role="img"
                  className={`object-cover opacity-0 transition-[opacity,transform,filter] delay-100 duration-500 ease-out group-hover:scale-[1.03] group-hover:opacity-100 group-focus-within:scale-[1.03] group-focus-within:opacity-100 ${imageStateClass}`}
                  style={{
                    ...getCenteredBackgroundFillStyle(secondaryImageUrl),
                    position: "absolute",
                    inset: 0,
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
                {dictionary["product.soldOut"]}
              </span>
            </div>
          )}
        </Link>
        {showWishlistToggle && wishlistPlacement === "image" ? (
          <div className="absolute right-3 top-3 z-10">{wishlistButton}</div>
        ) : null}
      </div>

      {/* Info */}
      <div className="mt-1 flex-1 sm:mt-2.5">
        <p className="mb-0.5 text-[7px] uppercase tracking-[.15em] text-[#888] sm:mb-1 sm:text-[10px] sm:tracking-[.22em]">
          {localizedProduct.collectionLabel}
        </p>
        <Link
          href={productHref}
          className="block text-[10px] font-medium leading-snug text-[#1a1a1a] transition hover:text-[#555] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] sm:text-[13px] sm:text-sm"
        >
          {localizedProduct.name}
        </Link>
        {differentiator ? (
          <p className="mt-0.5 text-[9px] leading-snug text-[#7f7379] sm:mt-1 sm:text-[11px]">
            {differentiator}
          </p>
        ) : null}
        <p className="mt-0.5 text-[10px] font-semibold text-[#1a1a1a] sm:mt-1 sm:text-[13px] sm:text-sm">
          {displayedPrice}
        </p>
        <p className="mt-0.5 text-[9px] text-[#8a7a82] sm:text-[11px]">{freeShippingLabel}</p>
        <div className="hidden sm:flex mt-1.5 min-h-9 items-center justify-between opacity-100 transition-[opacity,transform] duration-300 ease-out sm:min-h-10 sm:opacity-75 sm:group-hover:-translate-y-px sm:group-hover:opacity-100 sm:group-focus-within:-translate-y-px sm:group-focus-within:opacity-100">
          {showWishlistToggle && wishlistPlacement === "inline" ? wishlistButton : <span aria-hidden="true" />}

          {showAddToCart && !isMissingZonePrice ? (
            <AddToCartForm
              productId={product.id}
              quantity={1}
              redirectTo={resolvedRedirectTo}
              disabled={isOutOfStock}
            >
              {({ isPending }) => (
                <button
                  type="submit"
                  aria-label={isOutOfStock ? `${localizedProduct.name} ${dictionary["product.soldOut"]}` : `${dictionary["product.addToCart"]}: ${localizedProduct.name}`}
                  disabled={isOutOfStock || isPending || cartState !== "idle"}
                  onClick={handleCart}
                  className={`relative inline-flex h-10 w-10 -m-2 items-center justify-center overflow-visible rounded-full transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] ${
                    isOutOfStock
                      ? "cursor-not-allowed text-[#ccc]"
                      : cartState === "added"
                        ? "text-[#C0006A]"
                        : "text-[#888] hover:text-[#1a1a1a] sm:group-hover:text-[#555]"
                  } ${isPending ? "scale-[0.96]" : ""}`}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#E0157A",
                      top: "-8px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      opacity: 0,
                      animation: cartState === "adding" ? "dotFall 0.6s ease forwards" : "none",
                      pointerEvents: "none",
                    }}
                  />
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    className="overflow-visible"
                    fill="none"
                  >
                    <path
                      d="M6 7h12"
                      stroke={cartState === "added" ? "#C0006A" : "#2D1A16"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      style={{
                        transformOrigin: "50% 4px",
                        animation: cartState === "adding" ? "lidOpen 0.65s ease forwards" : "none",
                      }}
                    />
                    <path
                      d="M6 7l1.5 9h9L18 7M9 7V5a3 3 0 0 1 6 0v2"
                      stroke={cartState === "added" ? "#C0006A" : "#2D1A16"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </AddToCartForm>
          ) : null}
        </div>
      </div>
      <style jsx global>{`
        @keyframes heartPop {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.6;
          }
          60% {
            transform: translate(-50%, -50%) scale(2.5);
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, -50%) scale(3.5);
            opacity: 0;
          }
        }

        @keyframes lidOpen {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-28deg);
          }
          65% {
            transform: rotate(-28deg);
          }
          90% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        @keyframes dotFall {
          0% {
            opacity: 1;
            top: -12px;
            transform: translateX(-50%) scale(1);
          }
          55% {
            opacity: 1;
            top: 6px;
            transform: translateX(-50%) scale(0.8);
          }
          70% {
            opacity: 0;
            top: 10px;
          }
          100% {
            opacity: 0;
            top: 10px;
          }
        }
      `}</style>
    </article>
  );
}
