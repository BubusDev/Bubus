"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronRight, Menu } from "lucide-react";

type Crumb = { label: string; href?: string };

function buildBreadcrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ label: "Admin", href: "/admin" }];

  const labelMap: Record<string, string> = {
    admin: "Admin",
    products: "Termékek",
    new: "Új termék",
    edit: "Szerkesztés",
    archive: "Archívum",
    special: "Special Edition",
    "special-edition": "Special Edition",
    orders: "Rendelések",
    returns: "Visszaküldések",
    activity: "Aktivitás",
    content: "Tartalom",
    announcement: "Üzenetsáv",
    stones: "Kövek",
    specialties: "Különlegességek menü",
    settings: "Beállítások",
  };

  let href = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    href += `/${seg}`;

    if (i === 0) continue; // skip "admin" — already in crumbs

    const isLast = i === segments.length - 1;
    const label = labelMap[seg] ?? seg;
    crumbs.push(isLast ? { label } : { label, href });
  }

  return crumbs;
}

type AdminHeaderProps = {
  onMenuClick?: () => void;
};

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const crumbs = buildBreadcrumbs(pathname);

  return (
    <header
      className="sticky top-0 z-40 flex min-w-0 items-center justify-between gap-3 border-b border-[var(--admin-line-100)] bg-[rgba(255,255,255,0.94)] px-4 py-3 backdrop-blur-xl sm:px-6"
    >
      <button
        type="button"
        className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center border border-[var(--admin-line-100)] bg-white text-[var(--admin-ink-700)] transition hover:border-[var(--admin-line-200)] hover:text-[var(--admin-ink-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(63,122,210,0.22)] lg:hidden"
        aria-label="Admin menü megnyitása"
        aria-controls="admin-mobile-sidebar"
        onClick={onMenuClick}
      >
        <Menu className="h-4 w-4" />
      </button>

      <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden text-sm" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          const hideOnSmall = i > 0 && !isLast;
          return (
            <span
              key={i}
              className={`${hideOnSmall ? "hidden sm:flex" : "flex"} min-w-0 items-center gap-1`}
            >
              {i > 0 && (
                <ChevronRight className="h-3 w-3 flex-shrink-0 text-[var(--admin-ink-500)]" />
              )}
              {isLast || !crumb.href ? (
                <span className="min-w-0 truncate font-medium text-[var(--admin-ink-900)]">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="min-w-0 truncate text-[var(--admin-ink-500)] transition hover:text-[var(--admin-blue-700)]"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      <Link
        href="/"
        className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center gap-2 border border-[var(--admin-line-100)] text-xs font-medium text-[var(--admin-ink-700)] transition hover:border-[var(--admin-line-200)] hover:text-[var(--admin-ink-900)] sm:w-auto sm:px-3"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only">Vissza a webshophoz</span>
      </Link>
    </header>
  );
}
