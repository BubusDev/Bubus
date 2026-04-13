import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/catalog";
import {
  resendOrderStatusUpdateEmailAction,
  updateOrderAssignmentAction,
  updateOrderInternalStatusAction,
} from "@/app/(admin)/admin/orders/actions";
import { getOrderStatusUpdateEmailAdminState } from "@/lib/order-status-email";
import {
  internalOrderStatuses,
  orderStatusConfig,
  returnRequestStatusConfig,
} from "@/lib/admin-order-workflow";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [orderRaw, statusEmail, admins] = await Promise.all([
    db.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: {
            select: { slug: true, images: { where: { isCover: true }, take: 1 } },
          },
        },
      },
      returnRequests: {
        orderBy: {
          createdAt: "desc",
        },
      },
      workflowHistory: {
        orderBy: {
          changedAt: "desc",
        },
        include: {
          changedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    }),
    getOrderStatusUpdateEmailAdminState(id),
    db.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  if (!orderRaw) notFound();
  const order = orderRaw;

  const cfg = orderStatusConfig[order.internalStatus] ?? orderStatusConfig.received;
  const statusLabel = internalOrderStatuses.find((s) => s.value === order.internalStatus)?.label ?? order.internalStatus;

  return (
    <AdminShell title={`Rendelés — ${order.orderNumber}`}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Bal oszlop */}
        <div className="space-y-5">
          {/* Vevő adatok */}
          <section className="border border-[#e8e5e0] bg-white p-5">
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[.14em] text-[#888]">Vevő adatai</h2>
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
                <p className="text-[11px] text-[#888]">Felelős</p>
                <p className="font-medium text-[#1a1a1a]">
                  {order.assignedTo?.name?.trim() || order.assignedTo?.email?.trim() || "Nincs kijelölve"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#888]">Szállítási cím</p>
                <p className="font-medium text-[#1a1a1a]">{order.shippingAddress}</p>
              </div>
            </div>
          </section>

          <section className="border border-[#e8e5e0] bg-white p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[11px] font-medium uppercase tracking-[.14em] text-[#888]">Visszaküldési kérelmek</h2>
                <p className="mt-2 text-sm text-[#555]">
                  Az ehhez a rendeléshez kapcsolódó kérelmek gyors áttekintése.
                </p>
              </div>
              <Link
                href="/admin/returns"
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#e8e5e0] px-4 text-[13px] font-medium text-[#1a1a1a] transition hover:bg-[#faf9f7]"
              >
                Összes kérelem
              </Link>
            </div>

            {order.returnRequests.length === 0 ? (
              <div className="border border-[#f0eeec] bg-[#faf9f7] p-4 text-sm text-[#666]">
                Ehhez a rendeléshez még nem érkezett visszaküldési kérelem.
              </div>
            ) : (
              <div className="space-y-3">
                {order.returnRequests.map((request) => {
                  const requestCfg = returnRequestStatusConfig[request.status] ?? returnRequestStatusConfig.new;

                  return (
                    <Link
                      key={request.id}
                      href={`/admin/returns/${request.id}`}
                      className="block border border-[#f0eeec] bg-[#faf9f7] p-4 transition hover:border-[#dfc3d2] hover:bg-white"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-[11px] uppercase tracking-[.16em] text-[#888]">
                            {new Date(request.createdAt).toLocaleDateString("hu-HU")}
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#1a1a1a]">
                            {request.reason?.trim() || "Nincs rövid ok megadva"}
                          </p>
                          <p className="mt-1 text-[13px] text-[#666]">
                            {request.requesterEmail}
                          </p>
                        </div>
                        <span
                          className="inline-flex items-center px-2.5 py-1 text-[12px] font-medium"
                          style={{
                            background: requestCfg.bg,
                            color: requestCfg.color,
                            border: `1px solid ${requestCfg.border}`,
                          }}
                        >
                          {requestCfg.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Rendelt termékek */}
          <section className="border border-[#e8e5e0] bg-white">
            <h2 className="border-b border-[#e8e5e0] px-5 py-3 text-[11px] font-medium uppercase tracking-[.14em] text-[#888]">
              Rendelt termékek
            </h2>
            <div className="divide-y divide-[#f0eeec]">
              {order.items.map((item) => {
                const coverImg = item.product.images[0];
                return (
                  <div key={item.id} className="flex items-center gap-4 px-4 py-4 sm:px-5">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden bg-[#f5f3f0]">
                      {coverImg && (
                        <img
                          src={coverImg.url}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#1a1a1a]">{item.productName}</p>
                      <p className="text-[12px] text-[#888]">×{item.quantity}</p>
                    </div>
                    <p className="shrink-0 text-right font-medium text-[#1a1a1a]">
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
            <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[.14em] text-[#888]">Felelős kijelölése</h2>
            <form action={updateOrderAssignmentAction} className="space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <label className="block">
                <span className="mb-1 block text-[11px] text-[#888]">Admin tulajdonos</span>
                <select
                  name="assignedToId"
                  defaultValue={order.assignedTo?.id ?? ""}
                  className="w-full border border-[#d0ccc8] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] outline-none transition focus:border-[#1a1a1a]"
                >
                  <option value="">Nincs kijelölve</option>
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name} {admin.email ? `(${admin.email})` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="min-h-10 w-full bg-[#1a1a1a] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#333] sm:w-auto"
              >
                Felelős mentése
              </button>
            </form>
          </section>

          <section className="border border-[#e8e5e0] bg-white p-5">
            <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[.14em] text-[#888]">Belső megjegyzés</h2>
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
                className="mt-2 min-h-10 w-full bg-[#1a1a1a] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#333] sm:w-auto"
              >
                Megjegyzés mentése
              </button>
            </form>
          </section>

          {/* Status update email preview */}
          <section className="border border-[#e8e5e0] bg-white p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[11px] font-medium uppercase tracking-[.14em] text-[#888]">Státusz email műveletek</h2>
                <p className="mt-2 text-sm text-[#555]">
                  Az aktuális customer-facing állapothoz tartozó email előnézete és küldési állapota.
                </p>
              </div>
              <form action={resendOrderStatusUpdateEmailAction}>
                <input type="hidden" name="orderId" value={order.id} />
                <button
                  type="submit"
                  disabled={!statusEmail?.projectedEmailUpdateKey || statusEmail.isSending}
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-full bg-[#1a1a1a] px-4 text-[13px] font-medium text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#c8c3be] sm:w-auto"
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

          <section className="border border-[#e8e5e0] bg-white p-5">
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[.14em] text-[#888]">Workflow előzmények</h2>
            {order.workflowHistory.length === 0 ? (
              <div className="border border-[#f0eeec] bg-[#faf9f7] p-4 text-sm text-[#666]">
                Ehhez a rendeléshez még nincs rögzített workflow előzmény.
              </div>
            ) : (
              <div className="space-y-3">
                {order.workflowHistory.map((entry) => (
                  <div key={entry.id} className="border border-[#f0eeec] bg-[#faf9f7] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        {entry.assignmentChanged ? (
                          <p className="text-sm font-medium text-[#1a1a1a]">
                            Felelős: {entry.previousAssigneeLabel ?? "nincs"} {"->"} {entry.newAssigneeLabel ?? "nincs"}
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-[#1a1a1a]">
                            {entry.previousStatus ?? "nincs"} {"->"} {entry.newStatus}
                          </p>
                        )}
                        <p className="mt-1 text-[12px] text-[#666]">
                          Forrás: {entry.source === "bulk" ? "bulk művelet" : "egyedi frissítés"}
                        </p>
                        {entry.assignmentChanged ? (
                          <p className="mt-1 text-[12px] text-[#666]">
                            Státusz ekkor: {entry.newStatus}
                          </p>
                        ) : null}
                        <p className="mt-1 text-[12px] text-[#666]">
                          Módosította: {entry.changedBy?.name ?? entry.changedBy?.email ?? "ismeretlen admin"}
                        </p>
                      </div>
                      <p className="text-[12px] text-[#888]">
                        {new Date(entry.changedAt).toLocaleString("hu-HU")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Jobb oszlop — státusz kezelés */}
        <div className="space-y-5">
          <section className="border border-[#e8e5e0] bg-white p-5">
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[.14em] text-[#888]">Státusz kezelés</h2>

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
                  {internalOrderStatuses.map((s) => (
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
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[.14em] text-[#888]">Rendelés adatok</h2>
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
                <div key={row.label} className="flex flex-wrap justify-between gap-2 text-[13px]">
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
