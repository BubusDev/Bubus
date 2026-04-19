import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
import { HomepageShowcaseEditor } from "@/components/admin/HomepageShowcaseEditor";
import {
  getAdminShowcaseCategories,
  getAdminShowcaseProducts,
  getAdminShowcaseTabs,
  SHOWCASE_FILTER_TYPES,
} from "@/lib/homepage-showcase";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const statusMessages: Record<string, string> = {
  saved: "A tab mentve.",
  deleted: "A tab törölve.",
  reordered: "A tab sorrend mentve.",
};

export default async function AdminHomepageShowcasePage({ searchParams }: PageProps) {
  const [tabs, categories, products, resolvedParams] = await Promise.all([
    getAdminShowcaseTabs(),
    getAdminShowcaseCategories(),
    getAdminShowcaseProducts(),
    searchParams,
  ]);

  const status = typeof resolvedParams.status === "string" ? resolvedParams.status : null;
  const legacyStatus = resolvedParams.saved === "1"
    ? "saved"
    : resolvedParams.deleted === "1"
      ? "deleted"
      : resolvedParams.reordered === "1"
        ? "reordered"
        : null;
  const message = statusMessages[status ?? legacyStatus ?? ""];

  return (
    <AdminShell title="Kezdőlap showcase tabjai">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/admin/content" className="admin-inline-link text-sm">
          ← Vissza a tartalomhoz
        </Link>
      </div>

      {message ? (
        <div className="admin-panel-muted mb-5 px-4 py-3 text-sm text-[var(--admin-ink-700)]">
          {message}
        </div>
      ) : null}

      <div className="mb-6 max-w-3xl text-sm leading-6 text-[var(--admin-ink-600)]">
        A kezdőlap termék-csúszkájának tabjai. Állítsd be a forrást, válassz kategóriát
        vagy kézi terméklistát, majd mentsd a tabot. A sorrend külön menthető, és az aktív
        tabok ebben a sorrendben jelennek meg a webshopban.
      </div>

      <HomepageShowcaseEditor
        tabs={tabs}
        categories={categories}
        products={products}
        filterTypes={SHOWCASE_FILTER_TYPES}
      />
    </AdminShell>
  );
}
