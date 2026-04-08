"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { type ReactNode, useState } from "react";

import { ProfileDropdown } from "@/components/ProfileDropdown";
import {
  headerPrimaryNavItems,
  headerSecondaryNavItems,
  type HeaderUser,
} from "@/lib/header-data";

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
      className="nav-icon-btn group relative inline-flex h-10 w-10 items-center justify-center text-[#5a4651] transition-colors duration-200 hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
    >
      <span className="transition-transform duration-200 group-hover:scale-105">
        {children}
      </span>

      {hasBadge ? (
        <span className="absolute -right-0.5 -top-0.5 flex min-h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full border border-[rgba(255,248,251,0.95)] bg-[#6e3d58] px-1 text-[9px] font-semibold tracking-[0.08em] text-white shadow-[0_6px_18px_rgba(110,61,88,0.16)]">
          {badgeCount! > 9 ? "9+" : badgeCount}
        </span>
      ) : null}

      {/* underline dot */}
      <span className="absolute -bottom-1 left-1/2 h-[1.5px] w-0 -translate-x-1/2 bg-[#c45a85] transition-all duration-200 group-hover:w-full" />
    </Link>
  );
}


export function Header({
  user,
  favouritesCount = 0,
  cartCount = 0,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const getNavLinkClassName = (href: string) =>
    `rounded-full px-4 py-2 text-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1] ${
      pathname === href
        ? "bg-white/90 text-[#4d2741] shadow-[0_10px_28px_rgba(138,95,120,0.12)]"
        : "text-[#6b425a] hover:bg-white/65 hover:text-[#4d2741]"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/40 bg-[rgba(255,241,247,0.72)] backdrop-blur-2xl">
      <div className="mx-auto flex min-h-[84px] w-full max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 transition duration-300 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
        >
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-semibold uppercase tracking-[0.32em] text-[#c0517a]">
              Boutique ékszer
            </span>
            <span
              className="font-[family:var(--font-display)] text-[1.45rem] font-semibold tracking-[-0.02em]"
              style={{
                background: "linear-gradient(135deg, #c45a85 0%, #9b3d6e 50%, #e07a70 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Chicks Jewelry
            </span>
          </div>
        </Link>

        <nav
          aria-label="Fő navigáció"
          className="hidden flex-1 items-center justify-center md:flex"
        >
          <div className="flex flex-wrap items-center justify-center gap-1">
            {headerPrimaryNavItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={getNavLinkClassName(href)}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Desktop icon nav — no background pill wrapper */}
        <nav aria-label="Hasznos navigáció" className="hidden items-center gap-1 md:flex">
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
              className="nav-icon-btn group relative inline-flex h-10 w-10 items-center justify-center text-[#5a4651] transition-colors duration-200 hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
            >
              <span className="transition-transform duration-200 group-hover:scale-105">
                <User className="h-[1.1rem] w-[1.1rem]" />
              </span>
              <span className="absolute -bottom-1 left-1/2 h-[1.5px] w-0 -translate-x-1/2 bg-[#c45a85] transition-all duration-200 group-hover:w-full" />
            </Link>
          )}
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
              {headerPrimaryNavItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`${getNavLinkClassName(href)} inline-flex items-center justify-center`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}

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

            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/70 bg-white/72 p-3 text-xs text-[#8d7382] backdrop-blur-md">
              {headerSecondaryNavItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full px-3 py-1.5 transition hover:bg-white hover:text-[#4d2741]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
