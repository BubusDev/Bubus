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
};

type AccordionGroupKey = FilterGroup["key"] | "price";

const defaultOpenGroups: AccordionGroupKey[] = ["category", "stone"];

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
      .filter((entry) => entry !== option.value)
      .forEach((entry) => params.append(group.key, entry));
  } else {
    params.append(group.key, option.value);
  }

  const href = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;

  return (
    <Link
      href={href}
      className={`flex items-center justify-between py-2 text-sm transition ${
        active
          ? "text-[#a34f7e]"
          : "text-[#6e5564] hover:text-[#4d2741]"
      }`}
    >
      <span>{option.label}</span>
      <span
        className={`h-2 w-2 rounded-full ${
          active ? "bg-[#e78fbc]" : "bg-[#e3ccd8]"
        }`}
      />
    </Link>
  );
}

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
    { label: `${formatPrice(60)} - ${formatPrice(80)}`, min: 60, max: 80 },
    { label: `${formatPrice(80)} felett`, min: 80, max: undefined },
  ];

  return (
    <div className="space-y-2.5 pt-1">
      <div className="pb-2 text-sm text-[#6e5564]">
        <span className="text-[9px] uppercase tracking-[0.24em] text-[#ab7f97]">
          Aktuális ársáv
        </span>
        <p className="mt-1 text-sm font-medium text-[#4d2741]">
          {formatPrice(availableFilters.priceRange[0])} -{" "}
          {formatPrice(availableFilters.priceRange[1])}
        </p>
      </div>

      {presets.map((preset) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("priceMin");
        params.delete("priceMax");

        if (typeof preset.min === "number") {
          params.set("priceMin", String(preset.min));
        }

        if (typeof preset.max === "number") {
          params.set("priceMax", String(preset.max));
        }

        const isActive =
          state.priceMin === preset.min && state.priceMax === preset.max;

        return (
          <Link
            key={preset.label}
            href={params.size > 0 ? `${pathname}?${params.toString()}` : pathname}
            className={`block py-2 text-sm transition ${
              isActive
                ? "text-[#a34f7e]"
                : "text-[#6e5564] hover:text-[#4d2741]"
            }`}
          >
            {preset.label}
          </Link>
        );
      })}
    </div>
  );
}

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

  const visibleGroups = filterGroups.filter((group) => group.options.length > 0);

  const toggleGroup = (key: AccordionGroupKey) => {
    setOpenGroups((current) =>
      current.includes(key)
        ? current.filter((entry) => entry !== key)
        : [...current, key],
    );
  };

  const hasActivePriceRange =
    typeof state.priceMin === "number" || typeof state.priceMax === "number";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 border-b border-[#eee4ea] pb-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.28em] text-[#ab7f97]">
            Szűrők
          </p>
          <h2 className="mt-1.5 text-[1.15rem] font-medium leading-none text-[#4d2741]">
            Finomítás
          </h2>
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#6d5260]"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-3">
        {visibleGroups.map((group) => {
          const activeCount = state.selected[group.key].length;
          const isOpen = openGroups.includes(group.key);

          return (
            <section key={group.key} className="border-b border-[#f1e6ec]">
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                className="flex w-full items-center gap-3 py-3 text-left"
                aria-expanded={isOpen}
              >
                <span className="min-w-0 flex-1 text-[0.95rem] font-medium text-[#5f4254]">
                  {group.label}
                </span>

                {activeCount > 0 ? (
                  <span className="text-[11px] text-[#a34f7e]">
                    {activeCount}
                  </span>
                ) : null}

                <ChevronDown
                  className={`h-4 w-4 text-[#a67a92] transition ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen ? (
                <div className="pb-3">
                  {group.options.map((option) => (
                    <FilterOptionButton
                      key={`${group.key}-${option.value}`}
                      group={group}
                      option={option}
                      active={state.selected[group.key].includes(option.value)}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}

        <section className="border-b border-[#f1e6ec]">
          <button
            type="button"
            onClick={() => toggleGroup("price")}
            className="flex w-full items-center gap-3 py-3 text-left"
            aria-expanded={openGroups.includes("price")}
          >
              <span className="min-w-0 flex-1 text-[0.95rem] font-medium text-[#5f4254]">
              Ár
            </span>

            {hasActivePriceRange ? (
              <span className="text-[11px] text-[#a34f7e]">1</span>
            ) : null}

            <ChevronDown
              className={`h-4 w-4 text-[#a67a92] transition ${
                openGroups.includes("price") ? "rotate-180" : ""
              }`}
            />
          </button>

          {openGroups.includes("price") ? (
            <div className="pb-3">
              <PriceLinks
                state={state}
                availableFilters={availableFilters}
              />
            </div>
          ) : null}
        </section>
      </div>

      {searchParams.size > 0 ? (
        <div className="mt-4 pt-2">
          <Link
            href={pathname}
            className="inline-flex text-sm font-medium text-[#9f5a82] transition hover:text-[#8f456d]"
          >
            Összes szűrő törlése
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function FilterSidebar(props: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 border-b border-[#eadce4] pb-2 text-sm font-medium text-[#6b425a]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Szűrők
        </button>
      </div>

      <aside className="hidden lg:block lg:w-[220px] lg:shrink-0">
        <div className="sticky top-28">
          <FilterPanel {...props} />
        </div>
      </aside>

      {isOpen ? (
        <div className="fixed inset-0 z-[70] bg-[#6a3d59]/20 backdrop-blur-sm lg:hidden">
          <div className="ml-auto h-full w-full max-w-sm overflow-y-auto bg-white px-5 py-5">
            <FilterPanel {...props} onClose={() => setIsOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
