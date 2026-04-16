import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { db } from "@/lib/db";
import { deleteStoneAction } from "./actions";

export default async function AdminStonesPage() {
  const stones = await db.stone.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <AdminShell title="Kövek szerkesztő">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--admin-ink-600)]">{stones.length} kő az adatbázisban</p>
          <Link
            href="/admin/content/stones/new"
            className="admin-button-primary admin-control-md gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            Új kő
          </Link>
        </div>

        {stones.length === 0 ? (
          <p className="text-sm text-[var(--admin-ink-600)]">Még nincsenek kövek. Hozd létre az elsőt!</p>
        ) : (
          <div className="admin-table-shell">
            {stones.map((stone, index) => (
              <div
                key={stone.id}
                className={`flex items-center gap-4 px-5 py-4 ${
                  index !== stones.length - 1 ? "border-b border-[#eef2f7]" : ""
                }`}
              >
                {/* Color circle */}
                <div
                  className="h-9 w-9 flex-shrink-0 rounded-full shadow-inner"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, white 0%, ${stone.colorHex} 100%)`,
                  }}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--admin-ink-900)]">{stone.name}</p>
                  <p className="text-[11px] text-[var(--admin-ink-500)]">
                    {stone.effects.length} hatás
                    {stone.chakra ? ` · ${stone.chakra}` : ""}
                    {stone.origin ? ` · ${stone.origin}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/content/stones/${stone.id}/edit`}
                    className="admin-button-secondary admin-control-sm inline-flex items-center gap-1.5"
                  >
                    <Pencil className="h-3 w-3" />
                    Szerkesztés
                  </Link>

                  <form action={deleteStoneAction}>
                    <input type="hidden" name="id" value={stone.id} />
                    <button
                      type="submit"
                      className="admin-button-danger admin-control-sm inline-flex items-center"
                    >
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
