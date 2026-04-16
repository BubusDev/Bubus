import Link from "next/link";
import { notFound } from "next/navigation";

import {
  reconcileReturnRequestRefundAction,
  triggerReturnRequestRefundAction,
  updateReturnRequestAction,
  updateReturnRequestAssignmentAction,
} from "@/app/(admin)/admin/returns/actions";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  returnRefundStatusConfig,
  returnRequestStatusConfig,
  returnRequestStatuses,
} from "@/lib/admin-order-workflow";
import { formatPrice } from "@/lib/catalog";
import { db } from "@/lib/db";

export default async function AdminReturnRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ refund?: string }>;
}) {
  const { id } = await params;
  const { refund } = await searchParams;

  const [request, admins] = await Promise.all([
    db.returnRequest.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        history: {
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

  if (!request) {
    notFound();
  }

  const cfg = returnRequestStatusConfig[request.status] ?? returnRequestStatusConfig.new;
  const refundCfg = returnRefundStatusConfig[request.refundStatus] ?? returnRefundStatusConfig.not_refunded;
  const customerEmail = request.order.user?.email ?? request.order.guestEmail ?? request.requesterEmail;
  const refundFeedback =
    refund === "done"
      ? "A visszatérítés elindult vagy sikeresen rögzítésre került a Stripe-ban."
      : refund === "reconciled"
        ? "A Stripe visszatérítés állapota frissítve lett, és a kérelem refund mezői szinkronban vannak."
        : refund === "still_pending"
          ? "A Stripe szerint a visszatérítés továbbra is függőben van."
          : refund === "reconcile_error"
            ? "A Stripe állapotlekérdezés most nem sikerült, ezért a helyi refund állapot nem változott."
      : refund === "failed"
        ? "A visszatérítés nem sikerült. Ellenőrizd a Stripe állapotot és próbáld újra."
        : refund === "duplicate"
          ? "Ehhez a kérelemhez már folyamatban van vagy rögzítve lett visszatérítés."
          : refund === "invalid"
            ? "A visszatérítés ehhez a kérelemhez most nem indítható."
            : null;
  const canTriggerRefund =
    (request.status === "approved" || request.status === "completed") &&
    request.order.paymentStatus === "PAID" &&
    Boolean(request.order.stripePaymentIntentId) &&
    request.refundStatus !== "pending" &&
    request.refundStatus !== "succeeded" &&
    !request.stripeRefundId;

  return (
    <AdminShell
      title={`Visszaküldési kérelem — ${request.id.slice(0, 8)}`}
      actions={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/admin/orders/${request.order.id}`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#e8e5e0] px-4 text-sm font-medium text-[#1a1a1a] transition hover:bg-[#faf9f7]"
          >
            Kapcsolódó rendelés
          </Link>
          <Link
            href="/admin/returns"
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#e8e5e0] px-4 text-sm font-medium text-[#1a1a1a] transition hover:bg-[#faf9f7]"
          >
            Összes kérelem
          </Link>
        </div>
      }
    >
      {refundFeedback ? (
        <div className="mb-4 rounded-[1.2rem] border border-[#e8e5e0] bg-white px-4 py-3 text-sm text-[#6b425a]">
          {refundFeedback}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="border border-[#e8e5e0] bg-white p-5">
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[.14em] text-[#888]">Kérelem részletei</h2>
            <div className="space-y-3 text-sm text-[#1a1a1a]">
              <div>
                <p className="text-[11px] text-[#888]">Rövid ok</p>
                <p className="font-medium">{request.reason?.trim() || "Nincs megadva"}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#888]">Leírás</p>
                <p className="whitespace-pre-wrap leading-7 text-[#555]">{request.details}</p>
              </div>
            </div>
          </section>

          <section className="border border-[#e8e5e0] bg-white p-5">
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[.14em] text-[#888]">Kapcsolódó rendelés</h2>
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap justify-between gap-3">
                <span className="text-[#888]">Rendelésszám</span>
                <Link href={`/admin/orders/${request.order.id}`} className="font-medium text-[#1a1a1a] hover:underline">
                  {request.order.orderNumber}
                </Link>
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <span className="text-[#888]">Vásárló</span>
                <span className="font-medium text-[#1a1a1a]">{request.order.shippingName}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <span className="text-[#888]">E-mail</span>
                <span className="font-medium text-[#1a1a1a]">{customerEmail}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <span className="text-[#888]">Stripe payment</span>
                <span className="font-mono text-[12px] text-[#1a1a1a]">
                  {request.order.stripePaymentIntentId ?? "Nincs Stripe payment intent"}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="border border-[#e8e5e0] bg-white p-5">
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[.14em] text-[#888]">Visszatérítés / pénzügy</h2>
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-[11px] text-[#888]">Refund státusz</p>
                <span
                  className="inline-flex items-center px-2.5 py-1 text-[12px] font-medium"
                  style={{ background: refundCfg.bg, color: refundCfg.color, border: `1px solid ${refundCfg.border}` }}
                >
                  {refundCfg.label}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border border-[#f0eeec] bg-[#faf9f7] p-3 text-[13px]">
                  <p className="text-[11px] text-[#888]">Refund összeg</p>
                  <p className="mt-1 font-medium text-[#1a1a1a]">
                    {request.refundedAmount ? formatPrice(request.refundedAmount) : "Még nincs rögzítve"}
                  </p>
                </div>
                <div className="border border-[#f0eeec] bg-[#faf9f7] p-3 text-[13px]">
                  <p className="text-[11px] text-[#888]">Refund azonosító</p>
                  <p className="mt-1 break-all font-mono text-[12px] text-[#1a1a1a]">
                    {request.stripeRefundId ?? "Még nincs"}
                  </p>
                </div>
                <div className="border border-[#f0eeec] bg-[#faf9f7] p-3 text-[13px]">
                  <p className="text-[11px] text-[#888]">Refundálva</p>
                  <p className="mt-1 font-medium text-[#1a1a1a]">
                    {request.refundedAt ? new Date(request.refundedAt).toLocaleString("hu-HU") : "Még nincs"}
                  </p>
                </div>
                <div className="border border-[#f0eeec] bg-[#faf9f7] p-3 text-[13px]">
                  <p className="text-[11px] text-[#888]">Hiba / megjegyzés</p>
                  <p className="mt-1 text-[#1a1a1a]">{request.refundFailureReason ?? "Nincs"}</p>
                </div>
              </div>

              <form action={triggerReturnRequestRefundAction} className="space-y-3 border border-[#f0eeec] bg-[#faf9f7] p-4">
                <input type="hidden" name="requestId" value={request.id} />
                <label className="block">
                  <span className="mb-1 block text-[11px] text-[#888]">Refund összeg (Ft)</span>
                  <input
                    type="number"
                    min={1}
                    max={request.order.total}
                    step={1}
                    name="refundAmount"
                    defaultValue={request.order.total}
                    disabled={!canTriggerRefund}
                    className="w-full border border-[#d0ccc8] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] outline-none disabled:cursor-not-allowed disabled:bg-[#f3f1ee]"
                  />
                </label>
                <p className="text-[12px] text-[#666]">
                  Teljes visszatérítéshez hagyd az eredeti rendelési összeget: {formatPrice(request.order.total)}.
                </p>
                <button
                  type="submit"
                  disabled={!canTriggerRefund}
                  className="w-full rounded-full bg-[#1a1a1a] py-2.5 text-[13px] font-medium text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#c8c3be]"
                >
                  Refund indítása Stripe-ban
                </button>
              </form>

              {request.refundStatus === "pending" && request.stripeRefundId ? (
                <form action={reconcileReturnRequestRefundAction} className="border border-[#f0eeec] bg-white p-4">
                  <input type="hidden" name="requestId" value={request.id} />
                  <p className="mb-3 text-[12px] text-[#666]">
                    A Stripe visszatérítés még függőben van. Itt kézzel újraellenőrizhető a végső állapot.
                  </p>
                  <button
                    type="submit"
                    className="w-full rounded-full border border-[#d0ccc8] bg-white py-2.5 text-[13px] font-medium text-[#1a1a1a] transition hover:bg-[#faf9f7]"
                  >
                    Stripe refund állapot frissítése
                  </button>
                </form>
              ) : null}
            </div>
          </section>

          <section className="border border-[#e8e5e0] bg-white p-5">
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[.14em] text-[#888]">Workflow kezelés</h2>
            <div className="mb-4">
              <p className="mb-1.5 text-[11px] text-[#888]">Jelenlegi státusz</p>
              <span
                className="inline-flex items-center px-2.5 py-1 text-[12px] font-medium"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
              >
                {cfg.label}
              </span>
            </div>

            <form action={updateReturnRequestAction} className="space-y-3">
              <input type="hidden" name="requestId" value={request.id} />
              <label className="block">
                <span className="mb-1 block text-[11px] text-[#888]">Státusz</span>
                <select
                  name="status"
                  defaultValue={request.status}
                  className="w-full border border-[#d0ccc8] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a]"
                >
                  {returnRequestStatuses.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] text-[#888]">Admin megjegyzés</span>
                <textarea
                  name="adminNote"
                  rows={5}
                  defaultValue={request.adminNote ?? ""}
                  className="w-full border border-[#d0ccc8] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] text-[#888]">Lezárás / döntés</span>
                <textarea
                  name="resolution"
                  rows={4}
                  defaultValue={request.resolution ?? ""}
                  placeholder="Pl. jóváhagyva, visszaküldési cím megküldve / elutasítva indoklással"
                  className="w-full border border-[#d0ccc8] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a]"
                />
              </label>

              <button
                type="submit"
                className="w-full bg-[#1a1a1a] py-2.5 text-[13px] font-medium text-white transition hover:bg-[#333]"
              >
                Kérelem frissítése
              </button>
            </form>
          </section>

          <section className="border border-[#e8e5e0] bg-white p-5">
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[.14em] text-[#888]">Felelős kijelölése</h2>
            <form action={updateReturnRequestAssignmentAction} className="space-y-3">
              <input type="hidden" name="requestId" value={request.id} />
              <label className="block">
                <span className="mb-1 block text-[11px] text-[#888]">Admin tulajdonos</span>
                <select
                  name="assignedToId"
                  defaultValue={request.assignedTo?.id ?? ""}
                  className="w-full border border-[#d0ccc8] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a]"
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
                className="w-full bg-[#1a1a1a] py-2.5 text-[13px] font-medium text-white transition hover:bg-[#333]"
              >
                Felelős mentése
              </button>
            </form>
          </section>

          <section className="border border-[#e8e5e0] bg-white p-5">
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[.14em] text-[#888]">Meta</h2>
            <div className="space-y-2 text-[13px]">
              <div className="flex flex-wrap justify-between gap-3">
                <span className="text-[#888]">Azonosító</span>
                <span className="font-mono text-[#1a1a1a]">{request.id}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <span className="text-[#888]">Létrehozva</span>
                <span className="font-medium text-[#1a1a1a]">
                  {new Date(request.createdAt).toLocaleString("hu-HU")}
                </span>
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <span className="text-[#888]">Frissítve</span>
                <span className="font-medium text-[#1a1a1a]">
                  {new Date(request.updatedAt).toLocaleString("hu-HU")}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#888]">Felelős</span>
                <span className="font-medium text-[#1a1a1a]">
                  {request.assignedTo?.name?.trim() || request.assignedTo?.email?.trim() || "Nincs kijelölve"}
                </span>
              </div>
            </div>
          </section>

          <section className="border border-[#e8e5e0] bg-white p-5">
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[.14em] text-[#888]">Workflow előzmények</h2>
            {request.history.length === 0 ? (
              <div className="border border-[#f0eeec] bg-[#faf9f7] p-4 text-sm text-[#666]">
                Ehhez a kérelemhez még nincs rögzített workflow előzmény.
              </div>
            ) : (
              <div className="space-y-3">
                {request.history.map((entry) => (
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
                          Módosította: {entry.changedBy?.name ?? entry.changedBy?.email ?? "ismeretlen admin"}
                        </p>
                        {entry.refundChanged ? (
                          <p className="mt-1 text-[12px] text-[#666]">
                            Refund: {entry.previousRefundStatus ?? "nincs"} {"->"} {entry.newRefundStatus ?? "nincs"}
                            {entry.refundedAmount ? ` · ${formatPrice(entry.refundedAmount)}` : ""}
                            {entry.stripeRefundId ? ` · ${entry.stripeRefundId}` : ""}
                          </p>
                        ) : null}
                        {entry.assignmentChanged ? (
                          <p className="mt-1 text-[12px] text-[#666]">
                            Státusz ekkor: {entry.newStatus}
                          </p>
                        ) : null}
                        <p className="mt-1 text-[12px] text-[#666]">
                          {entry.adminNoteChanged ? "Admin megjegyzés változott" : "Admin megjegyzés nem változott"}
                          {" · "}
                          {entry.resolutionChanged ? "Lezárás változott" : "Lezárás nem változott"}
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
      </div>
    </AdminShell>
  );
}
