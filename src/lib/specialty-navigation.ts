import { db } from "@/lib/db";

export type SpecialtyNavigationItemView = {
  id: string;
  label: string;
  href: string;
  isVisible: boolean;
  sortOrder: number;
};

export async function getActiveSpecialtyNavigationItems(): Promise<SpecialtyNavigationItemView[]> {
  return db.specialtyNavigationItem.findMany({
    where: { isVisible: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    select: {
      id: true,
      label: true,
      href: true,
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
      isVisible: true,
      sortOrder: true,
    },
  });
}
