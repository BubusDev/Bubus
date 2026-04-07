"use client";

import { ChevronLeft, ChevronRight, Gem } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type Stone = {
  id: string;
  name: string;
  slug: string;
  color: string;
  colorHex: string;
  shortDesc: string;
  longDesc: string;
  effects: string[];
  origin: string | null;
  chakra: string | null;
  imageUrl: string | null;
};

type Props = {
  stones: Stone[];
};

function StonePageLeft({ stone, pageNum }: { stone: Stone; pageNum: number }) {
  return (
    <div className="flex h-full flex-col">
      {/* Fejléc */}
      <div className="page-header">
        <span className="page-label">{stone.chakra ?? "Féldrágakő"}</span>
        <span className="page-num">{pageNum}</span>
      </div>

      {/* Kő neve */}
      <h2 className="stone-name">{stone.name}</h2>
      {stone.origin && <p className="stone-origin">{stone.origin}</p>}

      {/* Vonal */}
      <div className="stone-divider" />

      {/* Kő fotó / szín kör */}
      <div className="stone-image-wrap">
        {stone.imageUrl ? (
          <div className="stone-photo">
            <Image src={stone.imageUrl} alt={stone.name} fill style={{ objectFit: "cover" }} />
          </div>
        ) : (
          <div
            className="stone-circle"
            style={{
              background: `radial-gradient(circle at 35% 35%, white 0%, ${stone.colorHex}99 45%, ${stone.colorHex} 100%)`,
              boxShadow: `0 8px 28px ${stone.colorHex}55, 0 0 0 3px white`,
            }}
          />
        )}
      </div>

      {/* Rövid leírás */}
      <p className="stone-short-desc">{stone.shortDesc}</p>

      {/* Hatások */}
      {stone.effects.length > 0 && (
        <div className="stone-effects">
          {stone.effects.slice(0, 5).map((e) => (
            <span key={e} className="stone-effect-pill">{e}</span>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* Lap alja */}
      <div className="page-footer">
        <span className="page-brand">Chicks Jewelry</span>
        <div className="page-footer-line" />
      </div>
    </div>
  );
}

function StonePageRight({ stone, pageNum }: { stone: Stone; pageNum: number }) {
  return (
    <div className="flex h-full flex-col">
      {/* Fejléc */}
      <div className="page-header">
        <span className="page-label">Részletes leírás</span>
        <span className="page-num">{pageNum}</span>
      </div>

      {/* Hosszú leírás */}
      <p className="stone-long-desc">{stone.longDesc}</p>

      {/* Vonal */}
      <div className="stone-section-divider" />

      {/* Adatok */}
      <div className="stone-details">
        {[
          { label: "Csakra", value: stone.chakra, hex: null },
          { label: "Eredet", value: stone.origin, hex: null },
          { label: "Szín", value: stone.color, hex: stone.colorHex },
        ]
          .filter((r) => r.value)
          .map((row) => (
            <div key={row.label} className="stone-detail-row">
              <span className="stone-detail-label">{row.label}</span>
              <span className="stone-detail-value">
                {row.hex && (
                  <span
                    className="stone-detail-dot"
                    style={{ background: row.hex }}
                  />
                )}
                {row.value}
              </span>
            </div>
          ))}
      </div>

      <div className="flex-1" />

      {/* Lap alja */}
      <div className="page-footer">
        <div className="page-footer-line" />
        <span className="page-brand">{new Date().getFullYear()}</span>
      </div>
    </div>
  );
}

function EmptyPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <p style={{ fontSize: 12, color: "#c0a0b4", fontStyle: "italic" }}>Hamarosan…</p>
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

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const idx = stones.findIndex((s) => s.slug === hash);
    if (idx >= 0) setCurrentPage(Math.floor(idx / 2));
  }, [stones]);

  const handleTurn = (dir: "prev" | "next") => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage((p) =>
        dir === "next"
          ? Math.min(pairs.length - 1, p + 1)
          : Math.max(0, p - 1),
      );
      setIsAnimating(false);
    }, 220);
  };

  const pair = pairs[currentPage] ?? [];

  return (
    <div className="stones-scene">
      {/* Fejléc */}
      <header className="stones-header">
        <div className="stones-pill">
          <Gem className="h-3.5 w-3.5" />
          <span>Természet kincsei</span>
        </div>
        <h1 className="stones-title">Kövek, amelyek mesélnek</h1>
        <p className="stones-subtitle">
          Lapozd végig a féldrágakövek világát — minden oldal egy új történet.
        </p>
      </header>

      {/* Könyv + kézfotó */}
      <div className="book-scene">
        {/* Háttérkép */}
        <div className="book-bg-photo">
          <Image
            src="/images/book-hands.png"
            alt=""
            fill
            className="object-contain object-center"
            priority
          />
        </div>

        {/* DEV — kalibrációs overlay */}
        {process.env.NODE_ENV === "development" && (
          <div
            style={{
              position: "absolute",
              top: "9%", left: "11%", right: "11%", bottom: "28%",
              border: "2px solid red",
              zIndex: 100,
              pointerEvents: "none",
              display: "grid",
              gridTemplateColumns: "1fr 3% 1fr",
            }}
          >
            <div style={{ border: "1px solid blue", background: "rgba(0,0,255,.05)" }} />
            <div style={{ background: "rgba(255,0,0,.1)" }} />
            <div style={{ border: "1px solid green", background: "rgba(0,255,0,.05)" }} />
          </div>
        )}

        {/* Tartalom grid — fotó lapjaira igazítva */}
        <div className={`book-grid${isAnimating ? " book-animating" : ""}`}>
          {/* Bal lap */}
          <div className="book-leaf-wrapper book-leaf-left">
            <div className="book-leaf-content">
              {pair[0] ? (
                <StonePageLeft stone={pair[0]} pageNum={currentPage * 2 + 1} />
              ) : (
                <EmptyPage />
              )}
            </div>
          </div>

          {/* Gerinc */}
          <div className="book-spine-gap" />

          {/* Jobb lap */}
          <div className="book-leaf-wrapper book-leaf-right">
            <div className="book-leaf-content">
              {pair[1] ? (
                <StonePageRight stone={pair[1]} pageNum={currentPage * 2 + 2} />
              ) : (
                <EmptyPage />
              )}
            </div>
          </div>
        </div>

        {/* Lapozó gombok */}
        <button
          onClick={() => handleTurn("prev")}
          disabled={currentPage === 0 || isAnimating}
          className="book-nav-btn book-nav-prev"
          aria-label="Előző oldal"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleTurn("next")}
          disabled={currentPage === pairs.length - 1 || isAnimating}
          className="book-nav-btn book-nav-next"
          aria-label="Következő oldal"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Pontok */}
      {pairs.length > 1 && (
        <div className="book-pagination">
          {pairs.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`book-dot${i === currentPage ? " book-dot-active" : ""}`}
              aria-label={`${i + 1}. oldalpár`}
            />
          ))}
        </div>
      )}

      <style>{`
        /* ── Scene ── */
        .stones-scene {
          position: relative;
          background: linear-gradient(160deg, #f5d5e5 0%, #e8b4cc 50%, #d4a0b8 100%);
          margin: -3rem -1rem -5rem;
          padding: 48px 16px 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* ── Fejléc ── */
        .stones-header {
          text-align: center;
          margin-bottom: 28px;
          position: relative;
          z-index: 1;
        }
        .stones-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid rgba(196,90,133,.3);
          background: rgba(255,255,255,.5);
          border-radius: 999px;
          padding: 5px 14px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .3em;
          text-transform: uppercase;
          color: #c0517a;
          margin-bottom: 12px;
          backdrop-filter: blur(8px);
        }
        .stones-title {
          font-family: var(--font-display, 'Playfair Display', serif);
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          color: #2b1220;
          letter-spacing: -.02em;
          margin-bottom: 8px;
        }
        .stones-subtitle {
          font-size: 13px;
          color: #8a5070;
          line-height: 1.8;
          max-width: 40ch;
          margin: 0 auto;
        }

        /* ── Book scene ── */
        .book-scene {
          position: relative;
          width: 100%;
          max-width: 780px;
          aspect-ratio: 1 / 1;
        }

        .book-bg-photo {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        /* ── Tartalom grid ──
           1024×1024px fotó mérései:
           - Könyv felső éle:      92px → 9%
           - Könyv alsó éle:      737px → bottom 28%
           - Bal lap bal éle:     113px → left 11%
           - Jobb lap jobb éle:   912px → right 11%
           - Gerinc: 497–527px   → 3% oszlop
        */
        .book-grid {
          position: absolute;
          top: 9%;
          left: 11%;
          right: 11%;
          bottom: 28%;
          z-index: 10;
          display: grid;
          grid-template-columns: 1fr 3% 1fr;
          gap: 0;
          transition: opacity .22s ease, transform .22s ease;
        }
        .book-animating {
          opacity: 0;
          transform: scale(.985);
        }

        /* ── Lapok ── */
        .book-leaf-wrapper {
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .book-leaf-content {
          flex: 1;
          overflow: hidden;
          padding: 6% 8% 5%;
        }
        .book-leaf-left .book-leaf-content {
          padding-right: 6%;
          box-shadow: inset -6px 0 14px rgba(42,18,30,.05);
        }
        .book-leaf-right .book-leaf-content {
          padding-left: 6%;
          box-shadow: inset 6px 0 14px rgba(42,18,30,.04);
        }
        .book-spine-gap {
          /* üres gerinc terület */
        }

        /* ── Lap tartalom stílusok ── */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .page-label {
          font-size: 9px;
          letter-spacing: .32em;
          text-transform: uppercase;
          color: #c0517a;
        }
        .page-num {
          font-family: var(--font-display, serif);
          font-size: 10px;
          color: #b08898;
        }
        .stone-name {
          font-family: var(--font-display, 'Playfair Display', serif);
          font-size: clamp(1.1rem, 2.2vw, 1.55rem);
          color: #2b1220;
          line-height: 1.1;
          margin-bottom: 3px;
        }
        .stone-origin {
          font-size: 10px;
          color: #b08898;
          margin-bottom: 10px;
        }
        .stone-divider {
          height: 1px;
          width: 36px;
          background: linear-gradient(to right, #c45a85, transparent);
          margin-bottom: 12px;
          flex-shrink: 0;
        }
        .stone-image-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
          flex-shrink: 0;
        }
        .stone-photo {
          position: relative;
          width: min(100px, 22vw);
          height: min(100px, 22vw);
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(42,18,30,.15);
          border: 3px solid white;
          flex-shrink: 0;
        }
        .stone-circle {
          width: min(96px, 21vw);
          height: min(96px, 21vw);
          border-radius: 50%;
          flex-shrink: 0;
        }
        .stone-short-desc {
          font-size: 11.5px;
          line-height: 1.85;
          color: #5a3a4a;
        }
        .stone-effects {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 8px;
        }
        .stone-effect-pill {
          font-size: 9px;
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid #f0d4e0;
          background: #fdf5f8;
          color: #9a5a72;
        }
        .stone-long-desc {
          font-size: 11px;
          line-height: 2;
          color: #4a3040;
          overflow: hidden;
        }
        .stone-section-divider {
          height: 1px;
          background: #f0d4e0;
          margin: 10px 0;
          flex-shrink: 0;
        }
        .stone-details {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .stone-detail-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        .stone-detail-label {
          width: 46px;
          flex-shrink: 0;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .2em;
          color: #b08898;
          padding-top: 1px;
        }
        .stone-detail-value {
          font-size: 11.5px;
          color: #4a3040;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .stone-detail-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,.1);
          display: inline-block;
          flex-shrink: 0;
        }
        .page-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          opacity: .25;
          margin-top: 10px;
          flex-shrink: 0;
        }
        .page-brand {
          font-size: 9px;
          font-style: italic;
          font-family: var(--font-display, serif);
          color: #2b1220;
        }
        .page-footer-line {
          height: 1px;
          width: 36px;
          background: #c45a85;
        }

        /* ── Nav gombok ── */
        .book-nav-btn {
          position: absolute;
          bottom: 30%;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(196,90,133,.3);
          background: rgba(255,255,255,.72);
          color: #c45a85;
          backdrop-filter: blur(8px);
          cursor: pointer;
          transition: background .15s, transform .15s;
          box-shadow: 0 4px 12px rgba(42,18,30,.12);
        }
        .book-nav-btn:hover:not(:disabled) {
          background: rgba(255,255,255,.92);
          transform: scale(1.08);
        }
        .book-nav-btn:disabled { opacity: .3; cursor: default; }
        .book-nav-prev { left: 1%; }
        .book-nav-next { right: 1%; }

        /* ── Pagination ── */
        .book-pagination {
          display: flex;
          gap: 8px;
          margin-top: 16px;
          position: relative;
          z-index: 1;
        }
        .book-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(196,90,133,.3);
          border: none;
          cursor: pointer;
          transition: background .15s, transform .15s;
          padding: 0;
        }
        .book-dot-active {
          background: #c45a85;
          transform: scale(1.3);
        }

        /* ── Reszponzív ── */
        @media (max-width: 640px) {
          .stones-scene { padding: 32px 8px 48px; }
          .book-scene {
            max-width: 100%;
            aspect-ratio: auto;
            background: #faf7f2;
            border-radius: 1.5rem;
            box-shadow: 0 20px 60px rgba(42,18,30,.2);
          }
          .book-bg-photo { display: none; }
          .book-grid {
            position: relative;
            top: auto; left: auto; right: auto; bottom: auto;
            inset: 0;
            grid-template-columns: 1fr;
          }
          .book-spine-gap { display: none; }
          .book-leaf-left .book-leaf-content {
            border-bottom: 1px solid #f0d4e0;
            box-shadow: none;
          }
          .book-leaf-right .book-leaf-content {
            box-shadow: none;
          }
          .book-leaf-content { padding: 24px 20px; }
          .stone-name { font-size: 1rem; }
          .stone-long-desc { font-size: 10px; }
        }
      `}</style>
    </div>
  );
}
