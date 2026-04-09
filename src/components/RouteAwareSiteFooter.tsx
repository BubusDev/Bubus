"use client";

import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/SiteFooter";

export function RouteAwareSiteFooter() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return null;
  }

  return <SiteFooter showCategoryDiscovery={pathname === "/"} />;
}
