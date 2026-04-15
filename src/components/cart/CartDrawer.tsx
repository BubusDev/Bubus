"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, X } from "lucide-react";

import { formatPrice } from "@/lib/catalog";
import type { CartItemSummary, CartSummary } from "@/lib/account";

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  cartCount: number;
};

function CartDrawerItem({ item }: { item: CartItemSummary }) {
  return (
    <div className="flex gap-3 px-4 py-3.5">
      <Link href={`/product/${item.slug}`} className="shrink-0">
        <div className="relative h-16 w-12 overflow-hidden bg-[#f5f3f0]">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : null}
        </div>
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/product/${item.slug}`}
          className="line-clamp-2 text-xs font-medium leading-snug text-[#1a1a1a] transition hover:text-[#555]"
        >
          {item.name}
        </Link>
        <p className="mt-0.5 text-[10px] text-[#888]">{item.category}</p>
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-xs text-[#888]">× {item.quantity}</p>
          <p className="text-xs font-semibold text-[#1a1a1a]">
            {formatPrice(item.lineTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CartDrawer({ isOpen, onClose, cartCount }: CartDrawerProps) {
  const [cartTab, setCartTab] = useState<"cart" | "wishlist">("cart");
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch("/api/cart")
      .then((r) => r.json())
      .then((data) => setCart(data as CartSummary))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

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
            Kosár ({cartCount})
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
            Kívánságlista
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
                    A kosarad üres
                  </p>
                  <p className="mb-6 text-sm text-[#888]">
                    Böngéssz a kollekciónkban!
                  </p>
                  <Link
                    href="/"
                    onClick={onClose}
                    className="border border-[#1a1a1a] px-6 py-2.5 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#1a1a1a] hover:text-white"
                  >
                    Vásárlás folytatása
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#f5f4f2]">
                  {cart.items.map((item) => (
                    <CartDrawerItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </>
          )}

          {cartTab === "wishlist" && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <p className="mb-1 font-semibold text-[#1a1a1a]">Kedvencek</p>
              <p className="mb-6 text-sm text-[#888]">
                Tekintsd meg az összes kedvenc termékedet.
              </p>
              <Link
                href="/favourites"
                onClick={onClose}
                className="border border-[#1a1a1a] px-6 py-2.5 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#1a1a1a] hover:text-white"
              >
                Kedvencek megtekintése
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        {cartTab === "cart" && cart && cart.items.length > 0 && (
          <div className="shrink-0 border-t border-[#e8e5e0] bg-white p-5">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-[#888]">Részösszeg</span>
              <span className="font-semibold text-[#1a1a1a]">
                {formatPrice(cart.subtotal)}
              </span>
            </div>
            <div className="mb-4 flex justify-between text-sm">
              <span className="text-[#888]">Szállítás</span>
              <span className="font-medium text-[#16a34a]">
                {cart.shipping > 0 ? formatPrice(cart.shipping) : "Ingyenes"}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full bg-[#1a1a1a] py-3.5 text-center text-sm font-semibold text-white transition hover:bg-[#333]"
            >
              Tovább a fizetéshez
            </Link>
            <Link
              href="/cart"
              onClick={onClose}
              className="mt-2 block w-full py-2.5 text-center text-xs text-[#888] transition hover:text-[#1a1a1a]"
            >
              Kosár szerkesztése
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
