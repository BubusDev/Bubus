import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { paymentStatus: "PAID", internalStatus: { in: ["received", "in_production", "packed", "label_ready"] } } as any,
    }),
    db.order.findMany({
      where: { paymentStatus: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { email: true } } },
    }),
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
            className="inline-flex items-center h-9 px-4 text-sm font-medium bg-[#1a1a1a] text-white hover:bg-[#333] transition"
          >
            + Új termék
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center h-9 px-4 text-sm font-medium border border-[#e8e5e0] text-[#1a1a1a] hover:bg-[#faf9f7] transition"
          >
            Rendelések
          </Link>
        </div>
      }
    >
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 xl:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white border border-[#e8e5e0] p-5">
            <p className="text-[11px] uppercase tracking-[.18em] text-[#888] mb-2">{m.label}</p>
            <p className="text-2xl font-semibold text-[#1a1a1a]">{m.value}</p>
            {m.delta && <p className="text-xs text-[#16a34a] mt-1">{m.delta}</p>}
          </div>
        ))}
      </div>

      {/* Recent orders table */}
      <div className="bg-white border border-[#e8e5e0]">
        <div className="px-5 py-4 border-b border-[#e8e5e0] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1a1a1a]">Legutóbbi rendelések</h2>
          <Link
            href="/admin/orders"
            className="text-xs text-[#888] hover:text-[#1a1a1a] transition"
          >
            Összes →
          </Link>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f0ede8]">
              {["#", "Vevő", "Összeg", "Státusz", "Dátum"].map((col) => (
                <th
                  key={col}
                  className="px-5 py-3 text-left text-[11px] uppercase tracking-[.15em] text-[#888] font-medium"
                >
                  {col}
                </th>
              ))}
              <th className="px-5 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f4f2]">
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-[#888]">
                  Még nincs fizetett rendelés.
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#faf9f7] transition">
                  <td className="px-5 py-3.5 text-sm font-mono text-[#888]">
                    {order.orderNumber}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#1a1a1a]">
                    {order.shippingName}
                    <span className="block text-[11px] text-[#888]">{order.user.email}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-[#1a1a1a]">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge
                      status={(order as OrderWithInternalStatus).internalStatus ?? "received"}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#888]">
                    {new Date(order.createdAt).toLocaleDateString("hu-HU")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-[12px] font-medium text-[#1a1a1a] underline-offset-2 hover:underline"
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

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { href: "/admin/products",        label: "Termékek" },
          { href: "/admin/special-edition", label: "Special Edition" },
          { href: "/admin/announcement",    label: "Üzenetsáv" },
          { href: "/admin/settings",        label: "Beállítások" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="border border-[#e8e5e0] bg-white px-4 py-3.5 text-sm font-medium text-[#1a1a1a] hover:bg-[#faf9f7] transition"
          >
            {link.label} →
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
