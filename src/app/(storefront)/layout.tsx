import type { ReactNode } from "react";

import { AnnouncementBar } from "@/components/AnnouncementBar";
import { CategoryNav } from "@/components/CategoryNav";
import { Header } from "@/components/Header";
import { RouteAwareSiteFooter } from "@/components/RouteAwareSiteFooter";
import { getHeaderCounts } from "@/lib/account";
import { getActiveAnnouncementBar } from "@/lib/announcement-bar";
import { getHeaderUser } from "@/lib/auth";

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getHeaderUser();
  const [counts, announcement] = await Promise.all([
    getHeaderCounts(user?.id),
    getActiveAnnouncementBar(),
  ]);

  return (
    <>
      <AnnouncementBar announcement={announcement} />
      <Header
        user={user ?? undefined}
        favouritesCount={counts.favourites}
        cartCount={counts.cartItems}
      />
      <CategoryNav />
      {children}
      <RouteAwareSiteFooter />
    </>
  );
}
