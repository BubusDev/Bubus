import { TicketPercent } from "lucide-react";
import { ProductOptionType } from "@prisma/client";

import {
  createPromoCodeAction,
  deletePromoCodeAction,
  togglePromoCodeActiveAction,
  updatePromoCodeAction,
} from "@/app/(admin)/admin/promo-codes/actions";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductSelector } from "@/components/admin/ProductSelector";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/catalog";
import { promoEligibilityLabels } from "@/lib/promo-codes";

type PromoCodesPageProps = {
  searchParams: Promise<{ status?: string }>;
};

const statusMessages: Record<string, string> = {
  created: "Promóciós kód létrehozva.",
  updated: "Promóciós kód mentve.",
  activated: "Promóciós kód aktiválva.",
  deactivated: "Promóciós kód kikapcsolva.",
  deleted: "Promóciós kód törölve.",
  duplicate: "Ez a kód már létezik.",
  invalid: "Ellenőrizd a kötelező mezőket és a százalék értékét.",
  "invalid-applicability": "Válassz legalább egy kategóriát vagy terméket a kiválasztott érvényességi körhöz.",
  "invalid-interval": "A lejárati dátum nem lehet korábbi, mint a kezdő dátum.",
  "delete-blocked": "Ez a kód már kosárhoz, rendeléshez vagy beváltáshoz kapcsolódik, ezért nem törölhető.",
};

const promoApplicabilityLabels = {
  ALL_PRODUCTS: "All products",
  CATEGORIES: "Selected categories",
  PRODUCTS: "Selected products",
} as const;

type ApplicabilityOption = {
  id: string;
  name: string;
};

function toDateTimeLocal(value: Date | null) {
  if (!value) return "";
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}

