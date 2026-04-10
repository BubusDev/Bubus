"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

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

export function AdminHeader() {
  const pathname = usePathname();
  const crumbs = buildBreadcrumbs(pathname);

  return (
    <header
      className="sticky top-0 z-40 flex items-center border-b border-[var(--admin-line-100)] bg-[rgba(255,255,255,0.94)] px-6 py-3 backdrop-blur-xl"
      style={{ boxShadow: "0 10px 30px rgba(18, 31, 58, 0.04)" }}
    >
      <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="h-3 w-3 flex-shrink-0 text-[var(--admin-ink-500)]" />
              )}
              {isLast || !crumb.href ? (
                <span className="font-medium text-[var(--admin-ink-900)]">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-[var(--admin-ink-500)] transition hover:text-[var(--admin-blue-700)]"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </header>
  );
}
