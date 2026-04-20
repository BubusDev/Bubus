"use client";

import Image from "next/image";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  GripVertical,
  Loader2,
  Copy,
  ExternalLink,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  deleteShowcaseTabAction,
  duplicateShowcaseTabInlineAction,
  reorderShowcaseTabsAction,
  saveShowcaseTabInlineAction,
} from "@/app/(admin)/admin/content/homepage-showcase/actions";
import { HomeProductShowcase } from "@/components/home/HomeProductShowcase";
import { formatPrice } from "@/lib/catalog";
import { getShowcaseFilterTypeLabel } from "@/lib/homepage-showcase";
import type {
  AdminShowcaseCategoryOption,
  AdminShowcaseProductOption,
  AdminShowcaseTabRow,
  SHOWCASE_FILTER_TYPES,
} from "@/lib/homepage-showcase";

type FilterType = (typeof SHOWCASE_FILTER_TYPES)[number]["value"];
type SaveVisualState = "default" | "saved" | "error";

const helperTextClass = "text-xs leading-5 text-[var(--admin-ink-500)]";
const mutedStateClass =
  "rounded-md border border-dashed border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] px-3 py-3 text-sm text-[var(--admin-ink-500)]";
const previewEmptyStateClass =
  "rounded-md border border-dashed border-[var(--admin-line-100)] bg-white px-3 py-6 text-center text-sm text-[var(--admin-ink-500)]";
const warningBadgeClass =
  "rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700";
const errorPanelClass = "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700";
const secondaryActionClass =
  "inline-flex min-h-9 items-center justify-center rounded border border-[var(--admin-line-100)] bg-white px-3 text-xs font-medium text-[var(--admin-ink-700)] transition hover:bg-[var(--admin-blue-050)]";
const previewPanelClass =
  "rounded-md border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] px-4 py-4";

type HomepageShowcaseEditorProps = {
  tabs: AdminShowcaseTabRow[];
  categories: AdminShowcaseCategoryOption[];
  products: AdminShowcaseProductOption[];
  filterTypes: typeof SHOWCASE_FILTER_TYPES;
};

