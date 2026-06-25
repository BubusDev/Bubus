"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, X } from "lucide-react";

import { useCountryLanguage } from "@/components/international/CountryLanguageProvider";
import type { CartItemSummary, CartSummary, FavouriteProduct } from "@/lib/account";
import { formatPriceForCountry, getDisplayPriceForCountry, getShippingLineValue, type SupportedLanguage } from "@/lib/international";
import { getDictionary, getLocalizedProduct } from "@/lib/i18n";
import { getLocalizedPath } from "@/lib/locale-routing";

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  cartCount: number;
};

function CartDrawerItem({ item, countryCode, language }: { item: CartItemSummary; countryCode: CartSummary["countryCode"]; language: SupportedLanguage }) {
  const isArchived = item.unavailableReason === "archived";
  const dictionary = getDictionary(language);
  const localizedItem = getLocalizedProduct(item, language);
  const productHref = getLocalizedPath(`/product/${item.slug}`, language);

  return (
    <div className="flex gap-3 px-4 py-3.5">
      <Link href={productHref} className="shrink-0">
        <div className="relative h-16 w-12 overflow-hidden bg-[#f5f3f0]">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={localizedItem.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : null}
        </div>
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={productHref}
          className="line-clamp-2 text-xs font-medium leading-snug text-[#1a1a1a] transition hover:text-[#555]"
        >
          {localizedItem.name}
        </Link>
        <p className="mt-0.5 text-[10px] text-[#888]">{item.category}</p>
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-xs text-[#888]">× {item.quantity}</p>
          <p className="text-xs font-semibold text-[#1a1a1a]">
            {item.isAvailable ? formatPriceForCountry(item.lineTotal, countryCode) : "-"}
          </p>
        </div>
        {isArchived ? (
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9b476f]">
            {language === "en" ? "No longer available" : "Már nem elérhető"}
          </p>
        ) : !item.isAvailable || item.exceedsStock ? (
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9b476f]">
            {dictionary["product.notAvailableEu"]}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function WishlistDrawerItem({ item }: { item: FavouriteProduct }) {
  const { country, language } = useCountryLanguage();
  const dictionary = getDictionary(language);
  const localizedItem = getLocalizedProduct(item, language);
  const displayPrice = getDisplayPriceForCountry(item, country);
  const productHref = getLocalizedPath(`/product/${item.slug}`, language);
  return (
    <div className="flex gap-3 px-4 py-3.5">
      <Link href={productHref} className="shrink-0">
        <div className="relative h-16 w-12 overflow-hidden bg-[#f5f3f0]">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={localizedItem.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : null}
        </div>
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={productHref}
          className="line-clamp-2 text-xs font-medium leading-snug text-[#1a1a1a] transition hover:text-[#555]"
        >
          {localizedItem.name}
        </Link>
        <p className="mt-0.5 text-[10px] text-[#888]">{localizedItem.collectionLabel}</p>
        <p className="mt-1 text-xs font-semibold text-[#1a1a1a]">
          {displayPrice == null ? dictionary["product.notAvailableEu"] : formatPriceForCountry(displayPrice, country)}
        </p>
      </div>
    </div>
  );
}

export function CartDrawer({ isOpen, onClose, cartCount }: CartDrawerProps) {
  const { language } = useCountryLanguage();
  const dictionary = getDictionary(language);
  const [cartTab, setCartTab] = useState<"cart" | "wishlist">("cart");
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [wishlist, setWishlist] = useState<FavouriteProduct[] | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/cart")
      .then((r) => r.json())
      .then((data) => setCart(data as CartSummary))
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || cartTab !== "wishlist") return;
    if (wishlist !== null) return;
    fetch("/api/favourites")
      .then((r) => r.json())
      .then((data) => setWishlist(data as FavouriteProduct[]))
      .catch(() => setWishlist([]));
  }, [isOpen, cartTab, wishlist]);

  if (!isOpen) return null;

  const hasUnavailableItems =
    cart?.items.some((item) => !item.isAvailable || item.exceedsStock) ?? false;
  const loading = cart === null;
  const wishlistLoading = cartTab === "wishlist" && wishlist === null;
  const localizedHref = (href: string) => getLocalizedPath(href, language);

  return (
    <div className="fixed inset-0 z-[200] lg:hidden">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col bg-white shadow-2xl animate-[slideInRight_.25s_ease-out]">

        {/* Header tabs */}
        <div className="flex shrink-0 border-b border-[#e8e5e0]">
          <button
            type="button"
            onClick={() => setCartTab("cart")}
            className={`flex-1 py-4 text-sm font-semibold transition ${
              cartTab === "cart"
                ? "border-b-2 border-[#1a1a1a] text-[#1a1a1a]"
                : "text-[#aaa]"
            }`}
          >
            {dictionary["cart.cart"]} ({cartCount})
          </button>
          <button
            type="button"
            onClick={() => setCartTab("wishlist")}
            className={`flex-1 py-4 text-sm font-semibold transition ${
              cartTab === "wishlist"
                ? "border-b-2 border-[#1a1a1a] text-[#1a1a1a]"
                : "text-[#aaa]"
            }`}
          >
            {dictionary["nav.favourites"]}
          </button>
          <button type="button" onClick={onClose} className="shrink-0 px-4">
            <X className="h-5 w-5 text-[#1a1a1a]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {cartTab === "cart" && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1a1a1a] border-t-transparent" />
                </div>
              ) : !cart || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <ShoppingBag
                    className="mb-4 h-10 w-10 text-[#ddd]"
                    strokeWidth={1}
                  />
                  <p className="mb-1 font-semibold text-[#1a1a1a]">
                    {dictionary["cart.empty"]}
                  </p>
                  <p className="mb-6 text-sm text-[#888]">
                    {language === "en" ? "Browse the collection." : "Böngéssz a kollekciónkban!"}
                  </p>
                  <Link
                    href={localizedHref("/")}
                    onClick={onClose}
                    className="border border-[#1a1a1a] px-6 py-2.5 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#1a1a1a] hover:text-white"
                  >
                    {language === "en" ? "Continue shopping" : "Vásárlás folytatása"}
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#f5f4f2]">
                  {cart.items.map((item) => (
                    <CartDrawerItem key={item.id} item={item} countryCode={cart.countryCode} language={language} />
                  ))}
                </div>
              )}
            </>
          )}

          {cartTab === "wishlist" && (
            <>
              {wishlistLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1a1a1a] border-t-transparent" />
                </div>
              ) : !wishlist || wishlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <Heart className="mb-4 h-10 w-10 text-[#ddd]" strokeWidth={1} />
                  <p className="mb-1 font-semibold text-[#1a1a1a]">
                    {wishlist === null
                      ? language === "en" ? "Sign in to view favourites" : "Jelentkezz be a kedvencek megtekintéséhez"
                      : language === "en" ? "No favourite products yet" : "Még nincs kedvenc termék"}
                  </p>
                  <p className="mb-6 text-sm text-[#888]">
                    {language === "en" ? "Use the heart icon to save pieces you like." : "A szív ikonra kattintva mentheted el a kedvelt ékszereket."}
                  </p>
                  <Link
                    href={localizedHref("/")}
                    onClick={onClose}
                    className="border border-[#1a1a1a] px-6 py-2.5 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#1a1a1a] hover:text-white"
                  >
                    {language === "en" ? "Browse collection" : "Kollekció böngészése"}
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#f5f4f2]">
                  {wishlist.map((item) => (
                    <WishlistDrawerItem key={item.productId} item={item} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Wishlist footer */}
        {cartTab === "wishlist" && wishlist && wishlist.length > 0 && (
          <div className="shrink-0 border-t border-[#e8e5e0] bg-white p-5">
            <Link
              href={localizedHref("/favourites")}
              onClick={onClose}
              className="block w-full border border-[#1a1a1a] py-3 text-center text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#1a1a1a] hover:text-white"
            >
              {language === "en" ? "View all favourites" : "Összes kedvenc megtekintése"}
            </Link>
          </div>
        )}

        {/* Cart footer */}
        {cartTab === "cart" && cart && cart.items.length > 0 && (
          <div className="shrink-0 border-t border-[#e8e5e0] bg-white p-5">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-[#888]">{dictionary["cart.subtotal"]}</span>
              <span className="font-semibold text-[#1a1a1a]">
                {formatPriceForCountry(cart.subtotal, cart.countryCode)}
              </span>
            </div>
            <div className="mb-4 flex justify-between text-sm">
              <span className="text-[#888]">{dictionary["cart.shipping"]}</span>
              <span className="font-medium text-[#16a34a]">
                {getShippingLineValue(language)}
              </span>
            </div>
            {hasUnavailableItems ? (
              <div className="mt-4 border border-[#f3cadc] bg-[#fff3f8] px-4 py-3 text-xs leading-5 text-[#9b476f]">
                {language === "en" ? "Remove unavailable items before checkout." : "Távolítsd el a már nem elérhető tételeket a fizetés előtt."}
              </div>
            ) : (
              <Link
                href={localizedHref("/checkout")}
                onClick={onClose}
                className="block w-full bg-[#1a1a1a] py-3.5 text-center text-sm font-semibold text-white transition hover:bg-[#333]"
              >
                {dictionary["cart.checkout"]}
              </Link>
            )}
            <Link
              href={localizedHref("/cart")}
              onClick={onClose}
              className="mt-2 block w-full py-2.5 text-center text-xs text-[#888] transition hover:text-[#1a1a1a]"
            >
              {language === "en" ? "Edit cart" : "Kosár szerkesztése"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
