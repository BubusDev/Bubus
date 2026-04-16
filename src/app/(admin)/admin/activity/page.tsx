import { AdminActivityFilters } from "@/components/admin/AdminActivityFilters";
import { AdminRecentActivityList } from "@/components/admin/AdminRecentActivityList";
import { AdminShell } from "@/components/admin/AdminShell";
import { getRecentAdminActivity, type AdminActivityFilters as AdminActivityFilterValues } from "@/lib/admin-activity";

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
  key: keyof AdminActivityFilterValues,
) {
  const value = searchParams[key];
  return typeof value === "string" ? value.trim() : "";
}

function getActivityFilters(
  searchParams: Record<string, string | string[] | undefined>,
): AdminActivityFilterValues {
  return {
    customerName: getSearchParamValue(searchParams, "customerName"),
    customerEmail: getSearchParamValue(searchParams, "customerEmail"),
    responsible: getSearchParamValue(searchParams, "responsible"),
    orderNumber: getSearchParamValue(searchParams, "orderNumber"),
  };
}

function hasActivityFilters(filters: AdminActivityFilterValues) {
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
      description={hasFilters ? `Szűrt találatok: ${items.length}.` : undefined}
    >
      <div className="overflow-hidden border border-[#e8e5e0] bg-white">
        <AdminActivityFilters
          fields={activityFilterFields}
          filters={filters}
          hasFilters={hasFilters}
          resultCount={items.length}
        />
        <AdminRecentActivityList items={items} />
      </div>
    </AdminShell>
  );
}
