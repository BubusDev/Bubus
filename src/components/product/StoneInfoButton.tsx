"use client";

import { Info, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type StoneData = {
  name: string;
  slug: string;
  colorHex: string;
  shortDesc: string;
  effects: string[];
  origin?: string | null;
  chakra?: string | null;
};

// Static fallback map keyed by stone slug (matches ProductOption slugs)
const STONE_MAP: Record<string, StoneData> = {
  "rose-quartz": {
    name: "Rózsakvarc",
    slug: "rozsakvarc",
    colorHex: "#f9c8dc",
    shortDesc: "A feltétel nélküli szeretet köve. Megnyitja a szívet és gyengéd energiával tölt el.",
    effects: ["Szeretet", "Önelfogadás", "Gyengédség", "Érzelmi gyógyulás"],
    origin: "Brazília, Madagaszkár",
    chakra: "Szív csakra",
  },
  crystal: {
    name: "Kristály",
    slug: "kristaly",
    colorHex: "#e8f4ff",
    shortDesc: "A tisztaság és az átláthatóság köve. Felerősíti a szándékokat és megtisztítja az energiát.",
    effects: ["Tisztaság", "Fókusz", "Energia", "Harmónia"],
    origin: "Brazília, Svájc",
    chakra: "Korona csakra",
  },
  opal: {
    name: "Opál",
    slug: "opal",
    colorHex: "#f0e8f8",
    shortDesc: "A kreativitás és az érzelmek köve. Minden szögből másképp ragyog — akárcsak aki viseli.",
    effects: ["Kreativitás", "Egyéniség", "Érzelmek", "Remény"],
    origin: "Ausztrália, Etiópia",
    chakra: "Korona csakra",
  },
  moonstone: {
    name: "Holdkő",
    slug: "holdko",
    colorHex: "#d4e8f5",
    shortDesc: "A női energia és az intuíció köve. Összeköttet a holddal, a ciklusokkal és a belső bölcsességgel.",
    effects: ["Intuíció", "Női energia", "Egyensúly", "Álmodozás"],
    origin: "Srí Lanka, India",
    chakra: "Homlok csakra",
  },
  pearl: {
    name: "Gyöngy",
    slug: "gyongy",
    colorHex: "#f8f4f0",
    shortDesc: "A tisztaság és a bölcsesség jelképe. Türelemmel és kitartással formálódik, akárcsak az igazi szépség.",
    effects: ["Tisztaság", "Bölcsesség", "Türelem", "Elegancia"],
    origin: "Japán, Ausztrália",
    chakra: "Korona csakra",
  },
  diamond: {
    name: "Gyémánt",
    slug: "gyemant",
    colorHex: "#f0f8ff",
    shortDesc: "Az örök erő és a ragyogás köve. A legtisztább fényt tükrözi vissza viselőjének.",
    effects: ["Erő", "Ragyogás", "Tisztaság", "Örökkévalóság"],
    origin: "Dél-Afrika, Oroszország",
    chakra: "Korona csakra",
  },
};

type Props = {
  stoneSlug: string;
  stoneLabel: string;
  stoneData?: StoneData | null;
};

export function StoneInfoButton({ stoneSlug, stoneLabel, stoneData }: Props) {
  const [open, setOpen] = useState(false);
  const stone = stoneData ?? STONE_MAP[stoneSlug] ?? null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-1.5 text-[#4d2741] transition hover:text-[#c45a85]"
        aria-label={`Részletek: ${stoneLabel}`}
      >
        <span className="text-[13px]">{stoneLabel}</span>
        <Info className="h-3.5 w-3.5 text-[#c0a0b4] group-hover:text-[#c45a85] transition" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(42,18,30,.3)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-[2rem] bg-white/90 p-8 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-[#c0a0b4] transition hover:bg-rose-50 hover:text-[#c45a85]"
              aria-label="Bezárás"
            >
              <X className="h-4 w-4" />
            </button>

            {stone ? (
              <>
                {/* Color circle */}
                <div
                  className="mb-5 h-12 w-12 rounded-full shadow-inner"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, white 0%, ${stone.colorHex} 100%)`,
                  }}
                />

                {stone.chakra && (
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c0517a]">
                    {stone.chakra}
                  </p>
                )}

                <h2 className="font-[family:var(--font-display)] text-[2rem] leading-none tracking-[-0.03em] text-[#2f1a27]">
                  {stone.name}
                </h2>

                <p className="mt-4 text-[13px] leading-[1.9] text-[#5a3a4a]">
                  {stone.shortDesc}
                </p>

                {stone.effects.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {stone.effects.map((effect) => (
                      <span
                        key={effect}
                        className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-[#9a5a72]"
                      >
                        {effect}
                      </span>
                    ))}
                  </div>
                )}

                {stone.origin && (
                  <p className="mt-4 text-[11px] text-[#9a7080]">
                    Lelőhely: {stone.origin}
                  </p>
                )}

                <Link
                  href={`/stones#${stone.slug}`}
                  className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#c45a85] transition hover:opacity-70"
                  onClick={() => setOpen(false)}
                >
                  Többet erről a kőről
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <>
                <h2 className="font-[family:var(--font-display)] text-[2rem] leading-none tracking-[-0.03em] text-[#2f1a27]">
                  {stoneLabel}
                </h2>
                <p className="mt-4 text-[13px] leading-[1.9] text-[#5a3a4a]">
                  Részletes leírás hamarosan elérhető.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
