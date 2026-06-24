import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { cookies } from "next/headers";

import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import { LANGUAGE_COOKIE_NAME, validateSupportedLanguage } from "@/lib/international";
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
  const cookieStore = await cookies();
  const language = validateSupportedLanguage(cookieStore.get(LANGUAGE_COOKIE_NAME)?.value);

  return (
    <html lang={language} className={`${sans.variable} ${serif.variable}`}>
      <body className={sans.className}>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
