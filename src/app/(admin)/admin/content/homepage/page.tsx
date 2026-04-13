import { AdminHomepageContentForm } from "@/components/admin/AdminHomepageContentForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { getHomepageContent } from "@/lib/homepage-content";

type AdminHomepageContentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminHomepageContentPage({
  searchParams,
}: AdminHomepageContentPageProps) {
  const [content, resolvedSearchParams] = await Promise.all([
    getHomepageContent(),
    searchParams,
  ]);
  const saved = resolvedSearchParams.saved;
  const savedMessage =
    saved === "block"
      ? "A kezdőlapi blokk mentve."
      : saved === "tile"
        ? "A promó csempe mentve."
        : "";

  return (
    <AdminShell
      title="Kezdőlap tartalom"
      description="Hero, Instagram kampány és kollekció promó slotok kezelése kódmódosítás nélkül."
    >
      {savedMessage ? (
        <div className="admin-panel-muted mb-5 px-4 py-3 text-sm text-[var(--admin-ink-700)]">
          {savedMessage}
        </div>
      ) : null}
      <AdminHomepageContentForm content={content} />
    </AdminShell>
  );
}
