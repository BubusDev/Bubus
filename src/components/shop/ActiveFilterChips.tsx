"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  formatPrice,
  type FilterGroup,
  type ParsedCollectionState,
} from "@/lib/catalog";

type ActiveFilterChipsProps = {
  filterGroups?: FilterGroup[];
  state: ParsedCollectionState;
};

export function ActiveFilterChips({ filterGroups = [], state }: ActiveFilterChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getLabel = (key: string, value: string) =>
    filterGroups
      .find((group) => group.key === key)
      ?.options.find((option) => option.value === value)?.label ?? value;

  const chips = [
    ...Object.entries(state.selected).flatMap(([key, values]) =>
      values.map((value) => ({ key, value, label: getLabel(key, value) })),
    ),
    ...(typeof state.priceMin === "number" || typeof state.priceMax === "number"
      ? [
          {
            key: "price",
            value: "price",
            label: `${state.priceMin ? formatPrice(state.priceMin) : "Bármennyi"} - ${state.priceMax ? formatPrice(state.priceMax) : "Bármennyi"}`,
          },
        ]
      : []),
    ...(state.special
      ? [{ key: "special", value: state.special, label: state.special }]
      : []),
  ];

  if (chips.length === 0) {
    return null;
  }

  const clearChip = (chip: { key: string; value: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (chip.key === "price") {
      params.delete("priceMin");
      params.delete("priceMax");
    } else if (chip.key === "special") {
      params.delete("special");
    } else {
      const next = params.getAll(chip.key).filter((entry) => entry !== chip.value);
      params.delete(chip.key);
      next.forEach((value) => params.append(chip.key, value));
    }

    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          type="button"
          onClick={() => clearChip(chip)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#f0d5e4] bg-white/92 px-3 py-1.5 text-[0.82rem] text-[#6d5260] shadow-[0_8px_20px_rgba(184,122,160,0.06)] transition hover:border-[#eab7d1] hover:bg-white"
        >
          <span>{chip.label}</span>
          <X className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