function PromoCodeFields({
  promoCode,
  categories,
  products,
}: {
  promoCode?: {
    id: string;
    code: string;
    discountPercent: number;
    validFrom: Date;
    validUntil: Date | null;
    isActive: boolean;
    oneTimeUse: boolean;
    totalUsageLimit: number | null;
    perCustomerUsageLimit: number | null;
    minimumOrderAmount: number | null;
    eligibilityRule: keyof typeof promoEligibilityLabels;
    applicabilityScope: keyof typeof promoApplicabilityLabels;
    applicableCategories: { categoryId: string }[];
    applicableProducts: { productId: string }[];
  };
  categories: ApplicabilityOption[];
  products: ApplicabilityOption[];
}) {
  const selectedCategoryIds = new Set(
    promoCode?.applicableCategories.map((entry) => entry.categoryId) ?? [],
  );
  const selectedProductIds = new Set(
    promoCode?.applicableProducts.map((entry) => entry.productId) ?? [],
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-[var(--admin-ink-700)]">Code</span>
        <input
          name="code"
          required
          defaultValue={promoCode?.code}
          className="admin-input h-10 px-3 text-sm uppercase"
          placeholder="WELCOME10"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-[var(--admin-ink-700)]">Discount percent</span>
        <input
          name="discountPercent"
          type="number"
          min={1}
          max={100}
          required
          defaultValue={promoCode?.discountPercent}
          className="admin-input h-10 px-3 text-sm"
          placeholder="10"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-[var(--admin-ink-700)]">Valid from</span>
        <input
          name="validFrom"
          type="datetime-local"
          required
          defaultValue={promoCode ? toDateTimeLocal(promoCode.validFrom) : toDateTimeLocal(new Date())}
          className="admin-input h-10 px-3 text-sm"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-[var(--admin-ink-700)]">Valid until</span>
        <input
          name="validUntil"
          type="datetime-local"
          defaultValue={toDateTimeLocal(promoCode?.validUntil ?? null)}
          className="admin-input h-10 px-3 text-sm"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-[var(--admin-ink-700)]">Eligibility</span>
        <select
          name="eligibilityRule"
          defaultValue={promoCode?.eligibilityRule ?? "ALL_USERS"}
          className="admin-input h-10 px-3 text-sm"
        >
          <option value="ALL_USERS">Everyone</option>
          <option value="REGISTERED_USERS_ONLY">Registered users only</option>
        </select>
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-[var(--admin-ink-700)]">Applicability</span>
        <select
          name="applicabilityScope"
          defaultValue={promoCode?.applicabilityScope ?? "ALL_PRODUCTS"}
          className="admin-input h-10 px-3 text-sm"
        >
          <option value="ALL_PRODUCTS">All products</option>
          <option value="CATEGORIES">Selected categories</option>
          <option value="PRODUCTS">Selected products</option>
        </select>
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-[var(--admin-ink-700)]">Total usage limit</span>
        <input
          name="totalUsageLimit"
          type="number"
          min={1}
          defaultValue={promoCode?.totalUsageLimit ?? ""}
          className="admin-input h-10 px-3 text-sm"
          placeholder="No limit"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-[var(--admin-ink-700)]">Per-customer limit</span>
        <input
          name="perCustomerUsageLimit"
          type="number"
          min={1}
          defaultValue={promoCode?.perCustomerUsageLimit ?? ""}
          className="admin-input h-10 px-3 text-sm"
          placeholder="No limit"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-[var(--admin-ink-700)]">Minimum order amount</span>
        <input
          name="minimumOrderAmount"
          type="number"
          min={1}
          defaultValue={promoCode?.minimumOrderAmount ?? ""}
          className="admin-input h-10 px-3 text-sm"
          placeholder="No minimum"
        />
      </label>

      <div className="flex flex-wrap items-end gap-2">
        <label className="admin-checkbox-pill inline-flex h-10 items-center gap-2 px-3 text-xs">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={promoCode?.isActive ?? true}
            className="h-4 w-4 rounded border-[#cfb2c0]"
          />
          Active
        </label>
        <label className="admin-checkbox-pill inline-flex h-10 items-center gap-2 px-3 text-xs">
          <input
            type="checkbox"
            name="oneTimeUse"
            defaultChecked={promoCode?.oneTimeUse ?? false}
            className="h-4 w-4 rounded border-[#cfb2c0]"
          />
          One-time-use
        </label>
      </div>

      <div className="grid gap-3 sm:col-span-2 xl:col-span-2">
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-[var(--admin-ink-700)]">
            Categories for category-scoped coupons
          </span>
          <select
            name="categoryIds"
            multiple
            defaultValue={Array.from(selectedCategoryIds)}
            className="admin-input min-h-28 px-3 py-2 text-sm"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-[var(--admin-ink-500)]">
            Used only when applicability is "Selected categories".
          </span>
        </label>
      </div>

      <div className="grid gap-3 sm:col-span-2 xl:col-span-2">
        <div className="grid gap-1.5">
          <span className="text-xs font-medium text-[var(--admin-ink-700)]">
            Products for product-scoped coupons
          </span>
          <ProductSelector
            products={products}
            initialSelectedIds={Array.from(selectedProductIds)}
            name="productIds"
          />
          <span className="text-[11px] text-[var(--admin-ink-500)]">
            Used only when applicability is &quot;Selected products&quot;.
          </span>
        </div>
      </div>
    </div>
  );
}

