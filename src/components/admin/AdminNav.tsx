"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  Package,
  Settings,
} from "lucide-react";

const mainNav = [
  { label: "Áttekintés", href: "/admin", icon: LayoutDashboard },
  { label: "Termékek", href: "/admin/products", icon: Package },
  { label: "Tartalom", href: "/admin/content", icon: FileText },
  { label: "Beállítások", href: "/admin/settings", icon: Settings },
];

const productSubNav = [
  { label: "Összes termék", href: "/admin/products" },
  { label: "Új termék", href: "/admin/products/new" },
  { label: "Archívum", href: "/admin/products/archive" },
  { label: "Special Edition", href: "/admin/products/special" },
];

const contentSubNav = [
  { label: "Üzenetsáv", href: "/admin/content/announcement" },
  { label: "Kövek szerkesztő", href: "/admin/content/stones" },
  { label: "Különlegességek menü", href: "/admin/content/specialties" },
];

export function AdminNav() {
  const pathname = usePathname();

  const isProductsSection =
    pathname.startsWith("/admin/products");
  const isContentSection =
    pathname.startsWith("/admin/content");

  const subNav = isProductsSection
    ? productSubNav
    : isContentSection
      ? contentSubNav
      : null;

  const isMainActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/products") return isProductsSection;
    if (href === "/admin/content") return isContentSection;
    return pathname.startsWith(href);
  };

  const isSubActive = (href: string) => {
    if (href === "/admin/products") return pathname === "/admin/products";
    return pathname.startsWith(href);
  };

  return (
    <div className="border-b border-[var(--admin-line-100)]">
      <nav className="flex flex-wrap gap-1.5 px-5 py-3 sm:px-8">
        {mainNav.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`admin-tab admin-control-md font-medium ${isMainActive(href) ? "admin-tab-active" : ""}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Contextual sub-nav */}
      {subNav && (
        <nav className="flex flex-wrap gap-1.5 border-t border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] px-5 py-2.5 sm:px-8">
          {subNav.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`admin-filter-chip admin-control-sm font-medium ${isSubActive(href) ? "admin-filter-chip-soft-active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
