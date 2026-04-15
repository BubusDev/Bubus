"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LogOut,
  Settings,
  ShoppingBag,
  TicketPercent,
  User,
  type LucideIcon,
} from "lucide-react";

type AccountNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

const accountNavItems: AccountNavItem[] = [
  {
    label: "Profil",
    href: "/profile",
    icon: User,
    match: (pathname) => pathname === "/profile",
  },
  {
    label: "Rendeléseim",
    href: "/orders",
    icon: ShoppingBag,
    match: (pathname) => pathname.startsWith("/orders"),
  },
  {
    label: "Kedvencek",
    href: "/favourites",
    icon: Heart,
    match: (pathname) => pathname === "/favourites",
  },
  {
    label: "Kuponjaim",
    href: "/coupons",
    icon: TicketPercent,
    match: (pathname) => pathname === "/coupons",
  },
  {
    label: "Beállítások",
    href: "/settings",
    icon: Settings,
    match: (pathname) => pathname === "/settings" || pathname === "/account",
  },
];

export function AccountNavigation() {
  const pathname = usePathname();

  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <nav
        aria-label="Fiók navigáció"
        className="rounded-lg border border-[#e8e2dd] bg-white/95 p-2 shadow-[0_18px_42px_rgba(45,31,40,0.06)]"
      >
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
          {accountNavItems.map(({ href, icon: Icon, label, match }) => {
            const isActive = match(pathname);

            return (
              <Link
                key={label}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`group flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#2d1f28] text-white shadow-sm"
                    : "text-[#62545c] hover:bg-[#faf8f7] hover:text-[#2d1f28]"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition ${
                    isActive
                      ? "border-white/15 bg-white/12 text-white"
                      : "border-[#eee7ea] bg-white text-[#8e687b] group-hover:border-[#d8c7cf] group-hover:text-[#4d2741]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-2 border-t border-[#eee8e4] pt-2">
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="group flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-[#7c626f] transition hover:bg-[#faf8f7] hover:text-[#2d1f28]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#eee7ea] bg-white text-[#9a7b8b] transition group-hover:border-[#d8c7cf] group-hover:text-[#4d2741]">
                <LogOut className="h-4 w-4" />
              </span>
              <span>Kijelentkezés</span>
            </button>
          </form>
        </div>
      </nav>
    </aside>
  );
}
