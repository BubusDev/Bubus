"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Archive,
  Gift,
  Pencil,
  Percent,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  createProductAction,
  deleteProductAction,
  toggleProductArchiveAction,
  toggleProductFlagAction,
  updateProductAction,
} from "@/app/(admin)/admin/products/actions";
import {
  AdminActionButton,
  AdminActionLink,
} from "@/components/admin/AdminActionButton";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { ProductCouponSection } from "@/components/admin/ProductCouponSection";
import { formatPrice, homepagePlacementLabels } from "@/lib/catalog";
import {
  type AdminProductFormOptions,
  type AdminProductRecord,
  toAdminProductFormValues,
} from "@/lib/admin-products-client";
import { getProductAvailabilitySnapshot } from "@/lib/product-lifecycle";

// ─── Types ────────────────────────────────────────────────────────────────────

type AssignedCoupon = {
  promoCodeId: string;
  code: string;
  discountPercent: number;
  validFrom: Date;
  validUntil: Date | null;
  isActive: boolean;
};

type AvailableCoupon = {
  id: string;
  code: string;
  discountPercent: number;
  validFrom: Date;
  validUntil: Date | null;
  isActive: boolean;
};

export type ProductsListClientProps = {
  products: AdminProductRecord[];
  options: AdminProductFormOptions;
  optionGroups: { type: string; label: string; options: { isActive: boolean; isStorefrontVisible: boolean; showInMainNav: boolean }[] }[];
  allPromoCodes: AvailableCoupon[];
  assignedCouponsByProductId: Record<string, AssignedCoupon[]>;
  initialMode: "new" | null;
  initialEditProductId: string | null;
};

type EditingState = "new" | AdminProductRecord | null;

// ─── Helper components ────────────────────────────────────────────────────────

function ProductThumbnail({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)]">
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes="56px" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-[var(--admin-ink-400)]">
          Nincs kép
        </div>
      )}
    </div>
  );
}

function OptionSummary({
  groups,
}: {
  groups: ProductsListClientProps["optionGroups"];
}) {
  return (
    <div className="flex flex-wrap gap-2 text-xs text-[var(--admin-ink-600)]">
      {groups.map((group) => {
        const activeCount = group.options.filter((o) => o.isActive).length;
        const navCount =
          group.type === "CATEGORY"
            ? group.options.filter(
                (o) => o.isActive && o.isStorefrontVisible && o.showInMainNav,
              ).length
            : null;
        return (
          <span key={group.type} className="admin-badge-neutral admin-pill">
            {group.label}: {activeCount}
            {navCount !== null ? ` / főmenü: ${navCount}` : ""}
          </span>
        );
      })}
    </div>
  );
}

const flagIconMap = { isNew: Sparkles, isGiftable: Gift, isOnSale: Percent } as const;
const flagTitleMap = { isNew: "Új", isGiftable: "Ajándékozható", isOnSale: "Akciós" } as const;

