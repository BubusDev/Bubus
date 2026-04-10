import Link from "next/link";
import { notFound } from "next/navigation";

import { submitReturnRequestAction } from "@/app/(storefront)/order-status/actions";
import { formatDate } from "@/lib/account";
import { formatPrice } from "@/lib/catalog";
import { getAccessibleCheckoutOrder } from "@/lib/order-access";
import { getCustomerOrderStatusView } from "@/lib/order-status";

type GuestOrderStatusDetailPageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ return?: string }>;
};

export default async function GuestOrderStatusDetailPage({
  params,
  searchParams,
}: GuestOrderStatusDetailPageProps) {
  const { orderId } = await params;
  const resolvedSearchParams = await searchParams;
  const order = await getAccessibleCheckoutOrder(orderId);

  if (!order) {
    notFound();
  }

  const customerStatus = getCustomerOrderStatusView({
    status: order.status,
    paymentStatus: order.paymentStatus,
    internalStatus: order.internalStatus,
    trackingNumber: order.trackingNumber,
    shippingMethod: order.shippingMethod,
    statusUpdatedAt: order.statusUpdatedAt,
  });

  return (
    <main className="mx-auto max-w-[980px] px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <section className="rounded-[2.5rem] border border-white/70 bg-white/78 p-8 shadow-[0_24px_55px_rgba(198,129,167,0.12)] backdrop-blur-xl sm:p-10">
        <div className="flex flex-col gap-4 border-b border-[#f0d8e5] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#b06b8e]">
              {order.orderNumber}
            </p>
            <h1 className="mt-3 font-[family:var(--font-display)] text-[2.6rem] text-[#4d2741]">
              {customerStatus.label}
            </h1>
            <p className="mt-3 max-w-[54ch] text-sm leading-7 text-[#7a6070]">
              {customerStatus.detail}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-[#7a6872]">Leadva</p>
            <p className="mt-1 text-lg font-semibold text-[#2d1f28]">
              {formatDate(order.createdAt)}
            </p>
            <p className="mt-2 text-sm text-[#7a6872]">Végösszeg: {formatPrice(order.total)}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[#f0d8e5] bg-[#fff9fc] p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Tracking szám</p>
            <p className="mt-3 text-sm font-medium text-[#4d2741]">
              {customerStatus.trackingNumber ?? "Még nincs tracking szám"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[#f0d8e5] bg-[#fff9fc] p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Szállítási mód</p>
            <p className="mt-3 text-sm font-medium text-[#4d2741]">
              {customerStatus.shippingMethodLabel ?? "Hamarosan frissül"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[#f0d8e5] bg-[#fff9fc] p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Utolsó frissítés</p>
            <p className="mt-3 text-sm font-medium text-[#4d2741]">
              {customerStatus.lastUpdatedLabel ?? "Még nincs fulfillment frissítés"}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-[#f0d8e5] bg-white/90 p-4">
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Szállítási adatok</p>
          <p className="mt-3 text-sm font-medium text-[#4d2741]">{order.shippingName}</p>
          <p className="mt-1 text-sm text-[#7a6070]">{order.shippingPhone}</p>
          <p className="mt-2 text-sm leading-7 text-[#7a6070]">{order.shippingAddress}</p>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-[#f0d8e5] bg-white/90 p-4">
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Visszaállítási kérelem</p>
          <p className="mt-3 text-sm leading-7 text-[#7a6070]">
            Ha visszaküldési vagy elállási kérelmet szeretnél indítani, itt közvetlenül elküldheted.
          </p>
          {resolvedSearchParams.return === "requested" ? (
            <p className="mt-3 rounded-[1rem] bg-[#f0faf3] px-3 py-2 text-sm text-[#3f6f4f]">
              A kérelmedet elküldtük az admin csapatnak.
            </p>
          ) : null}
          {resolvedSearchParams.return === "error" ? (
            <p className="mt-3 rounded-[1rem] bg-[#fff4f7] px-3 py-2 text-sm text-[#9b476f]">
              A kérelemhez legalább 10 karakteres leírás szükséges.
            </p>
          ) : null}
          <form action={submitReturnRequestAction} className="mt-4 space-y-3">
            <input type="hidden" name="orderId" value={order.id} />
            <input type="hidden" name="redirectTo" value={`/order-status/${order.id}`} />
            <input
              type="text"
              name="reason"
              placeholder="Rövid ok, pl. Méret vagy mégsem kérem"
              className="w-full rounded-[1rem] border border-[#ead0df] bg-white/90 px-4 py-3 text-sm text-[#4d2741] outline-none focus:border-[#d95f92]"
            />
            <textarea
              name="details"
              rows={4}
              required
              minLength={10}
              placeholder="Írd le röviden, miért szeretnéd visszaküldeni a terméket."
              className="w-full resize-none rounded-[1rem] border border-[#ead0df] bg-white/90 px-4 py-3 text-sm text-[#4d2741] outline-none focus:border-[#d95f92]"
            />
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead0df] bg-white/90 px-5 text-sm font-medium text-[#6b425a] transition hover:border-[#e6b4cf] hover:bg-white"
            >
              Kérelem elküldése
            </button>
          </form>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/order-status"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead0df] bg-white/90 px-5 text-sm font-medium text-[#6b425a] transition hover:border-[#e6b4cf] hover:bg-white"
          >
            Összes elérhető rendelés
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#f183bc] px-5 text-sm font-medium text-white transition hover:bg-[#ea6fb0]"
          >
            Kapcsolat
          </Link>
        </div>
      </section>
    </main>
  );
}
