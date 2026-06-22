import Image from "next/image";
import Link from "next/link";

type MediaSummary = {
  cleanupFailed: number;
  cleanupPending: number;
  homepageImages: number;
  productImages: number;
  totalImages: number;
};

export type AdminMediaInventoryRow = {
  id: string;
  adminHref?: string | null;
  createdAt?: string | null;
  imageUrl: string;
  source: string;
  sourceLabel: string;
  status: string;
  statusLabel: string;
  thumbnailUrl: string | null;
  updatedAt?: string | null;
  usageLabel: string;
};

export type AdminCleanupQueueRow = {
  id: string;
  createdAt: string;
  failureMessage: string | null;
  reason: string | null;
  scheduledAt: string;
  status: string;
  updatedAt: string;
  url: string;
};

type AdminMediaInventoryProps = {
  cleanupRows: AdminCleanupQueueRow[];
  rows: AdminMediaInventoryRow[];
  search: string;
  selectedSource: string;
  selectedStatus: string;
  sourceOptions: { label: string; value: string }[];
  statusOptions: { label: string; value: string }[];
  summary: MediaSummary;
};

const statusToneClass: Record<string, string> = {
  active: "border-[#bdd7c8] bg-[#f2faf5] text-[#24533a]",
  archived: "border-[#ead6a7] bg-[#fff9e8] text-[#765b18]",
  referenced: "border-[var(--admin-line-100)] bg-white text-[var(--admin-ink-700)]",
  cleanup_pending: "border-[#bfd0ea] bg-[var(--admin-blue-050)] text-[var(--admin-blue-700)]",
  cleanup_failed: "border-[#e3c7cf] bg-[#fff1f3] text-[#99283d]",
  cleanup_kept: "border-[#ead6a7] bg-[#fff9e8] text-[#765b18]",
  cleanup_deleted: "border-[var(--admin-line-100)] bg-[var(--admin-surface-100)] text-[var(--admin-ink-600)]",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("hu-HU");
}

function shortenUrl(url: string) {
  try {
    const parsed = new URL(url);
    const fileName = parsed.pathname.split("/").filter(Boolean).pop() ?? parsed.hostname;
    return `${parsed.hostname}/${fileName}`;
  } catch {
    if (url.length <= 64) return url;
    return `${url.slice(0, 28)}...${url.slice(-28)}`;
  }
}

function SourceBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-sm border border-[var(--admin-line-100)] bg-white px-2 py-1 text-[11px] font-medium text-[var(--admin-ink-700)]">
      {label}
    </span>
  );
}

function StatusBadge({ label, status }: { label: string; status: string }) {
  return (
    <span className={`inline-flex rounded-sm border px-2 py-1 text-[11px] font-medium ${statusToneClass[status] ?? statusToneClass.referenced}`}>
      {label}
    </span>
  );
}

function Thumbnail({ row }: { row: AdminMediaInventoryRow }) {
  return (
    <div className="relative h-14 w-14 overflow-hidden rounded-sm border border-[var(--admin-line-100)] bg-[var(--admin-surface-100)]">
      {row.thumbnailUrl ? (
        <Image
          src={row.thumbnailUrl}
          alt={row.usageLabel}
          fill
          sizes="56px"
          className="object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] text-[var(--admin-ink-500)]">
          Nincs preview
        </div>
      )}
    </div>
  );
}

