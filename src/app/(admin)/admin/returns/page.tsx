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
        <div className="flex max-w-full flex-col gap-2">
          <div className="admin-filter-row">
            <Link
              href={buildReturnsFilterHref({ status: "all" })}
              className={`admin-filter-chip admin-control-md ${activeStatus === "all" ? "admin-filter-chip-active" : ""}`}
            >
              Összes státusz
            </Link>
            {returnRequestStatuses.map((item) => (
              <Link
                key={item.value}
                href={buildReturnsFilterHref({ status: item.value })}
                className={`admin-filter-chip admin-control-md ${activeStatus === item.value ? "admin-filter-chip-active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="admin-filter-row">
            {returnRefundQueueFilters.map((item) => (
              <Link
                key={item.value}
                href={buildReturnsFilterHref({ refund: item.value })}
                className={`admin-filter-chip admin-control-md ${activeRefund === item.value ? "admin-filter-chip-soft-active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      }
    >
      {feedbackMessage ? (
        <div className="admin-panel-soft mb-4 px-4 py-3 text-sm text-[var(--admin-ink-700)]">
          <p>{feedbackMessage}</p>
          {bulkKind === "refund_reconcile" && refundReconcileResults.length > 0 ? (
            <div className="mt-3 border-t border-[var(--admin-line-100)] pt-3">
              <p className="text-[12px] font-medium uppercase tracking-[.16em] text-[var(--admin-ink-500)]">
                Kérelmenkénti eredmények
              </p>
              <ul className="mt-2 space-y-2">
                {refundReconcileResults.map((result) => (
                  <li key={`${result.requestId}:${result.code}`} className="flex flex-wrap items-center gap-2 text-[13px]">
                    <Link
                      href={`/admin/returns/${result.requestId}`}
                      className="admin-table-link font-mono underline-offset-2 hover:underline"
                    >
                      {result.requestId.slice(0, 8)}
                    </Link>
                    <span className="text-[var(--admin-ink-700)]">{bulkRefundResultLabels[result.code]}</span>
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
