import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/catalog";
import {
  resendOrderStatusUpdateEmailAction,
  updateOrderInternalStatusAction,
} from "@/app/admin/orders/actions";
import { getOrderStatusUpdateEmailAdminState } from "@/lib/order-status-email";

// These fields are added via migration — cast until Prisma client is regenerated
type OrderWithManagement = Awaited<ReturnType<typeof db.order.findUnique>> & {
  internalStatus: string;
  trackingNumber: string | null;
  shippingMethod: string | null;
  internalNote: string | null;
  statusUpdatedAt: Date | null;
};

const internalStatuses = [
  { value: "received",      label: "Beérkezett" },
  { value: "in_production", label: "Elkészítés alatt" },
  { value: "packed",        label: "Becsomagolva" },
  { value: "label_ready",   label: "Címke kész" },
  { value: "shipped",       label: "Feladva" },
  { value: "closed",        label: "Lezárva" },
];

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  received:      { bg: "#f0f0f0", color: "#555", border: "#ddd" },
  in_production: { bg: "#fef9e7", color: "#7d6608", border: "#f0d080" },
  packed:        { bg: "#eaf4fb", color: "#1a5276", border: "#a9cce3" },
  label_ready:   { bg: "#e8f8f5", color: "#1e8449", border: "#a9dfbf" },
  shipped:       { bg: "#eafaf1", color: "#145a32", border: "#82e0aa" },
  closed:        { bg: "#f2f3f4", color: "#333", border: "#ccc" },
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [orderRaw, statusEmail] = await Promise.all([
    db.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: {
            select: { slug: true, images: { where: { isCover: true }, take: 1 } },
          },
        },
      },
    },
    }),
    getOrderStatusUpdateEmailAdminState(id),
  ]);

  if (!orderRaw) notFound();

  // Cast to include the new fields added via migration
  const order = orderRaw as OrderWithManagement & typeof orderRaw;

  const cfg = statusColors[order.internalStatus] ?? statusColors.received;
  const statusLabel = internalStatuses.find((s) => s.value === order.internalStatus)?.label ?? order.internalStatus;

  return (
    <AdminShell title={`Rendelés — ${order.orderNumber}`}>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Bal oszlop */}
        <div className="space-y-5">
          {/* Vevő adatok */}
          <section className="border border-[#e8e5e0] bg-white p-5">
            <h2 className="mb-4 text-[10px] uppercase tracking-[.18em] text-[#888]">Vevő adatai</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[11px] text-[#888]">Név</p>
                <p className="font-medium text-[#1a1a1a]">{order.shippingName}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#888]">Telefon</p>
                <p className="font-medium text-[#1a1a1a]">{order.shippingPhone}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#888]">Email</p>
                <p className="font-medium text-[#1a1a1a]">{order.user?.email ?? order.guestEmail ?? "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#888]">Szállítási cím</p>
                <p className="font-medium text-[#1a1a1a]">{order.shippingAddress}</p>
              </div>
            </div>
          </section>

          {/* Rendelt termékek */}
          <section className="border border-[#e8e5e0] bg-white">
            <h2 className="border-b border-[#e8e5e0] px-5 py-3 text-[10px] uppercase tracking-[.18em] text-[#888]">
              Rendelt termékek
            </h2>
            <div className="divide-y divide-[#f0eeec]">
              {order.items.map((item) => {
                const coverImg = item.product.images[0];
                return (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden bg-[#f5f3f0]">
                      {coverImg && (
                        <img
                          src={coverImg.url}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#1a1a1a]">{item.productName}</p>
                      <p className="text-[12px] text-[#888]">×{item.quantity}</p>
                    </div>
                    <p className="font-medium text-[#1a1a1a]">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between border-t border-[#e8e5e0] px-5 py-3">
              <p className="text-[12px] text-[#888]">Végösszeg</p>
              <p className="text-lg font-semibold text-[#1a1a1a]">{formatPrice(order.total)}</p>
            </div>
          </section>

          {/* Belső megjegyzés */}
          <section className="border border-[#e8e5e0] bg-white p-5">
            <h2 className="mb-3 text-[10px] uppercase tracking-[.18em] text-[#888]">Belső megjegyzés</h2>
            <form action={updateOrderInternalStatusAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="internalStatus" value={order.internalStatus} />
              <input type="hidden" name="trackingNumber" value={order.trackingNumber ?? ""} />
              <input type="hidden" name="shippingMethod" value={order.shippingMethod ?? ""} />
              <textarea
                name="internalNote"
                defaultValue={order.internalNote ?? ""}
                rows={4}
                placeholder="Belső megjegyzés a rendeléshez..."
                className="w-full border border-[#d0ccc8] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none transition focus:border-[#1a1a1a]"
              />
              <button
                type="submit"
                className="mt-2 bg-[#1a1a1a] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#333]"
              >
                Megjegyzés mentése
              </button>
            </form>
          </section>

          {/* Status update email preview */}
          <section className="border border-[#e8e5e0] bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[10px] uppercase tracking-[.18em] text-[#888]">Státusz email műveletek</h2>
                <p className="mt-2 text-sm text-[#555]">
                  Az aktuális customer-facing állapothoz tartozó email előnézete és küldési állapota.
                </p>
              </div>
              <form action={resendOrderStatusUpdateEmailAction}>
                <input type="hidden" name="orderId" value={order.id} />
                <button
                  type="submit"
                  disabled={!statusEmail?.projectedEmailUpdateKey || statusEmail.isSending}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[#1a1a1a] px-4 text-[13px] font-medium text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#c8c3be]"
                >
                  Aktuális email újraküldése
                </button>
              </form>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-[#f0eeec] bg-[#faf9f7] p-3 text-[13px]">
                <p className="text-[11px] text-[#888]">Jelenlegi projected státusz</p>
                <p className="mt-1 font-medium text-[#1a1a1a]">{statusEmail?.projectedStatusLabel ?? "—"}</p>
              </div>
              <div className="border border-[#f0eeec] bg-[#faf9f7] p-3 text-[13px]">
                <p className="text-[11px] text-[#888]">Jelenlegi projected email key</p>
                <p className="mt-1 font-mono text-[#1a1a1a]">{statusEmail?.projectedEmailUpdateKey ?? "nincs küldhető email"}</p>
              </div>
              <div className="border border-[#f0eeec] bg-[#faf9f7] p-3 text-[13px]">
                <p className="text-[11px] text-[#888]">Utolsó sikeres email key</p>
                <p className="mt-1 font-mono text-[#1a1a1a]">{statusEmail?.lastStatusUpdateEmailKey ?? "—"}</p>
              </div>
              <div className="border border-[#f0eeec] bg-[#faf9f7] p-3 text-[13px]">
                <p className="text-[11px] text-[#888]">Küldés folyamatban</p>
                <p className="mt-1 font-medium text-[#1a1a1a]">{statusEmail?.isSending ? "Igen" : "Nem"}</p>
              </div>
              <div className="border border-[#f0eeec] bg-[#faf9f7] p-3 text-[13px]">
                <p className="text-[11px] text-[#888]">Aktív sending key</p>
                <p className="mt-1 font-mono text-[#1a1a1a]">{statusEmail?.statusUpdateEmailSendingKey ?? "—"}</p>
              </div>
              <div className="border border-[#f0eeec] bg-[#faf9f7] p-3 text-[13px]">
                <p className="text-[11px] text-[#888]">Utolsó sikeres küldés</p>
                <p className="mt-1 font-medium text-[#1a1a1a]">
                  {statusEmail?.statusUpdateEmailSentAt
                    ? statusEmail.statusUpdateEmailSentAt.toLocaleDateString("hu-HU", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </p>
              </div>
            </div>

            {statusEmail?.preview ? (
              <div className="mt-5">
                <p className="mb-2 text-[11px] text-[#888]">Email tárgy</p>
                <p className="mb-4 font-medium text-[#1a1a1a]">{statusEmail.preview.subject}</p>
                <div
                  className="overflow-hidden border border-[#e8e5e0] bg-[#f6f2ed]"
                  dangerouslySetInnerHTML={{ __html: statusEmail.preview.html }}
                />
              </div>
            ) : (
              <div className="mt-5 border border-[#f0eeec] bg-[#faf9f7] p-4 text-sm text-[#666]">
                A jelenlegi rendelésállapothoz most nem tartozik külön customer status-update email.
              </div>
            )}
          </section>
        </div>

        {/* Jobb oszlop — státusz kezelés */}
        <div className="space-y-5">
          <section className="border border-[#e8e5e0] bg-white p-5">
            <h2 className="mb-4 text-[10px] uppercase tracking-[.18em] text-[#888]">Státusz kezelés</h2>

            {/* Aktuális státusz */}
            <div className="mb-4">
              <p className="mb-1.5 text-[11px] text-[#888]">Jelenlegi státusz</p>
              <span
                className="inline-flex items-center px-2.5 py-1 text-[12px] font-medium"
                style={{
                  background: cfg.bg,
                  color: cfg.color,
                  border: `1px solid ${cfg.border}`,
                }}
              >
                {statusLabel}
              </span>
            </div>

            <form action={updateOrderInternalStatusAction} className="space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="internalNote" value={order.internalNote ?? ""} />

              <label className="block">
                <span className="mb-1 block text-[11px] text-[#888]">Új státusz</span>
                <select
                  name="internalStatus"
                  defaultValue={order.internalStatus}
                  className="w-full border border-[#d0ccc8] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a]"
                >
                  {internalStatuses.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] text-[#888]">Tracking szám</span>
                <input
                  type="text"
                  name="trackingNumber"
                  defaultValue={order.trackingNumber ?? ""}
                  placeholder="pl. GLS1234567890"
                  className="w-full border border-[#d0ccc8] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] text-[#888]">Szállítási mód</span>
                <input
                  type="text"
                  name="shippingMethod"
                  defaultValue={order.shippingMethod ?? ""}
                  placeholder="pl. GLS futár"
                  className="w-full border border-[#d0ccc8] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a]"
                />
              </label>

              <button
                type="submit"
                className="w-full bg-[#1a1a1a] py-2.5 text-[13px] font-medium text-white transition hover:bg-[#333]"
              >
                Státusz frissítése
              </button>
            </form>
          </section>

          {/* Rendelés info */}
          <section className="border border-[#e8e5e0] bg-white p-5">
            <h2 className="mb-4 text-[10px] uppercase tracking-[.18em] text-[#888]">Rendelés adatok</h2>
            <div className="space-y-2">
              {[
                { label: "Rendelésszám", value: order.orderNumber },
                {
                  label: "Leadva",
                  value: new Date(order.createdAt).toLocaleDateString("hu-HU", {
                    year: "numeric", month: "long", day: "numeric",
                  }),
                },
                {
                  label: "Fizetés",
                  value: order.paidAt
                    ? new Date(order.paidAt).toLocaleDateString("hu-HU", {
                        year: "numeric", month: "long", day: "numeric",
                      })
                    : "—",
                },
                { label: "Fizetési mód", value: order.paymentMethod },
                { label: "Összeg", value: formatPrice(order.total) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-2 text-[13px]">
                  <span className="text-[#888]">{row.label}</span>
                  <span className="font-medium text-[#1a1a1a]">{row.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
