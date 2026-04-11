import Link from "next/link";

import { AdminRecentActivityList } from "@/components/admin/AdminRecentActivityList";
import { AdminShell } from "@/components/admin/AdminShell";
import { getRecentAdminActivity, type AdminActivityFilters } from "@/lib/admin-activity";

type AdminActivityPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const activityFilterFields = [
  { name: "customerName", label: "Vevő név", placeholder: "Név részlete" },
  { name: "customerEmail", label: "Vevő email", placeholder: "email@pelda.hu" },
  { name: "responsible", label: "Felelős", placeholder: "Admin neve vagy emailje" },
  { name: "orderNumber", label: "Rendelésszám", placeholder: "BB-..." },
] as const;

function getSearchParamValue(
  searchParams: Record<string, string | string[] | undefined>,
  key: keyof AdminActivityFilters,
) {
  const value = searchParams[key];
  return typeof value === "string" ? value.trim() : "";
}

function getActivityFilters(
  searchParams: Record<string, string | string[] | undefined>,
): AdminActivityFilters {
  return {
    customerName: getSearchParamValue(searchParams, "customerName"),
    customerEmail: getSearchParamValue(searchParams, "customerEmail"),
    responsible: getSearchParamValue(searchParams, "responsible"),
    orderNumber: getSearchParamValue(searchParams, "orderNumber"),
  };
}

function hasActivityFilters(filters: AdminActivityFilters) {
  return Object.values(filters).some((value) => Boolean(value?.trim()));
}

export default async function AdminActivityPage({
  searchParams,
}: AdminActivityPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = getActivityFilters(resolvedSearchParams);
  const hasFilters = hasActivityFilters(filters);
  const items = await getRecentAdminActivity(40, filters);

  return (
    <AdminShell
      title="Legutóbbi aktivitás"
      description={`A rendelések és visszaküldési kérelmek legfrissebb workflow módosításai egy helyen.${hasFilters ? ` Szűrt találatok: ${items.length}.` : ""}`}
    >
      <div className="overflow-hidden border border-[#e8e5e0] bg-white">
        <div className="border-b border-[#e8e5e0]">
          <details open={hasFilters}>
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4 marker:hidden">
              <div>
                <h2 className="text-sm font-semibold text-[#1a1a1a]">Friss workflow események</h2>
                {hasFilters ? (
                  <p className="mt-1 text-[12px] text-[var(--admin-ink-500)]">Szűrt aktivitás lista</p>
                ) : null}
              </div>
              <span className="admin-filter-chip admin-control-sm font-medium">Keresés / szűrés</span>
            </summary>
            <div className="border-t border-[#f0eeec] bg-[#fbfcfe] px-5 py-4">
              <form action="/admin/activity" className="grid gap-3 md:grid-cols-4 md:items-end">
                {activityFilterFields.map((field) => (
                  <label key={field.name} className="block">
                    <span className="admin-eyebrow mb-1.5 block">{field.label}</span>
                    <input
                      name={field.name}
                      defaultValue={filters[field.name] ?? ""}
                      placeholder={field.placeholder}
                      className="admin-input min-h-9 px-3 text-sm"
                    />
                  </label>
                ))}
                <div className="flex flex-wrap items-center gap-2 md:col-span-4">
                  <button type="submit" className="admin-button-secondary admin-control-sm">
                    Szűrés
                  </button>
                  {hasFilters ? (
                    <Link href="/admin/activity" className="admin-filter-chip admin-control-sm">
                      Törlés
                    </Link>
                  ) : null}
                </div>
              </form>
            </div>
          </details>

          {hasFilters ? (
            <div className="border-t border-[#f0eeec] px-5 py-2 text-[12px] text-[var(--admin-ink-600)]">
              Aktív szűrők:{" "}
              {activityFilterFields
                .filter((field) => filters[field.name]?.trim())
                .map((field) => `${field.label}: ${filters[field.name]}`)
                .join(" · ")}
            </div>
          ) : null}
        </div>
        <AdminRecentActivityList items={items} />
      </div>
    </AdminShell>
  );
}
