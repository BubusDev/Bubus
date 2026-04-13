"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { type ReactNode, useState } from "react";

import { ProfileDropdown } from "@/components/ProfileDropdown";
import {
  headerPrimaryNavItems,
  headerSecondaryNavItems,
  type HeaderUser,
} from "@/lib/header-data";
import type { NavigationCategory } from "@/lib/catalog";
import {
  getSpecialtyHref,
  type SpecialtyView,
} from "@/lib/specialty-links";

type HeaderProps = {
  user?: HeaderUser;
  favouritesCount?: number;
  cartCount?: number;
  navigationCategories?: NavigationCategory[];
  specialtyItems?: SpecialtyView[];
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

function MobileUtilityLink({
  href,
  label,
  badgeCount,
  children,
  onClick,
}: HeaderActionButtonProps & { onClick?: () => void }) {
  const hasBadge = typeof badgeCount === "number" && badgeCount > 0;
  const isCartButton = href === "/cart";

  return (
    <Link
      href={href}
      data-cart-icon-target={isCartButton ? "cart" : undefined}
      className="relative inline-flex min-h-11 items-center justify-center gap-2 rounded-[0.85rem] border border-white/70 bg-white/78 px-3 text-sm font-medium text-[#6b425a] transition hover:bg-white hover:text-[#4d2741] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
      onClick={onClick}
    >
      {children}
      <span>{label}</span>
      {hasBadge ? (
        <span className="ml-1 inline-flex min-h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-[#6e3d58] px-1 text-[9px] font-semibold tracking-[0.08em] text-white">
          {badgeCount! > 9 ? "9+" : badgeCount}
        </span>
      ) : null}
    </Link>
  );
}

export function Header({
  user,
  favouritesCount = 0,
  cartCount = 0,
  navigationCategories = [],
  specialtyItems = [],
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSpecialtyMenuOpen, setIsSpecialtyMenuOpen] = useState(true);
  const pathname = usePathname();

  const getNavLinkClassName = (href: string) =>
    `rounded-full px-4 py-2 text-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1] ${
      pathname === href
        ? "bg-white/90 text-[#4d2741] shadow-[0_10px_28px_rgba(138,95,120,0.12)]"
        : "text-[#6b425a] hover:bg-[#a8346a]/90 hover:text-white"
    }`;

  return (
    <header className="navbar-glass sticky top-0 z-50 w-full border-b border-white/30 bg-[rgba(255,241,247,0.52)] hover:bg-[rgba(255,241,247,0.88)] hover:border-white/60">
      <div className="mx-auto grid min-h-[82px] w-full max-w-[1500px] grid-cols-[2.75rem_1fr_2.75rem] items-center gap-3 px-4 py-3 sm:px-6 lg:min-h-[90px] lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <span aria-hidden="true" className="h-11 w-11 lg:hidden" />

        <nav
          aria-label="Fő navigáció"
          className="hidden items-center justify-self-start lg:flex"
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

        <Link
          href="/"
          className="flex min-w-0 items-center justify-self-center text-center transition duration-300 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
        >
          <div className="flex flex-col items-center leading-none">
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-[#c0517a] sm:text-[0.72rem]">
              Boutique ékszer
            </span>
            <span
              className="font-[family:var(--font-display)] text-[1.68rem] font-semibold tracking-[-0.02em] sm:text-[2.1rem] lg:text-[2.28rem]"
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

        {/* Desktop icon nav — no background pill wrapper */}
        <nav aria-label="Hasznos navigáció" className="hidden items-center gap-1 justify-self-end lg:flex">
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
          className="flex h-11 w-11 items-center justify-center justify-self-end rounded-[1rem] border border-[#ead9e1] bg-[rgba(255,247,250,0.62)] text-[#5a4651] backdrop-blur-xl transition duration-300 hover:bg-[#fff8fb]/88 hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1] lg:hidden"
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
          className="border-t border-white/40 px-4 pb-4 pt-3 lg:hidden"
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

            <nav
              aria-label="Mobil vásárlási navigáció"
              className="rounded-2xl border border-white/70 bg-white/72 p-3 backdrop-blur-md"
            >
              <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#ad7894]">
                Vásárlás
              </p>
              <div className="grid gap-2">
                {navigationCategories.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex min-h-11 items-center justify-between rounded-[0.85rem] px-3.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1] ${
                      pathname === href
                        ? "bg-[#fff1f7] text-[#4d2741]"
                        : "text-[#6b425a] hover:bg-white hover:text-[#4d2741]"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}

                {specialtyItems.length > 0 ? (
                  <div className="border-t border-[#f1dce7] pt-2">
                    <button
                      type="button"
                      className="flex min-h-11 w-full items-center justify-between rounded-[0.85rem] px-3.5 text-left text-sm font-medium text-[#6b425a] transition hover:bg-white hover:text-[#4d2741] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
                      aria-expanded={isSpecialtyMenuOpen}
                      aria-controls="mobile-specialty-menu"
                      onClick={() => setIsSpecialtyMenuOpen((open) => !open)}
                    >
                      <span>Különlegességek</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isSpecialtyMenuOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                    {isSpecialtyMenuOpen ? (
                      <div id="mobile-specialty-menu" className="mt-1 grid gap-1 pl-2">
                        {specialtyItems.map((item) => (
                          <Link
                            key={item.id}
                            href={getSpecialtyHref(item)}
                            className="flex min-h-10 items-center rounded-[0.75rem] px-3 text-sm text-[#8a6076] transition hover:bg-white hover:text-[#4d2741] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </nav>

            {headerPrimaryNavItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {headerPrimaryNavItems.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`${getNavLinkClassName(href)} inline-flex min-h-11 items-center justify-center`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <MobileUtilityLink
                href="/favourites"
                label="Kedvencek"
                badgeCount={favouritesCount}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Heart className="h-5 w-5" />
              </MobileUtilityLink>

              <MobileUtilityLink
                href="/cart"
                label="Kosár"
                badgeCount={cartCount}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingBag className="h-5 w-5" />
              </MobileUtilityLink>
            </div>

            {user ? (
              <div className="rounded-2xl border border-white/70 bg-white/72 p-2 backdrop-blur-md">
                <ProfileDropdown user={user} />
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[0.85rem] border border-white/70 bg-white/80 px-4 text-sm font-medium text-[#6d5260] backdrop-blur-md transition duration-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Belépés</span>
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
