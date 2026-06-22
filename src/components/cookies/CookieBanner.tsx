"use client";

import Link from "next/link";
import { Cookie } from "lucide-react";
import { usePathname } from "next/navigation";

import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";

export function CookieBanner() {
  const { needsBanner, setConsent, openSettings } = useCookieConsent();
  const pathname = usePathname();
  const isActionHeavyRoute =
    pathname === "/cart" ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/order-status") ||
    pathname.startsWith("/product/");

  if (!needsBanner) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className={`fixed left-3 right-3 z-[120] max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-xl border border-[#f0d6e1] bg-white p-3.5 shadow-[0_18px_48px_rgba(77,39,65,0.16)] sm:left-auto sm:right-4 sm:w-[min(460px,calc(100%-2rem))] sm:p-4 ${
        isActionHeavyRoute ? "top-3 sm:bottom-4 sm:top-auto" : "bottom-3 sm:bottom-4"
      }`}
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#fff2f7] sm:flex">
          <Cookie className="h-5 w-5 text-[#d95587]" aria-hidden="true" />
        </div>
        <div>
          <h2
            id="cookie-banner-title"
            className="font-[family:var(--font-display)] text-[1.2rem] leading-tight text-[#2f1a27] sm:text-[1.35rem]"
          >
            Sütiket használunk
          </h2>
          <p id="cookie-banner-desc" className="mt-1.5 text-xs leading-5 text-[#69485a] sm:text-sm sm:leading-6">
            A szükséges sütik mindig aktívak. A statisztikai és marketing sütiket csak hozzájárulással
            használjuk. Részletek:{" "}
            <Link href="/cookies" className="underline underline-offset-2 hover:no-underline">
              cookie tájékoztatóban
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setConsent({ essential: true, statistics: false, marketing: false })}
          className="rounded-md border border-[#d8beca] px-3 py-2.5 text-sm font-medium text-[#432431] transition hover:bg-[#fff7fa] focus:outline-none focus:ring-2 focus:ring-[#d95587] focus:ring-offset-2"
        >
          Csak szükséges
        </button>
        <button
          type="button"
          onClick={openSettings}
          className="rounded-md px-3 py-2.5 text-sm font-medium text-[#6e5260] transition hover:bg-[#faf5f7] focus:outline-none focus:ring-2 focus:ring-[#d95587] focus:ring-offset-2"
        >
          Beállítások
        </button>
        <button
          type="button"
          onClick={() => setConsent({ essential: true, statistics: true, marketing: true })}
          className="col-span-2 rounded-md border border-[#d95587] bg-[#d95587] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#c54879] focus:outline-none focus:ring-2 focus:ring-[#d95587] focus:ring-offset-2 sm:col-span-1"
        >
          Összes elfogadása
        </button>
      </div>
    </div>
  );
}
