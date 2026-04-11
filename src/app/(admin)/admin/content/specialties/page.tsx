import { Plus, Trash2 } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSpecialtyNavigationItems } from "@/lib/specialty-navigation";
import {
  createSpecialtyNavigationItemAction,
  deleteSpecialtyNavigationItemAction,
  updateSpecialtyNavigationItemAction,
} from "./actions";

type AdminSpecialtiesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const inputClassName =
  "admin-input min-h-10 px-3 text-sm";

function getErrorMessage(searchParams: Record<string, string | string[] | undefined>) {
  const error = searchParams.error;
  return typeof error === "string" ? error : null;
}

export default async function AdminSpecialtiesPage({
  searchParams,
}: AdminSpecialtiesPageProps) {
  const [items, resolvedSearchParams] = await Promise.all([
    getAdminSpecialtyNavigationItems(),
    searchParams,
  ]);
  const errorMessage = getErrorMessage(resolvedSearchParams);

  return (
    <AdminShell
      title="Különlegességek navigáció"
      description="A webshop felső kategórianavigációjában megjelenő Különlegességek legördülő elemeinek kezelése."
    >
      <div className="space-y-6">
        {errorMessage ? (
          <div className="rounded-md border border-[#e3c7cf] bg-[#fff1f3] px-4 py-3 text-sm text-[#99283d]">
            {errorMessage}
          </div>
        ) : null}

        <form action={createSpecialtyNavigationItemAction} className="admin-panel p-5">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[var(--admin-blue-700)]" />
            <h2 className="text-sm font-semibold text-[var(--admin-ink-900)]">
              Új elem hozzáadása
            </h2>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_1fr_7rem_auto] md:items-end">
            <label className="block">
              <span className="admin-eyebrow mb-1.5 block">Név</span>
              <input name="label" required placeholder="Kulcstartók" className={inputClassName} />
            </label>

            <label className="block">
              <span className="admin-eyebrow mb-1.5 block">Cél URL</span>
              <input name="href" required placeholder="/karkotok" className={inputClassName} />
            </label>

            <label className="block">
              <span className="admin-eyebrow mb-1.5 block">Szűrő kulcs</span>
              <input name="filterKey" placeholder="napfogo" className={inputClassName} />
            </label>

            <label className="block">
              <span className="admin-eyebrow mb-1.5 block">Sorrend</span>
              <input
                name="sortOrder"
                type="number"
                defaultValue={items.length}
                className={inputClassName}
              />
            </label>

            <label className="admin-checkbox-pill inline-flex min-h-10 items-center gap-2 px-3 text-sm">
              <input name="isVisible" type="checkbox" defaultChecked className="h-4 w-4" />
              Látható
            </label>
          </div>

          <button type="submit" className="admin-button-primary admin-control-md mt-4">
            Létrehozás
          </button>
        </form>

        {items.length === 0 ? (
          <div className="admin-panel-muted p-5 text-sm text-[var(--admin-ink-600)]">
            Még nincs kezelhető elem. Amíg nincs látható elem, a Különlegességek menüpont nem jelenik meg a webshop navigációjában.
          </div>
        ) : (
          <div className="admin-table-shell">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`grid gap-4 px-5 py-4 lg:grid-cols-[1fr_1fr_1fr_7rem_auto_auto] lg:items-end ${
                  index !== items.length - 1 ? "border-b border-[#eef2f7]" : ""
                }`}
              >
                <form
                  id={`specialty-item-${item.id}`}
                  action={updateSpecialtyNavigationItemAction}
                  className="contents"
                >
                  <input type="hidden" name="id" value={item.id} />

                  <label className="block">
                    <span className="admin-eyebrow mb-1.5 block">Név</span>
                    <input
                      name="label"
                      required
                      defaultValue={item.label}
                      className={inputClassName}
                    />
                  </label>

                  <label className="block">
                    <span className="admin-eyebrow mb-1.5 block">Cél URL</span>
                    <input
                      name="href"
                      required
                      defaultValue={item.href}
                      className={inputClassName}
                    />
                  </label>

                  <label className="block">
                    <span className="admin-eyebrow mb-1.5 block">Szűrő kulcs</span>
                    <input
                      name="filterKey"
                      defaultValue={item.filterKey ?? ""}
                      placeholder="napfogo"
                      className={inputClassName}
                    />
                  </label>

                  <label className="block">
                    <span className="admin-eyebrow mb-1.5 block">Sorrend</span>
                    <input
                      name="sortOrder"
                      type="number"
                      defaultValue={item.sortOrder}
                      className={inputClassName}
                    />
                  </label>

                  <label className="admin-checkbox-pill inline-flex min-h-10 items-center gap-2 px-3 text-sm">
                    <input
                      name="isVisible"
                      type="checkbox"
                      defaultChecked={item.isVisible}
                      className="h-4 w-4"
                    />
                    Látható
                  </label>
                </form>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    form={`specialty-item-${item.id}`}
                    className="admin-button-secondary admin-control-sm"
                  >
                    Mentés
                  </button>

                  <form action={deleteSpecialtyNavigationItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="admin-button-danger admin-control-sm gap-1.5"
                    >
                      <Trash2 className="h-3 w-3" />
                      Törlés
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
