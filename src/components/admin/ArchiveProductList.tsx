"use client";

import Image from "next/image";
import { useState, useOptimistic, useTransition } from "react";
import { Archive, RotateCcw, Trash2 } from "lucide-react";

import { restoreProduct, permanentlyDeleteProduct, restoreAllProducts } from "@/app/(admin)/admin/products/archive/actions";
import { getBrowserDisplayImageUrl } from "@/lib/image-safety";

type ArchivedProduct = {
  id: string;
  name: string;
  imageUrl: string | null;
  collectionLabel: string;
  archivedAt: Date;
  archiveReason: string | null;
  slug: string;
};

type FilterKey = "all" | "sold_out" | "seasonal" | "discontinued";

const filterLabels: Record<FilterKey, string> = {
  all: "Összes",
  sold_out: "Elfogyott",
  seasonal: "Idényjellegű",
  discontinued: "Leállított",
};

const reasonMap: Record<string, FilterKey> = {
  SOLD_OUT: "sold_out",
  SEASONAL: "seasonal",
  DISCONTINUED: "discontinued",
};

type ConfirmState = { id: string; name: string } | null;

export function ArchiveProductList({ products }: { products: ArchivedProduct[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [, startTransition] = useTransition();

  const [optimisticProducts, removeOptimistic] = useOptimistic(
    products,
    (state, removedId: string) => state.filter((p) => p.id !== removedId),
  );

  const filtered =
    activeFilter === "all"
      ? optimisticProducts
      : optimisticProducts.filter(
          (p) => reasonMap[p.archiveReason ?? ""] === activeFilter,
        );

  function handleRestore(id: string) {
    startTransition(async () => {
      removeOptimistic(id);
      await restoreProduct(id);
    });
  }

  function handleDeleteConfirmed(id: string) {
    setConfirm(null);
    startTransition(async () => {
      removeOptimistic(id);
      await permanentlyDeleteProduct(id);
    });
  }

  function handleRestoreAll() {
    startTransition(async () => {
      for (const p of optimisticProducts) removeOptimistic(p.id);
      await restoreAllProducts();
    });
  }

  return (
    <>
      {/* Status bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="admin-filter-row">
          {(Object.keys(filterLabels) as FilterKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`admin-filter-chip admin-control-sm font-medium ${activeFilter === key ? "admin-filter-chip-active" : ""}`}
            >
              {filterLabels[key]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="admin-badge-neutral admin-pill">
            {optimisticProducts.length} archivált termék
          </span>
          {optimisticProducts.length > 0 && (
            <button
              onClick={handleRestoreAll}
              className="admin-button-secondary admin-control-sm"
            >
              Összes visszaállítása
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => {
            const displayImageUrl = getBrowserDisplayImageUrl(product.imageUrl);

            return (
              <div
                key={product.id}
                className="admin-panel flex items-center gap-4 overflow-hidden p-4 sm:gap-5 sm:p-5"
              >
                {/* Thumbnail */}
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[1rem] bg-[var(--admin-surface-100)] sm:h-20 sm:w-20">
                  {displayImageUrl ? (
                    <Image
                      src={displayImageUrl}
                      alt={product.name}
                      fill
                      className="object-cover opacity-60"
                      style={{ filter: "grayscale(40%)" }}
                      sizes="80px"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#edf4fd] to-[#d7e5f8]" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-[family:var(--font-display)] text-[1.05rem] leading-tight text-[var(--admin-ink-900)]">
                    {product.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="admin-badge-neutral admin-pill">
                      {product.collectionLabel}
                    </span>
                    <span className="text-[10px] text-[var(--admin-ink-500)]">
                      Archiválva:{" "}
                      {new Intl.DateTimeFormat("hu-HU", { dateStyle: "short" }).format(
                        new Date(product.archivedAt),
                      )}
                    </span>
                    <span className="text-[10px] text-[var(--admin-ink-500)]">/{product.slug}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => handleRestore(product.id)}
                    className="admin-button-primary admin-control-sm inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Visszaállítás
                  </button>
                  <button
                    onClick={() => setConfirm({ id: product.id, name: product.name })}
                    className="admin-button-danger admin-control-sm inline-flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Törlés
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#2b1220]/20 backdrop-blur-sm"
            onClick={() => setConfirm(null)}
          />
          <div className="admin-panel relative w-full max-w-sm overflow-hidden p-7">
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1f3]">
              <Trash2 className="h-5 w-5 text-[#c0314d]" />
            </div>
            <h3 className="mt-3 font-[family:var(--font-display)] text-[1.3rem] leading-tight text-[var(--admin-ink-900)]">
              Biztosan törlöd?
            </h3>
            <p className="mt-2 text-sm leading-7 text-[var(--admin-ink-600)]">
              A <strong className="text-[var(--admin-ink-900)]">{confirm.name}</strong> terméket véglegesen
              törlöd az adatbázisból. Ez a művelet nem visszavonható.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="admin-button-secondary flex-1 py-2.5 text-sm"
              >
                Mégse
              </button>
              <button
                onClick={() => handleDeleteConfirmed(confirm.id)}
                className="admin-button-danger flex-1 py-2.5 text-sm"
              >
                Végleges törlés
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Archive className="h-12 w-12 text-[var(--admin-ink-500)]" strokeWidth={1.2} />
      <h3 className="mt-4 font-[family:var(--font-display)] text-[1.4rem] text-[var(--admin-ink-900)]">
        Nincs archivált termék
      </h3>
      <p className="mt-2 max-w-[36ch] text-sm leading-7 text-[var(--admin-ink-500)]">
        Az archivált termékek itt jelennek meg, ahol visszaállíthatod vagy véglegesen törölheted
        őket.
      </p>
    </div>
  );
}
