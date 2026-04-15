import {
  Heart,
  LayoutDashboard,
  LogIn,
  type LucideIcon,
  Settings,
  ShoppingBag,
  TicketPercent,
  User,
} from "lucide-react";

import type { UserRole } from "@/lib/catalog";

export type HeaderUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type ProfileMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type HeaderNavItem = {
  label: string;
  href: string;
};

export const headerPrimaryNavItems: HeaderNavItem[] = [];

export const headerSecondaryNavItems: HeaderNavItem[] = [
  { label: "Adatkezelés", href: "/privacy" },
  { label: "Cookiek", href: "/cookies" },
  { label: "ÁSZF", href: "/terms" },
];

export const guestMenuItems: ProfileMenuItem[] = [
  { label: "Belépés", href: "/sign-in", icon: LogIn },
];

export const profileMenuByRole: Record<UserRole, ProfileMenuItem[]> = {
  user: [
    { label: "Profil", href: "/profile", icon: User },
    { label: "Kuponjaim", href: "/profile#kuponjaim", icon: TicketPercent },
    { label: "Beállítások", href: "/settings", icon: Settings },
    { label: "Rendeléseim", href: "/orders", icon: ShoppingBag },
    { label: "Kedvencek", href: "/favourites", icon: Heart },
  ],
  admin: [
    { label: "Profil", href: "/profile", icon: User },
    { label: "Kuponjaim", href: "/profile#kuponjaim", icon: TicketPercent },
    { label: "Beállítások", href: "/settings", icon: Settings },
    { label: "Admin felület", href: "/admin", icon: LayoutDashboard },
  ],
};
