import type { Metadata } from "next";
import { Mail, AtSign, Clock } from "lucide-react";

import { AmbientBlobs } from "@/components/AmbientBlobs";
import { ContactForm } from "@/components/contact/ContactForm";
import { BackToHome } from "@/components/BackToHome";

export const metadata: Metadata = {
  title: "Kapcsolat — Bubus",
  description: "Írj nekünk! Szívesen válaszolunk rendelési, egyedi darab és egyéb kérdésekre 1-2 munkanapon belül.",
};

const contactCards = [
  {
    Icon: Mail,
    label: "E-mail",
    value: "hello@bubus.hu",
    href: "mailto:hello@bubus.hu",
  },
  {
    Icon: AtSign,
    label: "Azonosító",
    value: "@bubus.ekszer",
    href: null,
  },
  {
    Icon: Clock,
    label: "Válaszidő",
    value: "1–2 munkanap",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <>
      <AmbientBlobs opacity={0.25} />

      <main className="mx-auto max-w-[1160px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <BackToHome />
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#af7795]">Kapcsolat</p>
          <h1 className="mt-3 font-[family:var(--font-display)] text-[2.4rem] leading-[1.05] tracking-[-0.04em] text-[#4d2741] sm:text-[3rem]">
            Írj nekünk,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #c45a85 0%, #e07a70 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              szívesen válaszolunk.
            </span>
          </h1>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
          {/* Left — info */}
          <div className="space-y-5">
            <div className="space-y-3">
              {contactCards.map(({ Icon, label, value, href }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 rounded-[1.8rem] bg-white p-5"
                  style={{ boxShadow: "0 2px 12px rgba(196,90,133,.07)" }}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#fff0f7]">
                    <Icon className="h-5 w-5 text-[#c45a85]" strokeWidth={1.6} />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#b08898]">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        className="mt-0.5 block text-sm font-medium text-[#4d2741] hover:text-[#c45a85] transition"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm font-medium text-[#4d2741]">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[1.8rem] border border-[#f2dde8] bg-[#fffbfd] p-5">
              <p className="text-sm leading-[1.9] text-[#7a5a6c]">
                <strong className="text-[#4d2741]">Egyedi rendelés?</strong> Jelezd az üzenetben!
                Egyedi karkötők, nyakláncok és gyűrűk egyedi kövekkel — minden megrendelés
                személyes egyeztetéssel kezdődik.
              </p>
            </div>

            <p className="text-xs leading-7 text-[#b08898]">
              Ha azonosító alapján keresnél minket, itt is megtalálod a Bubus fiókot.
            </p>
          </div>

          {/* Right — form */}
          <ContactForm />
        </div>
      </main>
    </>
  );
}
