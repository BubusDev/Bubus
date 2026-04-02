import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AnnouncementBar } from "@/components/AnnouncementBar";
import { CategoryNav } from "@/components/CategoryNav";
import { Header } from "@/components/Header";
import { getHeaderCounts } from "@/lib/account";
import { getActiveAnnouncementBar } from "@/lib/announcement-bar";
import { getHeaderUser } from "@/lib/auth";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteName,
  description: siteDescription,
};

export default async function RootLayout({
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
    <html lang="hu">
      <body>
        <AnnouncementBar announcement={announcement} />
        <Header
          user={user ?? undefined}
          favouritesCount={counts.favourites}
          cartCount={counts.cartItems}
        />
        <CategoryNav />
        {children}
      </body>
    </html>
  );
}
