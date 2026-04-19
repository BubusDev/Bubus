import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
import {
  deleteShowcaseTabAction,
  saveShowcaseTabAction,
} from "@/app/(admin)/admin/content/homepage-showcase/actions";
import { getAdminShowcaseTabs, SHOWCASE_FILTER_TYPES } from "@/lib/homepage-showcase";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function TabForm({
  tab,
}: {
  tab?: {
    id: string;
    key: string;
    label: string;
    sortOrder: number;
    isActive: boolean;
    filterType: string;
    filterValue: string | null;
    maxItems: number;
  };
}) {
  const isNew = !tab;

  return (
    <form action={saveShowcaseTabAction} className="admin-panel px-5 py-5">
      {tab && <input type="hidden" name="id" value={tab.id} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-1.5">
          <span className="admin-eyebrow">Key (egyedi azonosító)</span>
          <input
            type="text"
            name="key"
            defaultValue={tab?.key ?? ""}
            placeholder="pl. new, necklaces, sale"
            required
            className="admin-input min-h-10 px-3 text-sm"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="admin-eyebrow">Tab felirat</span>
          <input
            type="text"
            name="label"
            defaultValue={tab?.label ?? ""}
            placeholder="pl. Újdonságok"
            required
            className="admin-input min-h-10 px-3 text-sm"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="admin-eyebrow">Sorrend</span>
          <input
            type="number"
            name="sortOrder"
            defaultValue={tab?.sortOrder ?? 0}
            min={0}
            className="admin-input min-h-10 px-3 text-sm"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="admin-eyebrow">Szűrő típusa</span>
          <select
            name="filterType"
            defaultValue={tab?.filterType ?? "new_arrivals"}
            className="admin-input min-h-10 px-3 text-sm"
          >
            {SHOWCASE_FILTER_TYPES.map((ft) => (
              <option key={ft.value} value={ft.value}>
                {ft.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="admin-eyebrow">
            Szűrő érték
            <span className="ml-1 font-normal text-[var(--admin-ink-500)]">
              (kategória: slug; kézi: JSON tömb)
            </span>
          </span>
          <input
            type="text"
            name="filterValue"
            defaultValue={tab?.filterValue ?? ""}
            placeholder='pl. necklaces vagy ["id1","id2"]'
            className="admin-input min-h-10 px-3 text-sm"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="admin-eyebrow">Max. termékszám</span>
          <input
            type="number"
            name="maxItems"
            defaultValue={tab?.maxItems ?? 8}
            min={1}
            max={24}
            className="admin-input min-h-10 px-3 text-sm"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <label className="admin-checkbox-pill inline-flex min-h-10 items-center gap-2.5 px-3 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={tab?.isActive ?? true}
            className="h-4 w-4"
          />
          Aktív
        </label>

        <button
          type="submit"
          className="inline-flex min-h-10 items-center rounded border border-[var(--admin-border)] bg-[var(--admin-ink-900)] px-4 text-sm font-medium text-white transition hover:bg-[var(--admin-ink-700)]"
        >
          {isNew ? "Tab hozzáadása" : "Mentés"}
        </button>
      </div>
    </form>
  );
}

export default async function AdminHomepageShowcasePage({ searchParams }: PageProps) {
  const [tabs, resolvedParams] = await Promise.all([
    getAdminShowcaseTabs(),
    searchParams,
  ]);

  const saved = resolvedParams.saved === "1";
  const deleted = resolvedParams.deleted === "1";

  return (
    <AdminShell title="Kezdőlap showcase tabjai">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/admin/content"
          className="admin-inline-link text-sm"
        >
          ← Vissza a tartalomhoz
        </Link>
      </div>

      {(saved || deleted) && (
        <div className="admin-panel-muted mb-5 px-4 py-3 text-sm text-[var(--admin-ink-700)]">
          {saved ? "A tab mentve." : "A tab törölve."}
        </div>
      )}

      <p className="mb-6 text-sm leading-6 text-[var(--admin-ink-600)]">
        A kezdőlap termék-csúszkájának tabjai. A mentés után azonnal érvénybe lép a webshopban.
        Üres tab (0 termékes szűrő) nem jelenik meg a látogatóknak.
      </p>

      <div className="space-y-4">
        {tabs.map((tab) => (
          <div key={tab.id} className="relative">
            <TabForm tab={tab} />
            <form
              action={deleteShowcaseTabAction}
              className="absolute right-5 top-5"
            >
              <input type="hidden" name="id" value={tab.id} />
              <button
                type="submit"
                className="text-xs text-[var(--admin-ink-400)] underline transition hover:text-red-600"
                onClick={(e) => {
                  if (!confirm(`Törlöd a "${tab.label}" tabot?`)) e.preventDefault();
                }}
              >
                Törlés
              </button>
            </form>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="admin-eyebrow mb-4">Új tab hozzáadása</h2>
        <TabForm />
      </div>
    </AdminShell>
  );
}
