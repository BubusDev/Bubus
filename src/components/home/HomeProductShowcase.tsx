"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatPrice } from "@/lib/catalog";

export type HomeShowcaseProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  isOnSale?: boolean;
  imageUrl?: string | null;
};

type Tab = {
  key: string;
  label: string;
  products: HomeShowcaseProduct[];
};

type Props = {
  tabs: Tab[];
  defaultTab?: string;
  compactPreview?: boolean;
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

function ScrollProgressBar({
  scrollerRef,
  resetKey,
  prefersReducedMotion,
  compactPreview = false,
}: {
  scrollerRef: React.RefObject<HTMLDivElement | null>;
  resetKey: string | undefined;
  prefersReducedMotion: boolean;
  compactPreview?: boolean;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  const updateProgress = useCallback(() => {
    const el = scrollerRef.current;
    const bar = barRef.current;
    if (!el || !bar) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      bar.style.left = "0%";
      bar.style.width = "100%";
      return;
    }
    const visibleRatio = el.clientWidth / el.scrollWidth;
    const scrollRatio = el.scrollLeft / maxScroll;
    const barWidth = visibleRatio * 100;
    const barLeft = scrollRatio * (100 - barWidth);
    bar.style.left = `${barLeft}%`;
    bar.style.width = `${barWidth}%`;
  }, [scrollerRef]);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateProgress();
    el.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      el.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [scrollerRef, updateProgress]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    el.scrollLeft = 0;
    updateProgress();

    const frame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(frame);
  }, [resetKey, scrollerRef, updateProgress]);

  return (
    <div style={{ padding: compactPreview ? "0" : "0", marginTop: 14 }}>
      <div style={{ position: "relative", height: 1, background: "#e7e1d7" }}>
        <div
          ref={barRef}
          style={{
            position: "absolute",
            top: -1,
            height: 3,
            left: "0%",
            width: "30%",
            background: "#22231f",
            transition: prefersReducedMotion ? "none" : "left .15s ease-out",
          }}
        />
      </div>
    </div>
  );
}

