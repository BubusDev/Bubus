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
        background: "linear-gradient(180deg, #12213a 0%, #0d1729 100%)",
        borderRight: "1px solid rgba(202, 216, 239, 0.14)",
      }}
    >
      {/* Logo */}
      <div
        className="flex flex-col px-5 pb-4 pt-5"
        style={{ borderBottom: "1px solid rgba(202, 216, 239, 0.12)" }}
      >
        <span
          className="text-[9px] font-semibold uppercase tracking-[.28em]"
          style={{ color: "rgba(198, 212, 235, 0.6)" }}
        >
          Admin felület
        </span>
        <span
          className="mt-1 font-[family:var(--font-display)] text-[1.1rem] leading-tight tracking-[-0.01em] text-white"
        >
          Chicks Jewelry
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            <p
              className="px-5 pb-1.5 pt-4 text-[9px] uppercase tracking-[.18em]"
              style={{ color: "rgba(198, 212, 235, 0.56)" }}
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
                    color: active ? "#fff" : "rgba(213, 223, 239, 0.76)",
                    background: active ? "linear-gradient(90deg, rgba(63,122,210,0.28), rgba(63,122,210,0.08))" : "transparent",
                    borderLeft: `2px solid ${active ? "#4d86dc" : "transparent"}`,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.background = "rgba(255,255,255,.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = "#aaa";
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
        style={{ borderTop: "1px solid rgba(202, 216, 239, 0.12)", color: "rgba(198, 212, 235, 0.52)" }}
      >
        <Link
          href="/"
          className="transition hover:text-white"
          style={{ color: "rgba(198, 212, 235, 0.52)" }}
        >
          ← Vissza a webshophoz
        </Link>
      </div>
    </aside>
  );
}
