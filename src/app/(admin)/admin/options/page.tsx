import type { Metadata } from "next";

import { AdminOptionManager } from "@/components/admin/AdminOptionManager";
import { AdminShell } from "@/components/admin/AdminShell";
import { getProductOptionGroups } from "@/lib/products";

export const metadata: Metadata = {
  title: "Opciókészletek — Chicks Jewelry Admin",
  robots: { index: false, follow: false },
};

export default async function AdminOptionsPage() {
  const optionGroups = await getProductOptionGroups(true);

  return (
    <AdminShell title="Opciókészletek">
      <AdminOptionManager groups={optionGroups} />
    </AdminShell>
  );
}
