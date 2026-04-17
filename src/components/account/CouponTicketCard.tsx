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
  active: "border-[#d8c7cf] bg-white text-[#6f3f59]",
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
  if (daysRemaining === null) return "Nincs lejárat";
  if (daysRemaining === 0) return "Ma jár le";
  return `${daysRemaining} nap`;
}

export function CouponTicketCard({ coupon }: { coupon: CouponTicketData }) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const validityText = getValidityText(coupon);
  const isMuted = coupon.status === "used" || coupon.status === "expired";
  const daysRemaining = getDaysRemaining(coupon);
  const remainingText = getRemainingText(daysRemaining);

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
        "grid gap-3 border-b border-[#eee8eb] bg-white px-4 py-4 transition duration-200 last:border-b-0",
        "hover:bg-[#fffdfd] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:px-5",
        isMuted && "opacity-65",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cx(
              "break-all font-mono text-base font-semibold leading-6 tracking-normal text-[#20191d] sm:text-lg",
              coupon.status === "expired" && "text-[#777075]",
            )}
          >
            {coupon.code}
          </p>
          <span
            className={cx(
              "inline-flex shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
              statusTone[coupon.status],
            )}
          >
            {statusLabels[coupon.status]}
          </span>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-5 text-[#7b6773]">
          <span className="font-semibold text-[#6f3f59]">
            -{coupon.discountPercent}% kedvezmény
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
          "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md border px-3 text-[11px] font-semibold uppercase tracking-[0.12em] transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20191d]/25 disabled:opacity-60 sm:w-auto",
          copied
            ? "border-[#20191d] bg-[#20191d] text-white"
            : "border-[#d8c7cf] bg-white text-[#4d2d3e] hover:border-[#20191d] hover:text-[#20191d]",
        )}
        aria-label={`${coupon.code} kuponkód másolása`}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        <span>{copied ? "Másolva" : "Másolás"}</span>
      </button>
    </article>
  );
}
