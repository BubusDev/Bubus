import Link from "next/link";
import { redirect } from "next/navigation";

import { formatDate } from "@/lib/account";
import { getCurrentUser } from "@/lib/auth/current-user";
import { formatPrice } from "@/lib/catalog";
import { listAccessibleGuestOrders } from "@/lib/order-access";
import { getCustomerOrderStatusView } from "@/lib/order-status";

export default async function GuestOrderStatusPage() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect("/orders");
  }

  const orders = await listAccessibleGuestOrders();

  return (
    <main className="mx-auto max-w-[980px] px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <section className="rounded-[2.5rem] border border-white/70 bg-white/78 p-8 shadow-[0_24px_55px_rgba(198,129,167,0.12)] backdrop-blur-xl sm:p-10">
        <p className="text-center text-[10px] uppercase tracking-[0.32em] text-[#b06b8e]">
          Vendég rendeléskövetés
        </p>
        <h1 className="mt-3 text-center font-[family:var(--font-display)] text-[2.8rem] leading-none text-[#4d2741]">
          Rendelési állapot
        </h1>
        <p className="mx-auto mt-4 max-w-[52ch] text-center text-sm leading-7 text-[#7a6070]">
          Itt látod az ezen a böngészőn elérhető vendég rendeléseid aktuális állapotát, tracking
          adatait és legutóbbi frissítéseit.
        </p>

        {orders.length === 0 ? (
          <div className="mt-8 rounded-[1.8rem] border border-[#f0d8e5] bg-[#fff9fc] p-6 text-center">
            <p className="text-sm text-[#7a6070]">
              Jelenleg nincs elérhető vendég rendelés ezen az eszközön. A checkout után ide
              később is vissza tudsz térni ugyanarról a böngészőről.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#f183bc] px-5 text-sm font-medium text-white transition hover:bg-[#ea6fb0]"
              >
                Tovább válogatok
              </Link>
              <Link
                href="/order-status/recover"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead0df] bg-white/90 px-5 text-sm font-medium text-[#6b425a] transition hover:border-[#e6b4cf] hover:bg-white"
              >
                Másik eszközről keresem
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead0df] bg-white/90 px-5 text-sm font-medium text-[#6b425a] transition hover:border-[#e6b4cf] hover:bg-white"
              >
                Kapcsolat
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <div className="flex justify-end">
              <Link
                href="/order-status/recover"
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#ead0df] bg-white/90 px-4 text-sm font-medium text-[#6b425a] transition hover:border-[#e6b4cf] hover:bg-white"
              >
                Másik eszközről nyitnám meg
              </Link>
            </div>
            {orders.map((order) => {
              const customerStatus = getCustomerOrderStatusView({
                status: order.status,
                paymentStatus: order.paymentStatus,
                internalStatus: order.internalStatus,
                trackingNumber: order.trackingNumber,
                shippingMethod: order.shippingMethod,
                statusUpdatedAt: order.statusUpdatedAt,
              });

              return (
                <article
                  key={order.id}
                  className="rounded-[1.8rem] border border-[#f0d8e5] bg-[#fff9fc] p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">
                        {order.orderNumber}
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-[#4d2741]">
                        {customerStatus.label}
                      </h2>
                      <p className="mt-2 max-w-[52ch] text-sm leading-7 text-[#7a6070]">
                        {customerStatus.detail}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-sm text-[#7a6872]">Végösszeg</p>
                      <p className="mt-1 text-lg font-semibold text-[#2d1f28]">
                        {formatPrice(order.total)}
                      </p>
                      <p className="mt-2 text-sm text-[#7a6872]">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.2rem] border border-[#eadbe3] bg-white/80 p-3">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#b06b8e]">Tracking</p>
                      <p className="mt-2 text-sm font-medium text-[#4d2741]">
                        {customerStatus.trackingNumber ?? "Még nincs tracking szám"}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-[#eadbe3] bg-white/80 p-3">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#b06b8e]">Szállítás</p>
                      <p className="mt-2 text-sm font-medium text-[#4d2741]">
                        {customerStatus.shippingMethodLabel ?? "Hamarosan frissül"}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-[#eadbe3] bg-white/80 p-3">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#b06b8e]">Utolsó frissítés</p>
                      <p className="mt-2 text-sm font-medium text-[#4d2741]">
                        {customerStatus.lastUpdatedLabel ?? "Még nincs fulfillment frissítés"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Link
                      href={`/order-status/${order.id}`}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead0df] bg-white/90 px-5 text-sm font-medium text-[#6b425a] transition hover:border-[#e6b4cf] hover:bg-white"
                    >
                      Részletek megnyitása
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
