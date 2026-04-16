"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpDown, X, Check } from "lucide-react";

const SORT_OPTIONS = [
  { value: "featured",   label: "Kiemelt" },
  { value: "newest",     label: "Legújabb" },
  { value: "price-asc",  label: "Ár: növekvő" },
  { value: "price-desc", label: "Ár: csökkenő" },
];

type CollectionSortProps = {
  currentSort: string;
  compact?: boolean;
};

export function CollectionSort({ currentSort, compact }: CollectionSortProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLabel = SORT_OPTIONS.find(o => o.value === currentSort)?.label ?? "Rendezés";

  return (
    <>
      {/* Trigger gomb */}
      <button
        onClick={() => setOpen(true)}
        className={
          compact
            ? "inline-flex h-9 w-9 items-center justify-center border border-[#e8e5e0] bg-white text-[#1a1a1a] transition hover:border-[#1a1a1a]"
            : "flex items-center gap-1.5 text-sm text-[#1a1a1a] border border-[#e8e5e0] px-3 py-1.5 hover:border-[#1a1a1a] transition"
        }
      >
        <ArrowUpDown className="h-3.5 w-3.5" strokeWidth={1.5} />
        {!compact && currentLabel}
      </button>

      {/* Overlay + panel */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-[150] bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed top-0 right-0 bottom-0 z-[151] w-[260px] bg-white shadow-2xl flex flex-col"
            style={{ animation: "slideInRight .22s ease-out" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0ede8]">
              <p className="text-sm font-semibold text-[#1a1a1a]">Rendezés</p>
              <button onClick={() => setOpen(false)}>
                <X className="h-4 w-4 text-[#888]" strokeWidth={1.5} />
              </button>
            </div>

            {/* Opciók */}
            <div className="flex-1 py-2">
              {SORT_OPTIONS.map(option => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("sort", option.value);
                const href = `${pathname}?${params.toString()}`;
                const isActive = currentSort === option.value;

                return (
                  <Link
                    key={option.value}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-5 py-3.5 text-sm border-b border-[#f5f4f2] transition
                      ${isActive ? "text-[#1a1a1a] font-semibold" : "text-[#555] hover:text-[#1a1a1a]"}`}
                  >
                    {option.label}
                    {isActive && <Check className="h-4 w-4 text-[#1a1a1a]" strokeWidth={2} />}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