export function HomeProductShowcase({ tabs, defaultTab, compactPreview = false }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.key);
  const [isVisible, setIsVisible] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (compactPreview) return;

    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [compactPreview]);

  if (tabs.length === 0) return null;

  const activeProducts = tabs.find((t) => t.key === activeTab)?.products ?? [];

  const scrollBy = (dir: "prev" | "next") => {
    if (!scrollerRef.current) return;
    const width = scrollerRef.current.clientWidth;
    scrollerRef.current.scrollBy({
      left: dir === "next" ? width * 0.8 : -width * 0.8,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      className={`showcase-section ${compactPreview ? "showcase-preview" : ""} ${isVisible ? "showcase-visible" : ""}`}
    >
      <div className="showcase-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`showcase-tab ${activeTab === tab.key ? "showcase-tab-active" : ""}`}
          aria-pressed={activeTab === tab.key}
        >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="showcase-scroll-wrap">
        <button
          onClick={() => scrollBy("prev")}
          className="showcase-nav-btn showcase-nav-prev"
          aria-label="Előző"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <div ref={scrollerRef} className="showcase-scroller">
          {activeProducts.map((product, i) => (
            <article
              key={product.id}
              className="showcase-card"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <Link href={`/product/${product.slug}`} className="block">
                <div className="showcase-img-wrap">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="showcase-img"
                      sizes="(max-width: 640px) 72vw, (max-width: 1280px) 292px, 315px"
                    />
                  ) : null}
                </div>
                <p className="showcase-name">{product.name}</p>
                <p className="showcase-price">
                  {product.isOnSale && product.compareAtPrice ? (
                    <>
                      <span>{formatPrice(product.price)}</span>
                      <span className="showcase-compare-price">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    </>
                  ) : (
                    formatPrice(product.price)
                  )}
                </p>
              </Link>
            </article>
          ))}
        </div>

        <button
          onClick={() => scrollBy("next")}
          className="showcase-nav-btn showcase-nav-next"
          aria-label="Következő"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      <ScrollProgressBar
        scrollerRef={scrollerRef}
        resetKey={activeTab}
        prefersReducedMotion={prefersReducedMotion}
        compactPreview={compactPreview}
      />

      <style>{`
        .showcase-section {
          padding: 0 0 6px;
          max-width: none;
          margin: 0 auto;
          opacity: 1;
          transform: translateY(0);
          transition: opacity .7s ease-out, transform .7s ease-out;
        }
        .showcase-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .showcase-preview {
          padding: 0;
          max-width: none;
          opacity: 1;
          transform: none;
        }

        .showcase-tabs {
          display: flex;
          gap: 12px;
          padding: 0;
          margin-bottom: 24px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .showcase-tabs::-webkit-scrollbar { display: none; }
        .showcase-preview .showcase-tabs {
          gap: 24px;
          padding: 0;
          margin-bottom: 18px;
        }
        .showcase-tab {
          position: relative;
          flex: 0 0 auto;
          padding: 10px 0;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: #8b867d;
          background: none;
          border: none;
          cursor: pointer;
          transition: color .2s;
          font-family: inherit;
        }
        .showcase-tab + .showcase-tab { margin-left: 18px; }
        .showcase-tab:hover { color: #22231f; }
        .showcase-tab:focus-visible {
          outline: 2px solid #6f775d;
          outline-offset: 4px;
        }
        .showcase-tab-active { color: #22231f; }
        .showcase-tab-active::after {
          content: '';
          position: absolute;
          bottom: 5px;
          left: 0; right: 0;
          height: 1px;
          background: #22231f;
        }

        .showcase-scroll-wrap {
          position: relative;
          padding: 0;
        }
        .showcase-preview .showcase-scroll-wrap {
          padding: 0;
        }

        .showcase-scroller {
          display: flex;
          gap: 18px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-bottom: 16px;
        }
        .showcase-scroller::-webkit-scrollbar { display: none; }

        .showcase-card {
          flex: 0 0 min(72vw, 315px);
          scroll-snap-align: start;
          opacity: 1;
          transform: translateY(0);
          transition: opacity .6s ease-out, transform .6s ease-out;
        }
        .showcase-preview .showcase-card {
          flex-basis: 180px;
          opacity: 1;
          transform: none;
        }
        .showcase-visible .showcase-card {
          opacity: 1;
          transform: translateY(0);
        }

        .showcase-img-wrap {
          position: relative;
          aspect-ratio: 3 / 4;
          background: #f5f3f0;
          overflow: hidden;
          margin-bottom: 14px;
        }
        .showcase-img {
          object-fit: cover;
          transition: transform .6s ease;
        }
        .showcase-card:hover .showcase-img {
          transform: scale(1.04);
        }
        .showcase-name {
          font-size: 14px;
          color: #22231f;
          margin-bottom: 4px;
          line-height: 1.35;
        }
        .showcase-price {
          font-size: 13px;
          color: #5f5a52;
          font-weight: 500;
          display: flex;
          gap: 8px;
          align-items: baseline;
          flex-wrap: wrap;
        }
        .showcase-compare-price {
          color: #948d82;
          font-weight: 400;
          text-decoration: line-through;
        }

        .showcase-nav-btn {
          position: absolute;
          top: calc(50% - 32px);
          z-index: 10;
          width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,.92);
          border: 1px solid #e7e1d7;
          color: #22231f;
          cursor: pointer;
          transition: background .2s, border-color .2s, color .2s;
        }
        .showcase-nav-btn:hover {
          background: #22231f;
          color: white;
          border-color: #22231f;
        }
        .showcase-nav-btn:focus-visible {
          outline: 2px solid #6f775d;
          outline-offset: 3px;
        }
        .showcase-nav-prev { left: -14px; }
        .showcase-nav-next { right: -14px; }
        .showcase-preview .showcase-nav-btn {
          display: none;
        }

        @media (max-width: 640px) {
          .showcase-tabs { gap: 0; margin-bottom: 18px; }
          .showcase-tab { font-size: 10px; letter-spacing: .16em; }
          .showcase-scroll-wrap { padding: 0; }
          .showcase-scroller { gap: 14px; }
          .showcase-card { flex: 0 0 72vw; }
          .showcase-nav-btn { display: none; }
        }

        @media (min-width: 900px) {
          .showcase-card { flex-basis: 292px; }
        }

        @media (min-width: 1280px) {
          .showcase-card { flex-basis: 315px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .showcase-section,
          .showcase-card,
          .showcase-img,
          .showcase-tab,
          .showcase-nav-btn { transition: none !important; }
          .showcase-section { opacity: 1; transform: none; }
          .showcase-visible .showcase-card { opacity: 1; transform: none; }
          .showcase-card:hover .showcase-img { transform: none; }
        }
      `}</style>
    </section>
  );
}