export function AdminMediaInventory({
  cleanupRows,
  rows,
  search,
  selectedSource,
  selectedStatus,
  sourceOptions,
  statusOptions,
  summary,
}: AdminMediaInventoryProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Összes referencia", value: summary.totalImages },
          { label: "Termékképek", value: summary.productImages },
          { label: "Homepage képek", value: summary.homepageImages },
          { label: "Cleanup pending", value: summary.cleanupPending },
          { label: "Cleanup failed", value: summary.cleanupFailed },
        ].map((item) => (
          <section key={item.label} className="admin-panel p-5">
            <p className="admin-eyebrow">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--admin-ink-900)]">{item.value}</p>
          </section>
        ))}
      </div>

      <form className="admin-panel-soft grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_12rem_12rem_auto] lg:items-end">
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-[var(--admin-ink-700)]">Keresés</span>
          <input
            name="q"
            defaultValue={search}
            placeholder="URL, terméknév, blokk vagy forrás..."
            className="admin-input h-10 px-3 text-sm"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-[var(--admin-ink-700)]">Forrás</span>
          <select name="source" defaultValue={selectedSource} className="admin-input h-10 px-3 text-sm">
            {sourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-[var(--admin-ink-700)]">Státusz</span>
          <select name="status" defaultValue={selectedStatus} className="admin-input h-10 px-3 text-sm">
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="admin-button-primary admin-control-md">
          Szűrés
        </button>
      </form>

      <section className="admin-table-shell overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--admin-line-100)] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--admin-ink-900)]">Image inventory</h2>
            <p className="mt-1 text-xs text-[var(--admin-ink-500)]">{rows.length} referencia a jelenlegi szűrésben.</p>
          </div>
        </div>

        <div className="hidden overflow-x-auto xl:block">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="admin-table-head">
                {["Preview", "Forrás", "Használat", "URL", "Státusz", "Dátum", ""].map((column) => (
                  <th key={column} className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[.15em] text-[var(--admin-ink-500)]">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-[var(--admin-ink-500)]">
                    Nincs találat a megadott szűrésre.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="admin-table-row">
                    <td className="px-5 py-3.5"><Thumbnail row={row} /></td>
                    <td className="px-5 py-3.5"><SourceBadge label={row.sourceLabel} /></td>
                    <td className="max-w-64 px-5 py-3.5 text-sm text-[var(--admin-ink-900)]">
                      <span className="line-clamp-2">{row.usageLabel}</span>
                    </td>
                    <td className="max-w-80 px-5 py-3.5 text-xs text-[var(--admin-ink-600)]">
                      <span className="line-clamp-2 break-all">{shortenUrl(row.imageUrl)}</span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge label={row.statusLabel} status={row.status} /></td>
                    <td className="px-5 py-3.5 text-xs text-[var(--admin-ink-500)]">{formatDate(row.updatedAt ?? row.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      {row.adminHref ? (
                        <Link href={row.adminHref} className="admin-inline-link text-xs">
                          Admin →
                        </Link>
                      ) : (
                        <span className="text-xs text-[var(--admin-ink-500)]">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-4 xl:hidden">
          {rows.length === 0 ? (
            <div className="admin-panel-soft px-4 py-8 text-center text-sm text-[var(--admin-ink-500)]">
              Nincs találat a megadott szűrésre.
            </div>
          ) : (
            rows.map((row) => (
              <article key={row.id} className="admin-panel-soft p-4">
                <div className="flex gap-3">
                  <Thumbnail row={row} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <SourceBadge label={row.sourceLabel} />
                      <StatusBadge label={row.statusLabel} status={row.status} />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-[var(--admin-ink-900)]">{row.usageLabel}</h3>
                    <p className="mt-1 break-all text-xs text-[var(--admin-ink-500)]">{shortenUrl(row.imageUrl)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--admin-ink-500)]">
                  <span>{formatDate(row.updatedAt ?? row.createdAt)}</span>
                  {row.adminHref ? <Link href={row.adminHref} className="admin-inline-link">Admin →</Link> : null}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="admin-table-shell overflow-hidden">
        <div className="border-b border-[var(--admin-line-100)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--admin-ink-900)]">Cleanup queue</h2>
          <p className="mt-1 text-xs text-[var(--admin-ink-500)]">
            Read-only lista. Ebben a körben nincs törlés vagy retry action.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="admin-table-head">
                {["Státusz", "URL", "Reason", "Failure", "Scheduled", "Updated"].map((column) => (
                  <th key={column} className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[.15em] text-[var(--admin-ink-500)]">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cleanupRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-[var(--admin-ink-500)]">
                    Nincs cleanup queue item.
                  </td>
                </tr>
              ) : (
                cleanupRows.map((row) => {
                  const status = `cleanup_${row.status.toLowerCase()}`;
                  return (
                    <tr key={row.id} className="admin-table-row">
                      <td className="px-5 py-3.5">
                        <StatusBadge label={row.status} status={status} />
                      </td>
                      <td className="max-w-96 px-5 py-3.5 text-xs text-[var(--admin-ink-600)]">
                        <span className="line-clamp-2 break-all">{shortenUrl(row.url)}</span>
                      </td>
                      <td className="max-w-60 px-5 py-3.5 text-xs text-[var(--admin-ink-600)]">{row.reason ?? "-"}</td>
                      <td className="max-w-80 px-5 py-3.5 text-xs text-[var(--admin-ink-600)]">{row.failureMessage ?? "-"}</td>
                      <td className="px-5 py-3.5 text-xs text-[var(--admin-ink-500)]">{formatDate(row.scheduledAt)}</td>
                      <td className="px-5 py-3.5 text-xs text-[var(--admin-ink-500)]">{formatDate(row.updatedAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
