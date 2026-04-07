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

function HandSvg({ side }: { side: "left" | "right" }) {
  const gradId = `skin-grad-${side}`;
  return (
    <svg viewBox="0 0 120 200" className="hand-svg" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5c5b0" />
          <stop offset="50%" stopColor="#e8a898" />
          <stop offset="100%" stopColor="#d4907a" />
        </linearGradient>
      </defs>
      {/* Palm */}
      <ellipse cx="60" cy="160" rx="48" ry="45" fill={`url(#${gradId})`} />
      {/* Thumb */}
      <ellipse
        cx="18" cy="130" rx="12" ry="28"
        fill={`url(#${gradId})`}
        transform="rotate(-20 18 130)"
      />
      {/* Fingers */}
      <rect x="10" y="60" width="16" height="70" rx="8" fill={`url(#${gradId})`} />
      <rect x="30" y="45" width="16" height="80" rx="8" fill={`url(#${gradId})`} />
      <rect x="50" y="50" width="16" height="75" rx="8" fill={`url(#${gradId})`} />
      <rect x="70" y="60" width="14" height="65" rx="7" fill={`url(#${gradId})`} />
      {/* Nails */}
      <rect x="13" y="62" width="10" height="14" rx="5" fill="#f5d0e0" opacity=".6" />
      <rect x="33" y="47" width="10" height="14" rx="5" fill="#f5d0e0" opacity=".6" />
      <rect x="53" y="52" width="10" height="14" rx="5" fill="#f5d0e0" opacity=".6" />
      <rect x="73" y="62" width="9"  height="13" rx="4.5" fill="#f5d0e0" opacity=".6" />
      {/* Shadow */}
      <ellipse cx="55" cy="195" rx="45" ry="8" fill="rgba(100,30,60,.2)" />
    </svg>
  );
}

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
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[58%] h-[38%] bg-[#f9e0ea]" />
        <div className="absolute top-0 right-0 w-[35%] h-[50%] bg-[#3d1525]" />
        <div className="absolute bottom-0 left-0 w-[45%] h-[28%] bg-[#c45a85]/20" />
        <div className="absolute top-[22%] left-[8%] right-[8%] bottom-[22%] bg-white shadow-md" />
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [animDir, setAnimDir] = useState<"left" | "right">("right");

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const idx = stones.findIndex((s) => s.slug === hash);
    if (idx >= 0) setCurrentPage(Math.floor(idx / 2));
  }, [stones]);

  const handlePageTurn = (direction: "prev" | "next") => {
    if (isAnimating) return;
    setAnimDir(direction === "next" ? "right" : "left");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage((p) =>
        direction === "next"
          ? Math.min(pairs.length - 1, p + 1)
          : Math.max(0, p - 1),
      );
      setIsAnimating(false);
    }, 200);
  };

  const pair = pairs[currentPage] ?? [];
  const left = pair[0];
  const right = pair[1];

  const showFrom = currentPage * 2 + 1;
  const showTo = Math.min(currentPage * 2 + 2, stones.length);

  return (
    <div className="stone-scene">
      {/* Background blobs */}
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />

      {/* Header */}
      <header className="relative z-10 text-center mb-12 pt-8">
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

      {/* Book container */}
      <div className="book-container">
        {/* Left hand */}
        <div className="book-hand book-hand-left" aria-hidden>
          <HandSvg side="left" />
        </div>

        {/* Book */}
        <div className="book">
          <div className="book-spine" />
          {left ? (
            <StonePage
              stone={left}
              pageNumber={currentPage * 2 + 1}
              side="left"
            />
          ) : (
            <EmptyPage side="left" />
          )}
          {right ? (
            <StonePage
              stone={right}
              pageNumber={currentPage * 2 + 2}
              side="right"
            />
          ) : (
            <EmptyPage side="right" />
          )}
          {/* Page flip animation overlay */}
          {isAnimating && (
            <div
              className={`page-flip-overlay ${animDir === "right" ? "page-turning-right" : "page-turning-left"}`}
            />
          )}
        </div>

        {/* Right hand */}
        <div className="book-hand book-hand-right" aria-hidden>
          <HandSvg side="right" />
        </div>

        {/* Table surface */}
        <div
          className="table-surface"
          style={{
            background: "linear-gradient(to bottom, #c4708a, #a05070)",
            boxShadow: "inset 0 20px 40px rgba(0,0,0,.15)",
          }}
        />
      </div>

      {/* Navigation */}
      {pairs.length > 1 && (
        <div className="relative z-10 mt-16 pb-12 flex items-center justify-center gap-6">
          <button
            onClick={() => handlePageTurn("prev")}
            disabled={currentPage === 0 || isAnimating}
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
            onClick={() => handlePageTurn("next")}
            disabled={currentPage === pairs.length - 1 || isAnimating}
            className="flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-5 py-2.5 text-sm text-[#7a5a6c] backdrop-blur-sm transition hover:border-[#c45a85] hover:text-[#c45a85] disabled:opacity-30"
          >
            Következő
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <style>{`
        /* ── Scene ── */
        .stone-scene {
          position: relative;
          overflow: hidden;
          background: linear-gradient(160deg, #f5d5e5 0%, #e8b8d0 40%, #f0d0e8 70%, #dda0c0 100%);
          margin: -3rem -1rem -5rem;   /* bleed past page padding */
        }

        /* ── Blobs ── */
        .bg-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .bg-blob-1 { background: #d4789a; opacity: .35; width: 600px; height: 600px; top: -100px; left: -100px; }
        .bg-blob-2 { background: #c45a85; opacity: .2;  width: 400px; height: 400px; bottom: 0;    right: -80px; }
        .bg-blob-3 { background: #8b3060; opacity: .15; width: 300px; height: 300px; top: 40%;    left: 30%;   }

        /* ── Book container ── */
        .book-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          padding: 40px 16px 0;
          z-index: 1;
        }

        /* ── Hands ── */
        .book-hand {
          position: absolute;
          bottom: 0;
          z-index: 5;
          pointer-events: none;
          width: 120px;
        }
        .book-hand-left {
          left: calc(50% - 460px);
          transform: rotate(15deg) translateY(20px);
          filter: drop-shadow(-4px 8px 12px rgba(100,30,60,.25));
        }
        .book-hand-right {
          right: calc(50% - 460px);
          transform: rotate(-15deg) translateY(20px) scaleX(-1);
          filter: drop-shadow(4px 8px 12px rgba(100,30,60,.25));
        }
        .hand-svg { width: 100%; height: auto; display: block; }

        /* ── Book ── */
        .book {
          position: relative;
          z-index: 10;
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 860px;
          width: 100%;
          min-height: 560px;
          border-radius: 3px 12px 12px 3px;
          overflow: hidden;
          box-shadow:
            0 2px 4px rgba(42,18,30,.08),
            0 8px 16px rgba(42,18,30,.12),
            0 20px 40px rgba(42,18,30,.2),
            0 40px 80px rgba(42,18,30,.25),
            -4px 0 8px rgba(42,18,30,.1);
          transform: perspective(1200px) rotateX(3deg) rotateY(-1deg);
          transform-origin: center 110%;
        }

        /* Paper texture */
        .book::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 100;
          mix-blend-mode: multiply;
        }

        /* ── Spine ── */
        .book-spine {
          position: absolute;
          left: 50%;
          top: 0; bottom: 0;
          width: 4px;
          transform: translateX(-50%);
          z-index: 20;
          pointer-events: none;
          background: linear-gradient(to right,
            rgba(42,18,30,.18),
            rgba(42,18,30,.06) 40%,
            rgba(255,255,255,.15) 50%,
            rgba(42,18,30,.06) 60%,
            rgba(42,18,30,.12)
          );
          box-shadow: 0 0 8px rgba(42,18,30,.1);
        }

        /* ── Pages ── */
        .book-page {
          position: relative;
          overflow: hidden;
          min-height: 560px;
          animation: page-appear 0.3s ease-out;
        }
        .book-page-left {
          background: linear-gradient(to right, #fff5f0 0%, #fffaf8 100%);
          border-right: 1px solid rgba(42,18,30,.06);
        }
        .book-page-right {
          background: linear-gradient(to left, #fff8f5 0%, #fffaf8 100%);
        }
        /* Inner gutter shadows */
        .book-page-left::after {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0;
          width: 40px;
          background: linear-gradient(to right, transparent, rgba(42,18,30,.04));
          pointer-events: none;
          z-index: 1;
        }
        .book-page-right::before {
          content: '';
          position: absolute;
          top: 0; left: 0; bottom: 0;
          width: 40px;
          background: linear-gradient(to left, transparent, rgba(42,18,30,.04));
          pointer-events: none;
          z-index: 1;
        }

        /* ── Table surface ── */
        .table-surface {
          position: absolute;
          bottom: 0;
          left: 0; right: 0;
          height: 96px;
          z-index: 0;
        }

        /* ── Page flip animation overlay ── */
        .page-flip-overlay {
          position: absolute;
          inset: 0;
          z-index: 50;
          pointer-events: none;
          background: rgba(255,245,250,.15);
        }

        /* ── Animations ── */
        @keyframes page-appear {
          0%   { opacity: 0; transform: rotateY(-6deg) translateX(-8px); }
          100% { opacity: 1; transform: rotateY(0deg)  translateX(0); }
        }
        @keyframes page-flip-left {
          0%   { transform: perspective(800px) rotateY(0deg);   opacity: 1; }
          50%  { transform: perspective(800px) rotateY(-90deg); opacity: 0; }
          100% { transform: perspective(800px) rotateY(0deg);   opacity: 1; }
        }
        @keyframes page-flip-right {
          0%   { transform: perspective(800px) rotateY(0deg);  opacity: 1; }
          50%  { transform: perspective(800px) rotateY(90deg); opacity: 0; }
          100% { transform: perspective(800px) rotateY(0deg);  opacity: 1; }
        }
        .page-turning-left  { animation: page-flip-left  0.4s ease-in-out; }
        .page-turning-right { animation: page-flip-right 0.4s ease-in-out; }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .stone-scene { margin: -3rem -1rem -5rem; }
          .book {
            grid-template-columns: 1fr;
            border-radius: 16px;
            transform: none;
          }
          .book-page-left { border-right: none; border-bottom: 1px solid rgba(42,18,30,.08); }
          .book-hand { display: none; }
          .table-surface { height: 48px; }
          .book-container { padding: 24px 16px 0; }
        }
      `}</style>
    </div>
  );
}
