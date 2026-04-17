"use client";

import { useState, useTransition } from "react";
import { Check, Copy } from "lucide-react";

import { formatPrice } from "@/lib/catalog";

export type CouponTicketStatus = "active" | "used" | "expired" | "upcoming";

export type CouponTicketData = {
  id: string;
  code: string;
  discountPercent: number;
  label: string;
  validFrom: Date;
  validUntil: Date | null;
  status: CouponTicketStatus;
  currentlyUsable: boolean;
  usedCount: number;
  minimumOrderAmount?: number | null;
};

const statusLabels: Record<CouponTicketStatus, string> = {
  active: "Aktív",
  used: "Felhasznált",
  expired: "Lejárt",
  upcoming: "Hamarosan",
};

const statusTone: Record<CouponTicketStatus, string> = {
  active: "border-[#dbe8dc] bg-[#f8fff8] text-[#27733e]",
  used: "border-[#ded6da] bg-[#faf8f9] text-[#756870]",
  expired: "border-[#ded6da] bg-[#f7f5f6] text-[#81777d]",
  upcoming: "border-[#e2d6c6] bg-[#fffdf7] text-[#7a5c38]",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatCouponDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function getValidityText(coupon: CouponTicketData) {
  const from = formatCouponDate(coupon.validFrom);
  const until = coupon.validUntil ? formatCouponDate(coupon.validUntil) : "visszavonásig";

  return `${from} - ${until}`;
}

function getDaysRemaining(coupon: CouponTicketData) {
  if (!coupon.validUntil) return null;

  const today = new Date();
  const end = new Date(coupon.validUntil);
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const endUtc = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());

  return Math.max(0, Math.ceil((endUtc - todayUtc) / 86_400_000));
}

function getRemainingText(daysRemaining: number | null) {
  if (daysRemaining === null) return "visszavonásig";
  if (daysRemaining === 0) return "ma jár le";
  return `${daysRemaining} nap`;
}

function getUrgencyColor(daysRemaining: number | null) {
  if (daysRemaining == null) return "#16a34a";
  if (daysRemaining <= 2) return "#dc2626";
  if (daysRemaining <= 7) return "#d97706";
  return "#16a34a";
}

export function CouponTicketCard({ coupon }: { coupon: CouponTicketData }) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const validityText = getValidityText(coupon);
  const isMuted = coupon.status === "used" || coupon.status === "expired";
  const daysRemaining = getDaysRemaining(coupon);
  const remainingText = getRemainingText(daysRemaining);
  const urgencyColor = getUrgencyColor(daysRemaining);

  function handleCopy() {
    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } catch {
        setCopied(false);
      }
    });
  }

  return (
    <article
      className={cx(
        "relative overflow-visible rounded-lg border border-[#e8e5e0] bg-white shadow-[0_12px_26px_rgba(45,31,40,0.05)] transition duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(45,31,40,0.08)]",
        isMuted && "opacity-65",
      )}
    >
      <span
        aria-hidden="true"
        className="absolute -left-px top-1/2 h-7 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-r-[14px] border border-l-0 border-[#e8e5e0] bg-[#f8f6f4]"
      />
      <span
        aria-hidden="true"
        className="absolute -right-px top-1/2 h-7 w-3.5 -translate-y-1/2 translate-x-1/2 rounded-l-[14px] border border-r-0 border-[#e8e5e0] bg-[#f8f6f4]"
      />

      <div className="grid gap-3 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cx(
                "break-all font-mono text-[15px] font-bold leading-6 tracking-[0.03em] text-[#1a1a1a] sm:text-base",
                coupon.status === "expired" && "text-[#777075]",
              )}
            >
              {coupon.code}
            </p>
            <span
              className={cx(
                "inline-flex shrink-0 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
                statusTone[coupon.status],
              )}
            >
              {statusLabels[coupon.status]}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-5 text-[#aaa]">
            <span className="font-semibold" style={{ color: isMuted ? "#81777d" : urgencyColor }}>
              -{coupon.discountPercent}%
            </span>
            <span>{isMuted ? validityText : remainingText}</span>
            {coupon.minimumOrderAmount ? (
              <span>
                Minimum:{" "}
                <span className="font-medium text-[#3f2735]">
                  {formatPrice(coupon.minimumOrderAmount)}
                </span>
              </span>
            ) : null}
            {coupon.usedCount > 0 ? <span>Már felhasználva</span> : null}
          </div>

          <p className="mt-1 truncate text-[11px] leading-5 text-[#9a8d94]">
            {coupon.label}
            {!isMuted && coupon.validUntil ? (
              <>
                {" · "}
                Érvényes: {validityText}
              </>
            ) : null}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          disabled={isPending}
          className={cx(
            "inline-flex h-8 w-full shrink-0 items-center justify-center gap-1.5 rounded border px-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20191d]/25 disabled:opacity-60 sm:w-auto",
            copied
              ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
              : "border-[#e8e5e0] bg-white text-[#555] hover:text-[#1a1a1a]",
          )}
          aria-label={`${coupon.code} kuponkód másolása`}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? "Kész" : "Másolás"}</span>
        </button>
      </div>

      <div className="mx-3 border-t-[1.5px] border-dashed border-[#e8e5e0]" />
    </article>
  );
}
