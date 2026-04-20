import type { Metadata } from "next";

import { db } from "@/lib/db";

import { GemstoneCardList, type Gemstone } from "./components/GemstoneCard";
import { SmoothScroll } from "./components/SmoothScroll";

export const metadata: Metadata = {
  title: "Drágakövek - Chicks Jewelry",
  description:
    "A köveink személyisége, hatása és finom társításai egy editorial hangulatú drágakövek oldalon.",
};

function getDisplayCategory(category: string) {
  if (category === "Feldragako" || category === "FELDRAGAKO") return "Féldrágakő";
  return category;
}

export default async function DragakovekPage() {
  const stones = await db.stone.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      color: true,
      shortDesc: true,
      longDesc: true,
      effects: true,
      origin: true,
      chakra: true,
      imageUrl: true,
      createdAt: true,
    },
  });

  const gemstones: Gemstone[] = stones.map((stone) => ({
    id: stone.id,
    title: stone.name,
    subtitle: stone.origin || `${stone.name} / kvarcféle`,
    category: getDisplayCategory(stone.color || "Féldrágakő"),
    shortPersonality: stone.shortDesc,
    longPersonality: stone.longDesc,
    effects: stone.effects,
    chakras: stone.chakra
      ? stone.chakra
          .split(",")
          .map((chakra) => chakra.trim())
          .filter(Boolean)
      : [],
    pairWith: [],
    imageUrl: stone.imageUrl,
    createdAt: stone.createdAt.toISOString(),
  }));

  return (
    <SmoothScroll>
      <main className="bg-[#f3bdc8] px-4 pb-24 pt-8 font-light text-[#fdfaf7] sm:px-8 lg:px-12">
        <section className="mx-auto max-w-[1520px] bg-[#f3bdc8]">
          <div className="grid gap-8 py-10 md:grid-cols-[1fr_2fr_1fr] md:items-end">
            <p className="font-serif text-sm italic uppercase tracking-[0.22em] text-[#7a2a3e]">
              BY NEWEST →
            </p>
            <h1 className="font-serif text-5xl font-light leading-none tracking-[-0.02em] text-[#fdfaf7] sm:text-7xl lg:text-8xl">
              Drágakövek
            </h1>
            <p className="max-w-xs font-serif text-lg italic leading-snug text-[#7a2a3e] md:justify-self-end">
              Minden kőnek saját személyisége van - találd meg a tiédet.
            </p>
          </div>
          <div className="h-0.5 bg-[#fdfaf7]/50" />
        </section>

        {gemstones.length === 0 ? (
          <section className="mx-auto max-w-[1520px] bg-[#f3bdc8] py-20">
            <p className="font-serif text-3xl font-light text-[#7a2a3e]">
              A drágakövek hamarosan felkerülnek.
            </p>
          </section>
        ) : (
          <GemstoneCardList gemstones={gemstones} />
        )}
      </main>
    </SmoothScroll>
  );
}
