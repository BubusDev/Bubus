import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Inter, Playfair_Display } from "next/font/google";

import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import { getRequestLocale } from "@/lib/request-locale";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

import "./globals.css";

const sans = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-ui-sans",
  display: "swap",
});

const serif = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display-serif",
  display: "swap",
});

const editorialDisplay = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-editorial-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteName,
  description: siteDescription,
  icons: {
    icon: "/images/book-hands.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const language = await getRequestLocale();

  return (
    <html lang={language} className={`${sans.variable} ${serif.variable} ${editorialDisplay.variable}`}>
      <body className={sans.className}>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
