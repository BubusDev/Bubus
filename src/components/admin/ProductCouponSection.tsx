"use client";

import { useState } from "react";
import { Search, Tag, X } from "lucide-react";

import {
  addCouponToProductAction,
  removeCouponFromProductAction,
} from "@/app/(admin)/admin/products/coupon-actions";

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

type ProductCouponSectionProps = {
  productId: string;
  assignedCoupons: AssignedCoupon[];
  availableCoupons: AvailableCoupon[];
};

function formatValidity(validFrom: Date, validUntil: Date | null) {
  const fmt = (d: Date) =>
    d.toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" });
  if (validUntil) return `${fmt(validFrom)} – ${fmt(validUntil)}`;
  return `${fmt(validFrom)} –`;
}

export function ProductCouponSection({
  productId,
  assignedCoupons,
  availableCoupons,
}: ProductCouponSectionProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const assignedIds = new Set(assignedCoupons.map((c) => c.promoCodeId));

  const filteredAvailable = availableCoupons.filter(
    (c) =>
      !assignedIds.has(c.id) &&
      c.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section className="admin-panel p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[rgba(42,99,181,0.08)] text-[#2a63b5]">
          <Tag className="h-5 w-5" />
        </span>
        <div>
          <p className="admin-eyebrow">Promóciós kódok</p>
          <h2 className="text-base font-semibold text-[var(--admin-ink-900)]">
            Kapcsolódó kuponok
          </h2>
        </div>
      </div>

      {/* Assigned coupons list */}
      {assignedCoupons.length === 0 ? (
        <p className="mb-4 text-sm text-[var(--admin-ink-500)]">
          Ehhez a termékhez még nincs hozzárendelt kupon.
        </p>
      ) : (
        <div className="mb-4 grid gap-2">
          {assignedCoupons.map((coupon) => (
            <div
              key={coupon.promoCodeId}
              className="flex items-center justify-between gap-3 rounded-md border border-[var(--admin-line-100)] bg-white px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold tracking-wide text-[var(--admin-ink-900)]">
                    {coupon.code}
                  </span>
                  <span className="admin-filter-chip admin-control-sm">
                    {coupon.discountPercent}%
                  </span>
                  <span
                    className={`admin-filter-chip admin-control-sm ${coupon.isActive ? "admin-filter-chip-soft-active" : ""}`}
                  >
                    {coupon.isActive ? "Aktív" : "Inaktív"}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-[var(--admin-ink-500)]">
                  {formatValidity(coupon.validFrom, coupon.validUntil)}
                </p>
              </div>
              <form action={removeCouponFromProductAction}>
                <input type="hidden" name="productId" value={productId} />
                <input type="hidden" name="promoCodeId" value={coupon.promoCodeId} />
                <button
                  type="submit"
                  aria-label={`Kupon eltávolítása: ${coupon.code}`}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#e3c7cf] bg-[#fbf5f6] text-[#ad4455] transition-colors hover:border-[#ddadba] hover:bg-[#fff1f3] hover:text-[#99283d]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* Add coupon search */}
      <div className="relative">
        <p className="mb-1.5 text-xs font-medium text-[var(--admin-ink-700)]">
          Kupon hozzáadása
        </p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--admin-ink-500)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Kupon keresése kód alapján..."
            className="admin-input h-10 pl-9 pr-3 text-sm"
            autoComplete="off"
          />
          {open && search && filteredAvailable.length === 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-md border border-[var(--admin-line-200)] bg-white px-3 py-2.5 text-xs text-[var(--admin-ink-500)] shadow-md">
              Nincs találat.
            </div>
          )}
          {open && filteredAvailable.length > 0 && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-[var(--admin-line-200)] bg-white shadow-md">
              {filteredAvailable.map((coupon) => (
                <form key={coupon.id} action={addCouponToProductAction}>
                  <input type="hidden" name="productId" value={productId} />
                  <input type="hidden" name="promoCodeId" value={coupon.id} />
                  <button
                    type="submit"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSearch("");
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--admin-blue-050)]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-sm font-semibold text-[var(--admin-ink-900)]">
                          {coupon.code}
                        </span>
                        <span className="text-xs text-[var(--admin-ink-600)]">
                          {coupon.discountPercent}%
                        </span>
                        {!coupon.isActive && (
                          <span className="text-[11px] text-[var(--admin-ink-500)]">(inaktív)</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--admin-ink-500)]">
                        {formatValidity(coupon.validFrom, coupon.validUntil)}
                      </p>
                    </div>
                  </button>
                </form>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
