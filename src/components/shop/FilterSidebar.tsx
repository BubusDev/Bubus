"use client";

import Link from "next/link";
import { ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
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

// ── PRICE OPTIONS (right panel content) ────────────────────────────────────
function PriceOptions({
  state,
  availableFilters,
}: {
  state: ParsedCollectionState;
  availableFilters: CatalogFilters;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [priceMin, priceMax] = availableFilters.priceRange;
  const low  = Math.round((priceMin + (priceMax - priceMin) * 0.33) / 1000) * 1000;
  const high = Math.round((priceMin + (priceMax - priceMin) * 0.66) / 1000) * 1000;

  const presets = [
    { label: `${formatPrice(low)} alatt`,                    min: undefined, max: low  },
    { label: `${formatPrice(low)} – ${formatPrice(high)}`,   min: low,       max: high },
    { label: `${formatPrice(high)} felett`,                  min: high,      max: undefined },
  ];

  return (
    <div className="fp-rb">
      <p className="fp-rl">Aktuális ársáv</p>
      <p className="fp-prange">
        {formatPrice(availableFilters.priceRange[0])} – {formatPrice(availableFilters.priceRange[1])}
      </p>
      <p className="fp-rl" style={{ marginTop: 14 }}>Gyors választás</p>
      {presets.map((preset) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("priceMin");
        params.delete("priceMax");
        if (typeof preset.min === "number") params.set("priceMin", String(preset.min));
        if (typeof preset.max === "number") params.set("priceMax", String(preset.max));
        const isActive = state.priceMin === preset.min && state.priceMax === preset.max;
        return (
          <Link
            key={preset.label}
            href={params.size > 0 ? `${pathname}?${params.toString()}` : pathname}
            className={`fp-ro ${isActive ? "fp-ro-active" : ""}`}
          >
            <span>{preset.label}</span>
            {isActive && <span className="fp-check">✓</span>}
          </Link>
        );
      })}
    </div>
  );
}

// ── GROUP OPTIONS (right panel content) ────────────────────────────────────
function GroupOptions({ group, state }: { group: FilterGroup; state: ParsedCollectionState }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="fp-rb">
      {group.options.map((option) => {
        const params = new URLSearchParams(searchParams.toString());
        const currentValues = params.getAll(group.key);
        const active = currentValues.includes(option.value);
        if (active) {
          params.delete(group.key);
          currentValues.filter((v) => v !== option.value).forEach((v) => params.append(group.key, v));
        } else {
          params.append(group.key, option.value);
        }
        const href = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
        return (
          <Link key={option.value} href={href} className={`fp-ro ${active ? "fp-ro-active" : ""}`}>
            <span>{option.label}</span>
            {active && <span className="fp-check">✓</span>}
          </Link>
        );
      })}
    </div>
  );
}

