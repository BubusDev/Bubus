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
  active: "border-[#16a34a]/25 bg-[#f0fdf4] text-[#166534]",
  used: "border-[#ded6da] bg-[#faf8f9] text-[#756870]",
  expired: "border-[#ded6da] bg-[#f7f5f6] text-[#81777d]",
  upcoming: "border-[#d97706]/25 bg-[#fffbeb] text-[#92400e]",
};

const urgencyTone = {
  safe: {
    color: "#16a34a",
    badgeBackground: "#f0fdf4",
  },
  warning: {
    color: "#d97706",
    badgeBackground: "#fffbeb",
  },
  danger: {
    color: "#dc2626",
    badgeBackground: "#fef2f2",
  },
} as const;

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

function getRemainingPercent(coupon: CouponTicketData) {
  if (!coupon.validUntil) return 100;

  const start = coupon.validFrom.getTime();
  const end = coupon.validUntil.getTime();
  const now = Date.now();
  const total = end - start;

  if (total <= 0) return 0;

  return Math.max(0, Math.min(100, ((end - now) / total) * 100));
}

function getUrgencyTone(remainingPercent: number) {
  if (remainingPercent > 50) return urgencyTone.safe;
  if (remainingPercent >= 20) return urgencyTone.warning;
  return urgencyTone.danger;
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
  const remainingPercent = getRemainingPercent(coupon);
  const urgency = getUrgencyTone(remainingPercent);

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
        "group relative isolate overflow-hidden rounded-lg border border-[#e8e5e0] bg-[#fffefe]",
        "shadow-[0_8px_24px_rgba(49,25,45,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(49,25,45,0.14)]",
        isMuted && "opacity-65",
      )}
    >
      <div className="pointer-events-none absolute left-1/2 top-[-1px] z-10 h-3.5 w-14 -translate-x-1/2 rounded-b-[12px] border-x border-b border-[#e8e5e0] bg-[#fffdfb]" />
      <div className="pointer-events-none absolute bottom-[-1px] left-1/2 z-10 h-3.5 w-14 -translate-x-1/2 rounded-t-[12px] border-x border-t border-[#e8e5e0] bg-[#fffdfb]" />

      <div className="flex min-h-[18rem] flex-col px-6 py-7">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="min-w-0 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7a4f61]">
              KUPON
            </p>
            <p className="text-sm font-semibold leading-5 text-[#33242b]">{coupon.label}</p>
          </div>

          <span
            className={cx(
              "inline-flex w-fit items-center rounded-md border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em]",
              isMuted && statusTone[coupon.status],
            )}
            style={
              isMuted
                ? undefined
                : {
                    borderColor: urgency.color,
                    backgroundColor: urgency.badgeBackground,
                    color: urgency.color,
                  }
            }
          >
            {isMuted ? statusLabels[coupon.status] : getRemainingText(daysRemaining)}
          </span>
        </div>

        <div className="my-6 border-t-2 border-dashed border-[#e8e5e0]" style={{ marginLeft: -24, marginRight: -24 }} />

        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0">
            <p
              className={cx(
                "break-words font-mono text-[1.9rem] font-bold leading-tight tracking-normal text-[#20191d]",
                coupon.status === "expired" && "text-[#777075]",
              )}
            >
              {coupon.code}
            </p>

            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-2">
              <p className="text-lg font-bold leading-none text-[#6f3f59]">
                -{coupon.discountPercent}% kedvezmény
              </p>
              {coupon.minimumOrderAmount ? (
                <p className="w-full text-xs leading-5 text-[#7b6773]">
                  Minimum rendelés:{" "}
                  <span className="font-medium text-[#3f2735]">
                    {formatPrice(coupon.minimumOrderAmount)}
                  </span>
                </p>
              ) : null}
            </div>
          </div>

          {!isMuted ? (
            <button
              type="button"
              onClick={handleCopy}
              disabled={isPending}
              className={cx(
                "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border px-4 text-xs font-bold uppercase tracking-[0.14em] transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20191d]/25 disabled:opacity-60 sm:w-auto",
                copied
                  ? "border-[#20191d] bg-[#20191d] text-white"
                  : "border-[#20191d] bg-[#fffefe] text-[#20191d] hover:bg-[#f7f3ee]",
              )}
              aria-label={`${coupon.code} kuponkód másolása`}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Másolva" : "Kód másolása"}</span>
            </button>
          ) : null}
        </div>

        <div className="my-6 border-t-2 border-dashed border-[#e8e5e0]" style={{ marginLeft: -24, marginRight: -24 }} />

        <div className="mt-auto">
          <dl className="grid gap-4 text-xs leading-5 text-[#766a70] sm:grid-cols-3">
            <div>
              <dt className="font-bold uppercase tracking-[0.18em] text-[#7a4f61]">Érvényes</dt>
              <dd className="mt-2 font-semibold text-[#3f2735]">{validityText}</dd>
            </div>
            <div>
              <dt className="font-bold uppercase tracking-[0.18em] text-[#7a4f61]">Használat</dt>
              <dd className="mt-2 font-semibold text-[#3f2735]">
                {coupon.usedCount > 0 ? "Már felhasználva" : "Még nem használt"}
              </dd>
            </div>
            <div>
              <dt className="font-bold uppercase tracking-[0.18em] text-[#7a4f61]">Állapot</dt>
              <dd className="mt-2">
                <span
                  className={cx(
                    "inline-flex rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                    isMuted && statusTone[coupon.status],
                  )}
                  style={
                    isMuted
                      ? undefined
                      : {
                          borderColor: urgency.color,
                          backgroundColor: urgency.badgeBackground,
                          color: urgency.color,
                        }
                  }
                >
                  {statusLabels[coupon.status]}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {!isMuted ? (
        <div className="absolute inset-x-0 bottom-0 h-[5px] bg-[#eee9e3]">
          <div
            className="h-full transition-[width] duration-300"
            style={{ width: `${remainingPercent}%`, backgroundColor: urgency.color }}
          />
        </div>
      ) : null}
    </article>
  );
}
