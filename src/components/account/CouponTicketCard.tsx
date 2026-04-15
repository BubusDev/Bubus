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
  active: "border-[#e8c6d6] bg-[#fff8fb] text-[#6f3f59]",
  used: "border-[#ded6da] bg-[#faf8f9] text-[#756870]",
  expired: "border-[#ded6da] bg-[#f7f5f6] text-[#81777d]",
  upcoming: "border-[#e8d6df] bg-[#fffafd] text-[#7d5a6c]",
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

export function CouponTicketCard({ coupon }: { coupon: CouponTicketData }) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const validityText = getValidityText(coupon);
  const isMuted = coupon.status === "used" || coupon.status === "expired";

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
        "group relative isolate overflow-hidden rounded-lg border border-[#ead9e2] bg-[#fffdfb]",
        "transition-colors duration-200 shadow-[0_1px_0_rgba(92,55,74,0.04)]",
        isMuted && "opacity-70",
      )}
    >
      <div className="pointer-events-none absolute -left-2.5 top-[6.9rem] h-5 w-5 rounded-full border border-[#ead9e2] bg-[#fffdfb]" />
      <div className="pointer-events-none absolute -right-2.5 top-[6.9rem] h-5 w-5 rounded-full border border-[#ead9e2] bg-[#fffdfb]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#f4dce8,#fff8fb_45%,#ead9e2)]" />

      <div className="flex min-h-[18rem] flex-col">
        <div className="grid gap-4 px-5 pb-5 pt-6 sm:grid-cols-[1fr_auto] sm:px-6">
          <div className="min-w-0 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ad7894]">
              KUPON
            </p>
            <p className="text-sm font-medium leading-5 text-[#4a3440]">{coupon.label}</p>
          </div>

          <div className="rounded-md border border-[#f0e2e8] bg-[#fff8fb] px-3 py-2 text-left sm:text-right">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#b08a9d]">
              Érvényes
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-[#5d4b55]">
              {validityText}
            </p>
          </div>
        </div>

        <div className="relative border-y border-[#f0e5ea] bg-[linear-gradient(180deg,#fffafb_0%,#fffdfb_100%)] px-5 py-6 sm:px-6">
          <div className="pointer-events-none absolute inset-x-5 top-0 border-t border-dashed border-[#ead9e2] sm:inset-x-6" />

          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="min-w-0">
              <p
                className={cx(
                  "break-words font-[family:var(--font-display)] text-[2.45rem] font-semibold leading-[0.95] text-[#30222a]",
                  "sm:text-[3.15rem]",
                  coupon.status === "expired" && "text-[#777075]",
                )}
              >
                {coupon.code}
              </p>

              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <p className="font-[family:var(--font-display)] text-[1.7rem] font-medium leading-none text-[#6f3f59]">
                  -{coupon.discountPercent}%
                </p>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9f7d8d]">
                  kedvezmény
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

            <button
              type="button"
              onClick={handleCopy}
              disabled={isPending}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#e5cfd9] bg-[#fffdfb] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#653d52] transition hover:border-[#d6a8bf] hover:bg-[#fff7fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#efbfd4] disabled:opacity-60 sm:w-auto"
              aria-label={`${coupon.code} kuponkód másolása`}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Másolva" : "Másolás"}</span>
            </button>
          </div>
        </div>

        <div className="mt-auto px-5 py-5 sm:px-6">
          <dl className="grid gap-3 text-xs leading-5 text-[#766a70] sm:grid-cols-3">
            <div className="rounded-md border border-[#f0e5ea] bg-white/70 px-3 py-3">
              <dt className="font-medium uppercase tracking-[0.18em] text-[#ad7894]">
                Érvényes
              </dt>
              <dd className="mt-2 font-medium text-[#3f2735]">{validityText}</dd>
            </div>
            <div className="rounded-md border border-[#f0e5ea] bg-white/70 px-3 py-3">
              <dt className="font-medium uppercase tracking-[0.18em] text-[#ad7894]">
                Használat
              </dt>
              <dd className="mt-2 font-medium text-[#3f2735]">
                {coupon.usedCount > 0 ? "Már felhasználva" : "Még nem használt"}
              </dd>
            </div>
            <div className="rounded-md border border-[#f0e5ea] bg-white/70 px-3 py-3">
              <dt className="font-medium uppercase tracking-[0.18em] text-[#ad7894]">
                Állapot
              </dt>
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
