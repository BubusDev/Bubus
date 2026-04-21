"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { getChakraDisplay } from "../lib/chakras";

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
  accentColor: string | null;
  createdAt: string;
};

function RelatedThumbs({ gemstones, currentId }: { gemstones: Gemstone[]; currentId: string }) {
  const related = gemstones.filter((gemstone) => gemstone.id !== currentId).slice(0, 8);

  if (related.length === 0) {
    return <p className="text-sm text-[#7a2a3e]">Hamarosan érkeznek párosítások.</p>;
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {related.map((gemstone) => (
        <div key={gemstone.id} className="w-28 flex-none">
          <div className="relative aspect-square overflow-hidden bg-[#fdfaf7]/15">
            {gemstone.imageUrl ? (
              <Image
                src={gemstone.imageUrl}
                alt={gemstone.title}
                fill
                sizes="112px"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[#fdfaf7]/20" />
            )}
          </div>
          <p className="mt-2 truncate font-serif text-sm text-[#fdfaf7]">{gemstone.title}</p>
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
  const [isClient, setIsClient] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.96, 1, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1, 1]);
  const accentColor = gemstone.accentColor || "#7a2a3e";

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <motion.article
      ref={ref}
      style={isClient && !shouldReduceMotion ? { scale, opacity } : undefined}
      className="bg-[#f3bdc8]"
    >
      <div className="grid border-b-2 border-white/40 py-5 md:min-h-[41svh] md:grid-cols-[0.45fr_3fr_0.3fr] md:py-12">
        <div className="flex items-start border-white/40 px-4 md:border-r-2 md:px-5">
          <span className="font-serif text-4xl font-light leading-none text-[#fdfaf7]/70 sm:text-5xl">
            {index + 1}
          </span>
        </div>

        <div className="grid gap-4 border-white/40 px-4 md:grid-cols-[minmax(140px,200px)_1fr] md:border-r-2 md:px-5 lg:gap-6">
          <div
            className="relative mx-auto aspect-square w-full max-w-[min(55vw,150px)] overflow-hidden border bg-[#fdfaf7]/15 md:mx-0 md:max-w-[180px]"
            style={{ borderColor: `${accentColor}55` }}
          >
            {gemstone.imageUrl ? (
              <Image
                src={gemstone.imageUrl}
                alt={gemstone.title}
                fill
                sizes="(min-width: 768px) 180px, min(55vw, 150px)"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#fdfaf7]/15 font-serif text-3xl italic text-[#7a2a3e]/50">
                {gemstone.title.slice(0, 1)}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a2a3e]">
              {gemstone.category}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#fdfaf7]/70">
              {gemstone.subtitle}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-light leading-none tracking-[-0.02em] text-[#fdfaf7] sm:text-4xl lg:text-5xl">
              {gemstone.title}
            </h2>
            <p className="mt-3 max-w-lg font-serif text-base italic leading-snug text-[#7a2a3e]">
              {gemstone.shortPersonality}
            </p>
            <div className="mt-3 h-0.5 w-8" style={{ backgroundColor: accentColor }} />

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 space-y-5 border-t-2 border-white/40 pt-5">
                    <p className="max-w-3xl text-sm leading-7 text-[#fdfaf7]/90">
                      {gemstone.longPersonality}
                    </p>

                    <div>
                      <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#7a2a3e]">
                        Hatások
                      </p>
                      <ul className="grid gap-2 text-sm text-[#fdfaf7]/90 sm:grid-cols-2">
                        {gemstone.effects.map((effect) => (
                          <li key={effect} className="flex gap-2 bg-transparent">
                            <span
                              className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
                              style={{ backgroundColor: accentColor }}
                            />
                            {effect}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#7a2a3e]">
                        Csakrák
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {(gemstone.chakras.length ? gemstone.chakras : ["heart"]).map((chakra) => {
                          const display = getChakraDisplay(chakra);
                          if (!display) return null;
                          return (
                            <span
                              key={chakra}
                              className="inline-flex items-center gap-2 rounded-full border border-[#fdfaf7]/15 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-[#fdfaf7]"
                            >
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{ background: display.color }}
                              />
                              {display.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#7a2a3e]">
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
          aria-label={`${gemstone.title} részleteinek ${open ? "bezárása" : "megnyitása"}`}
          className="flex items-start justify-end px-4 pt-5 font-serif text-3xl font-thin leading-none text-[#7a2a3e] transition hover:text-[#fdfaf7] md:px-5 md:pt-0"
        >
          <span className="mr-3 hidden pt-2 text-[10px] uppercase tracking-[0.22em] opacity-70 md:inline">
            Részletek
          </span>
          <motion.span
            animate={{ rotate: open && !shouldReduceMotion ? 45 : 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
          >
            +
          </motion.span>
        </button>
      </div>
    </motion.article>
  );
}

export function GemstoneCardList({ gemstones }: { gemstones: Gemstone[] }) {
  return (
    <section className="mx-auto max-w-[1520px] overflow-visible bg-[#f3bdc8]">
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
