"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight, ChevronUp, GripVertical, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { saveHomepageMaterialPicksAction } from "@/app/(admin)/admin/content/homepage/actions";
import { formatPrice } from "@/lib/catalog";
import type {
  HomepageContentView,
  HomepageMaterialPickOptions,
} from "@/lib/homepage-content";
import { productHasStone } from "@/lib/stone-product";

type PickSlot = {
  clientId: string;
  stoneTypeId: string;
  productId: string;
  isLegacySource?: boolean;
  legacyItemId?: string | null;
  hasUnavailableFeaturedProduct?: boolean;
  unavailableFeaturedProductReason?: string | null;
};

type HomepageMaterialPicksEditorProps = {
  picks: HomepageContentView["materialPicks"];
  options: HomepageMaterialPickOptions;
};

const helperTextClass = "text-xs leading-5 text-[var(--admin-ink-500)]";
const mutedStateClass =
  "rounded-md border border-dashed border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] px-3 py-3 text-sm text-[var(--admin-ink-500)]";
const warningBadgeClass =
  "rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700";
const warningPanelClass =
  "rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800";
const secondaryActionClass =
  "inline-flex min-h-8 shrink-0 items-center justify-center rounded border border-[var(--admin-line-100)] bg-white px-3 text-xs font-medium text-[var(--admin-ink-700)] transition hover:bg-[var(--admin-blue-050)]";
const iconActionClass =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[var(--admin-line-100)] bg-white text-[var(--admin-ink-600)] transition hover:bg-[var(--admin-blue-050)] disabled:cursor-not-allowed disabled:opacity-35";
const unsavedChangesMessage = "Nem mentett módosításaid vannak. Biztosan elnavigálsz?";

function buildInitialSlots(picks: HomepageContentView["materialPicks"]): PickSlot[] {
  const filledSlots = picks
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 4)
    .map((pick) => ({
      clientId: pick.id,
      stoneTypeId: pick.type === "STONE" ? pick.itemId : "",
      productId: pick.storedFeaturedProductId ?? pick.featuredProductId ?? "",
      isLegacySource: pick.isLegacySource,
      legacyItemId: pick.legacyItemId,
      hasUnavailableFeaturedProduct: pick.hasUnavailableFeaturedProduct,
      unavailableFeaturedProductReason: pick.unavailableFeaturedProductReason,
    }));

  return Array.from(
    { length: 4 },
    (_, index) =>
      filledSlots[index] ?? {
        clientId: `empty-${index}`,
        stoneTypeId: "",
        productId: "",
        isLegacySource: false,
        legacyItemId: null,
      },
  );
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex || toIndex < 0 || toIndex >= items.length) return items;

  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function serializePickSlots(slots: PickSlot[]) {
  return JSON.stringify(
    slots.map((slot) => ({
      stoneTypeId: slot.stoneTypeId,
      productId: slot.productId,
    })),
  );
}

