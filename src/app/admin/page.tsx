import Link from "next/link";

import { AdminRecentActivityList } from "@/components/admin/AdminRecentActivityList";
import { AdminShell } from "@/components/admin/AdminShell";
import { getRecentAdminActivity } from "@/lib/admin-activity";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/catalog";

const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  received:      { label: "Beérkezett",   bg: "#f0f0f0", color: "#555", border: "#ddd" },
  in_production: { label: "Elkészítés",   bg: "#fef9e7", color: "#7d6608", border: "#f0d080" },
  packed:        { label: "Becsomagolva", bg: "#eaf4fb", color: "#1a5276", border: "#a9cce3" },
  label_ready:   { label: "Címke kész",   bg: "#e8f8f5", color: "#1e8449", border: "#a9dfbf" },
  shipped:       { label: "Feladva",      bg: "#eafaf1", color: "#145a32", border: "#82e0aa" },
  closed:        { label: "Lezárva",      bg: "#f2f3f4", color: "#333",   border: "#ccc" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.received;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  );
}

type OrderWithInternalStatus = any;

export default async function AdminPage() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const [
    productCount,
    todayOrderCount,
    weekOrders,
    pendingOrderCount,
    recentOrders,
    recentActivity,
  ] = await Promise.all([
    db.product.count({ where: { archivedAt: null } }),
    db.order.count({
      where: { paymentStatus: "PAID", createdAt: { gte: todayStart } },
    }),
    db.order.findMany({
      where: { paymentStatus: "PAID", createdAt: { gte: weekStart } },
      select: { total: true },
    }),
    db.order.count({
      where: { paymentStatus: "PAID", internalStatus: { in: ["received", "in_production", "packed", "label_ready"] } } as any,
    }),
    db.order.findMany({
      where: { paymentStatus: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { email: true } } },
    }),
    getRecentAdminActivity(8),
  ]);

  const weekRevenue = weekOrders.reduce((sum, o) => sum + o.total, 0);

  const metrics = [
    { label: "Aktív termékek",    value: productCount,              delta: null },
    { label: "Mai rendelések",    value: todayOrderCount,           delta: todayOrderCount > 0 ? `+${todayOrderCount} ma` : null },
    { label: "Heti bevétel",      value: formatPrice(weekRevenue),  delta: null },
    { label: "Feldolgozás alatt", value: pendingOrderCount,         delta: null },
  ];

  return (
    <AdminShell
      title="Dashboard"
      description={now.toLocaleDateString("hu-HU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      actions={
        <div className="flex gap-2">
          <Link
            href="/admin/products/new"
            className="admin-button-primary h-9 px-4 text-sm"
          >
            + Új termék
          </Link>
          <Link
            href="/admin/orders"
            className="admin-button-secondary h-9 px-4 text-sm"
          >
            Rendelések
          </Link>
        </div>
      }
    >
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 xl:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="admin-panel p-5">
            <p className="mb-2 text-[11px] uppercase tracking-[.18em] text-[var(--admin-ink-500)]">{m.label}</p>
            <p className="text-2xl font-semibold text-[var(--admin-ink-900)]">{m.value}</p>
            {m.delta && <p className="text-xs text-[#16a34a] mt-1">{m.delta}</p>}
          </div>
        ))}
      </div>

      {/* Recent orders table */}
      <div className="admin-table-shell">
        <div className="flex items-center justify-between border-b border-[var(--admin-line-100)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--admin-ink-900)]">Legutóbbi rendelések</h2>
          <Link
            href="/admin/orders"
            className="admin-inline-link text-xs"
          >
            Összes →
          </Link>
        </div>

        <table className="w-full">
          <thead>
            <tr className="admin-table-head">
              {["#", "Vevő", "Összeg", "Státusz", "Dátum"].map((col) => (
                <th
                  key={col}
                  className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[.15em] text-[var(--admin-ink-500)]"
                >
                  {col}
                </th>
              ))}
              <th className="px-5 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-[var(--admin-ink-500)]">
                  Még nincs fizetett rendelés.
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr key={order.id} className="admin-table-row">
                  <td className="px-5 py-3.5 text-sm font-mono text-[var(--admin-ink-500)]">
                    {order.orderNumber}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[var(--admin-ink-900)]">
                    {order.shippingName}
                    <span className="block text-[11px] text-[var(--admin-ink-500)]">
                      {order.user?.email ?? order.guestEmail ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-[var(--admin-ink-900)]">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge
                      status={(order as OrderWithInternalStatus).internalStatus ?? "received"}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[var(--admin-ink-500)]">
                    {new Date(order.createdAt).toLocaleDateString("hu-HU")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="admin-table-link text-[12px] font-medium underline-offset-2 hover:underline"
                    >
                      →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-table-shell mt-6">
        <div className="flex items-center justify-between border-b border-[var(--admin-line-100)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--admin-ink-900)]">Legutóbbi aktivitás</h2>
          <Link
            href="/admin/activity"
            className="admin-inline-link text-xs"
          >
            Teljes lista →
          </Link>
        </div>
        <AdminRecentActivityList items={recentActivity} />
      </div>

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { href: "/admin/products",        label: "Termékek" },
          { href: "/admin/activity",        label: "Aktivitás" },
          { href: "/admin/special-edition", label: "Special Edition" },
          { href: "/admin/settings",        label: "Beállítások" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="admin-panel-soft px-4 py-3.5 text-sm font-medium text-[var(--admin-ink-900)] transition hover:border-[#bfd0ea] hover:bg-[var(--admin-blue-050)]"
          >
            {link.label} →
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
