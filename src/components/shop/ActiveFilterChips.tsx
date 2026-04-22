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
  const activeCount =
    Object.values(state.selected).reduce((sum, values) => sum + values.length, 0) +
    (typeof state.priceMin === "number" || typeof state.priceMax === "number" ? 1 : 0) +
    (state.special ? 1 : 0);

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

  const navigate = (params: URLSearchParams) => {
    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname, {
      scroll: false,
    });
  };

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

    navigate(params);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    [
      "category",
      "stone",
      "color",
      "style",
      "occasion",
      "availability",
      "priceMin",
      "priceMax",
      "special",
    ].forEach((key) => params.delete(key));
    navigate(params);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          type="button"
          onClick={() => clearChip(chip)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#f0d5e4] bg-white/92 px-3 py-2 text-[0.82rem] text-[#6d5260] shadow-[0_8px_20px_rgba(184,122,160,0.06)] transition hover:border-[#eab7d1] hover:bg-white"
        >
          <span>{chip.label}</span>
          <X className="h-3.5 w-3.5" />
        </button>
      ))}
      {activeCount > 0 ? (
        <button
          type="button"
          onClick={clearAllFilters}
          className="inline-flex min-h-10 items-center rounded-full border border-transparent px-3 py-2 text-[0.82rem] font-medium text-[#b04c78] transition hover:text-[#8e395f]"
        >
          Törlés
        </button>
      ) : null}
    </div>
  );
}