function ProductSlotPicker({
  disabled,
  productId,
  products,
  stoneTypeName,
  onChange,
}: {
  disabled: boolean;
  productId: string;
  products: HomepageMaterialPickOptions["products"];
  stoneTypeName: string;
  onChange: (productId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const selectedProduct = products.find((product) => product.id === productId);
  const normalizedQuery = query.trim().toLowerCase();
  const matches = products
    .filter((product) => product.id !== productId)
    .filter((product) => {
      if (!normalizedQuery) return true;
      return [product.name, product.slug, product.categoryName]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .slice(0, 8);

  if (disabled) {
    return (
      <div className={mutedStateClass}>
        Először válassz kőtípust.
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={mutedStateClass}>
        <p>Ehhez a kőtípushoz jelenleg nincs termék.</p>
        <p className="mt-1">
          Új termék létrehozása vagy meglévő termék kőtípus beállítása szükséges.
          <Link
            href="/admin/products/new"
            className="ml-2 font-semibold text-[var(--admin-ink-900)] underline underline-offset-2"
          >
            Új termék
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--admin-ink-500)]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`${stoneTypeName} termékei között keresés`}
          className="admin-input min-h-10 pl-9 pr-3 text-sm"
          autoComplete="off"
        />
      </div>

      {selectedProduct ? (
        <div className="flex items-center gap-3 rounded-md border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] px-3 py-2">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded border border-[var(--admin-line-100)] bg-white">
            {selectedProduct.imageUrl ? (
              <Image
                src={selectedProduct.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="44px"
              />
            ) : null}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-[var(--admin-ink-900)]">
              {selectedProduct.name}
            </span>
            <span className="block truncate text-xs text-[var(--admin-ink-500)]">
              Kiemelt termék · {selectedProduct.categoryName} · {formatPrice(selectedProduct.price)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--admin-line-100)] bg-white text-red-600"
            aria-label={`${selectedProduct.name} eltávolítása`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="grid max-h-52 gap-1 overflow-auto rounded-md border border-[var(--admin-line-100)] bg-white p-1">
        {matches.length > 0 ? (
          matches.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                onChange(product.id);
                setQuery("");
              }}
              className="flex items-center gap-3 rounded-md px-2.5 py-2 text-left transition hover:bg-[var(--admin-blue-050)]"
            >
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)]">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-[var(--admin-ink-900)]">
                  {product.name}
                </span>
                <span className="block truncate text-xs text-[var(--admin-ink-500)]">
                  {product.categoryName} · {formatPrice(product.price)}
                </span>
              </span>
            </button>
          ))
        ) : (
          <span className="px-3 py-4 text-sm text-[var(--admin-ink-500)]">
            Ehhez a kőtípushoz nincs választható termék.
          </span>
        )}
      </div>
    </div>
  );
}

