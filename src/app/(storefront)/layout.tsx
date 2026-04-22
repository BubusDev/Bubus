import type { ReactNode } from "react";
import { cookies } from "next/headers";
import Script from "next/script";

import { AnnouncementBar } from "@/components/AnnouncementBar";
import { CategoryNav } from "@/components/CategoryNav";
import { Header } from "@/components/Header";
import { RouteAwareSiteFooter } from "@/components/RouteAwareSiteFooter";
import { CookieBanner } from "@/components/cookies/CookieBanner";
import { CookieConsentProvider } from "@/components/cookies/CookieConsentProvider";
import { CookieSettingsPanel } from "@/components/cookies/CookieSettingsPanel";
import { TrackingScripts } from "@/components/cookies/TrackingScripts";
import { getHeaderCounts, getHeaderCouponDropdownPreview } from "@/lib/account";
import { getActiveAnnouncementBar } from "@/lib/announcement-bar";
import { getHeaderUser } from "@/lib/auth";
import { CONSENT_COOKIE_NAME, parseStoredConsentValue } from "@/lib/cookie-consent-client";
import { getNavigationCategories } from "@/lib/products-server";
import { getVisibleSpecialties } from "@/lib/specialty-navigation";

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = await cookies();
  const user = await getHeaderUser();
  const [counts, couponPreview, announcement, navigationCategories, specialtyItems] = await Promise.all([
    getHeaderCounts(user?.id),
    getHeaderCouponDropdownPreview(user?.id),
    getActiveAnnouncementBar(),
    getNavigationCategories(),
    getVisibleSpecialties(),
  ]);
  const initialConsent = parseStoredConsentValue(cookieStore.get(CONSENT_COOKIE_NAME)?.value ?? null);
  const hasGoogleServices = Boolean(
    process.env.NEXT_PUBLIC_GA_ID?.trim() || process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim(),
  );

  return (
    <>
      {hasGoogleServices ? (
        <Script id="google-consent-mode-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              functionality_storage: 'granted',
              security_storage: 'granted',
              wait_for_update: 500
            });
          `}
        </Script>
      ) : null}

      <CookieConsentProvider initialConsent={initialConsent}>
        <TrackingScripts />
        <div className="storefront-shell">
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
        </div>
        <CookieBanner />
        <CookieSettingsPanel />
      </CookieConsentProvider>
    </>
  );
}
