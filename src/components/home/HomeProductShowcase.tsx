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
    <div style={{ padding: compactPreview ? "0" : "0 40px", marginTop: 8 }}>
      <div style={{ position: "relative", height: 2, background: "#e8e5e0" }}>
        <div
          ref={barRef}
          style={{
            position: "absolute",
            top: -1,
            height: 4,
            left: "0%",
            width: "30%",
            background: "#1a1a1a",
            transition: prefersReducedMotion ? "none" : "left .15s ease-out",
          }}
        />
      </div>
    </div>
  );
}

export function HomeProductShowcase({ tabs, defaultTab, compactPreview = false }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.key);
  const [isVisible, setIsVisible] = useState(compactPreview);
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
                      sizes="(max-width: 640px) 160px, 220px"
                    />
                  ) : null}
                </div>
                <p className="showcase-name">{product.name}</p>
                <p className="showcase-price">{formatPrice(product.price)}</p>
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
          padding: 36px 0 28px;
          max-width: 1240px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(32px);
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
          gap: 28px;
          padding: 0 32px;
          margin-bottom: 22px;
          border-bottom: 1px solid #e8e5e0;
        }
        .showcase-preview .showcase-tabs {
          gap: 24px;
          padding: 0;
          margin-bottom: 18px;
        }
        .showcase-tab {
          position: relative;
          padding: 10px 0;
          font-size: 14px;
          font-weight: 500;
          color: #999;
          background: none;
          border: none;
          cursor: pointer;
          transition: color .2s;
          font-family: inherit;
        }
        .showcase-tab:hover { color: #1a1a1a; }
        .showcase-tab-active { color: #1a1a1a; }
        .showcase-tab-active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0; right: 0;
          height: 2px;
          background: #1a1a1a;
        }

        .showcase-scroll-wrap {
          position: relative;
          padding: 0 32px;
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
          padding-bottom: 14px;
        }
        .showcase-scroller::-webkit-scrollbar { display: none; }

        .showcase-card {
          flex: 0 0 220px;
          scroll-snap-align: start;
          opacity: 0;
          transform: translateY(20px);
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
          aspect-ratio: 1 / 1;
          background: #f5f3f0;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .showcase-img {
          object-fit: cover;
          transition: transform .6s ease;
        }
        .showcase-card:hover .showcase-img {
          transform: scale(1.04);
        }
        .showcase-name {
          font-size: 13px;
          color: #1a1a1a;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .showcase-price {
          font-size: 13px;
          color: #1a1a1a;
          font-weight: 500;
        }

        .showcase-nav-btn {
          position: absolute;
          top: calc(50% - 24px);
          z-index: 10;
          width: 38px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          background: white;
          border: 1px solid #e8e5e0;
          color: #1a1a1a;
          cursor: pointer;
          transition: background .2s, border-color .2s, color .2s;
          box-shadow: 0 2px 8px rgba(0,0,0,.06);
        }
        .showcase-nav-btn:hover {
          background: #1a1a1a;
          color: white;
          border-color: #1a1a1a;
        }
        .showcase-nav-prev { left: 12px; }
        .showcase-nav-next { right: 12px; }
        .showcase-preview .showcase-nav-btn {
          display: none;
        }

        @media (max-width: 640px) {
          .showcase-tabs { gap: 18px; padding: 0 16px; margin-bottom: 18px; }
          .showcase-tab { font-size: 13px; }
          .showcase-scroll-wrap { padding: 0 16px; }
          .showcase-scroller { gap: 14px; }
          .showcase-card { flex: 0 0 160px; }
          .showcase-nav-btn { display: none; }
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
