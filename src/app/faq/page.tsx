"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import { AmbientBlobs } from "@/components/AmbientBlobs";

/* ─── Data ───────────────────────────────────────────────────── */
type Category = "Összes" | "Rendelés" | "Szállítás" | "Termékek" | "Fizetés" | "Visszaküldés";

const faqs: { q: string; a: string; category: Category }[] = [
  {
    category: "Termékek",
    q: "Milyen féldrágaköveket használtok?",
    a: "Rózsakvarc, ametiszt, citrin, holdkő, obszidián, türkiz, labradorit és mások — szezonálisan változó készlettel. Minden kőnél feltüntetjük a típusát és természetes voltát.",
  },
  {
    category: "Rendelés",
    q: "Mennyi idő alatt készül el egy egyedi rendelés?",
    a: "Általában 2–3 hét, az alapanyag elérhetőségétől függően. Az egyedi megrendelések minden esetben személyes egyeztetéssel indulnak — írj nekünk a kapcsolat oldalon.",
  },
  {
    category: "Termékek",
    q: "Hogyan gondozzam az ékszeremet?",
    a: "Kerüld a vízzel, parfümmel és vegyi anyagokkal való érintkezést. Puha kendővel töröld le használat után. Tároláskor tedd vissza a Bubus dobozba, fénytől védett helyre.",
  },
  {
    category: "Visszaküldés",
    q: "Visszaküldhetem, ha nem tetszik?",
    a: "14 napon belül visszaküldhető minden nem egyedi darab, eredeti, viseletlenállapotban. Az egyedi rendelések visszaküldési feltételeiről külön egyeztetünk.",
  },
  {
    category: "Szállítás",
    q: "Van-e lehetőség személyes átvételre?",
    a: "Igen, Budapesten egyeztethető személyes átvétel. Írj nekünk előre időpontért — általában 1–2 munkanapon belül válaszolunk.",
  },
  {
    category: "Fizetés",
    q: "Milyen fizetési módokat fogadtok el?",
    a: "Bankkártya (Stripe-on keresztül, biztonságosan), banki átutalás és utánvét. Részletfizetési lehetőség egyedi rendeléseknél egyeztethető.",
  },
  {
    category: "Szállítás",
    q: "Hogyan csomagoljátok a rendeléseket?",
    a: "Minden darab egyedi Bubus dobozban érkezik, szövetpárnán, köteléssel. Ajándékba is tökéletes, ahogy van — külön kérésre köszöntőkártyát is teszünk mellé.",
  },
  {
    category: "Rendelés",
    q: "Készítetek páros ékszereket?",
    a: "Igen, páros karkötők és gyűrűk egyedi rendelésre elérhetők. Különleges ajándék párnak, barátoknak vagy anyának és lányának — minden esetben személyes egyeztetéssel.",
  },
  {
    category: "Termékek",
    q: "Természetesek a kövek?",
    a: "Igen, minden féldrágakövünk természetes, nem szintetikus. A kövek kisebb természetes elszíneződései, zárványai az autenticitás jelei — ezek nem hibák.",
  },
  {
    category: "Szállítás",
    q: "Mikor kapom meg a rendelésemet?",
    a: "Raktáron lévő termékek esetén 2–4 munkanap a szállítási idő. Minden megrendelés után visszaigazoló e-mailt küldünk a várható érkezési idővel.",
  },
];

const categories: Category[] = ["Összes", "Rendelés", "Szállítás", "Termékek", "Fizetés", "Visszaküldés"];

/* ─── Page ───────────────────────────────────────────────────── */
export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("Összes");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === "Összes" || faq.category === activeCategory;
      const matchesSearch =
        search.trim() === "" ||
        faq.q.toLowerCase().includes(search.toLowerCase()) ||
        faq.a.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <>
      <AmbientBlobs opacity={0.3} />

      <main className="mx-auto max-w-[860px] px-4 py-16 sm:px-6 sm:py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#af7795]">Segítség</p>
          <h1
            className="mt-3 font-[family:var(--font-display)] leading-[1.05] tracking-[-0.04em] text-[#4d2741]"
            style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}
          >
            Kérdésed van?{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #c45a85 0%, #e07a70 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Nálunk a válasz.
            </span>
          </h1>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b08898]" />
          <input
            type="search"
            placeholder="Keresés a kérdések között..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[1.2rem] border border-[rgba(224,191,208,0.8)] bg-white/82 py-3.5 pl-11 pr-5 text-sm text-[#31192d] outline-none transition placeholder:text-[#b188a4] focus:border-[#d95f92] focus:bg-white/96 focus:shadow-[0_0_0_4px_rgba(236,124,178,0.14)]"
          />
        </div>

        {/* Category pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                activeCategory === cat
                  ? "border-[#e9b6d0] bg-[linear-gradient(135deg,#ec7cb2,#d95f92)] text-white shadow-[0_8px_20px_rgba(217,95,146,0.25)]"
                  : "border-[#edd8e6] bg-white/80 text-[#7a5a6c] hover:border-[#e9b6d0] hover:bg-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#9b7a8b]">Nem található kérdés erre a keresésre.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={faq.q}
                  className="overflow-hidden rounded-[1.6rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,241,247,0.84))] shadow-[0_8px_24px_rgba(198,129,167,0.08)] backdrop-blur-xl"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center gap-4 px-6 py-5 text-left transition hover:bg-white/30"
                  >
                    <span className="flex-1 font-semibold text-[#4d2741]">{faq.q}</span>
                    <ChevronDown
                      className="h-4 w-4 flex-shrink-0 text-[#c45a85] transition-transform duration-300"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </button>

                  <div
                    style={{
                      maxHeight: isOpen ? "600px" : "0px",
                      opacity: isOpen ? 1 : 0,
                      overflow: "hidden",
                      transition: "max-height 320ms ease, opacity 280ms ease",
                    }}
                  >
                    <p className="px-6 pb-5 text-[14px] leading-[1.85] text-[#6a4a5a]">{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
