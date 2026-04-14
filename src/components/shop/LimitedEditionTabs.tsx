"use client";

import { useState } from "react";

import type { Product } from "@/lib/catalog";

const TABS = [
  { id: "description", label: "DESCRIPTION" },
  { id: "size", label: "SIZE & FIT" },
  { id: "materials", label: "MATERIALS" },
  { id: "shipping", label: "SHIPPING & RETURN" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function LimitedEditionTabs({ product }: { product: Product }) {
  const [active, setActive] = useState<TabId>("description");

  const content: Record<TabId, string | null> = {
    description:
      product.shortDescription?.trim() || product.description?.trim() || null,
    size: null,
    materials: null,
    shipping:
      "Ingyenes szállítás 3–5 munkanap alatt. 14 napos visszaküldési lehetőség.",
  };

  const empty = (
    <span className="text-xs italic text-gray-300">Hamarosan elérhető</span>
  );

  return (
    <div className="mt-6 border-t border-gray-200 pt-4 text-left">
      <div className="hidden items-center justify-between gap-3 sm:flex">
        {TABS.map((tab) => (
          <div key={tab.id} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActive(tab.id)}
              className={`text-left text-[10px] uppercase tracking-widest transition-colors ${
                active === tab.id
                  ? "text-[#1a1a1a]"
                  : "text-gray-400 hover:text-[#1a1a1a]"
              }`}
            >
              {tab.label}
            </button>
            {tab.id !== "shipping" ? (
              <span className="text-[10px] text-gray-300" aria-hidden="true">
                /
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-3 hidden min-h-[3rem] text-sm leading-7 text-[#666] sm:block">
        {content[active] ?? empty}
      </div>

      <div className="space-y-1 sm:hidden">
        {TABS.map((tab) => (
          <details key={tab.id} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between py-2.5 text-[10px] uppercase tracking-widest text-gray-400 [&::-webkit-details-marker]:hidden">
              {tab.label}
              <span className="text-xs text-gray-300 transition-transform duration-200 group-open:rotate-180">
                ▾
              </span>
            </summary>
            <div className="pb-3 text-sm leading-7 text-[#666]">
              {content[tab.id] ?? empty}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
