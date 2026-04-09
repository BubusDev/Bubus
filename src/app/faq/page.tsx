import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kérdések és válaszok — Chicks Jewelry",
  description: "Összegyűjtöttük a leggyakrabban felmerülő kérdéseket ékszereinkről, rendelésről, szállításról és visszaküldésről.",
};

const faqs: { q: string; a: string }[] = [
  {
    q: "Milyen féldrágaköveket használtok?",
    a: "Rózsakvarc, ametiszt, citrin, holdkő, obszidián, türkiz, labradorit és mások — szezonálisan változó készlettel. Minden kőnél feltüntetjük a típusát és természetes voltát.",
  },
  {
    q: "Természetesek a kövek?",
    a: "Igen, minden féldrágakövünk természetes, nem szintetikus. A kövek kisebb természetes elszíneződései, zárványai az autenticitás jelei — ezek nem hibák.",
  },
  {
    q: "Mennyi idő alatt készül el egy egyedi rendelés?",
    a: "Általában 2–3 hét, az alapanyag elérhetőségétől függően. Az egyedi megrendelések minden esetben személyes egyeztetéssel indulnak — írj nekünk a kapcsolat oldalon.",
  },
  {
    q: "Készítetek páros ékszereket?",
    a: "Igen, páros karkötők és gyűrűk egyedi rendelésre elérhetők. Különleges ajándék párnak, barátoknak vagy anyának és lányának — minden esetben személyes egyeztetéssel.",
  },
  {
    q: "Hogyan gondozzam az ékszeremet?",
    a: "Kerüld a vízzel, parfümmel és vegyi anyagokkal való érintkezést. Puha kendővel töröld le használat után. Tároláskor tedd vissza a Chicks Jewelry dobozba, fénytől védett helyre.",
  },
  {
    q: "Visszaküldhetem, ha nem tetszik?",
    a: "14 napon belül visszaküldhető minden nem egyedi darab, eredeti, viseletlenállapotban. Az egyedi rendelések visszaküldési feltételeiről külön egyeztetünk.",
  },
  {
    q: "Van-e lehetőség személyes átvételre?",
    a: "Igen, Budapesten egyeztethető személyes átvétel. Írj nekünk előre időpontért — általában 1–2 munkanapon belül válaszolunk.",
  },
  {
    q: "Milyen fizetési módokat fogadtok el?",
    a: "Bankkártya (Stripe-on keresztül, biztonságosan), banki átutalás és utánvét. Részletfizetési lehetőség egyedi rendeléseknél egyeztethető.",
  },
  {
    q: "Hogyan csomagoljátok a rendeléseket?",
    a: "Minden darab egyedi Chicks Jewelry dobozban érkezik, szövetpárnán, köteléssel. Ajándékba is tökéletes, ahogy van — külön kérésre köszöntőkártyát is teszünk mellé.",
  },
  {
    q: "Mikor kapom meg a rendelésemet?",
    a: "Raktáron lévő termékek esetén 2–4 munkanap a szállítási idő. Minden megrendelés után visszaigazoló e-mailt küldünk a várható érkezési idővel.",
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-[1100px] px-6 py-16">
      <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.6fr]">

        {/* Bal oldal — sticky intro */}
        <div className="lg:sticky lg:top-24">
          {/* Kép placeholder — rose-tinted */}
          <div
            className="mb-6 aspect-[3/4] overflow-hidden"
            style={{ background: "linear-gradient(160deg, #f9eef5 0%, #f0e0ea 50%, #e8d5e4 100%)" }}
          >
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div
                  className="mx-auto mb-4 h-20 w-20 rounded-full"
                  style={{ background: "rgba(196,90,133,.15)" }}
                />
                <p className="text-[12px] uppercase tracking-[.2em] text-[#c45a85]">
                  Chicks Jewelry
                </p>
              </div>
            </div>
          </div>

          <p className="mb-2 text-[10px] uppercase tracking-[.3em] text-[#888]">Segítség</p>
          <h1 className="mb-3 font-[family:var(--font-display)] text-2xl leading-tight text-[#1a1a1a]">
            Kérdésed van?
          </h1>
          <p className="max-w-[34ch] text-sm leading-[1.85] text-[#666]">
            Összegyűjtöttük a leggyakrabban felmerülő kérdéseket.
            Ha nem találod a választ, írj nekünk!
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center gap-2 text-sm transition"
            style={{ color: "#c45a85" }}
          >
            Írj nekünk <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Jobb oldal — FAQ accordion */}
        <div className="divide-y divide-[#e8e5e0]">
          {faqs.map((faq) => (
            <details key={faq.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="pr-4 text-sm font-medium text-[#1a1a1a]">{faq.q}</span>
                <Plus
                  className="h-4 w-4 flex-shrink-0 text-[#888] transition-transform duration-200 group-open:rotate-45"
                />
              </summary>
              <p className="mt-3 text-sm leading-[1.85] text-[#666]">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
