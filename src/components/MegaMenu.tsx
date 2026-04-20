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
        className="pointer-events-none fixed inset-0 z-[39] bg-[#2f2028]/[0.06] opacity-0 transition-opacity duration-200 data-[state=open]:opacity-100"
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
          className={`relative inline-flex items-center gap-1 whitespace-nowrap py-1 text-[13px] uppercase leading-5 tracking-[0.08em] transition-colors duration-150 after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-[#7f485c] after:transition-[width] after:duration-150 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0aeba] focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbf8f5] ${
            isOpen
              ? "font-semibold text-[#7f485c] after:w-full"
              : "font-medium text-[#4a343d] after:w-0 hover:text-[#7f485c] hover:after:w-full"
          }`}
        >
          <span>{triggerLabel}</span>
          <ChevronDown
            strokeWidth={2}
            aria-hidden="true"
            className={`h-3 w-3 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#7f485c]" : "text-[#8d7780]"
            }`}
          />
        </button>

        {/* Specialty navigation panel, absolutely positioned relative to the <nav> ancestor. */}
        <div
          id={panelId}
          role="region"
          aria-label={triggerLabel}
          aria-hidden={!isOpen}
          data-state={isOpen ? "open" : "closed"}
          className="pointer-events-none absolute left-0 right-0 top-full z-[41] border-t border-[#e6d8d2] bg-[#fffdfb] opacity-0 shadow-[0_18px_42px_rgba(57,39,47,0.08)] transition-opacity duration-200 ease-out data-[state=open]:pointer-events-auto data-[state=open]:opacity-100"
        >
          <div className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8 xl:py-8">
            <div
              className="grid divide-x divide-[#eee4df]"
              style={{ gridTemplateColumns: "minmax(190px, 0.78fr) minmax(230px, 1fr) minmax(280px, 1.08fr)" }}
            >

              {/* ── LEFT: category links (30%) ── */}
              <div className="min-w-0 pr-6 xl:pr-10">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a7c82]">
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
                        className={`group/link flex min-w-0 items-center gap-2 py-2.5 font-[family:var(--font-serif)] text-[17px] leading-tight transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0aeba] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdfb] xl:text-[18px] ${
                          activeItem?.id === item.id ? "font-semibold text-[#7f485c]" : "font-medium text-[#4a343d]"
                        }`}
                      >
                        <span className={`min-w-0 break-words transition-[color,transform] duration-150 group-hover/link:translate-x-0.5 group-hover/link:text-[#7f485c] ${
                          activeItem?.id === item.id ? "translate-x-0.5" : ""
                        }`}>
                          {item.name}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`mt-px h-px flex-none bg-[#7f485c] transition-all duration-150 group-hover/link:w-5 ${
                            activeItem?.id === item.id ? "w-5" : "w-0"
                          }`}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── MIDDLE: hover preview (35%) ── */}
              <div className="flex min-w-0 flex-col px-6 xl:px-10">
                <div
                  className="relative w-full overflow-hidden rounded-md bg-[#f3ede9]"
                  style={{ aspectRatio: "3/4", maxHeight: 318 }}
                >
                  {previewSrc ? (
                    <FadingMenuImage
                      key={previewSrc}
                      src={previewSrc}
                      alt={previewAlt}
                      className="object-cover object-[center_42%] transition-opacity duration-200"
                      sizes="(max-width: 1600px) 35vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#f4eeea]">
                      <span
                        className="font-[family:var(--font-serif)] text-4xl text-[#a98b91]"
                        aria-hidden="true"
                      >
                        ✦
                      </span>
                    </div>
                  )}
                </div>
                {previewDesc && (
                  <p key={activeItem?.id ?? "preview-desc"} className="mt-3 line-clamp-3 max-w-[34rem] text-[13px] leading-relaxed text-[#6f5960] transition-opacity duration-200">
                    {previewDesc}
                  </p>
                )}
              </div>

              {/* ── RIGHT: hero / promo block (35%) ── */}
              <div className="min-w-0 pl-6 xl:pl-10">
                {cardTitle && cardHref ? (
                  <div className="relative aspect-[4/3] min-h-[268px] overflow-hidden rounded-md bg-[#efe6e1]">
                    {cardImageSrc ? (
                      <FadingMenuImage
                        key={cardImageSrc}
                        src={cardImageSrc}
                        alt={cardImageAlt}
                        className="object-cover object-[center_42%]"
                        sizes="(max-width: 1600px) 35vw"
                      />
                    ) : null}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2f2028]/78 via-[#2f2028]/28 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex max-h-full flex-col justify-end p-5 drop-shadow-sm xl:p-6">
                      <span className="mb-2 self-start border border-white/35 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-white/82">
                        Válogatás
                      </span>
                      <h3 className="mb-2 line-clamp-2 break-words font-[family:var(--font-display)] text-[1.35rem] font-semibold leading-tight text-white">
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
                        className="inline-flex max-w-full items-center gap-1.5 self-start border border-white/50 bg-white/12 px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:border-white/75 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1dce4]"
                      >
                        <span className="line-clamp-1 min-w-0 break-all">{cardCtaText}</span>
                        <ArrowRight className="h-3 w-3 flex-none" />
                      </Link>
                    </div>
                  </div>
                ) : heroConfig ? (
                  <div className="relative h-full min-h-[268px] overflow-hidden rounded-md bg-[#efe6e1]">
                    {heroConfig.backgroundImageSrc ? (
                      <FadingMenuImage
                        key={heroConfig.backgroundImageSrc}
                        src={heroConfig.backgroundImageSrc}
                        alt={heroConfig.title}
                        className="object-cover object-[center_42%]"
                        sizes="(max-width: 1600px) 35vw"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2f2028]/78 via-[#2f2028]/28 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex max-h-full flex-col justify-end p-5 xl:p-6">
                      {heroConfig.badge ? (
                        <span className="mb-2 self-start border border-white/35 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-white/82">
                          {heroConfig.badge}
                        </span>
                      ) : null}
                      <h3 className="mb-2 line-clamp-2 break-words font-[family:var(--font-display)] text-[1.35rem] font-semibold leading-tight text-white">
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
                          className="inline-flex max-w-full items-center gap-1.5 self-start border border-white/50 bg-white/12 px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:border-white/75 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1dce4]"
                        >
                          <span className="line-clamp-1 min-w-0 break-all">{heroConfig.ctaText}</span>
                          <ArrowRight className="h-3 w-3 flex-none" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[268px] rounded-md bg-[#efe6e1]" />
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
