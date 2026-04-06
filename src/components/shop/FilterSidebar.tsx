"use client";

import Link from "next/link";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

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
  mode?: "both" | "mobile-trigger" | "desktop-sidebar";
};

type AccordionGroupKey = FilterGroup["key"] | "price";
const defaultOpenGroups: AccordionGroupKey[] = ["category", "stone"];

// ── FILTER OPTION ──────────────────────────────────────────────────────────
function FilterOptionButton({
  group,
  option,
  active,
}: {
  group: FilterGroup;
  option: FilterGroup["options"][number];
  active: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const currentValues = params.getAll(group.key);

  if (active) {
    params.delete(group.key);
    currentValues
      .filter((v) => v !== option.value)
      .forEach((v) => params.append(group.key, v));
  } else {
    params.append(group.key, option.value);
  }

  const href = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;

  return (
    <Link
      href={href}
      className={`filter-option ${active ? "filter-option-active" : "filter-option-idle"}`}
    >
      <span>{option.label}</span>
      <span className={`filter-dot ${active ? "filter-dot-active" : ""}`} />
    </Link>
  );
}

// ── PRICE LINKS ────────────────────────────────────────────────────────────
function PriceLinks({
  state,
  availableFilters,
}: {
  state: ParsedCollectionState;
  availableFilters: CatalogFilters;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presets = [
    { label: `${formatPrice(60)} alatt`, min: undefined, max: 60 },
    { label: `${formatPrice(60)} – ${formatPrice(80)}`, min: 60, max: 80 },
    { label: `${formatPrice(80)} felett`, min: 80, max: undefined },
  ];

  return (
    <div className="space-y-1 pt-1">
      <div className="mb-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-[#c0517a]">
          Aktuális ársáv
        </p>
        <p className="mt-1 text-sm font-semibold text-[#3a1f2d]">
          {formatPrice(availableFilters.priceRange[0])} –{" "}
          {formatPrice(availableFilters.priceRange[1])}
        </p>
      </div>

      {presets.map((preset) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("priceMin");
        params.delete("priceMax");
        if (typeof preset.min === "number") params.set("priceMin", String(preset.min));
        if (typeof preset.max === "number") params.set("priceMax", String(preset.max));

        const isActive =
          state.priceMin === preset.min && state.priceMax === preset.max;

        return (
          <Link
            key={preset.label}
            href={params.size > 0 ? `${pathname}?${params.toString()}` : pathname}
            className={`filter-option ${isActive ? "filter-option-active" : "filter-option-idle"}`}
          >
            <span>{preset.label}</span>
            <span className={`filter-dot ${isActive ? "filter-dot-active" : ""}`} />
          </Link>
        );
      })}
    </div>
  );
}

// ── FILTER PANEL ───────────────────────────────────────────────────────────
function FilterPanel({
  availableFilters,
  filterGroups,
  state,
  onClose,
}: FilterSidebarProps & { onClose?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openGroups, setOpenGroups] =
    useState<AccordionGroupKey[]>(defaultOpenGroups);

  const visibleGroups = filterGroups.filter((g) => g.options.length > 0);
  const toggleGroup = (key: AccordionGroupKey) =>
    setOpenGroups((c) =>
      c.includes(key) ? c.filter((k) => k !== key) : [...c, key],
    );

  const hasActivePriceRange =
    typeof state.priceMin === "number" || typeof state.priceMax === "number";

  return (
    <div className="filter-panel">

      {/* header */}
      <div className="filter-panel-header">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#c0517a]">
            Szűrők
          </p>
          <h2 className="mt-1 text-[1.1rem] font-semibold leading-none text-[#3a1f2d]">
            Finomítás
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#b08898] transition hover:bg-rose-50 hover:text-[#4d2741]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* groups */}
      <div className="mt-2 space-y-px">
        {visibleGroups.map((group) => {
          const activeCount = state.selected[group.key].length;
          const isOpen = openGroups.includes(group.key);

          return (
            <section key={group.key} className="filter-group">
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                aria-expanded={isOpen}
                className="filter-group-btn"
              >
                <span className="min-w-0 flex-1 text-[0.9rem] font-medium text-[#5a3a4a]">
                  {group.label}
                </span>
                {activeCount > 0 && (
                  <span className="filter-count-badge">{activeCount}</span>
                )}
                <ChevronDown
                  className={`h-3.5 w-3.5 text-[#c0a0b4] transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isOpen ? "max-h-96 pb-3 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {group.options.map((option) => (
                  <FilterOptionButton
                    key={`${group.key}-${option.value}`}
                    group={group}
                    option={option}
                    active={state.selected[group.key].includes(option.value)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* price group */}
        <section className="filter-group">
          <button
            type="button"
            onClick={() => toggleGroup("price")}
            aria-expanded={openGroups.includes("price")}
            className="filter-group-btn"
          >
            <span className="min-w-0 flex-1 text-[0.9rem] font-medium text-[#5a3a4a]">
              Ár
            </span>
            {hasActivePriceRange && (
              <span className="filter-count-badge">1</span>
            )}
            <ChevronDown
              className={`h-3.5 w-3.5 text-[#c0a0b4] transition-transform duration-200 ${
                openGroups.includes("price") ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-200 ${
              openGroups.includes("price") ? "max-h-60 pb-3 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <PriceLinks state={state} availableFilters={availableFilters} />
          </div>
        </section>
      </div>

      {/* clear all */}
      {searchParams.size > 0 && (
        <div className="mt-5 border-t border-[#f5e2eb] pt-4">
          <Link
            href={pathname}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#c0517a] transition hover:text-[#8f456d]"
          >
            <X className="h-3.5 w-3.5" />
            Összes szűrő törlése
          </Link>
        </div>
      )}

      {/* shared styles */}
      <style>{`
        .filter-panel {
          width: 100%;
        }
        .filter-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid #f5e2eb;
          padding-bottom: 14px;
          margin-bottom: 4px;
        }
        .filter-group {
          border-bottom: 1px solid #fae8f0;
        }
        .filter-group-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 11px 0;
          text-align: left;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .filter-count-badge {
          min-width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: linear-gradient(135deg, #c45a85, #e07a70);
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          padding: 0 5px;
        }
        .filter-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 0;
          font-size: 13px;
          text-decoration: none;
          transition: color .15s;
        }
        .filter-option-idle  { color: #7a5a6c; }
        .filter-option-idle:hover { color: #3a1f2d; }
        .filter-option-active { color: #c45a85; font-weight: 500; }
        .filter-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #edd4e2;
          transition: background .15s;
          flex-shrink: 0;
        }
        .filter-dot-active { background: #e07a9e; }
      `}</style>
    </div>
  );
}

// ── SIDEBAR (desktop + mobile) ─────────────────────────────────────────────
export function FilterSidebar(props: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mode = props.mode ?? "both";
  const showMobileTrigger = mode !== "desktop-sidebar";
  const showDesktopSidebar = mode !== "mobile-trigger";

  return (
    <>
      {/* mobile trigger */}
      {showMobileTrigger && (
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200/70 bg-white/65 px-4 py-2 text-sm font-medium text-[#6b425a] backdrop-blur-sm transition hover:bg-white/80"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-rose-400" />
            Szűrők
          </button>
        </div>
      )}

      {/* desktop sidebar */}
      {showDesktopSidebar && (
        <aside className="hidden lg:block lg:w-[220px] lg:shrink-0">
          <div className="sticky top-28 rounded-[1.6rem] border border-white/80 bg-white/60 p-5 backdrop-blur-xl shadow-sm shadow-rose-100/30">
            <FilterPanel {...props} />
          </div>
        </aside>
      )}

      {/* mobile drawer */}
      {showMobileTrigger && isOpen && (
        <div
          className="fixed inset-0 z-[70] lg:hidden"
          style={{ background: "rgba(42,18,30,.25)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="ml-auto h-full w-full max-w-sm overflow-y-auto px-5 py-6"
            style={{
              background: "rgba(255,255,255,.82)",
              backdropFilter: "blur(20px)",
              boxShadow: "-16px 0 48px -8px rgba(196,90,133,.15)",
            }}
          >
            <FilterPanel {...props} onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
