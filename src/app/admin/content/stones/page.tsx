import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { db } from "@/lib/db";
import { deleteStoneAction } from "./actions";

export default async function AdminStonesPage() {
  const stones = await db.stone.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <AdminShell
      title="Kövek szerkesztő"
      description="A féldrágakövek leírásainak kezelése — ezek jelennek meg a termékmodálban és a /stones oldalon."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#9a6878]">{stones.length} kő az adatbázisban</p>
          <Link
            href="/admin/content/stones/new"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c45a85] to-[#9b3d6e] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            Új kő
          </Link>
        </div>

        {stones.length === 0 ? (
          <p className="text-sm text-[#9a7080]">Még nincsenek kövek. Hozd létre az elsőt!</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#f0dbe6]">
            {stones.map((stone, index) => (
              <div
                key={stone.id}
                className={`flex items-center gap-4 px-5 py-4 ${
                  index !== stones.length - 1 ? "border-b border-[#f8edf3]" : ""
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
                  <p className="text-sm font-medium text-[#4d2741]">{stone.name}</p>
                  <p className="text-[11px] text-[#9a7080]">
                    {stone.effects.length} hatás
                    {stone.chakra ? ` · ${stone.chakra}` : ""}
                    {stone.origin ? ` · ${stone.origin}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/content/stones/${stone.id}/edit`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#ecd3e3] bg-white px-3 text-xs font-medium text-[#6b425a] transition hover:border-[#e9b6d0]"
                  >
                    <Pencil className="h-3 w-3" />
                    Szerkesztés
                  </Link>

                  <form action={deleteStoneAction}>
                    <input type="hidden" name="id" value={stone.id} />
                    <button
                      type="submit"
                      className="inline-flex h-8 items-center rounded-full border border-[#f0dbe6] bg-white px-3 text-xs text-[#c0a0b4] transition hover:border-rose-200 hover:text-rose-500"
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
