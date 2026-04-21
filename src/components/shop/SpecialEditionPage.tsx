import Image from "next/image";

import { LimitedEditionFeature } from "@/components/shop/LimitedEditionDetailPage";
import type { SpecialEditionEntryView } from "@/lib/products-client";

type SpecialEditionPageProps = {
  entries: SpecialEditionEntryView[];
  bannerImageUrl?: string;
  bannerImageAlt?: string;
};

export async function SpecialEditionPage({
  entries,
  bannerImageUrl,
  bannerImageAlt,
}: SpecialEditionPageProps) {
  return (
    <main>
      {bannerImageUrl ? (
        <section className="relative h-[42vh] min-h-[280px] w-full overflow-hidden bg-[#faf9f7] sm:h-[52vh] lg:min-h-[520px]">
          <Image
            src={bannerImageUrl}
            alt={bannerImageAlt || "Special Edition banner"}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </section>
      ) : null}

      {entries.length > 0 ? (
        entries.map((entry) => (
          <LimitedEditionFeature key={entry.id} entry={entry} />
        ))
      ) : (
        <section className="flex min-h-[420px] items-center justify-center bg-[#faf9f7] px-6 py-16 text-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.3em] text-[#888]">
              Special Edition
            </p>
            <h2 className="mt-3 font-[family:var(--font-display)] text-[2rem] text-[#1a1a1a]">
              Jelenleg nincs hozzárendelt termék
            </h2>
            <p className="mx-auto mt-3 max-w-[38ch] text-sm leading-7 text-[#666]">
              Adj hozzá Special Edition termékeket, hogy ez az oldal
              kampányszerű megjelenéssel feltöltődjön.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
