import type { ReactNode } from "react";

import { AnnouncementBar } from "@/components/AnnouncementBar";
import { CategoryNav } from "@/components/CategoryNav";
import { Header } from "@/components/Header";
import { RouteAwareSiteFooter } from "@/components/RouteAwareSiteFooter";
import { getHeaderCounts, getHeaderCouponDropdownPreview } from "@/lib/account";
import { getActiveAnnouncementBar } from "@/lib/announcement-bar";
import { getHeaderUser } from "@/lib/auth";
import { getNavigationCategories } from "@/lib/products-server";
import { getVisibleSpecialties } from "@/lib/specialty-navigation";

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getHeaderUser();
  const [counts, couponPreview, announcement, navigationCategories, specialtyItems] = await Promise.all([
    getHeaderCounts(user?.id),
    getHeaderCouponDropdownPreview(user?.id),
    getActiveAnnouncementBar(),
    getNavigationCategories(),
    getVisibleSpecialties(),
  ]);

  return (
    <>
      <AnnouncementBar announcement={announcement} />
      <Header
        user={user ?? undefined}
        favouritesCount={counts.favourites}
        cartCount={counts.cartItems}
        couponPreview={couponPreview}
        navigationCategories={navigationCategories}
        specialtyItems={specialtyItems}
      />
      <CategoryNav navigationCategories={navigationCategories} specialtyItems={specialtyItems} />
      {children}
      <RouteAwareSiteFooter />
    </>
  );
}
