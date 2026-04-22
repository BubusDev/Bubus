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
      className="nav-icon-btn group relative inline-flex h-10 w-10 items-center justify-center text-[#5f4a51] transition-colors duration-150 hover:text-[#9b3d6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b5c4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf8f5]"
    >
      <span className="transition-transform duration-200 group-hover:scale-105">
        {children}
      </span>

      {hasBadge ? (
        <span className="absolute -right-0.5 -top-0.5 flex min-h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full border border-[#fffdfb] bg-[#9b3d6e] px-1 text-[9px] font-semibold tracking-[0.08em] text-white shadow-[0_6px_14px_rgba(155,61,110,0.16)]">
          {badgeCount! > 9 ? "9+" : badgeCount}
        </span>
      ) : null}

      {/* underline dot */}
      <span className="absolute -bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-[#9b3d6e] transition-all duration-150 group-hover:w-5" />
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
      <header className="navbar-glass sticky top-0 z-50 w-full border-b border-[#eaded9] bg-[#fbf8f5]/95 hover:border-[#dfcdc7] hover:bg-[#fcf9f6]/98 focus-within:border-[#dfcdc7] focus-within:bg-[#fcf9f6]/98">
        <div className="mx-auto grid min-h-[72px] w-full max-w-[1500px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1 px-2.5 py-2.5 min-[390px]:px-3 sm:min-h-[80px] sm:gap-2 sm:px-6 lg:min-h-[84px] lg:grid-cols-[1fr_auto_1fr] lg:px-8">

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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#e4d6d0] bg-[#fffdfb] text-[#5f4a51] transition duration-150 hover:border-[#d7c3bc] hover:text-[#34262b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0aeba] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf8f5] sm:h-11 sm:w-11 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* ── COL 2: logo (center) ── */}
          <Link
            href="/"
            className="flex min-w-0 max-w-full items-center justify-self-center text-center transition duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b5c4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf8f5]"
          >
            <div className="flex min-w-0 max-w-full flex-col items-center leading-none">
              <span className="max-w-full truncate text-[0.5rem] font-semibold uppercase tracking-[0.16em] text-[#7f485c] min-[390px]:text-[0.56rem] min-[390px]:tracking-[0.24em] sm:text-[0.68rem] sm:tracking-[0.32em]">
                Boutique ékszer
              </span>
              <span className="relative max-w-full truncate font-[family:var(--font-display)] text-[1.18rem] font-semibold tracking-normal text-[#9b3d6e] after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-6 after:bg-[#a8346a] min-[390px]:text-[1.42rem] sm:text-[2.1rem] lg:text-[2.28rem]">
                Chicks Jewelry
              </span>
            </div>
          </Link>

          {/* ── COL 3: mobile icons / desktop right nav ── */}
          <div className="flex justify-end">
            {/* Mobile: user icon + coupon icon + cart icon */}
            <div className="flex min-w-0 shrink-0 items-center justify-end gap-0 min-[390px]:gap-0.5 sm:gap-1.5 lg:hidden">
              {/* User icon → /account or /sign-in */}
              <Link
                href={user ? "/account" : "/sign-in"}
                aria-label={user ? "Fiókom" : "Belépés"}
                className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center text-[#5f4a51] transition hover:text-[#9b3d6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b5c4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf8f5] sm:h-10 sm:w-10"
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
                  className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center text-[#5f4a51] transition hover:text-[#9b3d6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b5c4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf8f5] sm:h-10 sm:w-10"
                >
                  <TicketPercent className="h-[1.1rem] w-[1.1rem]" />
                  {couponPreview.activeCoupons.length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex min-h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full border border-[#fffdfb] bg-[#9b3d6e] px-1 text-[9px] font-semibold tracking-[0.08em] text-white">
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
                className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center text-[#5f4a51] transition hover:text-[#9b3d6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b5c4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf8f5] sm:h-10 sm:w-10"
              >
                <ShoppingBag className="h-[1.1rem] w-[1.1rem]" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex min-h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full border border-[#fffdfb] bg-[#9b3d6e] px-1 text-[9px] font-semibold tracking-[0.08em] text-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop icon nav */}
            <nav
              aria-label="Hasznos navigáció"
              className="hidden items-center justify-end gap-1.5 lg:flex"
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

              <div className="mx-1 h-5 w-px bg-[#e4d6d0]" />

              {user && couponPreview ? (
                <div className="relative" ref={desktopCouponRef}>
                  <button
                    type="button"
                    aria-label="Kuponjaim"
                    aria-expanded={desktopCouponOpen}
                    onClick={() => setDesktopCouponOpen((o) => !o)}
                    className={`nav-icon-btn group relative inline-flex h-10 w-10 items-center justify-center text-[#5f4a51] transition-colors duration-150 hover:text-[#9b3d6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b5c4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf8f5] ${desktopCouponOpen ? "text-[#9b3d6e]" : ""}`}
                  >
                    <span className="transition-transform duration-200 group-hover:scale-105">
                      <TicketPercent className="h-[1.1rem] w-[1.1rem]" />
                    </span>
                    {couponPreview.activeCoupons.length > 0 && (
                      <span className="absolute right-[9px] top-[9px] h-2 w-2 rounded-full border border-[#fffdfb] bg-[#9b3d6e]" />
                    )}
                    <span className="absolute -bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-[#9b3d6e] transition-all duration-150 group-hover:w-5" />
                  </button>

                  {desktopCouponOpen ? (
                    <div className="dropdown-reveal absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-md border border-[#e4d6d0] bg-[#fffdfb] shadow-[0_18px_42px_rgba(57,39,47,0.10)]">
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
                          className="flex items-center gap-1 text-[11px] text-[#756269] no-underline transition hover:text-[#4a343d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0aeba]"
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
                  className="nav-icon-btn group relative inline-flex h-10 w-10 items-center justify-center text-[#5f4a51] transition-colors duration-150 hover:text-[#9b3d6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b5c4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf8f5]"
                >
                  <span className="transition-transform duration-200 group-hover:scale-105">
                    <User className="h-[1.1rem] w-[1.1rem]" />
                  </span>
                  <span className="absolute -bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-[#9b3d6e] transition-all duration-150 group-hover:w-5" />
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* ── FULL-SCREEN MOBILE MENU ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-[#fffdfb] lg:hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e7d9d5] px-5 py-4">
            <Link
              href="/"
              onClick={() => setMobileMenuPath(null)}
              className="flex flex-col leading-none"
            >
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-[#7f485c]">
                Boutique ékszer
              </span>
              <span
                className="font-[family:var(--font-display)] text-xl font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, #7f485c 0%, #5a3845 58%, #a97773 100%)",
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
              <X className="h-5 w-5 text-[#34262b]" strokeWidth={1.5} />
            </button>
          </div>

          {/* Primary nav links */}
          <nav className="px-5 py-2">
            {navigationCategories.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuPath(null)}
                className="flex items-center justify-between border-b border-[#eee4df] py-4 text-[15px] font-semibold uppercase tracking-[0.06em] text-[#4a343d] transition hover:text-[#7f485c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0aeba] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdfb]"
              >
                {label}
                <ChevronRight className="h-4 w-4 text-[#b8a7a9]" strokeWidth={1.5} />
              </Link>
            ))}

            <Link
              href="/gemstones"
              onClick={() => setMobileMenuPath(null)}
              className="flex items-center justify-between border-b border-[#eee4df] py-4 text-[15px] font-semibold uppercase tracking-[0.06em] text-[#4a343d] transition hover:text-[#7f485c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0aeba] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdfb]"
            >
              Drágakövek
              <ChevronRight className="h-4 w-4 text-[#b8a7a9]" strokeWidth={1.5} />
            </Link>

            {/* Specialty items */}
            {specialtyItems.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setSpecialtyOpen((o) => !o)}
                  className={`flex w-full items-center justify-between border-b border-[#eee4df] py-4 text-[15px] font-semibold uppercase tracking-[0.06em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0aeba] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdfb] ${
                    specialtyOpen ? "text-[#7f485c]" : "text-[#4a343d]"
                  }`}
                >
                  Különlegességek
                  <ChevronDown
                    className={`h-4 w-4 text-[#b8a7a9] transition-transform ${specialtyOpen ? "rotate-180" : ""}`}
                    strokeWidth={1.5}
                  />
                </button>
                {specialtyOpen &&
                  specialtyItems.map((item) => (
                    <Link
                      key={item.id}
                      href={getSpecialtyHref(item)}
                      onClick={() => setMobileMenuPath(null)}
                      className="flex min-w-0 items-center justify-between gap-3 border-b border-[#eee4df] py-3 pl-4 font-[family:var(--font-serif)] text-[16px] font-medium text-[#5b464e] transition hover:text-[#7f485c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0aeba] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdfb]"
                    >
                      <span className="min-w-0 break-words">{item.name}</span>
                      <ChevronRight
                        className="h-3.5 w-3.5 flex-none text-[#b8a7a9]"
                        strokeWidth={1.5}
                      />
                    </Link>
                  ))}
              </>
            )}
          </nav>

          {/* Secondary links */}
          <div className="mt-4 border-t border-[#e7d9d5] px-5 pb-6 pt-2">
            {headerSecondaryNavItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuPath(null)}
                className="block border-b border-[#eee4df] py-3 text-sm text-[#756269] transition hover:text-[#4a343d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0aeba] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdfb]"
              >
                {label}
              </Link>
            ))}
            {user ? (
              <Link
                href="/profile"
                onClick={() => setMobileMenuPath(null)}
                className="block border-b border-[#eee4df] py-3 text-sm text-[#756269] transition hover:text-[#4a343d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0aeba] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdfb]"
              >
                Profilom
              </Link>
            ) : (
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuPath(null)}
                className="block border-b border-[#eee4df] py-3 text-sm text-[#756269] transition hover:text-[#4a343d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0aeba] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdfb]"
              >
                Belépés
              </Link>
            )}
          </div>

          {/* Instagram bar */}
          <div className="mx-5 mb-8 border border-[#e7d9d5] bg-[#fbf8f5] p-4">
            <p className="mb-0.5 text-xs font-semibold text-[#7f485c]">
              @chicksjewelry
            </p>
            <p className="text-xs text-[#756269]">
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
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" style={{ animation: "mobile-panel-overlay 320ms cubic-bezier(0.22,1,0.36,1) both" }} />
          <div
            className="mobile-panel-reveal relative w-full max-h-[85vh] overflow-hidden rounded-b-2xl border-b border-[#e8e5e0] bg-white shadow-2xl"
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
                <X className="h-4 w-4 text-[#34262b]" strokeWidth={1.5} />
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
                  className="flex items-center gap-1 text-[11px] text-[#756269] no-underline transition hover:text-[#4a343d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0aeba]"
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
