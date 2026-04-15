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
        "relative overflow-hidden rounded-lg border border-[#e8e5e0] bg-white",
        "transition duration-200 hover:border-[#d8c7cf]",
        isMuted && "opacity-65",
      )}
    >
      <div className="flex min-h-[14rem] flex-col px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="min-w-0 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8c7f86]">
              KUPON
            </p>
            <p className="text-sm font-semibold leading-5 text-[#33242b]">{coupon.label}</p>
          </div>

          <span
            className={cx(
              "inline-flex w-fit items-center rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
              statusTone[coupon.status],
            )}
          >
            {isMuted ? statusLabels[coupon.status] : getRemainingText(daysRemaining)}
          </span>
        </div>

        <div className="my-4 border-t border-[#e8e5e0]" />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <p
              className={cx(
                "break-words font-mono text-[1.65rem] font-semibold leading-tight tracking-normal text-[#20191d] sm:text-[1.9rem]",
                coupon.status === "expired" && "text-[#777075]",
              )}
            >
              {coupon.code}
            </p>

            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-2">
              <p className="text-lg font-semibold leading-none text-[#6f3f59]">
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
                "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border px-4 text-xs font-semibold uppercase tracking-[0.14em] transition",
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

        <div className="my-4 border-t border-[#e8e5e0]" />

        <div className="mt-auto">
          <dl className="grid gap-4 text-xs leading-5 text-[#766a70] sm:grid-cols-3">
            <div>
              <dt className="font-semibold uppercase tracking-[0.18em] text-[#7a4f61]">Érvényes</dt>
              <dd className="mt-2 font-semibold text-[#3f2735]">{validityText}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-[0.18em] text-[#7a4f61]">Használat</dt>
              <dd className="mt-2 font-semibold text-[#3f2735]">
                {coupon.usedCount > 0 ? "Már felhasználva" : "Még nem használt"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-[0.18em] text-[#7a4f61]">Állapot</dt>
              <dd className="mt-2">
                <span
                  className={cx(
                    "inline-flex rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                    statusTone[coupon.status],
                  )}
                >
                  {statusLabels[coupon.status]}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  );
}
