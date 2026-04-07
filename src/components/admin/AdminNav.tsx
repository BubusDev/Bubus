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
    <div className="border-b border-[#f0dbe6]">
      {/* Main nav */}
      <nav className="flex flex-wrap gap-1.5 px-5 py-3 sm:px-8">
        {mainNav.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              isMainActive(href)
                ? "bg-gradient-to-r from-[#c45a85] to-[#9b3d6e] text-white shadow-sm"
                : "border border-[#ecd3e3] bg-white/90 text-[#6b425a] hover:border-[#e9b6d0] hover:bg-white"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Contextual sub-nav */}
      {subNav && (
        <nav className="flex flex-wrap gap-1.5 border-t border-[#f8edf3] bg-[#fff5f8] px-5 py-2.5 sm:px-8">
          {subNav.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                isSubActive(href)
                  ? "border-b-2 border-[#c45a85] bg-white text-[#c45a85]"
                  : "text-[#9a6878] hover:text-[#4d2741]"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
