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
  active: "border-[#e9c8d8] bg-[#fff8fb] text-[#7a4f67]",
  used: "border-[#ded6da] bg-[#faf8f9] text-[#786b72]",
  expired: "border-[#ded6da] bg-[#f7f5f6] text-[#8a8085]",
  upcoming: "border-[#e6d4dd] bg-[#fffafd] text-[#876173]",
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

  return `${from} – ${until}`;
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
        "group relative isolate overflow-hidden rounded-lg border border-[#eadfe4] bg-[#fffdfb]",
        "transition-colors duration-200",
        isMuted && "opacity-70",
      )}
    >
      <div className="pointer-events-none absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-[#eadfe4] bg-white" />
      <div className="pointer-events-none absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-[#eadfe4] bg-white" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#f7edf2]" />

      <div className="flex min-h-[16rem] flex-col px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#b691a4]">Kupon</p>
            <p className="mt-2 text-sm leading-5 text-[#6f6168]">{coupon.label}</p>
          </div>
          <p className="max-w-[11rem] text-right text-[11px] leading-5 text-[#8a7a82]">
            {validityText}
          </p>
        </div>

        <div className="my-7 flex flex-col gap-4 sm:my-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p
              className={cx(
                "break-all font-[family:var(--font-display)] text-[2.35rem] leading-[0.95] text-[#33242b]",
                "sm:text-[2.8rem]",
                coupon.status === "expired" && "text-[#7c7378]",
              )}
            >
              {coupon.code}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-[1.45rem] font-medium leading-none text-[#7a4f67]">
                -{coupon.discountPercent}%
              </p>
              <span className="h-px w-8 bg-[#eadfe4]" />
              <p className="text-xs uppercase tracking-[0.18em] text-[#a68998]">
                kedvezmény
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            disabled={isPending}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-[#e4d6dd] bg-white px-3 text-xs font-medium text-[#6d465c] transition hover:border-[#d7a1bd] hover:bg-[#fff8fb] disabled:opacity-60"
            aria-label={`${coupon.code} kuponkód másolása`}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Másolva" : "Másolás"}</span>
          </button>
        </div>

        <div className="mt-auto border-t border-[#f0e8eb] pt-4">
          <dl className="grid gap-3 text-xs leading-5 text-[#766a70] sm:grid-cols-3">
            <div>
              <dt className="uppercase tracking-[0.18em] text-[#b691a4]">Érvényes</dt>
              <dd className="mt-1 font-medium text-[#3f2735]">{validityText}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.18em] text-[#b691a4]">Használat</dt>
              <dd className="mt-1 font-medium text-[#3f2735]">
                {coupon.usedCount > 0 ? "Már felhasználva" : "Még nem használt"}
              </dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.18em] text-[#b691a4]">Állapot</dt>
              <dd className="mt-1">
                <span
                  className={cx(
                    "inline-flex rounded-md border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em]",
                    statusTone[coupon.status],
                  )}
                >
                  {statusLabels[coupon.status]}
                </span>
              </dd>
            </div>
          </dl>

          {coupon.minimumOrderAmount ? (
            <p className="mt-4 text-xs leading-5 text-[#7b6773]">
              Minimum rendelés:{" "}
              <span className="font-medium text-[#3f2735]">
                {formatPrice(coupon.minimumOrderAmount)}
              </span>
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
