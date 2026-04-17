"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ArrowRight } from "lucide-react";

export type MegaMenuHeroConfig = {
  backgroundImageSrc?: string;
  badge?: string;
  title: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
};

export type MegaMenuItem = {
  id: string;
  name: string;
  href: string;
  shortDescription?: string | null;
  previewImageSrc?: string;
  previewImageAlt?: string;
};

type MegaMenuProps = {
  triggerLabel: string;
  items: MegaMenuItem[];
  heroConfig?: MegaMenuHeroConfig;
  defaultPreviewImageSrc?: string;
  defaultPreviewImageAlt?: string;
};

export function MegaMenu({
  triggerLabel,
  items,
  heroConfig,
  defaultPreviewImageSrc,
  defaultPreviewImageAlt,
}: MegaMenuProps) {
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroCta = useRef<HTMLAnchorElement>(null);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) { clearTimeout(openTimerRef.current); openTimerRef.current = null; }
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
  }, []);

  const openNow = useCallback(() => { clearTimers(); setIsOpen(true); }, [clearTimers]);
  const closeNow = useCallback(() => { clearTimers(); setIsOpen(false); setHoveredItemId(null); }, [clearTimers]);

  const scheduleOpen = useCallback(() => {
    clearTimers();
    openTimerRef.current = setTimeout(openNow, 150);
  }, [clearTimers, openNow]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimerRef.current = setTimeout(closeNow, 200);
  }, [clearTimers, closeNow]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeNow(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeNow]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const activeItem = hoveredItemId
    ? (items.find((i) => i.id === hoveredItemId) ?? null)
    : null;

  const previewSrc = activeItem?.previewImageSrc ?? defaultPreviewImageSrc;
  const previewAlt =
    activeItem?.previewImageAlt ??
    activeItem?.name ??
    defaultPreviewImageAlt ??
    triggerLabel;
  const previewDesc = activeItem?.shortDescription ?? null;

  function handleItemKeyDown(e: React.KeyboardEvent<HTMLAnchorElement>) {
    const all = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("[data-mega-item]"),
    );
    const idx = all.indexOf(e.currentTarget);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      all[(idx + 1) % all.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      all[(idx - 1 + all.length) % all.length]?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      heroCta.current?.focus();
    }
  }

  return (
    <>
      {/* Backdrop — fixed, visually behind header/nav (z-40) but above page content */}
      <div
        aria-hidden="true"
        data-state={isOpen ? "open" : "closed"}
        className="pointer-events-none fixed inset-0 z-[39] bg-black/20 opacity-0 transition-opacity duration-200 data-[state=open]:opacity-100"
      />

      {/*
        Wrapper has NO position:relative intentionally — the panel's position:absolute
        will anchor to the parent <nav> (which has position:relative), making the panel
        span the full nav width.
      */}
      <div onMouseEnter={scheduleOpen} onMouseLeave={scheduleClose}>
        {/* Trigger button */}
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onFocus={scheduleOpen}
          onBlur={scheduleClose}
          className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-normal leading-5 tracking-[0.02em] text-[#121313] transition-colors duration-300 active:opacity-80 hover:text-white group-hover/category-nav:text-white group-focus-within/category-nav:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1] focus-visible:ring-offset-1"
        >
          <span>{triggerLabel}</span>
          <ChevronDown
            strokeWidth={2}
            aria-hidden="true"
            className={`h-3 w-3 text-[#8b6d7f] transition-transform duration-200 group-hover/category-nav:text-white group-focus-within/category-nav:text-white ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Mega menu panel — absolutely positioned relative to the <nav> ancestor */}
        <div
          id={panelId}
          role="region"
          aria-label={triggerLabel}
          aria-hidden={!isOpen}
          data-state={isOpen ? "open" : "closed"}
          className="absolute left-0 right-0 top-full z-[41] border-t border-[#f0e8ee] bg-[#fffafd]/98 shadow-[0_28px_64px_rgba(76,43,65,0.18)] backdrop-blur-xl pointer-events-none opacity-0 -translate-y-2 transition-[opacity,transform] duration-[250ms] ease-out data-[state=open]:pointer-events-auto data-[state=open]:opacity-100 data-[state=open]:translate-y-0"
        >
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8">
            <div
              className="grid divide-x divide-[#f0e8ee]"
              style={{ gridTemplateColumns: "30% 35% 35%" }}
            >

              {/* ── LEFT: category links (30%) ── */}
              <div className="pr-10">
                <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b08898]">
                  {triggerLabel}
                </p>
                <ul role="list" className="space-y-0.5">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        data-mega-item
                        tabIndex={isOpen ? 0 : -1}
                        role="menuitem"
                        onMouseEnter={() => setHoveredItemId(item.id)}
                        onMouseLeave={() => setHoveredItemId(null)}
                        onFocus={() => setHoveredItemId(item.id)}
                        onBlur={() => setHoveredItemId(null)}
                        onKeyDown={handleItemKeyDown}
                        className="group/link flex items-center gap-2 py-2 font-[family:var(--font-serif)] text-[18px] leading-tight text-[#3f2f39] focus-visible:outline-none focus-visible:underline focus-visible:decoration-[#c45a85] focus-visible:text-[#9b3d6e]"
                      >
                        <span className="transition-transform duration-150 group-hover/link:translate-x-1 group-hover/link:text-[#9b3d6e]">
                          {item.name}
                        </span>
                        <span
                          aria-hidden="true"
                          className="mt-px h-px w-0 flex-none bg-[#c45a85] transition-all duration-150 group-hover/link:w-4"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── MIDDLE: hover preview (35%) ── */}
              <div className="flex flex-col px-10">
                <div
                  className="relative w-full overflow-hidden rounded-xl bg-[#f3e8ef]"
                  style={{ aspectRatio: "3/4", maxHeight: 300 }}
                >
                  {previewSrc ? (
                    <Image
                      key={previewSrc}
                      src={previewSrc}
                      alt={previewAlt}
                      fill
                      className="object-cover transition-opacity duration-200"
                      sizes="(max-width: 1600px) 35vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span
                        className="font-[family:var(--font-serif)] text-4xl text-[#d4b8c8]"
                        aria-hidden="true"
                      >
                        ✦
                      </span>
                    </div>
                  )}
                </div>
                {previewDesc && (
                  <p className="mt-3 text-xs leading-relaxed text-[#8a6878]">
                    {previewDesc}
                  </p>
                )}
              </div>

              {/* ── RIGHT: hero / promo block (35%) ── */}
              <div className="pl-10">
                {heroConfig ? (
                  <div className="relative h-full min-h-[240px] overflow-hidden rounded-xl bg-gradient-to-br from-[#f0d0e0] to-[#d8b0cc]">
                    {heroConfig.backgroundImageSrc && (
                      <Image
                        src={heroConfig.backgroundImageSrc}
                        alt={heroConfig.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1600px) 35vw"
                      />
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3c1428]/80 via-[#3c1428]/30 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      {heroConfig.badge && (
                        <span className="mb-2 self-start rounded border border-white/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.28em] text-white/80">
                          {heroConfig.badge}
                        </span>
                      )}
                      <h3 className="mb-2 font-[family:var(--font-display)] text-xl font-semibold leading-tight text-white">
                        {heroConfig.title}
                      </h3>
                      {heroConfig.description && (
                        <p className="mb-4 text-xs leading-relaxed text-white/75">
                          {heroConfig.description}
                        </p>
                      )}
                      {heroConfig.ctaText && heroConfig.ctaHref && (
                        <Link
                          ref={heroCta}
                          href={heroConfig.ctaHref}
                          tabIndex={isOpen ? 0 : -1}
                          className="inline-flex items-center gap-1.5 self-start rounded border border-[#c45a85]/80 px-4 py-2 text-xs text-white transition-colors hover:bg-[#c45a85] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
                        >
                          {heroConfig.ctaText}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[240px] rounded-xl bg-[#f3e8ef]" />
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
