import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { reorderAction } from "@/app/(storefront)/account/actions";
import { AccountShell } from "@/components/account/AccountShell";
import { EmptyStateCard } from "@/components/account/EmptyStateCard";
import {
  formatDate,
  getOrdersForUser,
  type OrderPreviewItem,
  type OrderSummary,
} from "@/lib/account";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/catalog";
import { getCustomerOrderStatusView } from "@/lib/order-status";

export default async function OrdersPage() {
  const user = await requireUser("/orders");
  const orders = await getOrdersForUser(user.id);

  return (
    <AccountShell
      title="Rendeléseim"
      description="Minden korábbi rendelésed egy rendezett, könnyen átnézhető listában."
      currentPath="/orders"
    >
      {orders.length === 0 ? (
        <EmptyStateCard
          icon={ShoppingBag}
          eyebrow="Még nincs rendelés"
          title="Az első rendelésed után itt látod a részleteket"
          description="A rendelések státuszát, azonosítóját és a termékek előnézetét is itt követheted majd."
          actionHref="/"
          actionLabel="Termékek böngészése"
        />
      ) : (
        <section className="w-full bg-white">
          <div className="divide-y divide-[#eee7ea]">
            {orders.map((order: OrderSummary) => {
              const customerStatus = getCustomerOrderStatusView({
                status: order.status,
                paymentStatus: order.paymentStatus,
                internalStatus: order.internalStatus,
                trackingNumber: order.trackingNumber,
                shippingMethod: order.shippingMethod,
                statusUpdatedAt: order.statusUpdatedAt,
              });

              return (
                <article key={order.id} className="px-4 py-5 sm:px-8 sm:py-7">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-[#b3a0aa]">
                          {order.orderNumber}
                        </p>

                        <span className="inline-flex w-fit items-center rounded-full bg-[#f7f4f5] px-3 py-1 text-xs font-medium text-[#5e4d57]">
                          {customerStatus.label}
                        </span>

                        <p className="text-sm text-[#7a6872]">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#7a6872]">
                        <p>{customerStatus.detail}</p>
                        {customerStatus.shippingMethodLabel ? (
                          <p>Szállítás: {customerStatus.shippingMethodLabel}</p>
                        ) : null}
                        {customerStatus.trackingNumber ? (
                          <p>Tracking: {customerStatus.trackingNumber}</p>
                        ) : null}
                        {customerStatus.lastUpdatedLabel ? (
                          <p>Frissítve: {customerStatus.lastUpdatedLabel}</p>
                        ) : null}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2.5">
                        {order.items.map((item: OrderPreviewItem) => (
                          <div
                            key={item.id}
                            className="flex min-w-0 items-center gap-3 rounded-full border border-[#ebe4e8] bg-white px-3 py-2"
                          >
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f6f3f4] text-[#9f7489]">
                                <ShoppingBag className="h-4 w-4" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[#2d1f28]">
                                {item.productName}
                              </p>
                              <p className="text-xs text-[#7a6872]">
                                {item.quantity} db
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-4 xl:min-w-[220px] xl:items-end">
                      <div className="xl:text-right">
                        <p className="text-sm text-[#7a6872]">Végösszeg</p>
                        <p className="mt-1 text-lg font-semibold text-[#2d1f28]">
                          {formatPrice(order.total)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <form action={reorderAction}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <button
                            type="submit"
                            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#f183bc] px-4 text-sm font-medium text-white transition hover:bg-[#ea6fb0]"
                          >
                            Újrarendelés
                          </button>
                        </form>

                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#e6dde1] bg-white px-4 text-sm font-medium text-[#5e4d57] transition hover:border-[#d8c7cf] hover:bg-[#fcfbfc]"
                        >
                          Részletek
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </AccountShell>
  );
}
