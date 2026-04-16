"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  LogOut,
  User,
} from "lucide-react";

import { type HeaderUser, profileMenuByRole } from "@/lib/header-data";
import { formatPrice } from "@/lib/catalog";
import type {
  HeaderCouponDropdownPreview,
  HeaderCouponPreview,
  HeaderCouponProductPreview,
} from "@/lib/account";

type ProfileDropdownProps = {
  user: HeaderUser;
  couponPreview?: HeaderCouponDropdownPreview;
};

export function MiniCouponRow({ coupon }: { coupon: HeaderCouponPreview }) {
  const [copied, setCopied] = useState(false);
  const daysRemaining = coupon.daysRemaining;
  const urgencyColor =
    daysRemaining == null
      ? "#16a34a"
      : daysRemaining <= 2
        ? "#dc2626"
        : daysRemaining <= 7
          ? "#d97706"
          : "#16a34a";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="relative mx-3 border-b-[1.5px] border-dashed border-[#e8e5e0] px-3.5 py-2.5">
      <span
        aria-hidden="true"
        className="absolute -left-3 top-1/2 h-5 w-2.5 -translate-y-1/2 rounded-r-[10px] border border-l-0 border-[#e8e5e0] bg-white"
      />
      <span
        aria-hidden="true"
        className="absolute -right-3 top-1/2 h-5 w-2.5 -translate-y-1/2 rounded-l-[10px] border border-r-0 border-[#e8e5e0] bg-white"
      />

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-[13px] font-bold tracking-[0.03em] text-[#1a1a1a]">
            {coupon.code}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold" style={{ color: urgencyColor }}>
            -{coupon.discountPercent}%
            {" · "}
            <span className="font-normal text-[#aaa]">
              {daysRemaining == null
                ? "visszavonásig"
                : daysRemaining === 0
                  ? "ma jár le"
                  : `${daysRemaining} nap`}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex shrink-0 items-center gap-1 rounded border border-[#e8e5e0] px-2 py-1 text-[10px] font-semibold transition ${
            copied ? "bg-[#1a1a1a] text-white" : "bg-white text-[#555] hover:text-[#1a1a1a]"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-2.5 w-2.5" /> Kész
            </>
          ) : (
            <>
              <Copy className="h-2.5 w-2.5" /> Másolás
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function MiniProductCard({ product }: { product: HeaderCouponProductPreview }) {
  return (
    <Link href={`/product/${product.slug}`} className="block no-underline">
      <div className="relative mb-1.5 aspect-[3/4] overflow-hidden rounded bg-[#f5f3f0]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : null}
      </div>
      <p className="truncate text-[10px] font-medium leading-[1.3] text-[#1a1a1a]">
        {product.name}
      </p>
      <p className="mt-0.5 text-[10px] text-[#888]">{formatPrice(product.price)}</p>
    </Link>
  );
}

export function ProfileDropdown({ user, couponPreview }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCouponPanelOpen, setIsCouponPanelOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCoupons = couponPreview?.activeCoupons ?? [];
  const eligibleProducts = couponPreview?.eligibleProducts ?? [];
  const recommendationLabel = couponPreview?.recommendationLabel;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCouponPanelOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsCouponPanelOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const menuItems = profileMenuByRole[user.role];
  const closeMenu = () => {
    setIsOpen(false);
    setIsCouponPanelOpen(false);
  };

  return (
    <div className="relative inline-flex h-10 w-10 shrink-0" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Profil menü megnyitása"
        onClick={() => setIsOpen((open) => !open)}
        className={`group relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-transparent text-[#5a4651] transition duration-200 hover:border-[#e8d6dd] hover:bg-white/80 hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1] ${
          isOpen ? "border-[#e8d6dd] bg-white/88 text-[#2f2230]" : ""
        }`}
      >
        <User className="h-[1.1rem] w-[1.1rem]" />
        {activeCoupons.length > 0 && (
          <span className="absolute right-[9px] top-[9px] h-2 w-2 rounded-full border border-[rgba(255,248,251,0.95)] bg-[#c45a85]" />
        )}
      </button>

      {isOpen ? (
        <div
          role="menu"
          aria-label="Profil menü"
          className="user-dropdown-wrap dropdown-reveal absolute right-0 top-full z-50 mt-3"
          onMouseLeave={() => setIsCouponPanelOpen(false)}
        >
          <div className="user-menu-left bg-white/96 p-2 backdrop-blur-xl">
            <div className="rounded-md border border-[#eee7ea] bg-[#fffdfb] px-4 py-3.5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f7f4f5] text-[#8e5f79]">
                  <User className="h-5 w-5" />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#2d1f28]">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-[#907585]">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="my-2 h-px bg-[#eee7ea]" />

            <div className="space-y-0.5">
              {menuItems.map(({ href, icon: Icon, label }) => {
                const isCouponItem = label === "Kuponjaim";

                return (
                  <Link
                    key={label}
                    href={href}
                    role="menuitem"
                    className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition duration-200 hover:bg-[#fff8fb] focus-visible:bg-[#fff8fb] focus-visible:outline-none"
                    onClick={closeMenu}
                    onMouseEnter={() => {
                      if (isCouponItem) {
                        setIsCouponPanelOpen(true);
                      }
                    }}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#eee7ea] bg-white text-[#8e687b] transition duration-200 group-hover:border-[#d8c7cf] group-hover:text-[#4d2741]">
                      <Icon className="h-[0.9rem] w-[0.9rem]" />
                    </span>
                    <span className="font-medium text-[#5d3350] transition-colors duration-200 group-hover:text-[#2d1f28]">
                      {label}
                    </span>
                    {isCouponItem ? (
                      <ChevronRight className="ml-auto h-3.5 w-3.5 text-[#ccc]" />
                    ) : null}
                  </Link>
                );
              })}
            </div>

            <div className="my-2 h-px bg-[#eee7ea]" />

            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition duration-200 hover:bg-[#fff8fb] focus-visible:bg-[#fff8fb] focus-visible:outline-none"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#eee7ea] bg-white text-[#8e687b] transition duration-200 group-hover:border-[#d8c7cf] group-hover:text-[#4d2741]">
                  <LogOut className="h-[0.9rem] w-[0.9rem]" />
                </span>
                <span className="font-medium text-[#5d3350] transition-colors duration-200 group-hover:text-[#2d1f28]">
                  Kijelentkezés
                </span>
              </button>
            </form>
          </div>

          {isCouponPanelOpen ? (
            <>
              <span className="coupon-panel-bridge" aria-hidden="true" />
              <div className="coupon-side-panel">
                <div className="border-b border-[#f0ede8] px-[18px] pb-3 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b08898]">
                    Kuponjaim
                  </p>
                </div>

                <div className="max-h-[260px] overflow-y-auto py-2.5">
                  {activeCoupons.length === 0 ? (
                    <p className="px-[18px] py-5 text-center text-xs text-[#aaa]">
                      Nincs aktív kuponod
                    </p>
                  ) : (
                    activeCoupons.map((coupon) => (
                      <MiniCouponRow key={coupon.id} coupon={coupon} />
                    ))
                  )}
                </div>

              {eligibleProducts.length > 0 ? (
                <>
                  <div className="border-t border-[#f0ede8] px-[18px] pb-2 pt-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b08898]">
                      {recommendationLabel}
                    </p>
                  </div>
                    <div className="grid grid-cols-3 gap-2 px-[18px] pb-4">
                      {eligibleProducts.slice(0, 3).map((product) => (
                        <MiniProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </>
                ) : null}

                <div className="border-t border-[#f0ede8] px-[18px] py-2.5">
                  <Link
                    href="/profile#kuponjaim"
                    className="flex items-center gap-1 text-[11px] text-[#888] no-underline transition hover:text-[#1a1a1a]"
                    onClick={closeMenu}
                  >
                    Összes kupon megtekintése <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