function ProductFlagToggle({
  productId,
  flag,
  active,
}: {
  productId: string;
  flag: "isNew" | "isGiftable" | "isOnSale";
  active: boolean;
}) {
  const Icon = flagIconMap[flag];
  return (
    <form action={toggleProductFlagAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="flag" value={flag} />
      <input type="hidden" name="nextValue" value={String(!active)} />
      <AdminActionButton
        type="submit"
        size="sm"
        variant={active ? "primary" : "secondary"}
        className="!h-8 !w-8 !p-0"
        title={flagTitleMap[flag]}
      >
        <Icon className="h-4 w-4" />
      </AdminActionButton>
    </form>
  );
}

function ProductArchiveToggle({ productId }: { productId: string }) {
  return (
    <form action={toggleProductArchiveAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="nextArchived" value="true" />
      <input type="hidden" name="archiveReason" value="DISCONTINUED" />
      <AdminActionButton
        type="submit"
        size="sm"
        variant="danger"
        className="!h-8 !w-8 !p-0"
        title="Archiválás"
      >
        <Archive className="h-4 w-4" />
      </AdminActionButton>
    </form>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

function ProductPanel({
  editing,
  options,
  assignedCoupons,
  allPromoCodes,
  onClose,
  onSuccess,
}: {
  editing: EditingState;
  options: AdminProductFormOptions;
  assignedCoupons: AssignedCoupon[];
  allPromoCodes: AvailableCoupon[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isNew = editing === "new";
  const product = isNew ? null : (editing as AdminProductRecord);

  // Escape key closes panel
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-[#172033]/35">
      <div className="ml-auto flex h-full w-full max-w-3xl flex-col bg-[var(--admin-surface-050)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--admin-line-100)] px-6 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--admin-ink-500)]">
              Termékek
            </p>
            <h2 className="text-lg font-semibold text-[var(--admin-ink-900)]">
              {isNew ? "Új termék" : "Termék szerkesztése"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="admin-button-secondary admin-control-sm"
            aria-label="Bezárás"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AdminProductForm
            action={isNew ? createProductAction : updateProductAction}
            onSuccess={onSuccess}
            options={options}
            submitLabel={isNew ? "Termék létrehozása" : "Módosítások mentése"}
            values={toAdminProductFormValues(product, options)}
          />

          {!isNew && product && (
            <div className="mt-6">
              <ProductCouponSection
                productId={product.id}
                assignedCoupons={assignedCoupons}
                availableCoupons={allPromoCodes}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProductsListClient({
  products,
  options,
  optionGroups,
  allPromoCodes,
  assignedCouponsByProductId,
  initialMode,
  initialEditProductId,
}: ProductsListClientProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<EditingState>(() => {
    if (initialMode === "new") return "new";
    if (initialEditProductId) {
      return products.find((p) => p.id === initialEditProductId) ?? null;
    }
    return null;
  });
  const [toast, setToast] = useState("");

  // Clean up ?new=1 / ?edit=<id> from the URL on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      router.replace("/admin/products");
    }
  }, [router]);

  const panelOpen = editing !== null;
  const editingProductId = editing !== "new" && editing !== null ? editing.id : null;
  const assignedCoupons = editingProductId ? (assignedCouponsByProductId[editingProductId] ?? []) : [];

  const panelKey =
    editing === "new" ? "new" : editing !== null ? editing.id : "closed";

  function handlePanelSuccess() {
    setEditing(null);
    setToast(editing === "new" ? "Termék létrehozva." : "Termék frissítve.");
    router.refresh();
  }

  function handlePanelClose() {
    setEditing(null);
  }

  return (
    <div>
      {toast && (
        <p className="admin-panel-muted mb-5 px-4 py-3 text-sm text-[var(--admin-ink-700)]">
          {toast}
        </p>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <OptionSummary groups={optionGroups} />
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="admin-button-primary admin-control-md inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Új termék
        </button>
      </div>

      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {products.map((product) => {
          const coverImageUrl =
            product.images.find((image) => image.isCover)?.url ??
            product.images[0]?.url ??
            product.imageUrl;
          const snapshot = getProductAvailabilitySnapshot(product);
          const statusLabel =
            snapshot.lifecycleStatus === "active"
              ? "Aktív"
              : snapshot.lifecycleStatus === "draft"
                ? "Draft"
                : snapshot.lifecycleStatus === "sold_out"
                  ? "Elfogyott"
                  : "Hiányos";

          return (
            <article key={product.id} className="admin-panel-soft p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="admin-badge-neutral admin-pill">{statusLabel}</span>
                <span className="text-xs text-[var(--admin-ink-500)]">
                  Készlet: {product.stockQuantity} db
                </span>
                {snapshot.readinessIssues.length > 0 && (
                  <span className="text-xs text-[#9b476f]">
                    {snapshot.readinessIssues[0]?.message}
                  </span>
                )}
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <ProductThumbnail src={coverImageUrl} alt={product.name} />
                  <div className="min-w-0">
                    <p className="text-base font-semibold leading-snug text-[var(--admin-ink-900)]">
                      {product.name}
                    </p>
                    <p className="mt-1 break-all text-sm text-[var(--admin-ink-600)]">
                      /{product.slug}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 text-right text-sm font-semibold text-[var(--admin-ink-900)]">
                  {formatPrice(product.price)}
                </p>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-[var(--admin-ink-700)]">
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--admin-ink-500)]">Kategória</span>
                  <span className="font-medium text-[var(--admin-ink-900)]">
                    {product.category.name}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--admin-ink-500)]">Kihelyezés</span>
                  <span className="text-right font-medium text-[var(--admin-ink-900)]">
                    {homepagePlacementLabels[product.homepagePlacement.toLowerCase() as keyof typeof homepagePlacementLabels]}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-[var(--admin-line-100)] pt-4">
                <p className="mb-2 text-xs font-medium text-[var(--admin-ink-500)]">Jelölések</p>
                <div className="flex flex-wrap gap-1.5">
                  <ProductFlagToggle productId={product.id} flag="isNew" active={product.isNew} />
                  <ProductFlagToggle productId={product.id} flag="isGiftable" active={product.isGiftable} />
                  <ProductFlagToggle productId={product.id} flag="isOnSale" active={product.isOnSale} />
                  <ProductArchiveToggle productId={product.id} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--admin-line-100)] pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(product)}
                  className="admin-button-secondary admin-control-sm !h-9 !w-9 !p-0"
                  title="Szerkesztés"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <form action={deleteProductAction}>
                  <input type="hidden" name="productId" value={product.id} />
                  <AdminActionButton
                    type="submit"
                    variant="danger"
                    size="sm"
                    className="!h-9 !w-9 !p-0"
                    title="Törlés"
                  >
                    <Trash2 className="h-4 w-4" />
                  </AdminActionButton>
                </form>
              </div>
            </article>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="admin-table-shell hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="admin-table-head text-[10px] uppercase tracking-[0.28em] text-[var(--admin-ink-500)]">
              <tr>
                <th className="px-5 py-4">Termék</th>
                <th className="px-5 py-4">Kategória</th>
                <th className="px-5 py-4">Ár</th>
                <th className="px-5 py-4">Állapot</th>
                <th className="px-5 py-4">Kihelyezés</th>
                <th className="px-5 py-4">Jelölések</th>
                <th className="px-5 py-4">Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const snapshot = getProductAvailabilitySnapshot(product);
                const coverImageUrl =
                  product.images.find((img) => img.isCover)?.url ??
                  product.images[0]?.url ??
                  product.imageUrl;
                const statusLabel =
                  snapshot.lifecycleStatus === "active"
                    ? "Aktív"
                    : snapshot.lifecycleStatus === "draft"
                      ? "Draft"
                      : snapshot.lifecycleStatus === "sold_out"
                        ? "Elfogyott"
                        : "Hiányos";

                return (
                  <tr key={product.id} className="admin-table-row last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <ProductThumbnail src={coverImageUrl} alt={product.name} />
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--admin-ink-900)]">{product.name}</p>
                          <p className="mt-1 text-sm text-[var(--admin-ink-600)]">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--admin-ink-700)]">
                      {product.category.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--admin-ink-700)]">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--admin-ink-700)]">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[var(--admin-ink-900)]">{statusLabel}</span>
                        <span className="text-xs text-[var(--admin-ink-500)]">
                          {product.stockQuantity} db készlet
                        </span>
                        {snapshot.readinessIssues.length > 0 && (
                          <span className="text-xs text-[#9b476f]">
                            {snapshot.readinessIssues[0]?.message}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--admin-ink-700)]">
                      {homepagePlacementLabels[product.homepagePlacement.toLowerCase() as keyof typeof homepagePlacementLabels]}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <ProductFlagToggle productId={product.id} flag="isNew" active={product.isNew} />
                        <ProductFlagToggle productId={product.id} flag="isGiftable" active={product.isGiftable} />
                        <ProductFlagToggle productId={product.id} flag="isOnSale" active={product.isOnSale} />
                        <ProductArchiveToggle productId={product.id} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditing(product)}
                          className="admin-button-secondary admin-control-sm !h-8 !w-8 !p-0"
                          title="Szerkesztés"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <form action={deleteProductAction}>
                          <input type="hidden" name="productId" value={product.id} />
                          <AdminActionButton
                            type="submit"
                            variant="danger"
                            size="sm"
                            className="!h-8 !w-8 !p-0"
                            title="Törlés"
                          >
                            <Trash2 className="h-4 w-4" />
                          </AdminActionButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out panel */}
      {panelOpen && (
        <ProductPanel
          key={panelKey}
          editing={editing}
          options={options}
          assignedCoupons={assignedCoupons}
          allPromoCodes={allPromoCodes}
          onClose={handlePanelClose}
          onSuccess={handlePanelSuccess}
        />
      )}
    </div>
  );
}
