import Link from "next/link";
import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/catalog";

// Fields added by migration — cast until Prisma client is regenerated after `prisma migrate dev`
type OrderWithInternalStatus = { internalStatus: string };

const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  received:      { label: "Beérkezett",    bg: "#f0f0f0", color: "#555", border: "#ddd" },
  in_production: { label: "Elkészítés",    bg: "#fef9e7", color: "#7d6608", border: "#f0d080" },
  packed:        { label: "Becsomagolva",  bg: "#eaf4fb", color: "#1a5276", border: "#a9cce3" },
  label_ready:   { label: "Címke kész",    bg: "#e8f8f5", color: "#1e8449", border: "#a9dfbf" },
  shipped:       { label: "Feladva",       bg: "#eafaf1", color: "#145a32", border: "#82e0aa" },
  closed:        { label: "Lezárva",       bg: "#f2f3f4", color: "#333", border: "#ccc" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.received;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium"
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {cfg.label}
    </span>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const orders = await db.order.findMany({
    where: {
      paymentStatus: "PAID",
      // internalStatus filter — applied after migration when Prisma types are updated
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(status ? ({ internalStatus: status } as any) : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        select: { productName: true, quantity: true, unitPrice: true },
      },
    },
    take: 100,
  });

  return (
    <AdminShell
      title="Rendelések"
      description={`${orders.length} rendelés${status ? ` — szűrve: ${statusConfig[status]?.label ?? status}` : ""}`}
    >
      <div className="overflow-hidden border border-[#e8e5e0] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #e8e5e0", background: "#faf9f7" }}>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[.18em] text-[#888] font-medium">#</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[.18em] text-[#888] font-medium">Dátum</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[.18em] text-[#888] font-medium">Vevő</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[.18em] text-[#888] font-medium">Termékek</th>
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[.18em] text-[#888] font-medium">Összeg</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[.18em] text-[#888] font-medium">Státusz</th>
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[.18em] text-[#888] font-medium">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[#888]">
                  Nincs rendelés
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  style={{ borderBottom: "1px solid #f0eeec" }}
                  className="transition hover:bg-[#faf9f7]"
                >
                  <td className="px-4 py-3 font-mono text-[12px] text-[#555]">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-[#555]">
                    {new Date(order.createdAt).toLocaleDateString("hu-HU", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1a1a1a]">{order.shippingName}</p>
                    <p className="text-[11px] text-[#888]">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[#555]">
                    {order.items.map((item) => (
                      <span key={item.productName} className="block text-[12px]">
                        {item.productName} ×{item.quantity}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#1a1a1a]">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={(order as unknown as OrderWithInternalStatus).internalStatus ?? "received"} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-[12px] font-medium text-[#1a1a1a] underline-offset-2 hover:underline"
                    >
                      Részletek
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
