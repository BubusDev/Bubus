"use client";

import Link from "next/link";
import { Filter, Search, X } from "lucide-react";
import { useId, useState } from "react";

import type { AdminActivityFilters } from "@/lib/admin-activity";

type ActivityFilterField = {
  name: keyof AdminActivityFilters;
  label: string;
  placeholder: string;
};

type AdminActivityFiltersProps = {
  fields: readonly ActivityFilterField[];
  filters: AdminActivityFilters;
  hasFilters: boolean;
  resultCount: number;
};

function getActiveFilters(fields: readonly ActivityFilterField[], filters: AdminActivityFilters) {
  return fields
    .map((field) => ({ ...field, value: filters[field.name]?.trim() ?? "" }))
    .filter((field) => field.value);
}

export function AdminActivityFilters({
  fields,
  filters,
  hasFilters,
  resultCount,
}: AdminActivityFiltersProps) {
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(hasFilters);
  const activeFilters = getActiveFilters(fields, filters);

  return (
    <div className="border-b border-[#e8e5e0]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <div>
          <h2 className="text-sm font-semibold text-[#1a1a1a]">Friss workflow események</h2>
          <p className="mt-1 text-[12px] text-[var(--admin-ink-500)]">
            {hasFilters ? `${resultCount} találat szűrt nézetben` : "Legutóbbi workflow módosítások"}
          </p>
        </div>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((current) => !current)}
          className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded border px-2.5 text-[12px] font-medium transition ${
            isOpen
              ? "border-[rgba(42,99,181,0.22)] bg-[#f5f8fc] text-[var(--admin-blue-700)]"
              : "border-[var(--admin-line-200)] bg-white text-[var(--admin-ink-600)] hover:border-[#bfd0ea] hover:bg-[var(--admin-blue-050)] hover:text-[var(--admin-ink-900)]"
          }`}
        >
          <Filter className="h-3 w-3" aria-hidden="true" />
          Keresés / Szűrés
        </button>
      </div>

      <div
        id={panelId}
        aria-hidden={!isOpen}
        className={`grid overflow-hidden border-t border-[#f0eeec] bg-[var(--admin-surface-050)] transition-[grid-template-rows,opacity] duration-200 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <form
            action="/admin/activity"
            className="grid gap-2.5 px-4 py-3 sm:px-5 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end"
          >
            {fields.map((field) => (
              <label key={field.name} className="block">
                <span className="mb-1 block text-[12px] font-medium text-[var(--admin-ink-700)]">
                  {field.label}
                </span>
                <input
                  name={field.name}
                  defaultValue={filters[field.name] ?? ""}
                  placeholder={field.placeholder}
                  tabIndex={isOpen ? undefined : -1}
                  className="admin-input min-h-8 px-2.5 text-[13px]"
                />
              </label>
            ))}
            <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
              <button type="submit" tabIndex={isOpen ? undefined : -1} className="admin-button-secondary admin-control-sm gap-1.5">
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
                Keresés
              </button>
              <Link href="/admin/activity" tabIndex={isOpen ? undefined : -1} className="admin-filter-chip admin-control-sm gap-1.5">
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Törlés
              </Link>
            </div>
          </form>
        </div>
      </div>

      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-[#f0eeec] px-4 py-2 text-[12px] text-[var(--admin-ink-600)] sm:px-5">
          <span className="font-medium text-[var(--admin-ink-700)]">Aktív szűrők:</span>
          {activeFilters.map((field) => (
            <span
              key={field.name}
              className="inline-flex min-h-6 items-center rounded border border-[var(--admin-line-200)] bg-white px-2 text-[11px] leading-none text-[var(--admin-ink-700)]"
            >
              {field.label}: {field.value}
            </span>
          ))}
          <Link href="/admin/activity" className="admin-inline-link font-semibold">
            Reset
          </Link>
        </div>
      ) : null}
    </div>
  );
}
