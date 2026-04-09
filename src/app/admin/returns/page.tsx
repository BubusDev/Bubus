import Link from "next/link";

import { AdminReturnsTableClient } from "@/components/admin/AdminReturnsTableClient";
import { AdminShell } from "@/components/admin/AdminShell";
import { db } from "@/lib/db";
import {
  returnRefundQueueFilters,
  returnRequestStatusConfig,
  returnRequestStatuses,
} from "@/lib/admin-order-workflow";

export default async function AdminReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    refund?: string;
    bulk?: string;
    updated?: string;
    skipped?: string;
  }>;
}) {
  const { status, refund, bulk, updated, skipped } = await searchParams;
  const activeStatus = status ?? "all";
  const activeRefund = refund ?? "all";

  const where = {
    ...(activeStatus !== "all"
      ? {
          status: activeStatus,
        }
      : {}),
    ...(activeRefund !== "all"
      ? {
          refundStatus: activeRefund,
        }
      : {}),
  };

  function buildReturnsFilterHref(next: { status?: string; refund?: string }) {
    const params = new URLSearchParams();
    const nextStatus = next.status ?? activeStatus;
    const nextRefund = next.refund ?? activeRefund;

    if (nextStatus !== "all") {
      params.set("status", nextStatus);
    }

    if (nextRefund !== "all") {
      params.set("refund", nextRefund);
    }

    const query = params.toString();
    return query ? `/admin/returns?${query}` : "/admin/returns";
  }

  const requests = await db.returnRequest.findMany({
    where,
    orderBy: [
      { createdAt: "desc" },
    ],
    include: {
      assignedTo: {
        select: {
          name: true,
          email: true,
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          shippingName: true,
          guestEmail: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
    take: 100,
  });

  const feedbackMessage =
    bulk === "done"
      ? `Bulk művelet kész: ${updated ?? "0"} frissítve, ${skipped ?? "0"} kihagyva.`
      : bulk === "invalid"
        ? "A bulk művelethez válassz legalább egy kérelmet és érvényes műveletet."
        : null;

  return (
    <AdminShell
      title="Visszaküldési kérelmek"
      description={`${requests.length} kérelem${activeStatus !== "all" ? ` — státusz: ${returnRequestStatusConfig[activeStatus]?.label ?? activeStatus}` : ""}${activeRefund !== "all" ? ` — refund: ${returnRefundQueueFilters.find((item) => item.value === activeRefund)?.label ?? activeRefund}` : ""}`}
      actions={
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildReturnsFilterHref({ status: "all" })}
              className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-medium transition ${
                activeStatus === "all"
                  ? "bg-[#1a1a1a] text-white"
                  : "border border-[#e8e5e0] bg-white text-[#6b425a] hover:bg-[#faf9f7]"
              }`}
            >
              Összes státusz
            </Link>
            {returnRequestStatuses.map((item) => (
              <Link
                key={item.value}
                href={buildReturnsFilterHref({ status: item.value })}
                className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-medium transition ${
                  activeStatus === item.value
                    ? "bg-[#1a1a1a] text-white"
                    : "border border-[#e8e5e0] bg-white text-[#6b425a] hover:bg-[#faf9f7]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {returnRefundQueueFilters.map((item) => (
              <Link
                key={item.value}
                href={buildReturnsFilterHref({ refund: item.value })}
                className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-medium transition ${
                  activeRefund === item.value
                    ? "bg-[#6b425a] text-white"
                    : "border border-[#e8e5e0] bg-white text-[#6b425a] hover:bg-[#faf9f7]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      }
    >
      {feedbackMessage ? (
        <div className="mb-4 rounded-[1.2rem] border border-[#e8e5e0] bg-white px-4 py-3 text-sm text-[#6b425a]">
          {feedbackMessage}
        </div>
      ) : null}
      <AdminReturnsTableClient
        currentFilter={activeStatus === "all" ? "" : activeStatus}
        currentRefundFilter={activeRefund === "all" ? "" : activeRefund}
        requests={requests.map((request) => ({
          id: request.id,
          createdAtLabel: new Date(request.createdAt).toLocaleDateString("hu-HU", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          orderId: request.order.id,
          orderNumber: request.order.orderNumber,
          customerName: request.order.shippingName,
          customerEmail:
            request.order.user?.email ?? request.order.guestEmail ?? request.requesterEmail,
          status: request.status,
          refundStatus: request.refundStatus,
          assignedOwnerLabel:
            request.assignedTo?.name?.trim() || request.assignedTo?.email?.trim() || "Nincs kijelölve",
          reasonSummary: request.reason?.trim() || "Nincs rövid ok",
          detailsSummary: request.details,
        }))}
      />
    </AdminShell>
  );
}
