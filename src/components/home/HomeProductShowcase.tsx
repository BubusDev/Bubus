"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatPrice } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";

type Tab = {
  key: string;
  label: string;
  products: Product[];
};

type Props = {
  tabs: Tab[];
  defaultTab?: string;
};

function ScrollProgressBar({
  scrollerRef,
}: {
  scrollerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [progress, setProgress] = useState({ left: 0, width: 30 });

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) {
        setProgress({ left: 0, width: 100 });
        return;
      }
      const visibleRatio = el.clientWidth / el.scrollWidth;
      const scrollRatio = el.scrollLeft / maxScroll;
      const barWidth = visibleRatio * 100;
      const barLeft = scrollRatio * (100 - barWidth);
      setProgress({ left: barLeft, width: barWidth });
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [scrollerRef]);

  return (
    <div style={{ padding: "0 40px", marginTop: 8 }}>
      <div style={{ position: "relative", height: 2, background: "#e8e5e0" }}>
        <div
          style={{
            position: "absolute",
            top: -1,
            height: 4,
            left: `${progress.left}%`,
            width: `${progress.width}%`,
            background: "#1a1a1a",
            transition: "left .15s ease-out",
          }}
        />
      </div>
    </div>
  );
}

export function HomeProductShowcase({ tabs, defaultTab }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.key);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (tabs.length === 0) return null;

  const activeProducts = tabs.find((t) => t.key === activeTab)?.products ?? [];

  const scrollBy = (dir: "prev" | "next") => {
    if (!scrollerRef.current) return;
    const width = scrollerRef.current.clientWidth;
    scrollerRef.current.scrollBy({
      left: dir === "next" ? width * 0.8 : -width * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      className={`showcase-section ${isVisible ? "showcase-visible" : ""}`}
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
                      sizes="(max-width: 640px) 200px, 280px"
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

      <ScrollProgressBar scrollerRef={scrollerRef} />

      <style>{`
        .showcase-section {
          padding: 60px 0 40px;
          max-width: 1400px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(32px);
          transition: opacity .7s ease-out, transform .7s ease-out;
        }
        .showcase-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .showcase-tabs {
          display: flex;
          gap: 36px;
          padding: 0 40px;
          margin-bottom: 32px;
          border-bottom: 1px solid #e8e5e0;
        }
        .showcase-tab {
          position: relative;
          padding: 12px 0;
          font-size: 15px;
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
          padding: 0 40px;
        }

        .showcase-scroller {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-bottom: 20px;
        }
        .showcase-scroller::-webkit-scrollbar { display: none; }

        .showcase-card {
          flex: 0 0 280px;
          scroll-snap-align: start;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity .6s ease-out, transform .6s ease-out;
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
          margin-bottom: 16px;
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
          color: #1a1a1a;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .showcase-price {
          font-size: 14px;
          color: #1a1a1a;
          font-weight: 500;
        }

        .showcase-nav-btn {
          position: absolute;
          top: calc(50% - 30px);
          z-index: 10;
          width: 44px; height: 44px;
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

        @media (max-width: 640px) {
          .showcase-tabs { gap: 20px; padding: 0 20px; }
          .showcase-tab { font-size: 13px; }
          .showcase-scroll-wrap { padding: 0 20px; }
          .showcase-card { flex: 0 0 200px; }
          .showcase-nav-btn { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .showcase-section,
          .showcase-card,
          .showcase-img { transition: none !important; }
          .showcase-section { opacity: 1; transform: none; }
          .showcase-visible .showcase-card { opacity: 1; transform: none; }
        }
      `}</style>
    </section>
  );
}
