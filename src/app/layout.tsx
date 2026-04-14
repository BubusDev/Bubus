import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthSessionProvider } from "@/components/AuthSessionProvider";
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
  return (
    <html lang="hu">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