function parseManualProductIds(value: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function getHeaderSummaryParts(
  tab: Pick<AdminShowcaseTabRow, "filterType" | "filterValue">,
  categories: AdminShowcaseCategoryOption[],
  products: AdminShowcaseProductOption[],
  previewProductCount: number,
) {
  const sourceType = getShowcaseFilterTypeLabel(tab.filterType);
  let extra: string | null = null;

  switch (tab.filterType) {
    case "category": {
      const category = categories.find((item) => item.slug === tab.filterValue);
      extra = category?.name ?? "Nincs kategória";
      break;
    }
    case "manual": {
      const selectedCount = parseManualProductIds(tab.filterValue).filter((id) =>
        products.some((product) => product.id === id),
      ).length;
      extra = `${selectedCount} termék`;
      break;
    }
    case "new_arrivals":
    case "on_sale":
    case "giftable":
      extra = `${previewProductCount} termék`;
      break;
    default:
      extra = null;
  }

  return { sourceType, extra };
}

function getEmptyShowcaseReason({
  filterType,
  filterValue,
  categorySlug,
  manualProductIds,
}: {
  filterType: FilterType;
  filterValue: string | null;
  categorySlug: string;
  manualProductIds: string[];
}) {
  if (filterType === "category" && !categorySlug) {
    return "nincs kategória kiválasztva";
  }

  if (filterType === "manual" && manualProductIds.length === 0) {
    return "nincs termék kiválasztva";
  }

  if (filterType === "manual" && filterValue) {
    return "nincs storefront-ready kiválasztott product";
  }

  if (filterType === "category") {
    return "nincs storefront-ready product ebben a kategóriában";
  }

  return "nincs storefront-ready product";
}

function getEmptyShowcaseAction(filterType: FilterType, reason: string | null) {
  if (filterType === "category" && reason === "nincs kategória kiválasztva") {
    return { label: "Kategória mező", targetId: "category-source" };
  }

  if (filterType === "manual" && reason === "nincs termék kiválasztva") {
    return { label: "Termékválasztó", targetId: "manual-products" };
  }

  return null;
}

function getShowcasePreviewText({
  filterType,
  categorySlug,
  manualProductIds,
  categories,
  products,
  previewProducts,
}: {
  filterType: FilterType;
  categorySlug: string;
  manualProductIds: string[];
  categories: AdminShowcaseCategoryOption[];
  products: AdminShowcaseProductOption[];
  previewProducts: AdminShowcaseProductOption[];
}) {
  if (previewProducts.length === 0) return null;

  if (filterType === "manual") {
    const selectedNames = manualProductIds
      .map((id) => products.find((product) => product.id === id)?.name)
      .filter((name): name is string => Boolean(name))
      .slice(0, 2);

    return selectedNames.length > 0
      ? `${previewProducts.length} termék · ${selectedNames.join(", ")}`
      : `${previewProducts.length} termék`;
  }

  if (filterType === "category") {
    const categoryName = categories.find((category) => category.slug === categorySlug)?.name;
    return categoryName
      ? `${categoryName} · ${previewProducts.length} termék`
      : `${previewProducts.length} termék`;
  }

  return `${previewProducts.length} termék kerülne a csúszkába`;
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (toIndex < 0 || toIndex >= items.length) return items;

  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function normalizeManualIds(ids: string[]) {
  return JSON.stringify(ids);
}

function buildPreviewProducts({
  filterType,
  categorySlug,
  manualProductIds,
  maxItems,
  products,
}: {
  filterType: FilterType;
  categorySlug: string;
  manualProductIds: string[];
  maxItems: number;
  products: AdminShowcaseProductOption[];
}) {
  const limit = Number.isFinite(maxItems) && maxItems > 0 ? maxItems : 8;

  if (filterType === "manual") {
    return manualProductIds
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is AdminShowcaseProductOption => Boolean(product))
      .slice(0, limit);
  }

  const filteredProducts = products.filter((product) => {
    if (filterType === "new_arrivals") return product.isNew;
    if (filterType === "category") return product.categorySlug === categorySlug;
    if (filterType === "on_sale") return product.isOnSale;
    if (filterType === "giftable") return product.isGiftable;
    return false;
  });

  return filteredProducts.slice(0, limit);
}

function SaveButton({
  visualState,
  dirty,
}: {
  visualState: SaveVisualState;
  dirty: boolean;
}) {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <button
        type="submit"
        disabled
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-[var(--admin-line-100)] bg-[var(--admin-ink-700)] px-4 text-sm font-medium text-white"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Mentés...
      </button>
    );
  }

  if (visualState === "saved") {
    return (
      <button
        type="submit"
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-700"
      >
        <Check className="h-4 w-4" />
        Mentve
      </button>
    );
  }

  return (
    <button
      type="submit"
      className="inline-flex min-h-10 items-center justify-center rounded border border-[var(--admin-line-100)] bg-[var(--admin-ink-900)] px-4 text-sm font-medium text-white transition hover:bg-[var(--admin-ink-700)]"
    >
      {dirty ? "Mentés" : "Mentés"}
    </button>
  );
}

function DuplicateButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${secondaryActionClass} gap-2 disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
      {pending ? "Duplikálás..." : "Duplikálás"}
    </button>
  );
}

