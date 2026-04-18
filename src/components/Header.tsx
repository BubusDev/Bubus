"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Heart,
  Menu,
  ShoppingBag,
  TicketPercent,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useRef } from "react";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProfileDropdown, MiniCouponRow, MiniProductCard } from "@/components/ProfileDropdown";
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
  const [mobileCouponOpen, setMobileCouponOpen] = useState(false);
  const [desktopCouponOpen, setDesktopCouponOpen] = useState(false);
  const desktopCouponRef = useRef<HTMLDivElement>(null);

  const mobileMenuOpen = mobileMenuPath === pathname;
  const cartOpen = cartPath === pathname;

  // Scroll lock when any overlay is open
  useEffect(() => {
    const anyOpen = mobileMenuOpen || cartOpen || mobileCouponOpen;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, cartOpen, mobileCouponOpen]);

  // Close desktop coupon dropdown on outside click or Escape
  useEffect(() => {
    if (!desktopCouponOpen) return;
    function handlePointerDown(e: MouseEvent) {
      if (!desktopCouponRef.current?.contains(e.target as Node)) {
        setDesktopCouponOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setDesktopCouponOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [desktopCouponOpen]);

  return (
    <>
      <header className="navbar-glass sticky top-0 z-50 w-full border-b border-white/30 bg-[rgba(255,241,247,0.52)] hover:bg-[rgba(255,241,247,0.88)] hover:border-white/60">
        <div className="mx-auto grid min-h-[76px] w-full max-w-[1500px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1 px-2.5 py-3 min-[390px]:px-3 sm:min-h-[82px] sm:gap-2 sm:px-6 lg:min-h-[90px] lg:grid-cols-[1fr_auto_1fr] lg:px-8">

          {/* ── COL 1: mobile hamburger / desktop spacer ── */}
          <div className="min-w-0">
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#ead9e1] bg-[rgba(255,247,250,0.62)] text-[#5a4651] backdrop-blur-xl transition duration-300 hover:bg-[#fff8fb]/88 hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1] sm:h-11 sm:w-11 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* ── COL 2: logo (center) ── */}
          <Link
            href="/"
            className="flex min-w-0 max-w-full items-center justify-self-center text-center transition duration-300 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
          >
            <div className="flex min-w-0 max-w-full flex-col items-center leading-none">
              <span className="max-w-full truncate text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-[#c0517a] min-[390px]:text-[0.56rem] min-[390px]:tracking-[0.24em] sm:text-[0.72rem] sm:tracking-[0.34em]">
                Boutique ékszer
              </span>
              <span
                className="max-w-full truncate font-[family:var(--font-display)] text-[1.18rem] font-semibold tracking-normal min-[390px]:text-[1.42rem] sm:text-[2.1rem] lg:text-[2.28rem]"
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
          <div className="flex min-w-0 justify-end">
            {/* Mobile: user icon + coupon icon + cart icon */}
            <div className="flex min-w-0 shrink-0 items-center justify-end gap-0 min-[390px]:gap-0.5 sm:gap-1.5 lg:hidden">
              {/* User icon → /account or /sign-in */}
              <Link
                href={user ? "/account" : "/sign-in"}
                aria-label={user ? "Fiókom" : "Belépés"}
                className="relative hidden min-[390px]:inline-flex h-10 w-10 shrink-0 items-center justify-center text-[#5a4651] transition hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1] min-[390px]:h-9 min-[390px]:w-9 sm:h-10 sm:w-10"
              >
                <User className="h-[1.1rem] w-[1.1rem]" />
              </Link>

              {/* Coupon icon → opens coupon popup (only for logged-in users with coupons) */}
              {user && couponPreview ? (
                <button
                  type="button"
                  aria-label="Kuponjaim"
                  aria-expanded={mobileCouponOpen}
                  onClick={() => setMobileCouponOpen(true)}
                  className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center text-[#5a4651] transition hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1] min-[390px]:h-9 min-[390px]:w-9 sm:h-10 sm:w-10"
                >
                  <TicketPercent className="h-[1.1rem] w-[1.1rem]" />
                  {couponPreview.activeCoupons.length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex min-h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full border border-[rgba(255,248,251,0.95)] bg-[#c45a85] px-1 text-[9px] font-semibold tracking-[0.08em] text-white">
                      {couponPreview.activeCoupons.length > 9 ? "9+" : couponPreview.activeCoupons.length}
                    </span>
                  )}
                </button>
              ) : null}

              {/* Cart icon → opens drawer */}
              <button
                type="button"
                aria-label="Kosár"
                onClick={() => setCartPath(pathname)}
                className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center text-[#5a4651] transition hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1] min-[390px]:h-9 min-[390px]:w-9 sm:h-10 sm:w-10"
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
              className="hidden items-center justify-end gap-1 lg:flex"
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

              {user && couponPreview ? (
                <div className="relative" ref={desktopCouponRef}>
                  <button
                    type="button"
                    aria-label="Kuponjaim"
                    aria-expanded={desktopCouponOpen}
                    onClick={() => setDesktopCouponOpen((o) => !o)}
                    className={`nav-icon-btn group relative inline-flex h-10 w-10 items-center justify-center text-[#5a4651] transition-colors duration-200 hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1] ${desktopCouponOpen ? "text-[#2f2230]" : ""}`}
                  >
                    <span className="transition-transform duration-200 group-hover:scale-105">
                      <TicketPercent className="h-[1.1rem] w-[1.1rem]" />
                    </span>
                    {couponPreview.activeCoupons.length > 0 && (
                      <span className="absolute right-[9px] top-[9px] h-2 w-2 rounded-full border border-[rgba(255,248,251,0.95)] bg-[#c45a85]" />
                    )}
                    <span className="absolute -bottom-1 left-1/2 h-[1.5px] w-0 -translate-x-1/2 bg-[#c45a85] transition-all duration-200 group-hover:w-full" />
                  </button>

                  {desktopCouponOpen ? (
                    <div className="dropdown-reveal absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-xl border border-[#e8e5e0] bg-white shadow-xl">
                      <div className="border-b border-[#f0ede8] px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b08898]">
                          Kuponjaim
                        </p>
                      </div>

                      <div className="max-h-[260px] overflow-y-auto py-2.5">
                        {couponPreview.activeCoupons.length === 0 ? (
                          <p className="px-5 py-5 text-center text-xs text-[#aaa]">
                            Nincs aktív kuponod
                          </p>
                        ) : (
                          couponPreview.activeCoupons.map((coupon) => (
                            <MiniCouponRow key={coupon.id} coupon={coupon} />
                          ))
                        )}
                      </div>

                      {couponPreview.eligibleProducts.length > 0 ? (
                        <>
                          <div className="border-t border-[#f0ede8] px-4 pb-2 pt-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b08898]">
                              {couponPreview.recommendationLabel}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                            {couponPreview.eligibleProducts.slice(0, 3).map((product) => (
                              <MiniProductCard key={product.id} product={product} />
                            ))}
                          </div>
                        </>
                      ) : null}

                      <div className="border-t border-[#f0ede8] px-4 py-2.5">
                        <Link
                          href="/profile#kuponjaim"
                          className="flex items-center gap-1 text-[11px] text-[#888] no-underline transition hover:text-[#1a1a1a]"
                          onClick={() => setDesktopCouponOpen(false)}
                        >
                          Összes kupon megtekintése <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

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
                      className="flex min-w-0 items-center justify-between gap-3 border-b border-[#f5f4f2] py-3 pl-4 text-sm text-[#555]"
                    >
                      <span className="min-w-0 break-words">{item.name}</span>
                      <ChevronRight
                        className="h-3.5 w-3.5 flex-none text-[#ccc]"
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

      {/* ── MOBILE COUPON POPUP ── */}
      {mobileCouponOpen && couponPreview ? (
        <div className="fixed inset-0 z-[200] flex items-start lg:hidden" onClick={() => setMobileCouponOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative w-full max-h-[85vh] overflow-hidden rounded-b-2xl border-b border-[#e8e5e0] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#f0ede8] px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b08898]">
                Kuponjaim
              </p>
              <button
                type="button"
                aria-label="Bezárás"
                onClick={() => setMobileCouponOpen(false)}
              >
                <X className="h-4 w-4 text-[#1a1a1a]" strokeWidth={1.5} />
              </button>
            </div>

            {/* Coupons list */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(85vh - 100px)" }}>
              <div className="py-2.5">
                {couponPreview.activeCoupons.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-[#aaa]">
                    Nincs aktív kuponod
                  </p>
                ) : (
                  couponPreview.activeCoupons.map((coupon) => (
                    <MiniCouponRow key={coupon.id} coupon={coupon} />
                  ))
                )}
              </div>

              {couponPreview.eligibleProducts.length > 0 ? (
                <>
                  <div className="border-t border-[#f0ede8] px-5 pb-2 pt-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b08898]">
                      {couponPreview.recommendationLabel}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 px-5 pb-4">
                    {couponPreview.eligibleProducts.slice(0, 3).map((product) => (
                      <MiniProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </>
              ) : null}

              <div className="border-t border-[#f0ede8] px-5 py-3">
                <Link
                  href="/profile#kuponjaim"
                  className="flex items-center gap-1 text-[11px] text-[#888] no-underline transition hover:text-[#1a1a1a]"
                  onClick={() => setMobileCouponOpen(false)}
                >
                  Összes kupon megtekintése <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

    </>
  );
}