export default async function AdminPromoCodesPage({ searchParams }: PromoCodesPageProps) {
  const [{ status }, promoCodes, categories, products] = await Promise.all([
    searchParams,
    db.promoCode.findMany({
      include: {
        applicableCategories: {
          select: { categoryId: true },
        },
        applicableProducts: {
          select: { productId: true },
        },
        _count: {
          select: {
            redemptions: true,
            orders: true,
            carts: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    }),
    db.productOption.findMany({
      where: { type: ProductOptionType.CATEGORY },
      select: { id: true, name: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    db.product.findMany({
      where: { archivedAt: null },
      select: { id: true, name: true },
      orderBy: [{ name: "asc" }],
    }),
  ]);

  return (
    <AdminShell
      title="Promo codes"
      description="Create and manage percentage discount codes for the storefront cart and checkout."
    >
      {status && statusMessages[status] ? (
        <div className="admin-panel-muted mb-5 px-4 py-3 text-sm text-[var(--admin-ink-700)]">
          {statusMessages[status]}
        </div>
      ) : null}

      <form action={createPromoCodeAction} className="admin-panel p-5">
        <div className="mb-5 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[rgba(42,99,181,0.08)] text-[#2a63b5]">
            <TicketPercent className="h-5 w-5" />
          </span>
          <div>
            <p className="admin-eyebrow">New promo code</p>
            <h2 className="text-base font-semibold text-[var(--admin-ink-900)]">
              Create a dynamic discount
            </h2>
          </div>
        </div>

        <PromoCodeFields categories={categories} products={products} />

        <div className="mt-5">
          <AdminActionButton type="submit" variant="primary">
            Create promo code
          </AdminActionButton>
        </div>
      </form>

      <div className="mt-6 grid gap-4">
        {promoCodes.length === 0 ? (
          <div className="admin-panel-soft p-6 text-sm text-[var(--admin-ink-600)]">
            No promo codes yet.
          </div>
        ) : (
          promoCodes.map((promoCode) => {
            const canDelete =
              promoCode._count.redemptions === 0 &&
              promoCode._count.orders === 0 &&
              promoCode._count.carts === 0;

            return (
              <section key={promoCode.id} className="admin-panel p-5">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-[var(--admin-ink-900)]">
                        {promoCode.code}
                      </h2>
                      <span className="admin-filter-chip admin-control-sm">
                        {promoCode.discountPercent}%
                      </span>
                      <span className={`admin-filter-chip admin-control-sm ${promoCode.isActive ? "admin-filter-chip-soft-active" : ""}`}>
                        {promoCode.isActive ? "Active" : "Inactive"}
                      </span>
                      {promoCode.oneTimeUse ? (
                        <span className="admin-filter-chip admin-control-sm">One-time-use</span>
                      ) : null}
                      <span className="admin-filter-chip admin-control-sm">
                        {promoEligibilityLabels[promoCode.eligibilityRule]}
                      </span>
                      <span className="admin-filter-chip admin-control-sm">
                        {promoApplicabilityLabels[promoCode.applicabilityScope]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--admin-ink-600)]">
                      Used {promoCode.redeemedCount}
                      {promoCode.totalUsageLimit ? ` / ${promoCode.totalUsageLimit}` : ""} times
                      {promoCode.minimumOrderAmount
                        ? ` · minimum ${formatPrice(promoCode.minimumOrderAmount)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={togglePromoCodeActiveAction}>
                      <input type="hidden" name="id" value={promoCode.id} />
                      <input type="hidden" name="isActive" value={promoCode.isActive ? "false" : "true"} />
                      <AdminActionButton type="submit" size="sm">
                        {promoCode.isActive ? "Deactivate" : "Activate"}
                      </AdminActionButton>
                    </form>
                    <form action={deletePromoCodeAction}>
                      <input type="hidden" name="id" value={promoCode.id} />
                      <AdminActionButton
                        type="submit"
                        size="sm"
                        variant="danger"
                        disabled={!canDelete}
                        title={canDelete ? undefined : "Already referenced by a cart, order, or redemption."}
                      >
                        Delete
                      </AdminActionButton>
                    </form>
                  </div>
                </div>

                <form action={updatePromoCodeAction}>
                  <input type="hidden" name="id" value={promoCode.id} />
                  <PromoCodeFields
                    promoCode={promoCode}
                    categories={categories}
                    products={products}
                  />
                  <div className="mt-5">
                    <AdminActionButton type="submit" variant="secondary">
                      Save changes
                    </AdminActionButton>
                  </div>
                </form>
              </section>
            );
          })
        )}
      </div>
    </AdminShell>
  );
}
