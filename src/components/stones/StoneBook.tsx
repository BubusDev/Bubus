"use client";

import { ChevronLeft, ChevronRight, Gem } from "lucide-react";
import { useEffect, useState } from "react";

type Stone = {
  id: string;
  name: string;
  slug: string;
  colorHex: string;
  shortDesc: string;
  effects: string[];
  origin: string | null;
  chakra: string | null;
};

type Props = {
  stones: Stone[];
};

function StonePage({
  stone,
  pageNumber,
  side,
}: {
  stone: Stone;
  pageNumber: number;
  side: "left" | "right";
}) {
  const isLeft = side === "left";
  return (
    <div
      id={stone.slug}
      className={`book-page ${isLeft ? "book-page-left" : "book-page-right"}`}
    >
      {/* Geometric background blocks */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-3/4 h-2/5 bg-[#fdf0f5]" />
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-[#2b1220]" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/3 bg-[#c45a85]/15" />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 flex flex-col h-full">
        {/* Meta */}
        <div className="mb-6">
          {stone.chakra && (
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#c0517a] mb-1">
              {stone.chakra}
            </p>
          )}
          <h2 className="font-[family:var(--font-display)] text-2xl text-[#2b1220] mb-1">
            {stone.name}
          </h2>
          {stone.origin && (
            <p className="text-[11px] text-[#b08898]">{stone.origin}</p>
          )}
        </div>

        {/* Color circle */}
        <div className="flex-1 flex items-center justify-center">
          <div
            className="w-40 h-40 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, white 0%, ${stone.colorHex}cc 40%, ${stone.colorHex} 100%)`,
              boxShadow: `0 20px 60px ${stone.colorHex}60, inset 0 -8px 20px rgba(0,0,0,.1)`,
            }}
          />
        </div>

        {/* Description */}
        <div className="mt-6">
          <p className="text-sm leading-[1.85] text-[#5a3a4a]">{stone.shortDesc}</p>
          {stone.effects.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {stone.effects.map((e) => (
                <span
                  key={e}
                  className="rounded-full bg-[#fdf0f5] border border-rose-200 px-2.5 py-0.5 text-[10px] text-[#9a5a72]"
                >
                  {e}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between opacity-40">
          <span className="font-[family:var(--font-display)] text-xs text-[#2b1220]">
            Chicks Jewelry
          </span>
          <span className="text-xs text-[#9a7080]">{pageNumber}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyPage({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`book-page ${side === "left" ? "book-page-left" : "book-page-right"} flex items-center justify-center`}
    >
      <p className="text-sm text-[#c0a0b4] italic">Hamarosan…</p>
    </div>
  );
}

export function StoneBook({ stones }: Props) {
  const pairs: Stone[][] = stones.reduce<Stone[][]>((acc, stone, i) => {
    if (i % 2 === 0) acc.push([stone]);
    else acc[acc.length - 1].push(stone);
    return acc;
  }, []);

  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const idx = stones.findIndex((s) => s.slug === hash);
    if (idx >= 0) setCurrentPage(Math.floor(idx / 2));
  }, [stones]);

  const pair = pairs[currentPage] ?? [];
  const left = pair[0];
  const right = pair[1];

  const showFrom = currentPage * 2 + 1;
  const showTo = Math.min(currentPage * 2 + 2, stones.length);

  return (
    <div>
      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-white/60 px-5 py-2 backdrop-blur-sm mb-4">
          <Gem className="h-3.5 w-3.5 text-rose-400" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#c0517a]">
            Természet kincsei
          </span>
        </div>
        <h1 className="font-[family:var(--font-display)] text-4xl text-[#2b1220]">
          Kövek, amelyek mesélnek
        </h1>
        <p className="mt-3 text-sm text-[#8a6272] max-w-[40ch] mx-auto leading-[1.85]">
          Lapozd végig a féldrágakövek világát — minden oldal egy új történet,
          egy új energia, egy új érzés.
        </p>
        <p className="mt-2 text-[11px] text-[#b08898]">
          {showFrom}–{showTo}. kő · összesen {stones.length} db
        </p>
      </header>

      {/* Book scene */}
      <div className="book-scene">
        <div className="book">
          {left ? (
            <StonePage stone={left} pageNumber={currentPage * 2 + 1} side="left" />
          ) : (
            <EmptyPage side="left" />
          )}
          {right ? (
            <StonePage stone={right} pageNumber={currentPage * 2 + 2} side="right" />
          ) : (
            <EmptyPage side="right" />
          )}
        </div>
      </div>

      {/* Navigation */}
      {pairs.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-5 py-2.5 text-sm text-[#7a5a6c] backdrop-blur-sm transition hover:border-[#c45a85] hover:text-[#c45a85] disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            Előző
          </button>

          <div className="flex gap-2">
            {pairs.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentPage
                    ? "w-6 bg-[#c45a85]"
                    : "w-2 bg-rose-200 hover:bg-rose-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(pairs.length - 1, p + 1))}
            disabled={currentPage === pairs.length - 1}
            className="flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-5 py-2.5 text-sm text-[#7a5a6c] backdrop-blur-sm transition hover:border-[#c45a85] hover:text-[#c45a85] disabled:opacity-30"
          >
            Következő
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <style>{`
        .book-scene {
          perspective: 1200px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 80vh;
          padding: 40px 16px 80px;
        }

        .book {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 900px;
          width: 100%;
          min-height: 580px;
          position: relative;
          box-shadow:
            0 40px 80px rgba(42,18,30,.25),
            0 0 0 1px rgba(196,90,133,.1);
          border-radius: 4px 16px 16px 4px;
          overflow: hidden;
          transform: rotateX(2deg);
          transform-origin: center bottom;
        }

        .book::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(to right, rgba(42,18,30,.15), rgba(42,18,30,.05), rgba(42,18,30,.15));
          transform: translateX(-50%);
          pointer-events: none;
          z-index: 10;
        }

        .book-page {
          position: relative;
          overflow: hidden;
          background: white;
          min-height: 560px;
          animation: page-turn 0.3s ease-out;
        }

        .book-page-left {
          border-right: 1px solid rgba(42,18,30,.08);
        }

        @keyframes page-turn {
          0%   { opacity: 0; transform: rotateY(-8deg) translateX(-10px); }
          100% { opacity: 1; transform: rotateY(0deg) translateX(0); }
        }

        @media (max-width: 640px) {
          .book {
            grid-template-columns: 1fr;
            border-radius: 16px;
            transform: none;
          }
          .book-page-left {
            border-right: none;
            border-bottom: 1px solid rgba(42,18,30,.08);
          }
          .book-scene {
            min-height: auto;
            padding: 16px 0 40px;
          }
        }
      `}</style>
    </div>
  );
}
