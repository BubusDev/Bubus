"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  Archive,
  Sparkles,
  ShoppingCart,
  Clock,
  Truck,
  Gem,
  Megaphone,
  Menu,
  Image,
  Settings,
  User,
  RotateCcw,
  Activity,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Áttekintés",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
      { label: "Aktivitás", href: "/admin/activity", icon: Activity, exact: true },
    ],
  },
  {
    label: "Termékek",
    items: [
      { label: "Összes termék", href: "/admin/products", icon: Package, exact: true },
      { label: "Új termék", href: "/admin/products/new", icon: PackagePlus },
      { label: "Archívum", href: "/admin/products/archive", icon: Archive },
      { label: "Special Edition", href: "/admin/special-edition", icon: Sparkles },
    ],
  },
  {
    label: "Rendelések",
    items: [
      { label: "Összes rendelés", href: "/admin/orders", icon: ShoppingCart, exact: true },
      { label: "Beérkezett", href: "/admin/orders?status=received", icon: Clock },
      { label: "Címkézés", href: "/admin/orders?status=label_ready", icon: Package },
      { label: "Csomagolás", href: "/admin/orders?status=packed", icon: Package },
      { label: "Feldolgozás alatt", href: "/admin/orders?status=in_production", icon: Clock },
      { label: "Feladva", href: "/admin/orders?status=shipped", icon: Truck },
      { label: "Lezárva", href: "/admin/orders?status=closed", icon: ShoppingCart },
      { label: "Problémás", href: "/admin/orders?status=exceptions", icon: RotateCcw },
      { label: "Visszaküldések", href: "/admin/returns", icon: RotateCcw, exact: true },
    ],
  },
  {
    label: "Tartalom",
    items: [
      { label: "Kövek", href: "/admin/content/stones", icon: Gem },
      { label: "Üzenetsáv", href: "/admin/content/announcement", icon: Megaphone },
      { label: "Különlegességek menü", href: "/admin/content/specialties", icon: Menu },
      { label: "Kampány bannerek", href: "/admin/special-edition", icon: Image },
    ],
  },
  {
    label: "Beállítások",
    items: [
      { label: "Általános", href: "/admin/settings", icon: Settings },
      { label: "Profil", href: "/profile", icon: User },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href.split("?")[0]);
  }

  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 flex w-56 flex-col"
      style={{
        background: "#f2f5f9",
        borderRight: "1px solid var(--admin-line-100)",
      }}
    >
      <div
        className="flex flex-col px-5 pb-4 pt-5"
        style={{ borderBottom: "1px solid var(--admin-line-100)" }}
      >
        <span
          className="text-[9px] font-semibold uppercase tracking-[.28em]"
          style={{ color: "var(--admin-ink-500)" }}
        >
          Admin felület
        </span>
        <span
          className="mt-1 font-[family:var(--font-body)] text-[1rem] font-semibold leading-tight tracking-[-0.01em] text-[var(--admin-ink-900)]"
        >
          Chicks Jewelry
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            <p
              className="px-5 pb-1.5 pt-4 text-[9px] uppercase tracking-[.18em]"
              style={{ color: "var(--admin-ink-500)" }}
            >
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className="flex items-center gap-2.5 px-5 py-2 text-[13px] transition-all duration-150"
                  style={{
                    color: active ? "var(--admin-ink-900)" : "var(--admin-ink-700)",
                    background: active ? "rgba(42,99,181,0.08)" : "transparent",
                    borderLeft: `2px solid ${active ? "#2a63b5" : "transparent"}`,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = "var(--admin-ink-900)";
                      e.currentTarget.style.background = "rgba(255,255,255,.65)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = "var(--admin-ink-700)";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-3 text-[11px]"
        style={{ borderTop: "1px solid var(--admin-line-100)", color: "var(--admin-ink-500)" }}
      >
        <Link
          href="/"
          className="transition hover:text-[var(--admin-ink-900)]"
          style={{ color: "var(--admin-ink-500)" }}
        >
          ← Vissza a webshophoz
        </Link>
      </div>
    </aside>
  );
}