function ProductPicker({
  products,
  selectedIds,
  onSelectedIdsChange,
}: {
  products: AdminShowcaseProductOption[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState("");

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedProducts = selectedIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is AdminShowcaseProductOption => Boolean(product));
  const normalizedQuery = query.trim().toLowerCase();
  const matches = products
    .filter((product) => !selectedSet.has(product.id))
    .filter((product) => {
      if (!normalizedQuery) return true;
      return [product.name, product.slug, product.categoryName]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .slice(0, 12);

  function addProduct(productId: string) {
    onSelectedIdsChange(
      selectedIds.includes(productId) ? selectedIds : [...selectedIds, productId],
    );
    setQuery("");
  }

  function removeProduct(productId: string) {
    onSelectedIdsChange(selectedIds.filter((id) => id !== productId));
  }

  function moveProduct(index: number, direction: -1 | 1) {
    onSelectedIdsChange(moveItem(selectedIds, index, index + direction));
  }

  return (
    <div className="grid gap-3">
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="manualProductIds" value={id} />
      ))}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--admin-ink-500)]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Termék keresése név, slug vagy kategória alapján"
          className="admin-input min-h-10 pl-9 pr-3 text-sm"
          autoComplete="off"
        />
      </div>

      <div className="grid max-h-56 gap-1 overflow-auto rounded-md border border-[var(--admin-line-100)] bg-white p-1">
        {matches.length > 0 ? (
          matches.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addProduct(product.id)}
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
            Nincs találat.
          </span>
        )}
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="admin-eyebrow">Kiválasztott termékek</span>
          <span className="text-xs text-[var(--admin-ink-500)]">
            {selectedProducts.length} termék
          </span>
        </div>

        {selectedProducts.length > 0 ? (
          <div className="grid gap-2">
            {selectedProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-md border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] px-3 py-2"
              >
                <span className="w-6 shrink-0 text-center text-xs font-semibold text-[var(--admin-ink-500)]">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-[var(--admin-ink-900)]">
                    {product.name}
                  </span>
                  <span className="block truncate text-xs text-[var(--admin-ink-500)]">
                    {product.categoryName}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => moveProduct(index, -1)}
                  disabled={index === 0}
                  className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--admin-line-100)] bg-white text-[var(--admin-ink-700)] disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label={`${product.name} feljebb mozgatása`}
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveProduct(index, 1)}
                  disabled={index === selectedProducts.length - 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--admin-line-100)] bg-white text-[var(--admin-ink-700)] disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label={`${product.name} lejjebb mozgatása`}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--admin-line-100)] bg-white text-red-600"
                  aria-label={`${product.name} eltávolítása`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={mutedStateClass}>
            Keress és adj hozzá termékeket a kézi válogatáshoz.
          </div>
        )}
      </div>
    </div>
  );
}

