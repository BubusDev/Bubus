"use client";

import { useEffect } from "react";
import Script from "next/script";

import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

function updateGoogleConsent(allowStatistics: boolean, allowMarketing: boolean) {
  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("consent", "update", {
    analytics_storage: allowStatistics ? "granted" : "denied",
    ad_storage: allowMarketing ? "granted" : "denied",
    ad_user_data: allowMarketing ? "granted" : "denied",
    ad_personalization: allowMarketing ? "granted" : "denied",
  });
}

export function TrackingScripts() {
  const { consent } = useCookieConsent();

  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim() ?? "";
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() ?? "";
  const googleTagId = gaId || googleAdsId;
  const allowStatistics = Boolean(gaId) && consent?.state.statistics === true;
  const allowMarketing = Boolean(googleAdsId) && consent?.state.marketing === true;
  const shouldLoadGoogle = Boolean(googleTagId) && (allowStatistics || allowMarketing);

  useEffect(() => {
    updateGoogleConsent(allowStatistics, allowMarketing);

    if (gaId) {
      window[`ga-disable-${gaId}`] = !allowStatistics;
    }
  }, [allowMarketing, allowStatistics, gaId]);

  if (!shouldLoadGoogle || !googleTagId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
        strategy="afterInteractive"
      />
      <Script id="google-tracking-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          ${gaId ? `window['ga-disable-${gaId}'] = ${allowStatistics ? "false" : "true"};` : ""}
          ${allowStatistics ? `gtag('config', '${gaId}', { anonymize_ip: true });` : ""}
          ${allowMarketing ? `gtag('config', '${googleAdsId}');` : ""}
        `}
      </Script>
    </>
  );
}
