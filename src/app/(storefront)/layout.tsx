import type { ReactNode } from "react";

import { AnnouncementBar } from "@/components/AnnouncementBar";
import { CategoryNav } from "@/components/CategoryNav";
import { Header } from "@/components/Header";
import { RouteAwareSiteFooter } from "@/components/RouteAwareSiteFooter";
import { getHeaderCounts } from "@/lib/account";
import { getActiveAnnouncementBar } from "@/lib/announcement-bar";
import { getHeaderUser } from "@/lib/auth";
import { getNavigationCategories } from "@/lib/products";
import { getVisibleSpecialties } from "@/lib/specialty-navigation";

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getHeaderUser();
  const [counts, announcement, navigationCategories, specialtyItems] = await Promise.all([
    getHeaderCounts(user?.id),
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
        navigationCategories={navigationCategories}
        specialtyItems={specialtyItems}
      />
      <CategoryNav navigationCategories={navigationCategories} specialtyItems={specialtyItems} />
      {children}
      <RouteAwareSiteFooter />
    </>
  );
}
