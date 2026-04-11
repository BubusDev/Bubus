import { db } from "@/lib/db";

export const DEFAULT_SPECIALTY_LISTING_HREF = "/bracelets";

export type SpecialtyNavigationItemView = {
  id: string;
  label: string;
  href: string;
  filterKey: string | null;
  isVisible: boolean;
  sortOrder: number;
};

export function getSpecialtyNavigationHref(item: Pick<SpecialtyNavigationItemView, "href" | "filterKey">) {
  if (!item.filterKey) {
    return item.href;
  }

  const [pathname, query = ""] = item.href.split("?");
  const searchParams = new URLSearchParams(query);
  searchParams.set("special", item.filterKey);

  return `${pathname}?${searchParams.toString()}`;
}

export async function getActiveSpecialtyNavigationItems(): Promise<SpecialtyNavigationItemView[]> {
  return db.specialtyNavigationItem.findMany({
    where: { isVisible: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    select: {
      id: true,
      label: true,
      href: true,
      filterKey: true,
      isVisible: true,
      sortOrder: true,
    },
  });
}

export async function getAdminSpecialtyNavigationItems(): Promise<SpecialtyNavigationItemView[]> {
  return db.specialtyNavigationItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    select: {
      id: true,
      label: true,
      href: true,
      filterKey: true,
      isVisible: true,
      sortOrder: true,
    },
  });
}
