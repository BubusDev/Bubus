import type { Metadata } from "next";
import { Mail, AtSign, Clock } from "lucide-react";

import { AmbientBlobs } from "@/components/AmbientBlobs";
import { ContactForm } from "@/components/contact/ContactForm";
import { BackToHome } from "@/components/BackToHome";
import { getAlternateLanguages, getLocalizedPath } from "@/lib/locale-routing";
import { getRequestLocale } from "@/lib/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getRequestLocale();
  const canonicalPath = getLocalizedPath("/contact", language);

  return {
    title: language === "en" ? "Contact — Chicks Jewelry" : "Kapcsolat — Chicks Jewelry",
    description: language === "en"
      ? "Contact Chicks Jewelry about orders, custom pieces or any other question. We usually reply within 1-2 business days."
      : "Írj nekünk! Szívesen válaszolunk rendelési, egyedi darab és egyéb kérdésekre 1-2 munkanapon belül.",
    alternates: {
      canonical: canonicalPath,
      languages: getAlternateLanguages("/contact"),
    },
    openGraph: {
      title: language === "en" ? "Contact — Chicks Jewelry" : "Kapcsolat — Chicks Jewelry",
      description: language === "en"
        ? "Questions about orders or custom pieces? Send us a message."
        : "Rendelési vagy egyedi darab kérdésed van? Írj nekünk.",
      url: canonicalPath,
    },
  };
}

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

export default async function ContactPage() {
  const language = await getRequestLocale();
  const localizedContactCards = contactCards.map((card) => {
    if (language !== "en") return card;
    if (card.label === "Azonosító") return { ...card, label: "Handle" };
    if (card.label === "Válaszidő") return { ...card, label: "Response time", value: "1-2 business days" };
    return card;
  });

  return (
    <>
      <AmbientBlobs opacity={0.25} />

      <main className="mx-auto max-w-[1160px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <BackToHome />
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#af7795]">
            {language === "en" ? "Contact" : "Kapcsolat"}
          </p>
          <h1 className="mt-3 font-[family:var(--font-display)] text-[2.4rem] leading-[1.05] tracking-[-0.04em] text-[#4d2741] sm:text-[3rem]">
            {language === "en" ? "Write to us, " : "Írj nekünk, "}
            <span
              style={{
                background: "linear-gradient(135deg, #c45a85 0%, #e07a70 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {language === "en" ? "we are happy to help." : "szívesen válaszolunk."}
            </span>
          </h1>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
          {/* Left — info */}
          <div className="space-y-5">
            <div className="space-y-3">
              {localizedContactCards.map(({ Icon, label, value, href }) => (
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
                <strong className="text-[#4d2741]">
                  {language === "en" ? "Custom order?" : "Egyedi rendelés?"}
                </strong>{" "}
                {language === "en"
                  ? "Mention it in your message. Custom bracelets, necklaces and rings with selected stones start with a personal consultation."
                  : "Jelezd az üzenetben! Egyedi karkötők, nyakláncok és gyűrűk egyedi kövekkel — minden megrendelés személyes egyeztetéssel kezdődik."}
              </p>
            </div>

            <p className="text-xs leading-7 text-[#b08898]">
              {language === "en"
                ? "You can also find the Chicks Jewelry account by the handle above."
                : "Ha azonosító alapján keresnél minket, itt is megtalálod a Chicks Jewelry fiókot."}
            </p>
          </div>

          {/* Right — form */}
          <ContactForm />
        </div>
      </main>
    </>
  );
}