export function HomepageMaterialPicksEditor({
  picks,
  options,
}: HomepageMaterialPicksEditorProps) {
  const [initialState] = useState(() => {
    const initialSlots = buildInitialSlots(picks);
    return {
      slots: initialSlots,
      serializedSlots: serializePickSlots(initialSlots),
      collapsedSlotIds: new Set(
        initialSlots
          .filter((slot) => slot.stoneTypeId)
          .map((slot) => slot.clientId),
      ),
    };
  });
  const isDirtyRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const [slots, setSlots] = useState<PickSlot[]>(() => initialState.slots);
  const [draggedSlotId, setDraggedSlotId] = useState<string | null>(null);
  const [collapsedSlotIds, setCollapsedSlotIds] = useState<Set<string>>(
    () => initialState.collapsedSlotIds,
  );
  const serializedSlots = useMemo(() => serializePickSlots(slots), [slots]);
  const isDirty = serializedSlots !== initialState.serializedSlots;
  const selectedStoneTypeIds = useMemo(() => slots.map((slot) => slot.stoneTypeId), [slots]);
  const duplicateStoneTypeIds = useMemo(() => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const stoneTypeId of selectedStoneTypeIds) {
      if (!stoneTypeId) continue;
      if (seen.has(stoneTypeId)) duplicates.add(stoneTypeId);
      seen.add(stoneTypeId);
    }
    return duplicates;
  }, [selectedStoneTypeIds]);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirtyRef.current || isSubmittingRef.current) return;

      event.preventDefault();
      event.returnValue = "";
    }

    function handleDocumentClick(event: MouseEvent) {
      if (!isDirtyRef.current || isSubmittingRef.current || event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      const isSamePage =
        nextUrl.origin === currentUrl.origin &&
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search;

      if (isSamePage) return;
      if (window.confirm(unsavedChangesMessage)) {
        isDirtyRef.current = false;
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  function updateSlot(index: number, nextSlot: PickSlot) {
    setSlots((current) => current.map((slot, slotIndex) => (slotIndex === index ? nextSlot : slot)));
  }

  function moveSlot(fromIndex: number, toIndex: number) {
    setSlots((current) => moveItem(current, fromIndex, toIndex));
  }

  function toggleCollapsedSlot(slotId: string) {
    setCollapsedSlotIds((current) => {
      const next = new Set(current);
      if (next.has(slotId)) {
        next.delete(slotId);
      } else {
        next.add(slotId);
      }
      return next;
    });
  }

  return (
    <form
      action={saveHomepageMaterialPicksAction}
      onSubmit={() => {
        isSubmittingRef.current = true;
      }}
      className="admin-panel p-5"
    >
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="admin-eyebrow">Kezdőlapi válogatás</p>
          <h2 className="mt-2 text-lg font-semibold text-[var(--admin-ink-900)]">
            Kőtípus alapú kezdőlapi cardok
          </h2>
          <p className="mt-1.5 max-w-[68ch] text-sm leading-6 text-[var(--admin-ink-600)]">
            Válassz legfeljebb 4 kőtípust a product besorolási rendszerből. Ez adja a kártya címét
            és témáját; a kiemelt termék opcionális, és csak ehhez a kőtípushoz tartozhat.
          </p>
          <p className="mt-2 text-xs leading-5 text-[var(--admin-ink-500)]">
            Sorrendezéshez húzd a fogantyút, vagy használd a fel/le gombokat. A kártyák
            összecsukhatók, a mentés pedig az egész válogatásra vonatkozik.
          </p>
        </div>
        <button type="submit" className="admin-button-primary admin-control-md shrink-0">
          Válogatás mentése
        </button>
      </div>

      {slots.map((slot, index) => (
        <input
          key={slot.clientId}
          type="hidden"
          name="materialPick"
          value={slot.stoneTypeId ? `${slot.stoneTypeId}:${slot.productId}` : ""}
        />
      ))}

      <div className="grid gap-3">
        {slots.map((slot, index) => {
          const selectedStoneType = options.stoneTypes.find(
            (stoneType) => stoneType.id === slot.stoneTypeId,
          );
          const isLegacySource = Boolean(slot.isLegacySource && !selectedStoneType);
          const compatibleProducts = selectedStoneType
            ? options.products.filter((product) => productHasStone(product, selectedStoneType))
            : [];
          const selectedProductIsCompatible = compatibleProducts.some(
            (product) => product.id === slot.productId,
          );
          const productId = selectedProductIsCompatible ? slot.productId : "";
          const previewProduct = compatibleProducts.find((product) => product.id === productId);
          const isInvalidProduct = Boolean(slot.productId && !selectedProductIsCompatible);
          const hasNoAvailableProducts = Boolean(
            selectedStoneType && compatibleProducts.length === 0,
          );
          const isDuplicate = Boolean(
            slot.stoneTypeId && duplicateStoneTypeIds.has(slot.stoneTypeId),
          );
          const productEditHref = slot.productId ? `/admin/products/${slot.productId}/edit` : null;
          const showUnavailableFeaturedProductWarning =
            Boolean(slot.hasUnavailableFeaturedProduct) && !isLegacySource;
          const previewHref = previewProduct
            ? `/product/${previewProduct.slug}`
            : selectedStoneType
              ? `/new-in?stone=${encodeURIComponent(selectedStoneType.slug)}`
              : "";
          const isDragging = draggedSlotId === slot.clientId;
          const isCollapsed = collapsedSlotIds.has(slot.clientId);

          return (
            <section
              key={slot.clientId}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", String(index));
                event.dataTransfer.effectAllowed = "move";
                setDraggedSlotId(slot.clientId);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const fromIndex = Number(event.dataTransfer.getData("text/plain"));
                if (Number.isInteger(fromIndex)) moveSlot(fromIndex, index);
                setDraggedSlotId(null);
              }}
              onDragEnd={() => setDraggedSlotId(null)}
              className={`rounded-md border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] p-3.5 transition ${
                isDragging ? "opacity-60 ring-2 ring-[var(--admin-blue-100)]" : ""
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-2">
                  <button
                    type="button"
                    data-material-pick-drag-handle
                    className={`${iconActionClass} cursor-grab active:cursor-grabbing`}
                    aria-label={`${index + 1}. card áthelyezése`}
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCollapsedSlot(slot.clientId)}
                    className={iconActionClass}
                    aria-expanded={!isCollapsed}
                    aria-controls={`homepage-material-pick-slot-${slot.clientId}`}
                    aria-label={isCollapsed ? `${index + 1}. card kinyitása` : `${index + 1}. card összecsukása`}
                    title={isCollapsed ? "Kinyitás" : "Összecsukás"}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p className="admin-eyebrow">{index + 1}. card</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-[var(--admin-ink-900)]">
                        {selectedStoneType
                          ? selectedStoneType.name
                          : isLegacySource
                            ? "Újraválasztandó kőtípus"
                            : "Nincs kőtípus kiválasztva"}
                      </h3>
                      {isLegacySource ? (
                        <span className={warningBadgeClass}>
                          Legacy adat
                        </span>
                      ) : null}
                      {hasNoAvailableProducts ? (
                        <span className={warningBadgeClass}>
                          Ehhez a kőhöz nincs elérhető termék
                        </span>
                      ) : null}
                      {showUnavailableFeaturedProductWarning ? (
                        <span className={warningBadgeClass}>
                          A kiválasztott termék nem jelenik meg a webshopban
                          {slot.unavailableFeaturedProductReason
                            ? `: ${slot.unavailableFeaturedProductReason}`
                            : ""}
                          {productEditHref ? (
                            <Link
                              href={productEditHref}
                              className="ml-2 font-semibold underline underline-offset-2"
                            >
                              Termék szerkesztése
                            </Link>
                          ) : null}
                        </span>
                      ) : null}
                    </div>
                    <p className={`mt-0.5 ${helperTextClass}`}>
                      {isLegacySource
                        ? "Ez a slot nem használható, amíg nincs új kőtípus kiválasztva."
                        : "A kiválasztott kőtípus neve jelenik meg kártyacímként."}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveSlot(index, index - 1)}
                    disabled={index === 0}
                    className={iconActionClass}
                    aria-label={`${index + 1}. card feljebb mozgatása`}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSlot(index, index + 1)}
                    disabled={index === slots.length - 1}
                    className={iconActionClass}
                    aria-label={`${index + 1}. card lejjebb mozgatása`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateSlot(index, {
                        clientId: slot.clientId,
                        stoneTypeId: "",
                        productId: "",
                        isLegacySource: false,
                        legacyItemId: null,
                        hasUnavailableFeaturedProduct: false,
                        unavailableFeaturedProductReason: null,
                      })
                    }
                    className={`${secondaryActionClass} gap-1.5 text-red-600 hover:bg-red-50`}
                    aria-label={`${index + 1}. card tartalmának törlése`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Törlés
                  </button>
                </div>
              </div>

              <div id={`homepage-material-pick-slot-${slot.clientId}`} hidden={isCollapsed}>
                {isLegacySource ? (
                  <div className={`mt-3 ${warningPanelClass}`}>
                    Ez a régi kő-adatforrásból mentett elem. Válaszd ki újra a kőtípust, majd mentsd
                    el.
                    {slot.legacyItemId ? (
                      <span className="ml-1 text-amber-700">
                        Régi azonosító: {slot.legacyItemId}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-[var(--admin-line-100)] bg-white px-3 py-2">
                  {selectedStoneType ? (
                    <>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)]">
                          {previewProduct?.imageUrl ? (
                            <Image
                              src={previewProduct.imageUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : null}
                        </span>
                        <span className="min-w-0">
                          <span className="admin-eyebrow block">Gyors preview</span>
                          <span className="block truncate text-sm font-medium text-[var(--admin-ink-900)]">
                            {selectedStoneType.name}
                          </span>
                          <span className="block truncate text-xs text-[var(--admin-ink-500)]">
                            {previewProduct
                              ? `Kiemelt termék: ${previewProduct.name}`
                              : "Kőtípus alapú fallback lesz"}
                          </span>
                        </span>
                      </div>
                      {previewHref ? (
                        <Link href={previewHref} className={secondaryActionClass}>
                          Megnyitás
                        </Link>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-sm text-[var(--admin-ink-500)]">
                      Preview a kőtípus kiválasztása után jelenik meg.
                    </span>
                  )}
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
                  <div className="grid gap-3">
                    <label className="grid gap-1.5">
                      <span className="admin-eyebrow">1. Kőtípus</span>
                      <select
                        value={slot.stoneTypeId}
                        onChange={(event) => {
                          const stoneTypeId = event.target.value;
                          const nextStoneType = options.stoneTypes.find(
                            (stoneType) => stoneType.id === stoneTypeId,
                          );
                          const currentProduct = options.products.find(
                            (product) => product.id === slot.productId,
                          );
                          const keepProduct =
                            nextStoneType &&
                            currentProduct &&
                            productHasStone(currentProduct, nextStoneType)
                              ? slot.productId
                              : "";

                          updateSlot(index, {
                            clientId: slot.clientId,
                            stoneTypeId,
                            productId: keepProduct,
                            isLegacySource: false,
                            legacyItemId: null,
                            hasUnavailableFeaturedProduct: false,
                            unavailableFeaturedProductReason: null,
                          });
                        }}
                        className="admin-input min-h-10 px-3 text-sm"
                      >
                        <option value="">Válassz meglévő kőtípust</option>
                        {options.stoneTypes.map((stoneType) => (
                          <option key={stoneType.id} value={stoneType.id}>
                            {stoneType.name}
                          </option>
                        ))}
                      </select>
                      <span className={helperTextClass}>
                        Ez adja a kártya címét és témáját.
                      </span>
                    </label>

                    {selectedStoneType ? (
                      <div className="flex items-center justify-between gap-3 rounded-md border border-[var(--admin-line-100)] bg-white px-3 py-2">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-[var(--admin-ink-900)]">
                            {selectedStoneType.name}
                          </span>
                          <span className="block truncate text-xs text-[var(--admin-ink-500)]">
                            Szűrt storefront link: {`/new-in?stone=${selectedStoneType.slug}`}
                          </span>
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-1.5">
                    <span className="admin-eyebrow">2. Kiemelt termék</span>
                    <span className={helperTextClass}>
                      Opcionális kiemelt termék ehhez a kőtípushoz.
                    </span>
                    <ProductSlotPicker
                      disabled={!selectedStoneType}
                      products={compatibleProducts}
                      productId={productId}
                      stoneTypeName={selectedStoneType?.name ?? "Kőtípus"}
                      onChange={(nextProductId) =>
                        updateSlot(index, {
                          clientId: slot.clientId,
                          stoneTypeId: slot.stoneTypeId,
                          productId: nextProductId,
                          isLegacySource: false,
                          legacyItemId: null,
                          hasUnavailableFeaturedProduct: false,
                          unavailableFeaturedProductReason: null,
                        })
                      }
                    />
                    {showUnavailableFeaturedProductWarning ? (
                      <p className="text-xs font-medium text-amber-700">
                        A kiválasztott termék nem jelenik meg a webshopban
                        {slot.unavailableFeaturedProductReason
                          ? `: ${slot.unavailableFeaturedProductReason}`
                          : ""}
                        .
                        {productEditHref ? (
                          <Link
                            href={productEditHref}
                            className="ml-2 underline underline-offset-2"
                          >
                            Termék szerkesztése
                          </Link>
                        ) : null}
                      </p>
                    ) : isInvalidProduct ? (
                      <p className="text-xs font-medium text-amber-700">
                        A korábbi termék nem ehhez a kőtípushoz tartozik, ezért mentéskor törlődik.
                        {productEditHref ? (
                          <Link
                            href={productEditHref}
                            className="ml-2 underline underline-offset-2"
                          >
                            Termék szerkesztése
                          </Link>
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                </div>

                {isDuplicate ? (
                  <p className="mt-3 text-xs font-medium text-amber-700">
                    Duplikált kőtípus. Mentéskor csak az első előfordulás marad meg.
                  </p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </form>
  );
}
