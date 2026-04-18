"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  LogOut,
  User,
} from "lucide-react";

import { type HeaderUser, profileMenuByRole } from "@/lib/header-data";
import { formatPrice } from "@/lib/catalog";
import type {
  HeaderCouponPreview,
  HeaderCouponProductPreview,
} from "@/lib/account";

type ProfileDropdownProps = {
  user: HeaderUser;
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

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
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
      </button>

      {isOpen ? (
        <div
          role="menu"
          aria-label="Profil menü"
          className="user-dropdown-wrap dropdown-reveal absolute right-0 top-full z-50 mt-3"
        >
          <div className="user-menu-left bg-white p-2">
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
              {menuItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  role="menuitem"
                  className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition duration-200 hover:bg-[#fff8fb] focus-visible:bg-[#fff8fb] focus-visible:outline-none"
                  onClick={closeMenu}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#eee7ea] bg-white text-[#8e687b] transition duration-200 group-hover:border-[#d8c7cf] group-hover:text-[#4d2741]">
                    <Icon className="h-[0.9rem] w-[0.9rem]" />
                  </span>
                  <span className="font-medium text-[#5d3350] transition-colors duration-200 group-hover:text-[#2d1f28]">
                    {label}
                  </span>
                </Link>
              ))}
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

        </div>
      ) : null}
    </div>
  );
}
