import type { Metadata } from "next";

import { db } from "@/lib/db";
import { StoneBook } from "@/components/stones/StoneBook";

export const metadata: Metadata = {
  title: "Kövek — Chicks Jewelry",
  description:
    "Minden féldrágakőnek megvan a maga története, energiája és hatása. Ismerd meg azokat az anyagokat, amelyekből ékszereink készülnek.",
};

export default async function StonesPage() {
  const stones = await db.stone.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      colorHex: true,
      shortDesc: true,
      effects: true,
      origin: true,
      chakra: true,
    },
  });

  if (stones.length === 0) {
    return (
      <main className="mx-auto max-w-[1200px] px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <p className="text-sm text-[#9a7080]">
          A kövek adatbázisa hamarosan feltöltésre kerül.
        </p>
      </main>
    );
  }

  return (
    <main
      className="mx-auto max-w-[1200px] px-4 pb-20 pt-12 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(160deg, #fff5f8 0%, #fdf0f5 100%)" }}
    >
      <StoneBook stones={stones} />
    </main>
  );
}
