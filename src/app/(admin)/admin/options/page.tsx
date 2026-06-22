import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Opciókészletek — Chicks Jewelry Admin",
  robots: { index: false, follow: false },
};

export default function AdminOptionsPage() {
  return (
    <AdminShell
      title="Opciókészletek"
      description="A termék opciók jelenleg a termék létrehozó és szerkesztő űrlapokon belül kezelhetők."
      actions={
        <Link href="/admin/products/new" className="admin-button-primary admin-control-md">
          Új termék
        </Link>
      }
    >
      <section className="admin-panel p-6">
        <p className="admin-eyebrow">Phase 3.1 tisztázás</p>
        <h2 className="mt-3 text-xl font-semibold text-[var(--admin-ink-900)]">
          Nincs külön opciókezelő oldal
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--admin-ink-600)]">
          Kategória, kőtípus, szín, stílus, alkalom, elérhetőség és vizuális tónus opciókat
          most a termék admin űrlap megfelelő mezőinél tudsz hozzáadni vagy szerkeszteni.
          Ez az oldal szándékosan nem irányít át automatikusan, hogy egyértelmű legyen a jelenlegi működés.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="admin-button-secondary admin-control-md">
            Termék létrehozása
          </Link>
          <Link href="/admin/products" className="admin-button-secondary admin-control-md">
            Termékek listája
          </Link>
        </div>
      </section>
    </AdminShell>
  );
}
