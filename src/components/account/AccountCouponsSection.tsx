import {
  CouponTicketCard,
  type CouponTicketData,
} from "@/components/account/CouponTicketCard";
import type { AccountCouponSummary } from "@/lib/account";

function getCouponLabel(coupon: AccountCouponSummary) {
  if (coupon.label) return coupon.label;
  if (coupon.code === "UDVNALUNK") return "Személyes kupon";
  if (coupon.code.startsWith("HIRLEVEL")) return "Hírlevél kupon";
  return "Személyes kupon";
}

export function AccountCouponsSection({ coupons }: { coupons: AccountCouponSummary[] }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="text-sm font-semibold text-[#2d1f28]">
          Elérhető kedvezményeid
        </h3>
        <p className="text-xs leading-5 text-[#8a7a83]">
          Aktív és korábban használt kedvezménykódjaid.
        </p>
      </div>

      {coupons.length === 0 ? (
        <div className="rounded-lg border border-[#e8e2dd] bg-white px-4 py-5 text-sm leading-7 text-[#7b6773] sm:px-5">
          Jelenleg nincs elérhető kupon a profilodhoz.
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {coupons.map((coupon) => {
            const ticket: CouponTicketData = {
              ...coupon,
              label: getCouponLabel(coupon),
            };

            return <CouponTicketCard key={coupon.id} coupon={ticket} />;
          })}
        </div>
      )}
    </section>
  );
}
