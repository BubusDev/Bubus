"use client";

import Image from "next/image";
import { useState, useOptimistic, useTransition } from "react";
import { Archive, RotateCcw, Trash2 } from "lucide-react";

import { restoreProduct, permanentlyDeleteProduct, restoreAllProducts } from "@/app/admin/products/archive/actions";

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
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(filterLabels) as FilterKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                activeFilter === key
                  ? "border-[#e9b6d0] bg-[linear-gradient(135deg,#ec7cb2,#d95f92)] text-white shadow-[0_8px_20px_rgba(217,95,146,0.25)]"
                  : "border-[#edd8e6] bg-white/80 text-[#7a5a6c] hover:border-[#e9b6d0] hover:bg-white"
              }`}
            >
              {filterLabels[key]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[#edd8e6] bg-[#fff7fb] px-3 py-1.5 text-xs text-[#9b6a84]">
            {optimisticProducts.length} archivált termék
          </span>
          {optimisticProducts.length > 0 && (
            <button
              onClick={handleRestoreAll}
              className="rounded-full border border-[#edd8e6] bg-white/80 px-4 py-1.5 text-xs font-medium text-[#7a5a6c] transition hover:border-[#e9b6d0] hover:bg-white"
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
          {filtered.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 overflow-hidden rounded-[1.8rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,241,247,0.8))] p-4 shadow-[0_8px_24px_rgba(191,117,162,0.08)] backdrop-blur-xl sm:gap-5 sm:p-5"
            >
              {/* Thumbnail */}
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[1rem] bg-[#f9eef5] sm:h-20 sm:w-20">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover opacity-60"
                    style={{ filter: "grayscale(40%)" }}
                    sizes="80px"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#f5e0ea] to-[#e8c6d8]" />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-[family:var(--font-display)] text-[1.05rem] leading-tight text-[#3a1f2d]">
                  {product.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#f2d0e1] bg-[#fff4f9] px-2.5 py-0.5 text-[11px] text-[#9b476f]">
                    {product.collectionLabel}
                  </span>
                  <span className="text-[10px] text-[#b08898]">
                    Archiválva:{" "}
                    {new Intl.DateTimeFormat("hu-HU", { dateStyle: "short" }).format(
                      new Date(product.archivedAt),
                    )}
                  </span>
                  <span className="text-[10px] text-[#c4a0b0]">/{product.slug}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => handleRestore(product.id)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#c45a85,#e07a70)] px-4 py-2 text-xs font-medium text-white shadow-[0_8px_20px_rgba(196,90,133,0.25)] transition hover:-translate-y-[1px] hover:shadow-[0_12px_26px_rgba(196,90,133,0.32)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Visszaállítás
                </button>
                <button
                  onClick={() => setConfirm({ id: product.id, name: product.name })}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#f0d3dc] bg-white/80 px-4 py-2 text-xs font-medium text-[#9b476f] transition hover:border-[#e9afc0] hover:bg-[#fff0f4] hover:text-[#c0314d]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Törlés
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#2b1220]/20 backdrop-blur-sm"
            onClick={() => setConfirm(null)}
          />
          <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-7 shadow-[0_32px_70px_rgba(108,40,80,0.22)] backdrop-blur-xl">
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0f4]">
              <Trash2 className="h-5 w-5 text-[#c0314d]" />
            </div>
            <h3 className="mt-3 font-[family:var(--font-display)] text-[1.3rem] leading-tight text-[#3a1f2d]">
              Biztosan törlöd?
            </h3>
            <p className="mt-2 text-sm leading-7 text-[#7a5a6c]">
              A <strong className="text-[#4d2741]">{confirm.name}</strong> terméket véglegesen
              törlöd az adatbázisból. Ez a művelet nem visszavonható.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 rounded-full border border-[#edd8e6] bg-white/80 py-2.5 text-sm font-medium text-[#7a5a6c] transition hover:bg-white"
              >
                Mégse
              </button>
              <button
                onClick={() => handleDeleteConfirmed(confirm.id)}
                className="flex-1 rounded-full bg-[linear-gradient(135deg,#c0314d,#d44a60)] py-2.5 text-sm font-medium text-white shadow-[0_8px_20px_rgba(192,49,77,0.28)] transition hover:-translate-y-[1px]"
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
      <Archive className="h-12 w-12 text-rose-300" strokeWidth={1.2} />
      <h3 className="mt-4 font-[family:var(--font-display)] text-[1.4rem] text-[#4d2741]">
        Nincs archivált termék
      </h3>
      <p className="mt-2 max-w-[36ch] text-sm leading-7 text-[#9b7a8b]">
        Az archivált termékek itt jelennek meg, ahol visszaállíthatod vagy véglegesen törölheted
        őket.
      </p>
    </div>
  );
}
