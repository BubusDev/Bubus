import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderPaymentStatus } from "@prisma/client";

import { AdminShell } from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/catalog";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Vásárló részletei - Chicks Jewelry Admin",
  description: "Read-only admin vásárlói detail oldal.",
  robots: { index: false, follow: false },
};

type AdminCustomerDetailPageProps = {
  params: Promise<{ id: string }>;
};

const ORDER_HISTORY_LIMIT = 25;
const FAVOURITE_LIMIT = 10;
const ACTIVITY_LIMIT = 8;

function formatDateTime(value: Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function shortId(id: string) {
  return id.slice(0, 8);
}

function Badge({ children, tone = "neutral" }: { children: string; tone?: "good" | "warn" | "neutral" | "blue" }) {
  const className =
    tone === "good"
      ? "border-[#bdd7c8] bg-[#f6fbf7] text-[#24533a]"
      : tone === "warn"
        ? "border-[#ead6a7] bg-[#fff9e8] text-[#765b18]"
        : tone === "blue"
          ? "border-[#c6d8f0] bg-[#f4f8ff] text-[#24579f]"
          : "border-[var(--admin-line-100)] bg-white text-[var(--admin-ink-600)]";

  return (
    <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-medium ${className}`}>
      {children}
    </span>
  );
}

function SummaryCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <section className="admin-panel p-5">
      <p className="admin-eyebrow">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--admin-ink-900)]">{value}</p>
      <p className="mt-2 text-sm text-[var(--admin-ink-600)]">{helper}</p>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="admin-eyebrow">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-[var(--admin-ink-900)]">{value}</p>
    </div>
  );
}

export default async function AdminCustomerDetailPage({ params }: AdminCustomerDetailPageProps) {
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerifiedAt: true,
      earlyAccess: true,
      profileImageUrl: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          favourites: true,
          promoCodeGrants: true,
          promoCodeRedemptions: true,
        },
      },
    },
  });

  if (!user) notFound();

  const [
    totalOrderCount,
    orderPaymentStats,
    paidOrderStats,
    orderHistory,
    favourites,
    promoGrants,
    promoRedemptions,
    returnStats,
    recentReturns,
  ] = await Promise.all([
    db.order.count({ where: { userId: user.id } }),
    db.order.groupBy({
      by: ["paymentStatus"],
      where: { userId: user.id },
      _count: { _all: true },
    }),
    db.order.aggregate({
      where: { userId: user.id, paymentStatus: OrderPaymentStatus.PAID },
      _count: { _all: true },
      _sum: { total: true },
      _max: { createdAt: true },
    }),
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: ORDER_HISTORY_LIMIT,
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        status: true,
        internalStatus: true,
        paymentStatus: true,
        total: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
    }),
    db.favourite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: FAVOURITE_LIMIT,
      select: {
        id: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    }),
    db.promoCodeGrant.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: ACTIVITY_LIMIT,
      select: {
        id: true,
        source: true,
        cycle: true,
        createdAt: true,
        promoCode: {
          select: {
            code: true,
            isActive: true,
          },
        },
      },
    }),
    db.promoCodeRedemption.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: ACTIVITY_LIMIT,
      select: {
        id: true,
        discountAmount: true,
        createdAt: true,
        promoCode: {
          select: {
            code: true,
            isActive: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
          },
        },
      },
    }),
    db.returnRequest.groupBy({
      by: ["status", "refundStatus"],
      where: { order: { userId: user.id } },
      _count: { _all: true },
    }),
    db.returnRequest.findMany({
      where: { order: { userId: user.id } },
      orderBy: { createdAt: "desc" },
      take: ACTIVITY_LIMIT,
      select: {
        id: true,
        status: true,
        refundStatus: true,
        refundFailureReason: true,
        createdAt: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
          },
        },
      },
    }),
  ]);

  const paidOrderCount = paidOrderStats._count._all;
  const totalPaidRevenue = paidOrderStats._sum.total ?? 0;
  const averagePaidOrderValue = paidOrderCount > 0 ? Math.round(totalPaidRevenue / paidOrderCount) : 0;
  const canceledOrderCount =
    orderPaymentStats.find((stat) => stat.paymentStatus === OrderPaymentStatus.CANCELED)?._count._all ?? 0;
  const refundedReturnCount = returnStats
    .filter((stat) => stat.refundStatus === "succeeded")
    .reduce((sum, stat) => sum + stat._count._all, 0);
  const openReturnCount = returnStats
    .filter((stat) => stat.status !== "completed" && stat.status !== "rejected")
    .reduce((sum, stat) => sum + stat._count._all, 0);
  const failedRefundCount = returnStats
    .filter((stat) => stat.refundStatus === "failed")
    .reduce((sum, stat) => sum + stat._count._all, 0);
  const returnRequestCount = returnStats.reduce((sum, stat) => sum + stat._count._all, 0);
  const promoActivity = [
    ...promoGrants.map((grant) => ({
      id: `grant-${grant.id}`,
      type: "Grant",
      code: grant.promoCode.code,
      status: grant.promoCode.isActive ? "Active code" : "Inactive code",
      detail: grant.cycle ? `${grant.source} · ${grant.cycle}` : grant.source,
      createdAt: grant.createdAt,
      href: null,
    })),
    ...promoRedemptions.map((redemption) => ({
      id: `redemption-${redemption.id}`,
      type: "Redemption",
      code: redemption.promoCode.code,
      status: `Discount: ${formatPrice(redemption.discountAmount)}`,
      detail: redemption.order.orderNumber,
      createdAt: redemption.createdAt,
      href: `/admin/orders/${redemption.order.id}`,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, ACTIVITY_LIMIT);

  return (
    <AdminShell
      title={user.name || "Név nélküli vásárló"}
      description="Read-only customer detail. Ezen az oldalon nincs role edit, törlés, impersonation vagy auth állapot módosítás."
      actions={
        <Link href="/admin/customers" className="admin-button-secondary admin-control-md">
          Vissza a vásárlókhoz
        </Link>
      }
    >
      <div className="space-y-6">
        <section className="admin-panel p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-[var(--admin-line-100)] bg-[#f4f7fb]">
              {user.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt={user.name || user.email}
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-[var(--admin-ink-500)]">
                  {(user.name || user.email).slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-wrap gap-1.5">
                <Badge tone={user.role === "ADMIN" ? "blue" : "neutral"}>{user.role}</Badge>
                <Badge tone={user.emailVerifiedAt ? "good" : "warn"}>
                  {user.emailVerifiedAt ? "Verified email" : "Unverified email"}
                </Badge>
                <Badge tone={user.earlyAccess ? "good" : "neutral"}>
                  {user.earlyAccess ? "Early access" : "No early access"}
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Field label="Name" value={user.name || "-"} />
                <Field label="Email" value={user.email} />
                <Field label="Created" value={formatDateTime(user.createdAt)} />
                <Field label="Updated" value={formatDateTime(user.updatedAt)} />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <SummaryCard label="Összes rendelés" value={String(totalOrderCount)} helper="Userhez kötött rendelések" />
          <SummaryCard label="Paid orders" value={String(paidOrderCount)} helper="Csak PAID paymentStatus" />
          <SummaryCard
            label="Cancelled/refunded"
            value={String(canceledOrderCount + refundedReturnCount)}
            helper={`${canceledOrderCount} cancelled, ${refundedReturnCount} refunded return`}
          />
          <SummaryCard label="Paid revenue" value={formatPrice(totalPaidRevenue)} helper="Sikertelen/unpaid nélkül" />
          <SummaryCard label="Average paid" value={formatPrice(averagePaidOrderValue)} helper="Paid átlag kosárérték" />
          <SummaryCard label="Last paid" value={formatDateTime(paidOrderStats._max.createdAt)} helper="Utolsó fizetett rendelés" />
        </div>

        <section className="admin-table-shell overflow-hidden">
          <div className="border-b border-[var(--admin-line-100)] px-4 py-3">
            <p className="admin-eyebrow">Order history</p>
            <p className="mt-1 text-sm text-[var(--admin-ink-600)]">
              Utolsó {ORDER_HISTORY_LIMIT} rendelés, időrendben visszafelé.
            </p>
          </div>
          {orderHistory.length === 0 ? (
            <div className="admin-panel-soft px-4 py-8 text-center text-sm text-[var(--admin-ink-500)]">
              Ennél a vásárlónál még nincs rendelés.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="admin-table-head">
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Dátum</th>
                    <th className="px-4 py-3 font-medium">Order status</th>
                    <th className="px-4 py-3 font-medium">Payment</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Items</th>
                    <th className="px-4 py-3 font-medium">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {orderHistory.map((order) => (
                    <tr key={order.id} className="admin-table-row">
                      <td className="px-4 py-3 font-mono text-xs text-[var(--admin-ink-700)]">
                        {order.orderNumber || shortId(order.id)}
                      </td>
                      <td className="px-4 py-3 text-[var(--admin-ink-600)]">{formatDateTime(order.createdAt)}</td>
                      <td className="px-4 py-3 text-[var(--admin-ink-700)]">{order.internalStatus || order.status}</td>
                      <td className="px-4 py-3">
                        <Badge tone={order.paymentStatus === OrderPaymentStatus.PAID ? "good" : "neutral"}>
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--admin-ink-900)]">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3 text-[var(--admin-ink-600)]">{order._count.items}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="admin-table-link font-medium hover:underline">
                          Rendelés
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="admin-panel p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="admin-eyebrow">Favourite products</p>
                <p className="mt-1 text-sm text-[var(--admin-ink-600)]">{user._count.favourites} kedvenc összesen</p>
              </div>
            </div>
            {favourites.length === 0 ? (
              <div className="admin-panel-soft px-4 py-8 text-center text-sm text-[var(--admin-ink-500)]">
                Ennél a vásárlónál még nincs kedvenc termék.
              </div>
            ) : (
              <div className="divide-y divide-[#eef2f7]">
                {favourites.map((favourite) => (
                  <div key={favourite.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/products/${favourite.product.id}/edit`}
                        className="admin-table-link truncate font-medium hover:underline"
                      >
                        {favourite.product.name}
                      </Link>
                      <p className="mt-1 text-xs text-[var(--admin-ink-500)]">
                        {favourite.product.status} · {formatDateTime(favourite.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-panel p-5">
            <p className="admin-eyebrow">Promo / coupon activity</p>
            <p className="mt-1 text-sm text-[var(--admin-ink-600)]">
              {user._count.promoCodeGrants} grant, {user._count.promoCodeRedemptions} redemption
            </p>
            {promoActivity.length === 0 ? (
              <div className="admin-panel-soft mt-4 px-4 py-8 text-center text-sm text-[var(--admin-ink-500)]">
                Ennél a vásárlónál még nincs promo aktivitás.
              </div>
            ) : (
              <div className="mt-4 divide-y divide-[#eef2f7]">
                {promoActivity.map((activity) => (
                  <div key={activity.id} className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={activity.type === "Redemption" ? "good" : "blue"}>{activity.type}</Badge>
                      <span className="font-mono text-sm font-medium text-[var(--admin-ink-900)]">{activity.code}</span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--admin-ink-700)]">{activity.status}</p>
                    <p className="mt-1 text-xs text-[var(--admin-ink-500)]">
                      {activity.href ? (
                        <Link href={activity.href} className="admin-table-link hover:underline">
                          {activity.detail}
                        </Link>
                      ) : (
                        activity.detail
                      )}{" "}
                      · {formatDateTime(activity.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="admin-panel p-5">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="admin-eyebrow">Returns</p>
              <p className="mt-2 text-xl font-semibold text-[var(--admin-ink-900)]">{returnRequestCount}</p>
              <p className="mt-1 text-sm text-[var(--admin-ink-600)]">User rendeléseihez kötve</p>
            </div>
            <div>
              <p className="admin-eyebrow">Open returns</p>
              <p className="mt-2 text-xl font-semibold text-[var(--admin-ink-900)]">{openReturnCount}</p>
              <p className="mt-1 text-sm text-[var(--admin-ink-600)]">Nem completed/rejected</p>
            </div>
            <div>
              <p className="admin-eyebrow">Failed refund</p>
              <p className="mt-2 text-xl font-semibold text-[var(--admin-ink-900)]">{failedRefundCount}</p>
              <p className="mt-1 text-sm text-[var(--admin-ink-600)]">refundStatus = failed</p>
            </div>
          </div>
          {recentReturns.length === 0 ? (
            <div className="admin-panel-soft px-4 py-8 text-center text-sm text-[var(--admin-ink-500)]">
              Ennél a vásárlónál még nincs return request.
            </div>
          ) : (
            <div className="divide-y divide-[#eef2f7]">
              {recentReturns.map((request) => (
                <div key={request.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link href={`/admin/returns/${request.id}`} className="admin-table-link font-medium hover:underline">
                      Return {shortId(request.id)}
                    </Link>
                    <p className="mt-1 text-xs text-[var(--admin-ink-500)]">
                      {request.order.orderNumber} · {formatDateTime(request.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge>{request.status}</Badge>
                    <Badge tone={request.refundStatus === "failed" ? "warn" : "neutral"}>{request.refundStatus}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
