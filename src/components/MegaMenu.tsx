"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
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
  cardImageSrc?: string;
  cardImageAlt?: string;
  cardTitle?: string | null;
  cardDescription?: string | null;
  ctaText?: string | null;
};

type MegaMenuProps = {
  triggerLabel: string;
  items: MegaMenuItem[];
  heroConfig?: MegaMenuHeroConfig;
  defaultPreviewImageSrc?: string;
  defaultPreviewImageAlt?: string;
};

function FadingMenuImage({
  alt,
  className,
  sizes,
  src,
  style,
}: {
  alt: string;
  className: string;
  sizes: string;
  src?: string;
  style?: CSSProperties;
}) {
  const [isLoaded, setIsLoaded] = useState(!src);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return null;
  }

  return (
    <>
      {!isLoaded ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-white/18"
        />
      ) : null}
      <Image
        key={src}
        src={src}
        alt={alt}
        fill
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        className={`${className} transition-opacity duration-300 ease-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={style}
        sizes={sizes}
      />
    </>
  );
}

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

  function handleWrapperBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      scheduleClose();
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeNow(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeNow]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const firstItem = items[0] ?? null;
  const activeItem = hoveredItemId
    ? (items.find((i) => i.id === hoveredItemId) ?? firstItem)
    : firstItem;

  const previewSrc = activeItem?.previewImageSrc ?? defaultPreviewImageSrc;
  const previewAlt =
    activeItem?.previewImageAlt ??
    activeItem?.name ??
    defaultPreviewImageAlt ??
    triggerLabel;
  const previewDesc = activeItem?.shortDescription ?? null;
  const cardTitle = activeItem?.cardTitle || activeItem?.name || heroConfig?.title;
  const cardDescription =
    activeItem?.cardDescription ||
    activeItem?.shortDescription ||
    heroConfig?.description;
  const cardCtaText = activeItem?.ctaText || heroConfig?.ctaText || "Megnyitás";
  const cardHref = activeItem?.href || heroConfig?.ctaHref;
  const cardImageSrc = activeItem?.cardImageSrc || heroConfig?.backgroundImageSrc;
  const cardImageAlt = activeItem?.cardImageAlt || cardTitle || triggerLabel;

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
      <div onMouseEnter={scheduleOpen} onMouseLeave={scheduleClose} onFocus={openNow} onBlur={handleWrapperBlur}>
        {/* Trigger button */}
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-controls={panelId}
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
          <div className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8">
            <div
              className="grid divide-x divide-[#f0e8ee]"
              style={{ gridTemplateColumns: "minmax(180px, 0.82fr) minmax(220px, 1fr) minmax(260px, 1.05fr)" }}
            >

              {/* ── LEFT: category links (30%) ── */}
              <div className="min-w-0 pr-5 xl:pr-10">
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
                        onFocus={() => setHoveredItemId(item.id)}
                        onKeyDown={handleItemKeyDown}
                        className={`group/link flex min-w-0 items-center gap-2 py-2 font-[family:var(--font-serif)] text-[17px] leading-tight focus-visible:outline-none focus-visible:underline focus-visible:decoration-[#c45a85] focus-visible:text-[#9b3d6e] xl:text-[18px] ${
                          activeItem?.id === item.id ? "text-[#9b3d6e]" : "text-[#3f2f39]"
                        }`}
                      >
                        <span className={`min-w-0 break-words transition-transform duration-150 group-hover/link:translate-x-1 group-hover/link:text-[#9b3d6e] ${
                          activeItem?.id === item.id ? "translate-x-1" : ""
                        }`}>
                          {item.name}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`mt-px h-px flex-none bg-[#c45a85] transition-all duration-150 group-hover/link:w-4 ${
                            activeItem?.id === item.id ? "w-4" : "w-0"
                          }`}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── MIDDLE: hover preview (35%) ── */}
              <div className="flex min-w-0 flex-col px-5 xl:px-10">
                <div
                  className="relative w-full overflow-hidden rounded-lg bg-[linear-gradient(135deg,#f8edf3_0%,#ead7e4_100%)]"
                  style={{ aspectRatio: "4/5", maxHeight: 300 }}
                >
                  {previewSrc ? (
                    <FadingMenuImage
                      key={previewSrc}
                      src={previewSrc}
                      alt={previewAlt}
                      className="object-cover object-center transition-opacity duration-200"
                      sizes="(max-width: 1600px) 35vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_35%,#fff7fb_0%,#f2dce9_52%,#dfc0d2_100%)]">
                      <span
                        className="font-[family:var(--font-serif)] text-4xl text-[#b985a1]"
                        aria-hidden="true"
                      >
                        ✦
                      </span>
                    </div>
                  )}
                </div>
                {previewDesc && (
                  <p key={activeItem?.id ?? "preview-desc"} className="mt-3 line-clamp-3 text-xs leading-relaxed text-[#8a6878] transition-opacity duration-200">
                    {previewDesc}
                  </p>
                )}
              </div>

              {/* ── RIGHT: hero / promo block (35%) ── */}
              <div className="min-w-0 pl-5 xl:pl-10">
                {cardTitle && cardHref ? (
                  <div className="relative aspect-[4/3] min-h-[260px] overflow-hidden rounded-lg bg-[radial-gradient(circle_at_70%_15%,#9b5a79_0%,#63324f_45%,#351925_100%)]">
                    {cardImageSrc ? (
                      <FadingMenuImage
                        key={cardImageSrc}
                        src={cardImageSrc}
                        alt={cardImageAlt}
                        className="object-cover object-center"
                        sizes="(max-width: 1600px) 35vw"
                      />
                    ) : null}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2e1020]/90 via-[#3c1428]/52 to-[#3c1428]/10" />
                    <div className="absolute inset-x-0 bottom-0 flex max-h-full flex-col justify-end p-5 drop-shadow-sm xl:p-6">
                      <span className="mb-2 self-start rounded border border-white/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.28em] text-white/80">
                        Válogatás
                      </span>
                      <h3 className="mb-2 line-clamp-2 break-words font-[family:var(--font-display)] text-xl font-semibold leading-tight text-white">
                        {cardTitle}
                      </h3>
                      {cardDescription && (
                        <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-white/82">
                          {cardDescription}
                        </p>
                      )}
                      <Link
                        ref={heroCta}
                        href={cardHref}
                        tabIndex={isOpen ? 0 : -1}
                        className="inline-flex max-w-full items-center gap-1.5 self-start rounded border border-[#e9b7cc]/80 bg-[#3c1428]/18 px-4 py-2 text-xs text-white transition-colors hover:bg-[#c45a85] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
                      >
                        <span className="line-clamp-1 min-w-0 break-all">{cardCtaText}</span>
                        <ArrowRight className="h-3 w-3 flex-none" />
                      </Link>
                    </div>
                  </div>
                ) : heroConfig ? (
                  <div className="relative h-full min-h-[260px] overflow-hidden rounded-lg bg-[radial-gradient(circle_at_70%_15%,#9b5a79_0%,#63324f_45%,#351925_100%)]">
                    {heroConfig.backgroundImageSrc ? (
                      <FadingMenuImage
                        key={heroConfig.backgroundImageSrc}
                        src={heroConfig.backgroundImageSrc}
                        alt={heroConfig.title}
                        className="object-cover object-center"
                        sizes="(max-width: 1600px) 35vw"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2e1020]/90 via-[#3c1428]/52 to-[#3c1428]/10" />
                    <div className="absolute inset-x-0 bottom-0 flex max-h-full flex-col justify-end p-5 xl:p-6">
                      {heroConfig.badge ? (
                        <span className="mb-2 self-start rounded border border-white/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.28em] text-white/80">
                          {heroConfig.badge}
                        </span>
                      ) : null}
                      <h3 className="mb-2 line-clamp-2 break-words font-[family:var(--font-display)] text-xl font-semibold leading-tight text-white">
                        {heroConfig.title}
                      </h3>
                      {heroConfig.description && (
                        <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-white/82">
                          {heroConfig.description}
                        </p>
                      )}
                      {heroConfig.ctaText && heroConfig.ctaHref ? (
                        <Link
                          ref={heroCta}
                          href={heroConfig.ctaHref}
                          tabIndex={isOpen ? 0 : -1}
                          className="inline-flex max-w-full items-center gap-1.5 self-start rounded border border-[#e9b7cc]/80 bg-[#3c1428]/18 px-4 py-2 text-xs text-white transition-colors hover:bg-[#c45a85] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
                        >
                          <span className="line-clamp-1 min-w-0 break-all">{heroConfig.ctaText}</span>
                          <ArrowRight className="h-3 w-3 flex-none" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[260px] rounded-lg bg-[radial-gradient(circle_at_70%_15%,#9b5a79_0%,#63324f_45%,#351925_100%)]" />
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
