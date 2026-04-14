import { TicketPercent } from "lucide-react";

import { CopyCouponButton } from "@/components/account/CopyCouponButton";
import { formatDate, type AccountCouponSummary } from "@/lib/account";
import { formatPrice } from "@/lib/catalog";

const statusLabels: Record<AccountCouponSummary["status"], string> = {
  active: "active",
  expired: "expired",
  used: "used",
  upcoming: "upcoming",
};

export function AccountCouponsSection({ coupons }: { coupons: AccountCouponSummary[] }) {
  return (
    <section className="border-t border-[#f0e8eb] bg-white px-8 py-8 sm:px-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#b691a4]">
            Kuponok
          </p>
          <h3 className="mt-3 text-[1.15rem] font-semibold text-[#3f2735]">
            Elérhető kedvezményeid
          </h3>
        </div>
        <p className="max-w-[34rem] text-sm leading-6 text-[#7b6773]">
          Itt látod azokat a globális kuponokat, amelyeket bejelentkezett vásárlóként
          használhatsz, valamint a már felhasznált kódjaid állapotát.
        </p>
      </div>

      {coupons.length === 0 ? (
        <div className="rounded-lg border border-[#f0dfe7] bg-[#fffefe] px-5 py-5 text-sm leading-7 text-[#7b6773]">
          Jelenleg nincs elérhető kupon a profilodhoz.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {coupons.map((coupon) => (
            <article
              key={coupon.id}
              className="relative overflow-hidden rounded-lg border border-[#ead5df] bg-[linear-gradient(135deg,#fffefe_0%,#fff7fb_52%,#f8fbf8_100%)] shadow-[0_16px_34px_rgba(83,45,65,0.08)]"
            >
              <div className="pointer-events-none absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-[#ead5df] bg-white" />
              <div className="pointer-events-none absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-[#ead5df] bg-white" />
              <div className="grid sm:grid-cols-[minmax(0,1fr)_118px]">
                <div className="min-w-0 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#b691a4]">
                        <TicketPercent className="h-4 w-4 shrink-0 text-[#d0609c]" />
                        Kuponjegy
                      </p>
                      <p className="mt-3 break-all font-mono text-[1.35rem] font-semibold uppercase tracking-[0.08em] text-[#3f2735]">
                        {coupon.code}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${
                        coupon.currentlyUsable
                          ? "border-[#d8ebdf] bg-[#f5fbf7] text-[#35624b]"
                          : "border-[#eadce3] bg-white/72 text-[#8b7080]"
                      }`}
                    >
                      {statusLabels[coupon.status]}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-[2.3rem] font-semibold leading-none tracking-[-0.04em] text-[#3f2735]">
                        {coupon.discountPercent}%
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#b691a4]">
                        kedvezmény
                      </p>
                    </div>
                    <CopyCouponButton code={coupon.code} />
                  </div>

                  {coupon.minimumOrderAmount ? (
                    <p className="mt-4 text-xs leading-5 text-[#7b6773]">
                      Minimum rendelés:{" "}
                      <span className="font-medium text-[#3f2735]">
                        {formatPrice(coupon.minimumOrderAmount)}
                      </span>
                    </p>
                  ) : null}
                </div>

                <div className="border-t border-dashed border-[#e6cdda] bg-white/46 p-4 sm:border-l sm:border-t-0 sm:p-5">
                  <dl className="grid gap-3 text-xs leading-5 text-[#7b6773]">
                    <div>
                      <dt className="uppercase tracking-[0.18em] text-[#b691a4]">Ettől</dt>
                      <dd className="mt-1 font-medium text-[#3f2735]">
                        {formatDate(coupon.validFrom)}
                      </dd>
                    </div>
                    <div>
                      <dt className="uppercase tracking-[0.18em] text-[#b691a4]">Eddig</dt>
                      <dd className="mt-1 font-medium text-[#3f2735]">
                        {coupon.validUntil ? formatDate(coupon.validUntil) : "Visszavonásig"}
                      </dd>
                    </div>
                    <div>
                      <dt className="uppercase tracking-[0.18em] text-[#b691a4]">Használható</dt>
                      <dd className="mt-1 font-medium text-[#3f2735]">
                        {coupon.currentlyUsable ? "Igen" : "Nem"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
