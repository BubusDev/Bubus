"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronDown, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  formatPrice,
  type CatalogFilters,
  type FilterGroup,
  type ParsedCollectionState,
} from "@/lib/catalog";

type FilterSidebarProps = {
  availableFilters: CatalogFilters;
  filterGroups: FilterGroup[];
  state: ParsedCollectionState;
  mode?: "both" | "mobile-trigger" | "desktop-sidebar" | "drawer";
  compact?: boolean;
};

type AccordionGroupKey = FilterGroup["key"] | "price";

const FILTER_PARAM_KEYS = [
  "category",
  "stone",
  "color",
  "style",
  "occasion",
  "availability",
  "priceMin",
  "priceMax",
  "special",
] as const;

function getActiveFilterCount(state: ParsedCollectionState) {
  return (
    Object.values(state.selected).reduce((sum, values) => sum + values.length, 0) +
    (typeof state.priceMin === "number" || typeof state.priceMax === "number" ? 1 : 0) +
    (state.special ? 1 : 0)
  );
}

function getDefaultExpandedKeys(groups: FilterGroup[]) {
  return groups
    .filter((group) => group.options.length > 0)
    .slice(0, 2)
    .map((group) => group.key as AccordionGroupKey);
}

function getPricePresets(availableFilters: CatalogFilters) {
  const [priceMin, priceMax] = availableFilters.priceRange;
  const low = Math.round((priceMin + (priceMax - priceMin) * 0.33) / 1000) * 1000;
  const high = Math.round((priceMin + (priceMax - priceMin) * 0.66) / 1000) * 1000;

  return [
    { label: `${formatPrice(low)} alatt`, min: undefined, max: low },
    { label: `${formatPrice(low)} – ${formatPrice(high)}`, min: low, max: high },
    { label: `${formatPrice(high)} felett`, min: high, max: undefined },
  ];
}