function TabEditor({
  tab,
  index,
  total,
  categories,
  products,
  filterTypes,
  onMove,
  onSaved,
  onDuplicated,
}: {
  tab: AdminShowcaseTabRow;
  index: number;
  total: number;
  categories: AdminShowcaseCategoryOption[];
  products: AdminShowcaseProductOption[];
  filterTypes: typeof SHOWCASE_FILTER_TYPES;
  onMove: (fromIndex: number, toIndex: number) => void;
  onSaved: (tab: AdminShowcaseTabRow) => void;
  onDuplicated: (tab: AdminShowcaseTabRow, sourceIndex: number) => void;
}) {
  const initialFilterType = filterTypes.some((item) => item.value === tab.filterType)
    ? (tab.filterType as FilterType)
    : "new_arrivals";
  const [filterType, setFilterType] = useState<FilterType>(
    initialFilterType,
  );
  const [label, setLabel] = useState(tab.label);
  const [key, setKey] = useState(tab.key);
  const [isActive, setIsActive] = useState(tab.isActive);
  const [maxItems, setMaxItems] = useState(tab.maxItems);
  const [categorySlug, setCategorySlug] = useState(
    tab.filterType === "category" ? tab.filterValue ?? "" : "",
  );
  const [manualProductIds, setManualProductIds] = useState(parseManualProductIds(tab.filterValue));
  const [saveState, saveFormAction] = useActionState(saveShowcaseTabInlineAction, {
    status: "idle",
    message: "",
  });
  const [duplicateState, duplicateFormAction] = useActionState(
    duplicateShowcaseTabInlineAction,
    { status: "idle", message: "" },
  );
  const [saveFeedbackVisible, setSaveFeedbackVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const currentFilterValue =
    filterType === "category"
      ? categorySlug
      : filterType === "manual"
        ? normalizeManualIds(manualProductIds)
        : null;
  const dirty =
    label !== tab.label ||
    key !== tab.key ||
    isActive !== tab.isActive ||
    maxItems !== tab.maxItems ||
    filterType !== initialFilterType ||
    currentFilterValue !== (tab.filterValue ?? null);
  const previewProducts = buildPreviewProducts({
    filterType,
    categorySlug,
    manualProductIds,
    maxItems,
    products,
  });
  const headerSummary = getHeaderSummaryParts(
    {
      filterType,
      filterValue: currentFilterValue,
    },
    categories,
    products,
    previewProducts.length,
  );
  const hasNoVisibleProducts = isActive && previewProducts.length === 0;
  const emptyShowcaseReason = hasNoVisibleProducts
    ? getEmptyShowcaseReason({
        filterType,
        filterValue: currentFilterValue,
        categorySlug,
        manualProductIds,
      })
    : null;
  const emptyShowcaseAction = getEmptyShowcaseAction(filterType, emptyShowcaseReason);
  const showcasePreviewText = getShowcasePreviewText({
    filterType,
    categorySlug,
    manualProductIds,
    categories,
    products,
    previewProducts,
  });

  function jumpToEditorTarget(targetId: string) {
    setIsCollapsed(false);
    window.requestAnimationFrame(() => {
      const target = document.getElementById(`${tab.id}-${targetId}`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (target instanceof HTMLElement) target.focus({ preventScroll: true });
    });
  }

  useEffect(() => {
    if (saveState.status === "success" && saveState.tab) {
      const showTimeout = window.setTimeout(() => {
        if (saveState.tab) onSaved(saveState.tab);
        setSaveFeedbackVisible(true);
      }, 0);
      const hideTimeout = window.setTimeout(() => setSaveFeedbackVisible(false), 1800);

      return () => {
        window.clearTimeout(showTimeout);
        window.clearTimeout(hideTimeout);
      };
    }
  }, [onSaved, saveState]);

  useEffect(() => {
    if (duplicateState.status === "success" && duplicateState.tab) {
      const timeout = window.setTimeout(() => {
        if (duplicateState.tab) onDuplicated(duplicateState.tab, index);
      }, 0);
      return () => window.clearTimeout(timeout);
    }
  }, [duplicateState, index, onDuplicated]);

  return (
    <section
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", String(index));
        event.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const fromIndex = Number(event.dataTransfer.getData("text/plain"));
        if (Number.isInteger(fromIndex)) onMove(fromIndex, index);
      }}
      className="admin-panel overflow-hidden"
    >
      <div className="flex flex-col gap-3 border-b border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[var(--admin-line-100)] bg-white text-sm font-semibold text-[var(--admin-ink-700)]">
            {index + 1}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCollapsed((current) => !current)}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[var(--admin-line-100)] bg-white text-[var(--admin-ink-700)] transition hover:bg-[var(--admin-blue-050)]"
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? "Showcase tab megnyitása" : "Showcase tab becsukása"}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
              <GripVertical className="h-4 w-4 shrink-0 text-[var(--admin-ink-400)]" />
              <h2 className="min-w-0 truncate text-base font-semibold text-[var(--admin-ink-900)]">
                <span>{label || "Névtelen tab"}</span>
                <span className="font-normal text-[var(--admin-ink-500)]">
                  {" · "}
                  {headerSummary.sourceType}
                </span>
                {headerSummary.extra ? (
                  <span className="font-normal text-[var(--admin-ink-500)]">
                    {" · "}
                    {headerSummary.extra}
                  </span>
                ) : null}
              </h2>
              {dirty ? (
                <span className={warningBadgeClass}>
                  Módosult
                </span>
              ) : null}
              {hasNoVisibleProducts ? (
                <span className={warningBadgeClass}>
                  Nincs megjeleníthető termék
                  {emptyShowcaseReason ? `: ${emptyShowcaseReason}` : ""}
                  {emptyShowcaseAction ? (
                    <button
                      type="button"
                      onClick={() => jumpToEditorTarget(emptyShowcaseAction.targetId)}
                      className="ml-2 font-semibold underline underline-offset-2"
                    >
                      {emptyShowcaseAction.label}
                    </button>
                  ) : null}
                </span>
              ) : null}
              {!isActive ? (
                <span className="rounded border border-[var(--admin-line-100)] bg-white px-2 py-0.5 text-[11px] font-medium text-[var(--admin-ink-500)]">
                  Inaktív
                </span>
              ) : null}
            </div>
            {!hasNoVisibleProducts && showcasePreviewText ? (
              <p className={`mt-1 truncate ${helperTextClass}`}>
                Preview: {showcasePreviewText}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href="/#focusban"
            target="_blank"
            rel="noreferrer"
            className={`${secondaryActionClass} gap-2`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Megnyitás az oldalon
          </a>
          <form action={duplicateFormAction}>
            <input type="hidden" name="id" value={tab.id} />
            <DuplicateButton />
          </form>
          <button
            type="button"
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            className={`${secondaryActionClass} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Fel
          </button>
          <button
            type="button"
            onClick={() => onMove(index, index + 1)}
            disabled={index === total - 1}
            className={`${secondaryActionClass} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Le
          </button>
        </div>
      </div>

      {!isCollapsed ? (
        <form action={saveFormAction} className="grid gap-5 px-5 py-5">
          <input type="hidden" name="id" value={tab.id} />
          <input type="hidden" name="sortOrder" value={index + 1} />
          <input type="hidden" name="isActive" value={isActive ? "on" : ""} />

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <label className="grid gap-1.5">
            <span className="admin-eyebrow">Tab felirat</span>
            <input
              name="label"
              value={label}
              onChange={(event) => {
                setLabel(event.target.value);
                setSaveFeedbackVisible(false);
              }}
              required
              className="admin-input min-h-10 px-3 text-sm"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="admin-eyebrow">Belső azonosító</span>
            <input
              name="key"
              value={key}
              onChange={(event) => {
                setKey(event.target.value);
                setSaveFeedbackVisible(false);
              }}
              required
              className="admin-input min-h-10 px-3 text-sm"
            />
          </label>

          <div className="mt-5 grid gap-1.5 lg:mt-6">
            <span className="admin-eyebrow">Láthatóság</span>
            <button
              type="button"
              onClick={() => setIsActive((current) => !current)}
              onMouseDown={() => setSaveFeedbackVisible(false)}
              className={`inline-flex min-h-10 items-center justify-between gap-3 rounded border px-3 text-sm font-medium transition ${
                isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-[var(--admin-line-100)] bg-white text-[var(--admin-ink-600)]"
              }`}
              aria-pressed={isActive}
            >
              <span>{isActive ? "Aktív" : "Inaktív"}</span>
              <span
                className={`relative h-5 w-9 rounded-full transition ${
                  isActive ? "bg-emerald-500" : "bg-[var(--admin-line-200)]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                    isActive ? "left-4" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_160px]">
          <label className="grid gap-1.5">
            <span className="admin-eyebrow">Forrás</span>
            <select
              name="filterType"
              value={filterType}
              onChange={(event) => {
                const nextType = event.target.value as FilterType;
                setFilterType(nextType);
                if (nextType !== "category") setCategorySlug("");
                setSaveFeedbackVisible(false);
              }}
              className="admin-input min-h-10 px-3 text-sm"
            >
              {filterTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="admin-eyebrow">Max. termékszám</span>
            <input
              type="number"
              name="maxItems"
              value={maxItems}
              onChange={(event) => {
                setMaxItems(parseInt(event.target.value, 10) || 1);
                setSaveFeedbackVisible(false);
              }}
              min={1}
              max={24}
              className="admin-input min-h-10 px-3 text-sm"
            />
          </label>
        </div>

        {filterType === "category" ? (
          <label className="grid gap-1.5">
            <span className="admin-eyebrow">Kategória</span>
            <select
              id={`${tab.id}-category-source`}
              name="categorySlug"
              value={categorySlug}
              onChange={(event) => {
                setCategorySlug(event.target.value);
                setSaveFeedbackVisible(false);
              }}
              required
              className="admin-input min-h-10 px-3 text-sm"
            >
              <option value="">Válassz kategóriát</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {filterType === "manual" ? (
          <div id={`${tab.id}-manual-products`} tabIndex={-1} className="grid gap-1.5 scroll-mt-24">
            <span className="admin-eyebrow">Kézi termékválogatás</span>
            <ProductPicker
              products={products}
              selectedIds={manualProductIds}
              onSelectedIdsChange={(ids) => {
                setManualProductIds(ids);
                setSaveFeedbackVisible(false);
              }}
            />
          </div>
        ) : null}

        {filterType !== "category" && filterType !== "manual" ? (
          <div className="admin-panel-muted px-3 py-3 text-sm text-[var(--admin-ink-600)]">
            Ez a forrás automatikusan tölti a tabot a termékadatok alapján.
          </div>
        ) : null}

        <div className={previewPanelClass}>
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="admin-eyebrow">Storefront előnézet</p>
              <p className="mt-1 text-sm text-[var(--admin-ink-600)]">
                A jelenlegi beállítások alapján frissül.
              </p>
            </div>
            <span className="text-xs text-[var(--admin-ink-500)]">
              {previewProducts.length} termék
            </span>
          </div>
          {previewProducts.length > 0 ? (
            <HomeProductShowcase
              compactPreview
              tabs={[{ key: key || tab.key, label: label || "Névtelen tab", products: previewProducts }]}
            />
          ) : (
            <div className={previewEmptyStateClass}>
              Ehhez a beállításhoz nincs előnézeti termék.
            </div>
          )}
        </div>

        {saveState.status === "error" ? (
          <div className={errorPanelClass}>
            {saveState.message}
          </div>
        ) : null}

        {duplicateState.status === "error" ? (
          <div className={errorPanelClass}>
            {duplicateState.message}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-[var(--admin-line-100)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <SaveButton
            visualState={saveFeedbackVisible ? "saved" : saveState.status === "error" ? "error" : "default"}
            dirty={dirty}
          />
          <button
            type="submit"
            formAction={deleteShowcaseTabAction}
            onClick={(event) => {
              if (!confirm(`Törlöd a "${tab.label}" tabot?`)) event.preventDefault();
            }}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-red-200 bg-white px-4 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Törlés
          </button>
        </div>
        </form>
      ) : null}
    </section>
  );
}

function NewTabForm({
  nextSortOrder,
  categories,
  products,
  filterTypes,
  onCreated,
}: {
  nextSortOrder: number;
  categories: AdminShowcaseCategoryOption[];
  products: AdminShowcaseProductOption[];
  filterTypes: typeof SHOWCASE_FILTER_TYPES;
  onCreated: (tab: AdminShowcaseTabRow) => void;
}) {
  const [filterType, setFilterType] = useState<FilterType>("new_arrivals");
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [maxItems, setMaxItems] = useState(8);
  const [categorySlug, setCategorySlug] = useState("");
  const [manualProductIds, setManualProductIds] = useState<string[]>([]);
  const [saveState, saveFormAction] = useActionState(saveShowcaseTabInlineAction, {
    status: "idle",
    message: "",
  });
  const [saveFeedbackVisible, setSaveFeedbackVisible] = useState(false);
  const previewProducts = buildPreviewProducts({
    filterType,
    categorySlug,
    manualProductIds,
    maxItems,
    products,
  });

  useEffect(() => {
    if (saveState.status === "success" && saveState.tab) {
      const showTimeout = window.setTimeout(() => {
        if (saveState.tab) onCreated(saveState.tab);
        setSaveFeedbackVisible(true);
      }, 0);
      const hideTimeout = window.setTimeout(() => setSaveFeedbackVisible(false), 1800);

      return () => {
        window.clearTimeout(showTimeout);
        window.clearTimeout(hideTimeout);
      };
    }
  }, [onCreated, saveState]);

  return (
    <form action={saveFormAction} className="admin-panel grid gap-5 px-5 py-5">
      <input type="hidden" name="sortOrder" value={nextSortOrder} />
      <input type="hidden" name="isActive" value={isActive ? "on" : ""} />

      <div>
        <p className="admin-eyebrow">Új tab</p>
        <h2 className="mt-1 text-base font-semibold text-[var(--admin-ink-900)]">
          Új showcase forrás hozzáadása
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
        <label className="grid gap-1.5">
          <span className="admin-eyebrow">Tab felirat</span>
          <input
            name="label"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value);
              setSaveFeedbackVisible(false);
            }}
            placeholder="pl. Újdonságok"
            required
            className="admin-input min-h-10 px-3 text-sm"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="admin-eyebrow">Belső azonosító</span>
          <input
            name="key"
            value={key}
            onChange={(event) => {
              setKey(event.target.value);
              setSaveFeedbackVisible(false);
            }}
            placeholder="pl. new, necklaces, sale"
            required
            className="admin-input min-h-10 px-3 text-sm"
          />
        </label>

        <div className="mt-5 grid gap-1.5 lg:mt-6">
          <span className="admin-eyebrow">Láthatóság</span>
          <button
            type="button"
            onClick={() => {
              setIsActive((current) => !current);
              setSaveFeedbackVisible(false);
            }}
            className={`inline-flex min-h-10 items-center justify-between gap-3 rounded border px-3 text-sm font-medium transition ${
              isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-[var(--admin-line-100)] bg-white text-[var(--admin-ink-600)]"
            }`}
            aria-pressed={isActive}
          >
            <span>{isActive ? "Aktív" : "Inaktív"}</span>
            <span
              className={`relative h-5 w-9 rounded-full transition ${
                isActive ? "bg-emerald-500" : "bg-[var(--admin-line-200)]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                  isActive ? "left-4" : "left-0.5"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_160px]">
        <label className="grid gap-1.5">
          <span className="admin-eyebrow">Forrás</span>
          <select
            name="filterType"
            value={filterType}
            onChange={(event) => {
              setFilterType(event.target.value as FilterType);
              setSaveFeedbackVisible(false);
            }}
            className="admin-input min-h-10 px-3 text-sm"
          >
            {filterTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="admin-eyebrow">Max. termékszám</span>
          <input
            type="number"
            name="maxItems"
            value={maxItems}
            onChange={(event) => {
              setMaxItems(parseInt(event.target.value, 10) || 1);
              setSaveFeedbackVisible(false);
            }}
            min={1}
            max={24}
            className="admin-input min-h-10 px-3 text-sm"
          />
        </label>
      </div>

      {filterType === "category" ? (
        <label className="grid gap-1.5">
          <span className="admin-eyebrow">Kategória</span>
          <select
            name="categorySlug"
            value={categorySlug}
            onChange={(event) => {
              setCategorySlug(event.target.value);
              setSaveFeedbackVisible(false);
            }}
            required
            className="admin-input min-h-10 px-3 text-sm"
          >
            <option value="">Válassz kategóriát</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {filterType === "manual" ? (
        <div className="grid gap-1.5">
          <span className="admin-eyebrow">Kézi termékválogatás</span>
          <ProductPicker
            products={products}
            selectedIds={manualProductIds}
            onSelectedIdsChange={(ids) => {
              setManualProductIds(ids);
              setSaveFeedbackVisible(false);
            }}
          />
        </div>
      ) : null}

      <div className={previewPanelClass}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="admin-eyebrow">Storefront előnézet</p>
          <span className="text-xs text-[var(--admin-ink-500)]">
            {previewProducts.length} termék
          </span>
        </div>
        {previewProducts.length > 0 ? (
          <HomeProductShowcase
            compactPreview
            tabs={[{ key: key || "new-tab", label: label || "Új tab", products: previewProducts }]}
          />
        ) : (
          <div className={previewEmptyStateClass}>
            Ehhez a beállításhoz nincs előnézeti termék.
          </div>
        )}
      </div>

      {saveState.status === "error" ? (
        <div className={errorPanelClass}>
          {saveState.message}
        </div>
      ) : null}

      <SaveButton
        visualState={saveFeedbackVisible ? "saved" : saveState.status === "error" ? "error" : "default"}
        dirty={Boolean(label.trim() && key.trim())}
      />
    </form>
  );
}

export function HomepageShowcaseEditor({
  tabs,
  categories,
  products,
  filterTypes,
}: HomepageShowcaseEditorProps) {
  const [orderedTabs, setOrderedTabs] = useState(tabs);

  function moveTab(fromIndex: number, toIndex: number) {
    setOrderedTabs((current) => moveItem(current, fromIndex, toIndex));
  }

  const updateSavedTab = useCallback((savedTab: AdminShowcaseTabRow) => {
    setOrderedTabs((current) =>
      current.map((tab) => (tab.id === savedTab.id ? savedTab : tab)),
    );
  }, []);

  const insertDuplicatedTab = useCallback(
    (duplicatedTab: AdminShowcaseTabRow, sourceIndex: number) => {
      setOrderedTabs((current) => {
        if (current.some((tab) => tab.id === duplicatedTab.id)) return current;

        const next = [...current];
        next.splice(sourceIndex + 1, 0, duplicatedTab);
        return next.map((tab, index) => ({ ...tab, sortOrder: index + 1 }));
      });
    },
    [],
  );
  const appendCreatedTab = useCallback((createdTab: AdminShowcaseTabRow) => {
    setOrderedTabs((current) =>
      current.some((tab) => tab.id === createdTab.id) ? current : [...current, createdTab],
    );
  }, []);

  return (
    <div className="grid gap-8">
      <NewTabForm
        nextSortOrder={orderedTabs.length + 1}
        categories={categories}
        products={products}
        filterTypes={filterTypes}
        onCreated={appendCreatedTab}
      />

      <form action={reorderShowcaseTabsAction} className="admin-panel-soft px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="admin-eyebrow">Tab sorrend</p>
            <p className="mt-1 text-sm text-[var(--admin-ink-600)]">
              Húzd át a tabokat, vagy használd a Fel/Le gombokat. A sorrend mentés után
              jelenik meg a storefronton.
            </p>
          </div>
          {orderedTabs.map((tab) => (
            <input key={tab.id} type="hidden" name="tabIds" value={tab.id} />
          ))}
          <button
            type="submit"
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded border border-[var(--admin-line-100)] bg-white px-4 text-sm font-medium text-[var(--admin-ink-900)] transition hover:bg-[var(--admin-blue-050)]"
          >
            Sorrend mentése
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        {orderedTabs.length > 0 ? (
          orderedTabs.map((tab, index) => (
            <TabEditor
              key={tab.id}
              tab={tab}
              index={index}
              total={orderedTabs.length}
              categories={categories}
              products={products}
              filterTypes={filterTypes}
              onMove={moveTab}
              onSaved={updateSavedTab}
              onDuplicated={insertDuplicatedTab}
            />
          ))
        ) : (
          <div className="admin-panel-muted px-4 py-8 text-center text-sm text-[var(--admin-ink-600)]">
            Még nincs showcase tab.
          </div>
        )}
      </div>

    </div>
  );
}
