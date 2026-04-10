import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { ArchiveProductList } from "@/components/admin/ArchiveProductList";
import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Archivált termékek — Chicks Jewelry Admin",
  description: "Archivált termékek visszaállítása vagy végleges törlése.",
  robots: { index: false, follow: false },
};

async function getArchivedProducts() {
  return db.product.findMany({
    where: { archivedAt: { not: null } },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      collectionLabel: true,
      archivedAt: true,
      archiveReason: true,
      slug: true,
    },
    orderBy: { archivedAt: "desc" },
  });
}

export default async function ArchivePage() {
  await requireAdminUser("/admin/products/archive");
  const products = await getArchivedProducts();

  return (
    <AdminShell
      title="Archivált termékek"
      description="Visszaállíthatod a termékeket, ha újra van készlet, vagy véglegesen törölheted őket."
    >
      <ArchiveProductList
        products={products.map((p) => ({
          ...p,
          archivedAt: p.archivedAt!,
        }))}
      />
    </AdminShell>
  );
}