function FilterContent({
  availableFilters,
  filterGroups,
  state,
  onClose,
}: FilterSidebarProps & { onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const visibleGroups = filterGroups.filter((group) => group.options.length > 0);
  const [expandedGroups, setExpandedGroups] = useState<AccordionGroupKey[]>(() =>
    getDefaultExpandedKeys(filterGroups),
  );
  const hasPriceFilter = typeof state.priceMin === "number" || typeof state.priceMax === "number";
  const pricePresets = getPricePresets(availableFilters);

  const updateParams = (params: URLSearchParams) => {
    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname, {
      scroll: false,
    });
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    FILTER_PARAM_KEYS.forEach((key) => params.delete(key));
    updateParams(params);
  };

  const toggleGroup = (groupKey: AccordionGroupKey) => {
    setExpandedGroups((current) =>
      current.includes(groupKey)
        ? current.filter((key) => key !== groupKey)
        : [...current, groupKey],
    );
  };

  const toggleOption = (groupKey: FilterGroup["key"], value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.getAll(groupKey);
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((entry) => entry !== value)
      : [...currentValues, value];

    params.delete(groupKey);
    nextValues.forEach((entry) => params.append(groupKey, entry));
    updateParams(params);
  };

  const setPricePreset = (nextMin?: number, nextMax?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    const isActive = state.priceMin === nextMin && state.priceMax === nextMax;

    params.delete("priceMin");
    params.delete("priceMax");

    if (!isActive) {
      if (typeof nextMin === "number") params.set("priceMin", String(nextMin));
      if (typeof nextMax === "number") params.set("priceMax", String(nextMax));
    }

    updateParams(params);
  };

  const sections: Array<{
    key: AccordionGroupKey;
    label: string;
    activeCount: number;
    content: React.ReactNode;
  }> = [
    ...visibleGroups.map((group) => ({
      key: group.key as AccordionGroupKey,
      label: group.label,
      activeCount: searchParams.getAll(group.key).length,
      content: (
        <div className="space-y-1 px-5 py-2">
          {group.options.map((option) => {
            const checked = searchParams.getAll(group.key).includes(option.value);

            return (
              <label
                key={option.value}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 transition hover:bg-[#fbf7f5]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOption(group.key, option.value)}
                    className="h-4 w-4 rounded border border-black/15 accent-[#d45890]"
                  />
                  <span className="truncate text-sm text-[#2f2930]">{option.label}</span>
                </span>
                {typeof option.count === "number" ? (
                  <span className="shrink-0 text-xs text-black/45">({option.count})</span>
                ) : null}
              </label>
            );
          })}
        </div>
      ),
    })),
    {
      key: "price",
      label: "Ár",
      activeCount: hasPriceFilter ? 1 : 0,
      content: (
        <div className="space-y-1 px-5 py-2">
          <div className="rounded-lg border border-black/[0.05] bg-[#fcfbfa] px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#cf5a90]">
              Aktuális ársáv
            </p>
            <p className="mt-1 text-sm font-medium text-[#2f2930]">
              {formatPrice(availableFilters.priceRange[0])} – {formatPrice(availableFilters.priceRange[1])}
            </p>
          </div>
          {pricePresets.map((preset) => {
            const checked = state.priceMin === preset.min && state.priceMax === preset.max;

            return (
              <label
                key={preset.label}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-[#fbf7f5]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => setPricePreset(preset.min, preset.max)}
                  className="h-4 w-4 rounded border border-black/15 accent-[#d45890]"
                />
                <span className="text-sm text-[#2f2930]">{preset.label}</span>
              </label>
            );
          })}
        </div>
      ),
    },
  ];

  return (
    <div className="flex max-h-[inherit] min-h-0 flex-col">
      <div className="border-b border-gray-100 px-5 pb-3 pt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#cf5a90]">
          Szűrők
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        {sections.map((section) => {
          const expanded = expandedGroups.includes(section.key);

          return (
            <div key={section.key} className="border-b border-gray-100 last:border-b-0">
              <button
                type="button"
                onClick={() => toggleGroup(section.key)}
                className="flex w-full items-center justify-between px-5 py-3 text-left"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-[#2f2930]">
                  <span>{section.label}</span>
                  {section.activeCount > 0 ? (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#f9dce8] px-1.5 py-0.5 text-[10px] font-semibold text-[#c2457e]">
                      {section.activeCount}
                    </span>
                  ) : null}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-black/45 transition-transform duration-200 ${
                    expanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.div
                    key={`${section.key}-content`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    {section.content}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3">
        <button
          type="button"
          onClick={clearAllFilters}
          className="text-sm font-medium text-[#9c4a71] transition hover:text-[#7f355a]"
        >
          Törlés
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 rounded-full bg-[#1f1a1c] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#352d31]"
        >
          Alkalmaz <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function FilterSidebar(props: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const mode = props.mode ?? "both";
  const activeCount = getActiveFilterCount(props.state);
  const showTrigger = mode !== "desktop-sidebar";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, [mounted]);

  useEffect(() => {
    if (!isOpen || !mounted || isMobileViewport) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const panelWidth = Math.min(360, viewportWidth - 16);

      setPanelStyle({
        position: "fixed",
        top: rect.bottom + 10,
        left: Math.max(8, Math.min(rect.left, viewportWidth - panelWidth - 8)),
        width: panelWidth,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, isMobileViewport, mounted]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = isOpen && isMobileViewport ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobileViewport, mounted]);

  return (
    <>
      {showTrigger ? (
        <div ref={triggerRef} className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            aria-expanded={isOpen}
            className={`inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-[#352c31] transition ${
              activeCount > 0
                ? "border-[#e7bfd2] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                : "border-[#e8e5e0] hover:border-[#d8ccd2]"
            }`}
          >
            <span className="relative inline-flex h-4 w-4 items-center justify-center">
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.6} />
              {activeCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#d45890]" />
              ) : null}
            </span>
            <span>Szűrők{activeCount > 0 ? ` (${activeCount})` : ""}</span>
          </button>
        </div>
      ) : null}

      {mounted
        ? createPortal(
            <AnimatePresence>
              {isOpen ? (
                isMobileViewport ? (
                  <motion.div
                    key="filter-mobile-sheet"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12, ease: "easeIn" }}
                    className="fixed inset-0 z-[120] bg-black/20 md:hidden"
                  >
                    <motion.div
                      ref={panelRef}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 24 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute bottom-0 left-0 right-0 h-[85vh] overflow-hidden rounded-t-[1.6rem] border border-black/[0.06] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
                    >
                      <div className="flex justify-center pb-2 pt-3">
                        <span className="h-1.5 w-12 rounded-full bg-black/10" />
                      </div>
                      <div className="h-[calc(85vh-1.25rem)] min-h-0">
                        <FilterContent {...props} onClose={() => setIsOpen(false)} />
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="filter-desktop-popover"
                    ref={panelRef}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={panelStyle}
                    className="z-[120] max-h-[70vh] overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
                  >
                    <FilterContent {...props} onClose={() => setIsOpen(false)} />
                  </motion.div>
                )
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
