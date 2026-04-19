import { AdminHomepageContentForm } from "@/components/admin/AdminHomepageContentForm";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  getHomepageContent,
  getHomepageMaterialPickOptions,
} from "@/lib/homepage-content";

type AdminHomepageContentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminHomepageContentPage({
  searchParams,
}: AdminHomepageContentPageProps) {
  const [content, materialPickOptions, resolvedSearchParams] = await Promise.all([
    getHomepageContent(),
    getHomepageMaterialPickOptions(),
    searchParams,
  ]);
  const saved = resolvedSearchParams.saved;
  const savedMessage =
    saved === "block"
      ? "A kezdőlapi blokk mentve."
      : saved === "tile"
        ? "A promó csempe mentve."
        : saved === "materials"
          ? "A kezdőlapi kő és termék válogatás mentve."
        : "";

  return (
    <AdminShell title="Kezdőlap tartalom">
      {savedMessage ? (
        <div className="admin-panel-muted mb-5 px-4 py-3 text-sm text-[var(--admin-ink-700)]">
          {savedMessage}
        </div>
      ) : null}
      <AdminHomepageContentForm content={content} materialPickOptions={materialPickOptions} />
    </AdminShell>
  );
}
