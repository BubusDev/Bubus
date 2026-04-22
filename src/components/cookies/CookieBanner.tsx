"use client";

import Link from "next/link";
import { Cookie } from "lucide-react";

import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";

export function CookieBanner() {
  const { needsBanner, setConsent, openSettings } = useCookieConsent();

  if (!needsBanner) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="fixed bottom-4 left-1/2 z-[120] w-[calc(100%-2rem)] max-w-[640px] -translate-x-1/2 rounded-2xl border border-[#f4d5e1] border-t-4 border-t-[#ec6f9e] bg-white p-6 shadow-[0_28px_70px_rgba(77,39,65,0.18)] md:p-7"
    >
      <div className="mb-5 flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#fff2f7]">
          <Cookie className="h-5 w-5 text-[#d95587]" aria-hidden="true" />
        </div>
        <div>
          <h2
            id="cookie-banner-title"
            className="font-[family:var(--font-display)] text-[1.45rem] leading-tight text-[#2f1a27]"
          >
            Sütiket használunk
          </h2>
          <p id="cookie-banner-desc" className="mt-2 text-sm leading-6 text-[#69485a]">
            Az oldal működéséhez szükséges sütiket mindig használjuk. A statisztikai és marketing célú
            sütikhez az Ön előzetes hozzájárulása szükséges. A részleteket a{" "}
            <Link href="/cookies" className="underline underline-offset-2 hover:no-underline">
              cookie tájékoztatóban
            </Link>{" "}
            találja.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 md:flex-row">
        <button
          type="button"
          onClick={() => setConsent({ essential: true, statistics: false, marketing: false })}
          className="flex-1 rounded-full border border-[#d8beca] px-5 py-3 text-sm font-medium text-[#432431] transition hover:bg-[#fff7fa] focus:outline-none focus:ring-2 focus:ring-[#d95587] focus:ring-offset-2"
        >
          Csak szükséges
        </button>
        <button
          type="button"
          onClick={openSettings}
          className="flex-1 rounded-full px-5 py-3 text-sm font-medium text-[#6e5260] transition hover:bg-[#faf5f7] focus:outline-none focus:ring-2 focus:ring-[#d95587] focus:ring-offset-2"
        >
          Beállítások
        </button>
        <button
          type="button"
          onClick={() => setConsent({ essential: true, statistics: true, marketing: true })}
          className="flex-1 rounded-full border border-[#d95587] bg-[#d95587] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c54879] focus:outline-none focus:ring-2 focus:ring-[#d95587] focus:ring-offset-2"
        >
          Elfogadom az összeset
        </button>
      </div>
    </div>
  );
}
