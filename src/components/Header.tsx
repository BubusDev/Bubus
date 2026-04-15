"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Heart,
  Menu,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import {
  headerSecondaryNavItems,
  type HeaderUser,
} from "@/lib/header-data";
import type { HeaderCouponDropdownPreview } from "@/lib/account";
import type { NavigationCategory } from "@/lib/catalog";
import {
  getSpecialtyHref,
  type SpecialtyView,
} from "@/lib/specialty-links";

type HeaderProps = {
  user?: HeaderUser;
  favouritesCount?: number;
  cartCount?: number;
  couponPreview?: HeaderCouponDropdownPreview;
  navigationCategories?: NavigationCategory[];
  specialtyItems?: SpecialtyView[];
};

type HeaderActionButtonProps = {
  href: string;
  label: string;
  badgeCount?: number;
  children: React.ReactNode;
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
  couponPreview,
  navigationCategories = [],
  specialtyItems = [],
}: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuPath, setMobileMenuPath] = useState<string | null>(null);
  const [specialtyOpen, setSpecialtyOpen] = useState(false);
  const [cartPath, setCartPath] = useState<string | null>(null);

  const mobileMenuOpen = mobileMenuPath === pathname;
  const cartOpen = cartPath === pathname;

  // Scroll lock when any overlay is open
  useEffect(() => {
    const anyOpen = mobileMenuOpen || cartOpen;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, cartOpen]);

  return (
    <>
      <header className="navbar-glass sticky top-0 z-50 w-full border-b border-white/30 bg-[rgba(255,241,247,0.52)] hover:bg-[rgba(255,241,247,0.88)] hover:border-white/60">
        <div className="mx-auto grid min-h-[82px] w-full max-w-[1500px] grid-cols-[auto_1fr_auto] items-center gap-2 px-4 py-3 sm:px-6 lg:min-h-[90px] lg:grid-cols-[1fr_auto_1fr] lg:px-8">

          {/* ── COL 1: mobile hamburger / desktop spacer ── */}
          <div>
            {/* Mobile hamburger */}
            <button
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Menü bezárása" : "Menü megnyitása"}
              onClick={() =>
                setMobileMenuPath((currentPath) =>
                  currentPath === pathname ? null : pathname,
                )
              }
              className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[#ead9e1] bg-[rgba(255,247,250,0.62)] text-[#5a4651] backdrop-blur-xl transition duration-300 hover:bg-[#fff8fb]/88 hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* ── COL 2: logo (center) ── */}
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
                  background:
                    "linear-gradient(135deg, #c45a85 0%, #9b3d6e 50%, #e07a70 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Chicks Jewelry
              </span>
            </div>
          </Link>

          {/* ── COL 3: mobile icons / desktop right nav ── */}
          <div className="flex items-center justify-end gap-1">
            {/* Mobile: user icon + cart icon */}
            <div className="flex items-center gap-1.5 lg:hidden">
              {/* User icon → /account or /sign-in */}
              <Link
                href={user ? "/account" : "/sign-in"}
                aria-label={user ? "Fiókom" : "Belépés"}
                className="relative inline-flex h-10 w-10 items-center justify-center text-[#5a4651] transition hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
              >
                <User className="h-[1.1rem] w-[1.1rem]" />
              </Link>

              {/* Cart icon → opens drawer */}
              <button
                type="button"
                aria-label="Kosár"
                onClick={() => setCartPath(pathname)}
                className="relative inline-flex h-10 w-10 items-center justify-center text-[#5a4651] transition hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
              >
                <ShoppingBag className="h-[1.1rem] w-[1.1rem]" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex min-h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full border border-[rgba(255,248,251,0.95)] bg-[#6e3d58] px-1 text-[9px] font-semibold tracking-[0.08em] text-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop icon nav */}
            <nav
              aria-label="Hasznos navigáció"
              className="hidden items-center gap-1 lg:flex"
            >
              <HeaderActionButton
                href="/favourites"
                label="Kedvencek"
                badgeCount={favouritesCount}
              >
                <Heart className="h-[1.1rem] w-[1.1rem]" />
              </HeaderActionButton>

              <HeaderActionButton href="/cart" label="Kosár" badgeCount={cartCount}>
                <ShoppingBag className="h-[1.1rem] w-[1.1rem]" />
              </HeaderActionButton>

              <div className="mx-1 h-5 w-px bg-[#ead9e1]" />

              {user ? (
                <ProfileDropdown user={user} couponPreview={couponPreview} />
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
          </div>
        </div>
      </header>

      {/* ── FULL-SCREEN MOBILE MENU ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-white lg:hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#f0ede8] px-5 py-4">
            <Link
              href="/"
              onClick={() => setMobileMenuPath(null)}
              className="flex flex-col leading-none"
            >
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-[#c0517a]">
                Boutique ékszer
              </span>
              <span
                className="font-[family:var(--font-display)] text-xl font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, #c45a85 0%, #9b3d6e 50%, #e07a70 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Chicks Jewelry
              </span>
            </Link>
            <button
              type="button"
              aria-label="Menü bezárása"
              onClick={() => setMobileMenuPath(null)}
            >
              <X className="h-5 w-5 text-[#1a1a1a]" strokeWidth={1.5} />
            </button>
          </div>

          {/* Primary nav links */}
          <nav className="px-5 py-2">
            {navigationCategories.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuPath(null)}
                className="flex items-center justify-between border-b border-[#f5f4f2] py-4 text-base font-semibold text-[#1a1a1a]"
              >
                {label}
                <ChevronRight className="h-4 w-4 text-[#ccc]" strokeWidth={1.5} />
              </Link>
            ))}

            {/* Specialty items */}
            {specialtyItems.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setSpecialtyOpen((o) => !o)}
                  className="flex w-full items-center justify-between border-b border-[#f5f4f2] py-4 text-base font-semibold text-[#1a1a1a]"
                >
                  Különlegességek
                  <ChevronDown
                    className={`h-4 w-4 text-[#ccc] transition-transform ${specialtyOpen ? "rotate-180" : ""}`}
                    strokeWidth={1.5}
                  />
                </button>
                {specialtyOpen &&
                  specialtyItems.map((item) => (
                    <Link
                      key={item.id}
                      href={getSpecialtyHref(item)}
                      onClick={() => setMobileMenuPath(null)}
                      className="flex items-center justify-between border-b border-[#f5f4f2] py-3 pl-4 text-sm text-[#555]"
                    >
                      {item.name}
                      <ChevronRight
                        className="h-3.5 w-3.5 text-[#ccc]"
                        strokeWidth={1.5}
                      />
                    </Link>
                  ))}
              </>
            )}
          </nav>

          {/* Secondary links */}
          <div className="mt-4 border-t border-[#f0ede8] px-5 pb-6 pt-2">
            {headerSecondaryNavItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuPath(null)}
                className="block border-b border-[#f5f4f2] py-3 text-sm text-[#888]"
              >
                {label}
              </Link>
            ))}
            {user ? (
              <Link
                href="/profile"
                onClick={() => setMobileMenuPath(null)}
                className="block border-b border-[#f5f4f2] py-3 text-sm text-[#888]"
              >
                Profilom
              </Link>
            ) : (
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuPath(null)}
                className="block border-b border-[#f5f4f2] py-3 text-sm text-[#888]"
              >
                Belépés
              </Link>
            )}
          </div>

          {/* Instagram bar */}
          <div className="mx-5 mb-8 border border-[#f0d4e0] bg-[#fdf5f8] p-4">
            <p className="mb-0.5 text-xs font-semibold text-[#c45a85]">
              @chicksjewelry
            </p>
            <p className="text-xs text-[#888]">
              Kövess Instagramon az újdonságokért
            </p>
          </div>
        </div>
      )}

      {/* ── CART DRAWER ── */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartPath(null)}
        cartCount={cartCount}
      />

    </>
  );
}
