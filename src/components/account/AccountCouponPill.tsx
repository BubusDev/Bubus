"use client";

import { useState } from "react";
import { ChevronRight, X, ArrowRight } from "lucide-react";
import Link from "next/link";

import { MiniCouponRow, MiniProductCard } from "@/components/ProfileDropdown";
import type { HeaderCouponDropdownPreview } from "@/lib/account";

export function AccountCouponPill({
  couponPreview,
  compact = false,
}: {
  couponPreview: HeaderCouponDropdownPreview;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const { activeCoupons, eligibleProducts, recommendationLabel } = couponPreview;

  if (activeCoupons.length === 0) return null;

  return (
    <>
      {/* Figyelemfelhívó pill */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-5 py-3 bg-[#fdf5f8] border-b border-[#f0d4e0]"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-[#c45a85] animate-pulse" />
          <span className="text-sm font-medium text-[#c45a85]">
            {compact
              ? `${activeCoupons.length} kupon aktív`
              : `${activeCoupons.length} aktív kuponod van`}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#c45a85]">
          Megtekintés
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </button>

      {/* Kupon bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-[300] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-white animate-[slideInBottom_.25s_ease-out]">
            {/* Handle bar */}
            <div className="flex justify-center pb-2 pt-3">
              <div className="h-1 w-10 rounded-full bg-[#e8e5e0]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#f0ede8] px-5 pb-3">
              <p className="text-sm font-semibold text-[#1a1a1a]">Kuponjaim</p>
              <button type="button" onClick={() => setOpen(false)}>
                <X className="h-4 w-4 text-[#888]" />
              </button>
            </div>

            {/* Coupon list */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {activeCoupons.map((coupon) => (
                <MiniCouponRow key={coupon.id} coupon={coupon} />
              ))}

              {eligibleProducts.length > 0 && (
                <div className="mt-4 border-t border-[#f0ede8] pt-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#b08898]">
                    {recommendationLabel ?? "Ezekre is érvényes"}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {eligibleProducts.slice(0, 3).map((product) => (
                      <MiniProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Link to all coupons */}
            <div className="border-t border-[#f0ede8] px-5 py-4">
              <Link
                href="/profile#kuponjaim"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1 text-xs text-[#888] transition hover:text-[#1a1a1a]"
              >
                Összes kupon <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
