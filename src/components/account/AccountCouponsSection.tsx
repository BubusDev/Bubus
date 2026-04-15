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
    <section id="kuponjaim" className="scroll-mt-28 border-t border-[#f0e8eb] bg-[#fffdfb] px-8 py-8 sm:px-10">
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
