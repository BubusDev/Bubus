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
      className="sticky top-0 z-40 flex items-center px-6 py-3"
      style={{
        borderBottom: "1px solid #e8e5e0",
        background: "white",
      }}
    >
      <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="h-3 w-3 flex-shrink-0 text-[#bbb]" />
              )}
              {isLast || !crumb.href ? (
                <span className="font-medium text-[#1a1a1a]">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-[#888] transition hover:text-[#1a1a1a]"
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
