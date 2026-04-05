"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { type ReactNode, useState } from "react";

import { ProfileDropdown } from "@/components/ProfileDropdown";
import { type HeaderUser } from "@/lib/header-data";

type HeaderProps = {
  user?: HeaderUser;
  favouritesCount?: number;
  cartCount?: number;
};

type HeaderActionButtonProps = {
  href: string;
  label: string;
  badgeCount?: number;
  children: ReactNode;
};

function HeaderActionButton({
  href,
  label,
  badgeCount,
  children,
}: HeaderActionButtonProps) {
  const hasBadge = typeof badgeCount === "number" && badgeCount > 0;
  const isCartButton = href === "/cart";

  return (
    <Link
      href={href}
      aria-label={label}
      data-cart-icon-target={isCartButton ? "cart" : undefined}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-transparent text-[#5a4651] transition duration-300 hover:border-[#e8d6dd] hover:bg-[#fff8fb]/88 hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
    >
      <span className="transition duration-300 group-hover:scale-105">
        {children}
      </span>

      {hasBadge ? (
        <span className="absolute -right-0.5 -top-0.5 flex min-h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full border border-[rgba(255,248,251,0.95)] bg-[#6e3d58] px-1 text-[9px] font-semibold tracking-[0.08em] text-white shadow-[0_6px_18px_rgba(110,61,88,0.16)]">
          {badgeCount! > 9 ? "9+" : badgeCount}
        </span>
      ) : null}
    </Link>
  );
}

function ChickMark() {
  return (
    <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white/78 shadow-[0_10px_24px_rgba(184,122,160,0.1)] backdrop-blur-md">
      <span className="absolute h-5 w-5 rounded-full bg-white" />
      <span className="absolute left-[15px] top-[12px] h-2.5 w-2.5 rounded-full bg-[#ffd9ec]" />
      <span className="absolute right-[12px] top-[15px] h-1.5 w-1.5 rounded-full bg-[#f183bc]" />
      <span className="absolute right-[8px] top-[18px] h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#ffeaf4]" />
    </span>
  );
}

export function Header({
  user,
  favouritesCount = 0,
  cartCount = 0,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/40 bg-[rgba(255,241,247,0.72)] backdrop-blur-2xl">
      <div className="mx-auto flex min-h-[84px] w-full max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 transition duration-300 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
        >
          <ChickMark />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[#b06b8e]">
              Boutique ékszer webáruház
            </p>
            <p className="truncate font-[family:var(--font-display)] text-xl tracking-[0.04em] text-[#4d2741] sm:text-2xl">
              Chicks Jewelry
            </p>
          </div>
        </Link>

        

        <nav aria-label="Hasznos navigáció" className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-0.5 rounded-full border border-[#ead9e1] bg-[rgba(255,247,250,0.62)] px-1.5 py-1 shadow-[0_12px_30px_rgba(138,95,120,0.08)] backdrop-blur-xl">
            <HeaderActionButton
              href="/favourites"
              label="Kedvencek"
              badgeCount={favouritesCount}
            >
              <Heart className="h-[1.1rem] w-[1.1rem]" />
            </HeaderActionButton>

            <HeaderActionButton
              href="/cart"
              label="Kosár"
              badgeCount={cartCount}
            >
              <ShoppingBag className="h-[1.1rem] w-[1.1rem]" />
            </HeaderActionButton>

            <div className="mx-1 h-5 w-px bg-[#ead9e1]" />

            {user ? (
              <ProfileDropdown user={user} />
            ) : (
              <Link
                href="/sign-in"
                aria-label="Belépés"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-transparent text-[#5a4651] transition duration-300 hover:border-[#e8d6dd] hover:bg-[#fff8fb]/88 hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
              >
                <User className="h-[1.1rem] w-[1.1rem]" />
              </Link>
            )}
          </div>
        </nav>

        <button
          type="button"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-header-menu"
          aria-label={isMobileMenuOpen ? "Menü bezárása" : "Menü megnyitása"}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-[#ead9e1] bg-[rgba(255,247,250,0.62)] text-[#5a4651] backdrop-blur-xl transition duration-300 hover:bg-[#fff8fb]/88 hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1] md:hidden"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {isMobileMenuOpen ? (
        <div
          id="mobile-header-menu"
          className="border-t border-white/40 px-4 pb-4 pt-3 md:hidden"
        >
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/70 bg-white/70 p-3 backdrop-blur-md">
              <label className="flex items-center gap-3 rounded-full bg-white/90 px-4 py-3 text-sm text-[#8d7382]">
                <Search className="h-4 w-4 text-[#b484a6]" />
                <input
                  type="search"
                  placeholder="Termékek keresése"
                  className="w-full border-none bg-transparent text-[#4d2741] outline-none placeholder:text-[#b799ab]"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <HeaderActionButton
                href="/favourites"
                label="Kedvencek"
                badgeCount={favouritesCount}
              >
                <Heart className="h-5 w-5" />
              </HeaderActionButton>

              <HeaderActionButton
                href="/cart"
                label="Kosár"
                badgeCount={cartCount}
              >
                <ShoppingBag className="h-5 w-5" />
              </HeaderActionButton>
            </div>

            {user ? (
              <div className="rounded-2xl border border-white/70 bg-white/72 p-2 backdrop-blur-md">
                <ProfileDropdown user={user} />
              </div>
            ) : (
              <Link
                href="/sign-in"
                aria-label="Belépés"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-[#6d5260] backdrop-blur-md transition duration-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
