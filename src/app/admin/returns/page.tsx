import Link from "next/link";

import { AdminReturnsTableClient } from "@/components/admin/AdminReturnsTableClient";
import { AdminShell } from "@/components/admin/AdminShell";
import { db } from "@/lib/db";
import {
  returnRefundQueueFilters,
  returnRequestStatusConfig,
  returnRequestStatuses,
} from "@/lib/admin-order-workflow";

type BulkRefundReconcileItemResultCode =
  | "updated_succeeded"
  | "updated_failed"
  | "updated_pending"
  | "skipped_not_eligible"
  | "skipped_missing_stripe_refund_id"
  | "skipped_unchanged"
  | "skipped_not_found"
  | "skipped_stripe_lookup_failed";

type BulkRefundReconcileItemResult = {
  requestId: string;
  code: BulkRefundReconcileItemResultCode;
};

const bulkRefundResultLabels: Record<BulkRefundReconcileItemResultCode, string> = {
  updated_succeeded: "Frissítve: succeeded",
  updated_failed: "Frissítve: failed",
  updated_pending: "Frissítve: pending",
  skipped_not_eligible: "Kihagyva: nem egyeztethető",
  skipped_missing_stripe_refund_id: "Kihagyva: nincs Stripe refund azonosító",
  skipped_unchanged: "Kihagyva: nincs változás",
  skipped_not_found: "Kihagyva: kérelem nem található",
  skipped_stripe_lookup_failed: "Kihagyva: Stripe lekérés sikertelen",
};

function parseBulkRefundResults(input: string | undefined) {
  if (!input) {
    return [];
  }

  try {
    const parsed = JSON.parse(Buffer.from(input, "base64url").toString("utf8"));

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is BulkRefundReconcileItemResult => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const requestId = "requestId" in item ? item.requestId : null;
      const code = "code" in item ? item.code : null;

      return (
        typeof requestId === "string" &&
        typeof code === "string" &&
        Object.prototype.hasOwnProperty.call(bulkRefundResultLabels, code)
      );
    });
  } catch {
    return [];
  }
}

export default async function AdminReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    refund?: string;
    bulk?: string;
    bulkKind?: string;
    updated?: string;
    skipped?: string;
    bulkResults?: string;
  }>;
}) {
  const { status, refund, bulk, bulkKind, updated, skipped, bulkResults } = await searchParams;
  const activeStatus = status ?? "all";
  const activeRefund = refund ?? "all";
  const refundReconcileResults = parseBulkRefundResults(bulkResults);
  const refundReconcileResultMap = new Map(
    refundReconcileResults.map((item) => [item.requestId, item.code]),
  );

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
      ? bulkKind === "refund_reconcile"
        ? `Bulk refund egyeztetés kész: ${updated ?? "0"} kérelem frissítve, ${skipped ?? "0"} kihagyva.`
        : `Bulk művelet kész: ${updated ?? "0"} frissítve, ${skipped ?? "0"} kihagyva.`
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
          <p>{feedbackMessage}</p>
          {bulkKind === "refund_reconcile" && refundReconcileResults.length > 0 ? (
            <div className="mt-3 border-t border-[#f0eeec] pt-3">
              <p className="text-[12px] font-medium uppercase tracking-[.16em] text-[#888]">
                Kérelmenkénti eredmények
              </p>
              <ul className="mt-2 space-y-2">
                {refundReconcileResults.map((result) => (
                  <li key={`${result.requestId}:${result.code}`} className="flex flex-wrap items-center gap-2 text-[13px]">
                    <Link
                      href={`/admin/returns/${result.requestId}`}
                      className="font-mono text-[#1a1a1a] underline-offset-2 hover:underline"
                    >
                      {result.requestId.slice(0, 8)}
                    </Link>
                    <span className="text-[#6b425a]">{bulkRefundResultLabels[result.code]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
          bulkRefundReconcileResult:
            refundReconcileResultMap.get(request.id) ?? null,
          assignedOwnerLabel:
            request.assignedTo?.name?.trim() || request.assignedTo?.email?.trim() || "Nincs kijelölve",
          reasonSummary: request.reason?.trim() || "Nincs rövid ok",
          detailsSummary: request.details,
        }))}
      />
    </AdminShell>
  );
}
