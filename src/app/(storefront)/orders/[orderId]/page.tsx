import Link from "next/link";
import { FileText } from "lucide-react";
import { notFound } from "next/navigation";

import { reorderAction } from "@/app/account/actions";
import { submitReturnRequestAction } from "@/app/order-status/actions";
import { AccountShell } from "@/components/account/AccountShell";
import { formatDate, getOrderForUser } from "@/lib/account";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/catalog";
import { getCustomerOrderStatusView } from "@/lib/order-status";

type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ return?: string }>;
};

export default async function OrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const user = await requireUser("/orders");
  const { orderId } = await params;
  const resolvedSearchParams = await searchParams;
  const order = await getOrderForUser(user.id, orderId);

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
    <AccountShell
      title="Rendelés részletei"
      description="Letisztult összegzés a státuszról, a címről, a fizetésről és a rendelt tételekről."
      currentPath="/orders"
    >
      <section className="rounded-[2rem] border border-white/70 bg-white/78 p-6 shadow-[0_18px_40px_rgba(198,129,167,0.12)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 border-b border-[#f0d8e5] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#b06b8e]">
              {order.orderNumber}
            </p>
            <h2 className="mt-3 font-[family:var(--font-display)] text-[2rem] text-[#4d2741]">
              {customerStatus.label}
            </h2>
            <p className="mt-2 text-sm text-[#7a6070]">{formatDate(order.createdAt)}</p>
            <p className="mt-3 max-w-[52ch] text-sm leading-7 text-[#7a6070]">{customerStatus.detail}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <form action={reorderAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#f183bc] px-4 text-sm font-medium text-white shadow-[0_16px_35px_rgba(241,131,188,0.28)] transition hover:bg-[#ea6fb0]"
              >
                Újrarendelés
              </button>
            </form>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#ead0df] bg-white/90 px-4 text-sm font-medium text-[#6b425a]"
            >
              <FileText className="h-4 w-4" />
              Számla hamarosan
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[#f0d8e5] bg-[#fff9fc] p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Szállítás</p>
            <p className="mt-3 text-sm font-medium text-[#4d2741]">{order.shippingName}</p>
            <p className="mt-1 text-sm text-[#7a6070]">{order.shippingPhone}</p>
            <p className="mt-2 text-sm leading-7 text-[#7a6070]">{order.shippingAddress}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[#f0d8e5] bg-[#fff9fc] p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Fizetés</p>
            <p className="mt-3 text-sm font-medium text-[#4d2741]">{order.paymentMethod}</p>
            <p className="mt-2 text-sm text-[#7a6070]">
              {order.paymentStatus === "PAID"
                ? "A Stripe sikeresen visszaigazolta a fizetést."
                : order.paymentStatus === "PROCESSING" || order.paymentStatus === "FINALIZING"
                  ? "A Stripe még feldolgozza a tranzakciót."
                  : order.paymentStatus === "STOCK_UNAVAILABLE"
                    ? "A fizetés után készleteltérés történt, ezért manuális ellenőrzés szükséges."
                    : order.paymentStatus === "FAILED" || order.paymentStatus === "CANCELED"
                      ? "A fizetés nem zárult le sikeresen."
                      : "A fizetés visszaigazolására várunk."}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[#f0d8e5] bg-[#fff9fc] p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Összesen</p>
            <p className="mt-3 text-2xl font-semibold text-[#4d2741]">{formatPrice(order.total)}</p>
            <p className="mt-2 text-sm text-[#7a6070]">Részösszeg: {formatPrice(order.subtotal)}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[#f0d8e5] bg-white/90 p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Rendelés állapota</p>
            <p className="mt-3 text-sm font-medium text-[#4d2741]">{customerStatus.label}</p>
            <p className="mt-2 text-sm leading-7 text-[#7a6070]">{customerStatus.detail}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[#f0d8e5] bg-white/90 p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Szállítási követés</p>
            <p className="mt-3 text-sm font-medium text-[#4d2741]">
              {customerStatus.trackingNumber ?? "Még nincs tracking szám"}
            </p>
            <p className="mt-2 text-sm text-[#7a6070]">
              {customerStatus.shippingMethodLabel
                ? `Szállítási mód: ${customerStatus.shippingMethodLabel}`
                : "A szállítási mód hamarosan frissül."}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[#f0d8e5] bg-white/90 p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Utolsó frissítés</p>
            <p className="mt-3 text-sm font-medium text-[#4d2741]">
              {customerStatus.lastUpdatedLabel ?? "Még nincs fulfillment frissítés"}
            </p>
            <p className="mt-2 text-sm text-[#7a6070]">
              Ha új státusz vagy tracking szám kerül a rendeléshez, itt fog megjelenni.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {order.items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 rounded-[1.6rem] border border-[#f0d8e5] bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="h-20 w-20 rounded-[1.2rem] object-cover"
                  />
                ) : null}
                <div>
                  <Link
                    href={`/product/${item.productSlug}`}
                    className="text-lg font-semibold text-[#4d2741]"
                  >
                    {item.productName}
                  </Link>
                  <p className="mt-1 text-sm text-[#7a6070]">{item.quantity} db</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-sm text-[#7a6070]">Egységár</p>
                <p className="mt-1 text-lg font-semibold text-[#4d2741]">
                  {formatPrice(item.unitPrice)}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-[1.6rem] border border-[#f0d8e5] bg-white/90 p-4">
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
            <input type="hidden" name="redirectTo" value={`/orders/${order.id}`} />
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
      </section>
    </AccountShell>
  );
}
