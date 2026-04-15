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
    <section
      id="kuponjaim"
      className="scroll-mt-28 rounded-lg border border-[#e8e2dd] bg-white px-5 py-6 shadow-[0_16px_36px_rgba(45,31,40,0.04)] sm:px-6"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-[1.02rem] font-semibold text-[#2d1f28]">
            Elérhető kedvezményeid
          </h3>
        </div>
        <p className="max-w-[34rem] text-sm leading-6 text-[#7b6773]">
          Itt látod az aktív és korábban használt kedvezménykódjaidat.
        </p>
      </div>

      {coupons.length === 0 ? (
        <div className="rounded-md border border-[#eee7ea] bg-white px-5 py-5 text-sm leading-7 text-[#7b6773]">
          Jelenleg nincs elérhető kupon a profilodhoz.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
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