// ── FILTER PANEL (two-column) ───────────────────────────────────────────────
function FilterPanel({
  availableFilters,
  filterGroups,
  state,
  onClose,
}: FilterSidebarProps & { onClose?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeGroup, setActiveGroup] = useState<AccordionGroupKey | null>(null);
  const [search, setSearch] = useState("");

  const visibleGroups = filterGroups.filter((g) => g.options.length > 0);
  const hasActivePriceRange = typeof state.priceMin === "number" || typeof state.priceMax === "number";

  type GroupMeta = { key: AccordionGroupKey; label: string; count: number };
  const allGroups: GroupMeta[] = [
    ...visibleGroups.map((g) => ({ key: g.key as AccordionGroupKey, label: g.label, count: state.selected[g.key].length })),
    { key: "price", label: "Ár", count: hasActivePriceRange ? 1 : 0 },
  ];

  const filtered = search.trim()
    ? allGroups.filter((g) => g.label.toLowerCase().includes(search.toLowerCase()))
    : allGroups;

  const activeFilterGroup = visibleGroups.find((g) => g.key === activeGroup) ?? null;
  const activeLabel = allGroups.find((g) => g.key === activeGroup)?.label ?? "";

  return (
    <div className="fp-wrap">

      {/* ── LEFT RAIL ── */}
      <div className="fp-left">
        <div className="fp-lh">
          <div>
            <p className="fp-eye">Szűrők</p>
            <h2 className="fp-htitle">Finomítás</h2>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {searchParams.size > 0 && (
              <Link href={pathname} className="fp-xbtn" title="Összes törlése">
                <X style={{ width:12, height:12 }} />
              </Link>
            )}
            {onClose && (
              <button type="button" onClick={onClose} className="fp-xbtn">
                <X style={{ width:14, height:14 }} />
              </button>
            )}
          </div>
        </div>

        <div className="fp-search">
          <Search className="fp-search-ico" />
          <input
            type="text"
            placeholder="Szűrő keresése…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="fp-search-inp"
          />
        </div>

        <nav className="fp-nav">
          {filtered.map((g) => {
            const isActive = activeGroup === g.key;
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => setActiveGroup(isActive ? null : g.key)}
                className={`fp-ni ${isActive ? "fp-ni-active" : ""}`}
              >
                <span className="fp-nl">{g.label}</span>
                <span style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                  {g.count > 0 && <span className="fp-badge">{g.count}</span>}
                  <ChevronRight className={`fp-chev ${isActive ? "fp-chev-active" : ""}`} />
                </span>
              </button>
            );
          })}
        </nav>

        {searchParams.size > 0 && (
          <div className="fp-lf">
            <Link href={pathname} className="fp-clr">
              <X style={{ width:11, height:11 }} />
              Összes törlése
            </Link>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL ── */}
      {activeGroup !== null && (
        <div className="fp-right">
          <div className="fp-rh">
            <span className="fp-rtitle">{activeLabel}</span>
            <button type="button" onClick={() => setActiveGroup(null)} className="fp-xbtn">
              <X style={{ width:14, height:14 }} />
            </button>
          </div>
          {activeGroup === "price"
            ? <PriceOptions state={state} availableFilters={availableFilters} />
            : activeFilterGroup
              ? <GroupOptions group={activeFilterGroup} state={state} />
              : null}
        </div>
      )}

      <style>{`
        .fp-wrap{display:flex;width:100%;min-height:300px;overflow:hidden;}

        /* left */
        .fp-left{display:flex;flex-direction:column;width:196px;flex-shrink:0;border-right:1px solid #f5e2eb;}
        .fp-lh{display:flex;align-items:flex-start;justify-content:space-between;padding:15px 14px 11px;border-bottom:1px solid #f5e2eb;}
        .fp-eye{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.3em;color:#c0517a;margin-bottom:3px;}
        .fp-htitle{font-size:1rem;font-weight:600;color:#2f1a27;line-height:1;}
        .fp-xbtn{display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;border:none;background:transparent;color:#b08898;cursor:pointer;transition:background .15s;}
        .fp-xbtn:hover{background:#fdf0f5;color:#4d2741;}

        /* search */
        .fp-search{position:relative;padding:9px 11px;border-bottom:1px solid #f5e2eb;}
        .fp-search-ico{position:absolute;left:20px;top:50%;transform:translateY(-50%);width:12px;height:12px;color:#c0a0b4;pointer-events:none;}
        .fp-search-inp{width:100%;box-sizing:border-box;height:32px;border:1.5px solid #f0d4e0;border-radius:9px;background:rgba(255,255,255,.85);padding:0 10px 0 28px;font-size:12px;color:#2f1a27;outline:none;transition:border-color .2s;font-family:inherit;}
        .fp-search-inp::placeholder{color:#c4a0b4;}
        .fp-search-inp:focus{border-color:#c45a85;}

        /* nav */
        .fp-nav{flex:1;overflow-y:auto;padding:4px 0;}
        .fp-ni{display:flex;align-items:center;width:100%;padding:8px 12px;border:none;border-left:2px solid transparent;background:transparent;cursor:pointer;text-align:left;transition:background .12s;font-family:inherit;gap:8px;}
        .fp-ni:hover{background:rgba(253,240,245,.6);}
        .fp-ni-active{background:rgba(253,240,245,.9);border-left-color:#c45a85;}
        .fp-nl{flex:1;font-size:13px;font-weight:500;color:#5a3a4a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .fp-ni-active .fp-nl{color:#c45a85;}
        .fp-badge{min-width:15px;height:15px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:linear-gradient(135deg,#c45a85,#e07a70);color:#fff;font-size:9px;font-weight:700;padding:0 4px;}
        .fp-chev{width:12px;height:12px;color:#c0a0b4;transition:transform .15s,color .15s;}
        .fp-chev-active{color:#c45a85;transform:rotate(90deg);}

        /* left footer */
        .fp-lf{padding:9px 12px;border-top:1px solid #f5e2eb;}
        .fp-clr{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:500;color:#c0517a;text-decoration:none;transition:color .15s;}
        .fp-clr:hover{color:#8f456d;}

        /* right */
        .fp-right{flex:1;display:flex;flex-direction:column;overflow:hidden;animation:fp-in .18s ease-out;}
        @keyframes fp-in{from{opacity:0;transform:translateX(8px);}to{opacity:1;transform:translateX(0);}}
        .fp-rh{display:flex;align-items:center;justify-content:space-between;padding:15px 14px 11px;border-bottom:1px solid #f5e2eb;}
        .fp-rtitle{font-size:14px;font-weight:600;color:#2f1a27;}
        .fp-rb{flex:1;overflow-y:auto;padding:10px 12px;}
        .fp-rl{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.26em;color:#c0517a;margin-bottom:6px;}
        .fp-prange{font-size:14px;font-weight:600;color:#3a1f2d;margin-bottom:4px;}
        .fp-ro{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-radius:9px;font-size:13px;color:#7a5a6c;text-decoration:none;transition:background .12s,color .12s;margin-bottom:2px;}
        .fp-ro:hover{background:rgba(253,240,245,.7);color:#3a1f2d;}
        .fp-ro-active{background:rgba(196,90,133,.08);color:#c45a85;font-weight:500;}
        .fp-ro-active:hover{background:rgba(196,90,133,.13);}
        .fp-check{font-size:11px;color:#c45a85;font-weight:700;}
      `}</style>
    </div>
  );
}

// ── SIDEBAR SHELL ──────────────────────────────────────────────────────────
export function FilterSidebar(props: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mode = props.mode ?? "both";
  const showMobileTrigger = mode !== "desktop-sidebar";
  const showDesktopSidebar = mode !== "mobile-trigger";

  return (
    <>
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

      {showDesktopSidebar && (
        <aside className="hidden lg:block lg:shrink-0">
          <div
            className="sticky top-28 rounded-[1.6rem] border border-white/80 bg-white/65 backdrop-blur-xl overflow-hidden"
            style={{ boxShadow: "0 4px 24px rgba(196,90,133,.1)" }}
          >
            <FilterPanel {...props} />
          </div>
        </aside>
      )}

      {showMobileTrigger && isOpen && (
        <div
          className="fixed inset-0 z-[70] lg:hidden"
          style={{ background: "rgba(42,18,30,.25)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="ml-auto h-full overflow-y-auto"
            style={{
              width: "min(460px, 100%)",
              background: "rgba(255,255,255,.88)",
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