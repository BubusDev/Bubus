"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";

export type Gemstone = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  shortPersonality: string;
  longPersonality: string;
  effects: string[];
  chakras: string[];
  pairWith: string[];
  imageUrl: string | null;
  createdAt: string;
};

const chakraColors: Record<string, string> = {
  crown: "#f4edf8",
  "third-eye": "#8f78c8",
  throat: "#77bad7",
  heart: "#91bc84",
  "solar-plexus": "#e8c85b",
  sacral: "#e98f61",
  root: "#8e3545",
  korona: "#f4edf8",
  "harmadik szem": "#8f78c8",
  torok: "#77bad7",
  sziv: "#91bc84",
  napfonat: "#e8c85b",
  szakralis: "#e98f61",
  gyoker: "#8e3545",
};

function normalizeLabel(value: string) {
  return value.toLowerCase().trim();
}

function RelatedThumbs({ gemstones, currentId }: { gemstones: Gemstone[]; currentId: string }) {
  const related = gemstones.filter((gemstone) => gemstone.id !== currentId).slice(0, 8);

  if (related.length === 0) {
    return <p className="text-sm text-[#7a2a3e]">Hamarosan érkeznek párosítások.</p>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {related.map((gemstone) => (
        <div key={gemstone.id} className="w-[120px] flex-none">
          <div className="relative aspect-square overflow-hidden bg-[#fdfaf7]/15">
            {gemstone.imageUrl ? (
              <Image
                src={gemstone.imageUrl}
                alt={gemstone.title}
                fill
                sizes="120px"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[#fdfaf7]/20" />
            )}
          </div>
          <p className="mt-2 truncate font-serif text-xs text-[#fdfaf7]">{gemstone.title}</p>
        </div>
      ))}
    </div>
  );
}

function GemstoneCard({
  gemstone,
  index,
  gemstones,
}: {
  gemstone: Gemstone;
  index: number;
  gemstones: Gemstone[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.75, 1], [0.3, 0.7, 1]);
  const label = `${gemstone.category}${gemstone.subtitle ? ` · ${gemstone.subtitle}` : ""}`;

  return (
    <motion.article
      ref={ref}
      style={{ scale, opacity }}
      className="min-h-screen snap-center bg-[#f3bdc8]"
    >
      <div className="grid min-h-screen border-b-2 border-[#fdfaf7]/50 md:grid-cols-[0.75fr_3fr_0.45fr]">
        <div className="flex items-start border-[#fdfaf7]/50 px-4 py-8 md:border-r-2 md:px-8 md:py-12">
          <span className="font-serif text-7xl font-light leading-none text-[#fdfaf7]/70 sm:text-8xl">
            {index + 1}
          </span>
        </div>

        <div
          className={
            open
              ? "grid gap-10 border-[#fdfaf7]/50 px-4 pb-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-0 md:border-r-2 md:px-8 md:py-12"
              : "grid gap-8 border-[#fdfaf7]/50 px-4 pb-8 md:grid-cols-[minmax(220px,400px)_1fr] md:border-r-2 md:px-8 md:py-12 lg:gap-12"
          }
        >
          <div
            className={
              open
                ? "relative aspect-square w-full overflow-hidden bg-[#fdfaf7]/15 md:sticky md:top-28"
                : "relative aspect-square w-full max-w-[400px] overflow-hidden bg-[#fdfaf7]/15"
            }
          >
            {gemstone.imageUrl ? (
              <Image
                src={gemstone.imageUrl}
                alt={gemstone.title}
                fill
                sizes="(min-width: 1024px) 400px, 85vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#fdfaf7]/15 font-serif text-5xl italic text-[#7a2a3e]/50">
                {gemstone.title.slice(0, 1)}
              </div>
            )}
          </div>

          <div className={open ? "flex min-w-0 flex-col justify-center md:pl-16" : "flex min-w-0 flex-col justify-center"}>
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium uppercase tracking-[0.25em] text-[#7a2a3e]/70">
              {label}
            </p>
            <h2 className="mt-2 font-serif text-5xl font-light leading-none text-[#fdfaf7] sm:text-7xl lg:text-8xl">
              {gemstone.title}
            </h2>
            <p className="mt-3 max-w-xl font-serif text-xl italic leading-snug text-[#7a2a3e]">
              {gemstone.shortPersonality}
            </p>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0, y: 18 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: 12 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-8">
                    <div className="my-8 h-0.5 w-16 bg-[#fdfaf7]/40" />

                    <p className="my-8 max-w-prose text-base font-light leading-[1.8] text-[#fdfaf7]/90">
                      {gemstone.longPersonality}
                    </p>

                    <div>
                      <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-[#7a2a3e]">
                        Hatások
                      </p>
                      <ul className="grid gap-x-8 gap-y-3 text-sm font-light text-[#fdfaf7] sm:grid-cols-2">
                        {gemstone.effects.map((effect) => (
                          <li key={effect} className="flex gap-2 bg-transparent hover:bg-transparent">
                            <span className="mt-1 flex-none text-[#7a2a3e]">•</span>
                            {effect}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-10">
                      <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-[#7a2a3e]">
                        Csakrák
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {(gemstone.chakras.length ? gemstone.chakras : ["sziv"]).map((chakra) => {
                          const key = normalizeLabel(chakra);
                          return (
                            <span
                              key={chakra}
                              className="inline-flex items-center gap-2 rounded-full border-2 border-[#fdfaf7]/50 bg-transparent px-5 py-2 text-xs uppercase tracking-widest text-[#fdfaf7]"
                            >
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{ background: chakraColors[key] ?? "#fdfaf7" }}
                              />
                              {chakra}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-10">
                      <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-[#7a2a3e]">
                        Párosítható ezekkel
                      </p>
                      <RelatedThumbs gemstones={gemstones} currentId={gemstone.id} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex items-start justify-end px-4 py-8 font-serif text-5xl font-thin leading-none text-[#7a2a3e] transition hover:text-[#fdfaf7] md:px-8 md:py-12"
        >
          <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.3 }}>
            +
          </motion.span>
        </button>
      </div>
    </motion.article>
  );
}

export function GemstoneCardList({ gemstones }: { gemstones: Gemstone[] }) {
  return (
    <section className="mx-auto max-w-[1520px] bg-[#f3bdc8]">
      {gemstones.map((gemstone, index) => (
        <GemstoneCard
          key={gemstone.id}
          gemstone={gemstone}
          index={index}
          gemstones={gemstones}
        />
      ))}
    </section>
  );
}
