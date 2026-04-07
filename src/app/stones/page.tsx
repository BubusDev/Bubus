import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";

import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Kövek — Chicks Jewelry",
  description:
    "Minden féldrágakőnek megvan a maga története, energiája és hatása. Ismerd meg azokat az anyagokat, amelyekből ékszereink készülnek.",
};

export default async function StonesPage() {
  const stones = await db.stone.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-20 pt-12 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-12 max-w-[52ch]">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#c0517a]">
          ✦ Természet kincsei
        </p>
        <h1 className="font-[family:var(--font-display)] text-[2.4rem] leading-[1.05] tracking-[-0.04em] text-[#2f1a27] sm:text-[3rem]">
          Kövek, amelyek mesélnek
        </h1>
        <p className="mt-4 text-[14px] leading-[1.85] text-[#6a4a5a]">
          Minden féldrágakőnek megvan a maga története, energiája és hatása.
          Ismerd meg azokat az anyagokat, amelyekből ékszereink készülnek.
        </p>
      </header>

      {/* Grid */}
      {stones.length === 0 ? (
        <p className="text-sm text-[#9a7080]">
          A kövek adatbázisa hamarosan feltöltésre kerül.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stones.map((stone) => (
            <article
              key={stone.id}
              id={stone.slug}
              className="rounded-[1.6rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition hover:shadow-lg"
            >
              {/* Color circle */}
              <div
                className="mb-4 h-14 w-14 rounded-full shadow-inner"
                style={{
                  background: `radial-gradient(circle at 35% 35%, white 0%, ${stone.colorHex} 100%)`,
                }}
              />

              {stone.origin && (
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c0517a]">
                  {stone.origin}
                </p>
              )}

              <h2 className="mt-1 font-[family:var(--font-display)] text-xl text-[#2f1a27]">
                {stone.name}
              </h2>

              {stone.chakra && (
                <p className="mt-0.5 text-[11px] text-[#b08898]">
                  {stone.chakra}
                </p>
              )}

              <p className="mt-2 text-sm leading-[1.8] text-[#6a4a5a]">
                {stone.shortDesc}
              </p>

              {/* Effect pills */}
              {stone.effects.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
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

              {/* Long desc accordion */}
              <details className="group mt-4">
                <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-[#c0517a]">
                  Részletek
                  <ChevronDown className="h-3 w-3 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-[1.85] text-[#7a5a6c]">
                  {stone.longDesc}
                </p>
              </details>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
