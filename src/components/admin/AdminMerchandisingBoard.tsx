"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, GripVertical, LayoutGrid, List, RotateCcw, Save } from "lucide-react";
import { useMemo, useState, useTransition, type DragEvent } from "react";

import { saveMerchandisingOrderAction } from "@/app/(admin)/admin/merchandising/actions";
import { formatPrice } from "@/lib/catalog";
import { getFocalBackgroundStyle, type ImageFocalPoint } from "@/lib/image-crop";
import { getBrowserDisplayImageUrl } from "@/lib/image-safety";
import type { MerchandisingContext } from "@/lib/products";

export type MerchandisingBoardProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  badge: string;
  collectionLabel: string;
  categoryLabel: string;
  imageUrl: string | null;
  cardFocalPoint: ImageFocalPoint | null;
  statusLabel: string;
  availableToSell: number;
  isNew: boolean;
  isOnSale: boolean;
  isGiftable: boolean;
};

type AdminMerchandisingBoardProps = {
  contexts: MerchandisingContext[];
  selectedContext: MerchandisingContext | null;
  products: MerchandisingBoardProduct[];
  hasManualOrder: boolean;
};

type ViewMode = "board" | "list";

function moveItem(items: MerchandisingBoardProduct[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);

  if (!movedItem) {
    return items;
  }

  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

function getProductFlags(product: MerchandisingBoardProduct) {
  return [
    product.isNew ? "Újdonság" : null,
    product.isOnSale ? "Akció" : null,
    product.isGiftable ? "Ajándéknak" : null,
    product.availableToSell <= 0 ? "Elfogyott" : null,
  ].filter(Boolean);
}

export function AdminMerchandisingBoard({
  contexts,
  selectedContext,
  products,
  hasManualOrder,
}: AdminMerchandisingBoardProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [draft, setDraft] = useState({
    contextKey: selectedContext?.key ?? "",
    items: products,
    savedIds: products.map((product) => product.id).join(","),
  });
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const contextKey = selectedContext?.key ?? "";
  const items = draft.contextKey === contextKey ? draft.items : products;
  const originalIds = useMemo(
    () => (draft.contextKey === contextKey ? draft.savedIds : products.map((product) => product.id).join(",")),
    [contextKey, draft.contextKey, draft.savedIds, products],
  );
  const storefrontHref = selectedContext?.storefrontHref;
  const storefrontLabel = selectedContext?.storefrontLabel ?? "Storefront listing";
  const currentIds = items.map((product) => product.id).join(",");
  const hasChanges = originalIds !== currentIds;

  function handleContextChange(nextKey: string) {
    const query = new URLSearchParams();
    query.set("context", nextKey);
    router.push(`/admin/merchandising?${query.toString()}`);
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    setDraft((currentDraft) => {
      const currentItems = currentDraft.contextKey === contextKey ? currentDraft.items : products;
      const fromIndex = currentItems.findIndex((item) => item.id === draggedId);
      const toIndex = currentItems.findIndex((item) => item.id === targetId);

      if (fromIndex < 0 || toIndex < 0) {
        return currentDraft;
      }

      return {
        contextKey,
        items: moveItem(currentItems, fromIndex, toIndex),
        savedIds: currentDraft.contextKey === contextKey ? currentDraft.savedIds : products.map((product) => product.id).join(","),
      };
    });
    setStatusMessage("Nem mentett sorrend.");
    setDraggedId(null);
  }

  function saveOrder() {
    if (!selectedContext) {
      return;
    }

    startTransition(async () => {
      setStatusMessage("Mentés folyamatban...");

      try {
        const result = await saveMerchandisingOrderAction({
          listingKey: selectedContext.key,
          orderedProductIds: items.map((item) => item.id),
        });
        const savedIds = items.map((item) => item.id).join(",");
        setDraft({
          contextKey,
          items,
          savedIds,
        });
        setStatusMessage(
          `Mentve: ${new Intl.DateTimeFormat("hu-HU", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(result.savedAt))}`,
        );
        router.refresh();
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "A mentés nem sikerült.");
      }
    });
  }

  function resetOrder() {
    setDraft({
      contextKey,
      items: products,
      savedIds: products.map((product) => product.id).join(","),
    });
    setStatusMessage(null);
  }

  return (
    <div className="space-y-5">
      <section className="admin-panel p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="admin-eyebrow">Merchandising kontextus</p>
            <select
              value={selectedContext?.key ?? ""}
              onChange={(event) => handleContextChange(event.target.value)}
              className="admin-select mt-2 min-h-12 px-3 text-base font-semibold"
            >
              {contexts.map((context) => (
                <option key={context.key} value={context.key}>
                  {context.label}
                </option>
              ))}
            </select>
            {selectedContext ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[var(--admin-ink-600)]">
                <span>{selectedContext.description}</span>
                {storefrontHref ? (
                  <span className="admin-badge-neutral admin-pill">{storefrontLabel}</span>
                ) : (
                  <span className="admin-badge-neutral admin-pill">Nincs közvetlen storefront oldal</span>
                )}
              </div>
            ) : null}
          </div>

          <div className="admin-panel-muted grid min-w-[260px] gap-3 p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[var(--admin-ink-500)]">Termékek</span>
              <span className="font-semibold text-[var(--admin-ink-900)]">{items.length}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[var(--admin-ink-500)]">Sorrend</span>
              <span className="font-semibold text-[var(--admin-ink-900)]">
                {hasManualOrder ? "Manuális" : "Alapértelmezett"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className={`admin-button-secondary admin-control-sm flex-1 ${viewMode === "board" ? "admin-filter-chip-soft-active" : ""}`}
                onClick={() => setViewMode("board")}
              >
                <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
                Board nézet
              </button>
              <button
                type="button"
                className={`admin-button-secondary admin-control-sm flex-1 ${viewMode === "list" ? "admin-filter-chip-soft-active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <List className="mr-1.5 h-3.5 w-3.5" />
                Lista nézet
              </button>
            </div>
            {storefrontHref ? (
              <Link
                className="admin-button-secondary admin-control-md w-full"
                href={storefrontHref}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Megnyitás az oldalon
              </Link>
            ) : (
              <button type="button" className="admin-button-secondary admin-control-md w-full" disabled>
                <ExternalLink className="mr-2 h-4 w-4" />
                Nincs megnyitható oldal
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section className="admin-panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--admin-line-100)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="admin-eyebrow">Storefront ritmus</p>
              <h2 className="mt-1 font-[family:var(--font-display)] text-2xl leading-tight text-[var(--admin-ink-900)]">
                {selectedContext?.label ?? "Nincs kontextus"}
              </h2>
            </div>
            <p className="text-sm text-[var(--admin-ink-600)]">
              Húzd a kártyákat új pozícióba, majd mentsd a kontextus sorrendjét.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-[var(--admin-ink-500)]">
              Ebben a listing kontextusban jelenleg nincs storefronton megjelenő termék.
            </div>
          ) : viewMode === "board" ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 bg-[#fbfaf7] p-3 sm:grid-cols-3 sm:gap-x-4 sm:p-4 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((product, index) => (
                <MerchandisingProductTile
                  key={product.id}
                  product={product}
                  index={index}
                  dragged={draggedId === product.id}
                  onDragStart={() => setDraggedId(product.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(product.id)}
                  onDragEnd={() => setDraggedId(null)}
                />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-[var(--admin-line-100)]">
              {items.map((product, index) => (
                <MerchandisingProductRow
                  key={product.id}
                  product={product}
                  index={index}
                  dragged={draggedId === product.id}
                  onDragStart={() => setDraggedId(product.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(product.id)}
                  onDragEnd={() => setDraggedId(null)}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="admin-panel-soft h-fit p-4">
          <p className="admin-eyebrow">Műveletek</p>
          <div className="mt-4 grid gap-2">
            <button
              type="button"
              className="admin-button-primary admin-control-md w-full"
              onClick={saveOrder}
              disabled={!selectedContext || !hasChanges || isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              Sorrend mentése
            </button>
            <button
              type="button"
              className="admin-button-secondary admin-control-md w-full"
              onClick={resetOrder}
              disabled={!hasChanges || isPending}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Visszaállítás
            </button>
          </div>
          <div className="mt-4 rounded-md border border-[var(--admin-line-100)] bg-white/70 px-3 py-3 text-sm leading-6 text-[var(--admin-ink-600)]">
            {statusMessage ?? (hasChanges ? "Nem mentett módosítások." : "Nincs nem mentett módosítás.")}
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--admin-ink-500)]">
            A mentés csak ezt a listing kontextust érinti. Más kategóriák, akciós válogatások és kezdőlapi blokkok sorrendje külön marad.
          </p>
        </aside>
      </div>
    </div>
  );
}

function MerchandisingProductTile({
  product,
  index,
  dragged,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  product: MerchandisingBoardProduct;
  index: number;
  dragged: boolean;
  onDragStart: () => void;
  onDragOver: (event: DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const imageUrl = getBrowserDisplayImageUrl(product.imageUrl);
  const flags = getProductFlags(product);

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`group cursor-grab transition active:cursor-grabbing ${dragged ? "scale-[0.98] opacity-45" : "opacity-100"}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f3f0]">
        {imageUrl ? (
          <div
            role="img"
            aria-label={product.name}
            className="absolute inset-0 bg-[#f5f3f0]"
            style={getFocalBackgroundStyle(imageUrl, product.cardFocalPoint)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#edf1f6] px-3 text-center text-sm text-[var(--admin-ink-500)]">
            {product.name}
          </div>
        )}
        <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-[var(--admin-ink-900)] shadow-sm">
          <GripVertical className="h-3.5 w-3.5 text-[var(--admin-ink-500)]" />
          {index + 1}
        </div>
        {flags[0] ? (
          <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-[var(--admin-ink-700)] shadow-sm">
            {flags[0]}
          </span>
        ) : null}
      </div>
      <div className="mt-2">
        <p className="text-[9px] uppercase tracking-[0.2em] text-[#888]">{product.collectionLabel}</p>
        <p className="mt-1 line-clamp-2 min-h-9 text-sm font-semibold leading-snug text-[var(--admin-ink-900)]">
          {product.name}
        </p>
        <div className="mt-1 flex items-center justify-between gap-2 text-sm">
          <span className="font-semibold text-[var(--admin-ink-900)]">{formatPrice(product.price)}</span>
          <span className="truncate text-xs text-[var(--admin-ink-500)]">{product.categoryLabel}</span>
        </div>
      </div>
    </article>
  );
}

function MerchandisingProductRow({
  product,
  index,
  dragged,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  product: MerchandisingBoardProduct;
  index: number;
  dragged: boolean;
  onDragStart: () => void;
  onDragOver: (event: DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const imageUrl = getBrowserDisplayImageUrl(product.imageUrl);
  const flags = getProductFlags(product);

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`grid cursor-grab grid-cols-[auto_56px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition hover:bg-[var(--admin-blue-050)] active:cursor-grabbing ${dragged ? "opacity-45" : "opacity-100"}`}
    >
      <div className="inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md border border-[var(--admin-line-100)] bg-white px-2 text-xs font-semibold text-[var(--admin-ink-700)]">
        <GripVertical className="h-3.5 w-3.5" />
        {index + 1}
      </div>
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-[#f5f3f0]">
        {imageUrl ? (
          <div
            role="img"
            aria-label={product.name}
            className="absolute inset-0 bg-[#f5f3f0]"
            style={getFocalBackgroundStyle(imageUrl, product.cardFocalPoint)}
          />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--admin-ink-900)]">{product.name}</p>
        <p className="mt-1 truncate text-xs text-[var(--admin-ink-500)]">
          {product.collectionLabel} · {product.categoryLabel}
        </p>
        {flags.length ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {flags.map((flag) => (
              <span key={flag} className="admin-badge-neutral admin-pill">
                {flag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <span className="text-sm font-semibold text-[var(--admin-ink-900)]">{formatPrice(product.price)}</span>
    </article>
  );
}
