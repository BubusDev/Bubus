import Link from "next/link";
import { AdminOrdersTableClient } from "@/components/admin/AdminOrdersTableClient";
import { AdminShell } from "@/components/admin/AdminShell";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/catalog";
import {
  adminOrderQueueFilters,
} from "@/lib/admin-order-workflow";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    bulk?: string;
    updated?: string;
    skipped?: string;
  }>;
}) {
  const { status, bulk, updated, skipped } = await searchParams;
  const activeFilter = status ?? "all";

  const where =
    activeFilter === "exceptions"
      ? {
          OR: [
            { internalStatus: "issue" },
            { paymentStatus: "STOCK_UNAVAILABLE" as const },
            {
              returnRequests: {
                some: {
                  status: {
                    in: ["new", "in_review", "approved"],
                  },
                },
              },
            },
          ],
        }
      : activeFilter !== "all"
        ? {
            paymentStatus: "PAID" as const,
            internalStatus: activeFilter,
          }
        : {
            paymentStatus: "PAID" as const,
          };

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      assignedTo: { select: { name: true, email: true } },
      returnRequests: {
        select: {
          id: true,
          status: true,
        },
      },
      items: {
        select: { productName: true, quantity: true, unitPrice: true },
      },
    },
    take: 100,
  });

  const feedbackMessage =
    bulk === "done"
      ? `Bulk művelet kész: ${updated ?? "0"} frissítve, ${skipped ?? "0"} kihagyva.`
      : bulk === "invalid"
        ? "A bulk művelethez válassz legalább egy rendelést és érvényes műveletet."
        : null;

  return (
    <AdminShell
      title="Rendelések"
      description={`${orders.length} rendelés${activeFilter !== "all" ? ` — szűrve: ${adminOrderQueueFilters.find((item) => item.key === activeFilter)?.label ?? activeFilter}` : ""}`}
      actions={
        <div className="flex flex-wrap gap-2">
          {adminOrderQueueFilters.map((filter) => (
            <Link
              key={filter.key}
              href={filter.key === "all" ? "/admin/orders" : `/admin/orders?status=${encodeURIComponent(filter.key)}`}
              className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-medium transition ${
                activeFilter === filter.key
                  ? "bg-[#1a1a1a] text-white"
                  : "border border-[#e8e5e0] bg-white text-[#6b425a] hover:bg-[#faf9f7]"
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      }
    >
      {feedbackMessage ? (
        <div className="mb-4 rounded-[1.2rem] border border-[#e8e5e0] bg-white px-4 py-3 text-sm text-[#6b425a]">
          {feedbackMessage}
        </div>
      ) : null}
      <AdminOrdersTableClient
        currentFilter={activeFilter === "all" ? "" : activeFilter}
        orders={orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          createdAtLabel: new Date(order.createdAt).toLocaleDateString("hu-HU", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          shippingName: order.shippingName,
          customerEmail: order.user?.email ?? order.guestEmail ?? "—",
          itemLines: order.items.map((item) => `${item.productName} ×${item.quantity}`),
          totalLabel: formatPrice(order.total),
          internalStatus: order.internalStatus ?? "received",
          paymentStatus: order.paymentStatus,
          assignedOwnerLabel:
            order.assignedTo?.name?.trim() || order.assignedTo?.email?.trim() || "Nincs kijelölve",
          hasOpenReturnRequest: order.returnRequests.some(
            (request) => request.status !== "completed" && request.status !== "rejected",
          ),
        }))}
      />
    </AdminShell>
  );
}
