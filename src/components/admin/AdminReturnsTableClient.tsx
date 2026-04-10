"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { bulkUpdateReturnRequestAction } from "@/app/admin/returns/actions";
import { returnRefundStatusConfig, returnRequestStatusConfig } from "@/lib/admin-order-workflow";

type AdminReturnRequestRow = {
  id: string;
  createdAtLabel: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  refundStatus: string;
  bulkRefundReconcileResult: string | null;
  assignedOwnerLabel: string;
  reasonSummary: string;
  detailsSummary: string;
};

const bulkRefundResultLabels: Record<string, string> = {
  updated_succeeded: "Refund egyeztetés: succeeded",
  updated_failed: "Refund egyeztetés: failed",
  updated_pending: "Refund egyeztetés: pending",
  skipped_not_eligible: "Refund egyeztetés: nem egyeztethető",
  skipped_missing_stripe_refund_id: "Refund egyeztetés: nincs Stripe refund ID",
  skipped_unchanged: "Refund egyeztetés: nincs változás",
  skipped_not_found: "Refund egyeztetés: kérelem nem található",
  skipped_stripe_lookup_failed: "Refund egyeztetés: Stripe lekérés sikertelen",
};

const bulkActionOptions = [
  { value: "move_to_in_review", label: "Új -> Ellenőrzés alatt" },
  { value: "move_to_approved", label: "Ellenőrzés alatt -> Jóváhagyva" },
  { value: "move_to_rejected", label: "Ellenőrzés alatt -> Elutasítva" },
  { value: "move_to_completed", label: "Jóváhagyva -> Lezárva" },
  { value: "reconcile_refunds", label: "Refund állapot egyeztetése" },
] as const;

function StatusBadge({ status }: { status: string }) {
  const cfg = returnRequestStatusConfig[status] ?? returnRequestStatusConfig.new;

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  );
}

function RefundStatusBadge({ status }: { status: string }) {
  const cfg = returnRefundStatusConfig[status] ?? returnRefundStatusConfig.not_refunded;

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  );
}

export function AdminReturnsTableClient({
  requests,
  currentFilter,
  currentRefundFilter,
}: {
  requests: AdminReturnRequestRow[];
  currentFilter: string;
  currentRefundFilter: string;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>(bulkActionOptions[0].value);
  const allSelected = useMemo(
    () => requests.length > 0 && selectedIds.length === requests.length,
    [requests.length, selectedIds.length],
  );

  return (
    <form action={bulkUpdateReturnRequestAction}>
      <input type="hidden" name="currentFilter" value={currentFilter} />
      <input type="hidden" name="currentRefundFilter" value={currentRefundFilter} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-[#e8e5e0] bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-[#6b425a]">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(event) => {
                setSelectedIds(event.target.checked ? requests.map((request) => request.id) : []);
              }}
            />
            Oldalon látható összes kijelölése
          </label>
          <span className="text-sm text-[#888]">{selectedIds.length} kiválasztva</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            name="bulkAction"
            value={bulkAction}
            onChange={(event) => setBulkAction(event.target.value)}
            className="rounded-full border border-[#d0ccc8] bg-white px-4 py-2 text-sm text-[#1a1a1a] outline-none"
          >
            {bulkActionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={selectedIds.length === 0}
            className="inline-flex items-center rounded-full bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#c8c3be]"
          >
            Bulk művelet
          </button>
          {bulkAction === "reconcile_refunds" ? (
            <p className="text-[12px] text-[#666]">
              Csak a `pending` vagy `failed` refund státuszú, Stripe refund azonosítóval rendelkező kérelmek frissülnek.
            </p>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden border border-[#e8e5e0] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e8e5e0] bg-[#faf9f7]">
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">✓</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">Azonosító</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">Dátum</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">Rendelés</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">Vásárló</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">Felelős</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">Státusz</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">Refund</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">Ok / összefoglaló</th>
              <th className="px-4 py-3 text-right text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-[#888]">
                  Nincs megjeleníthető kérelem.
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="border-b border-[#f0eeec] transition hover:bg-[#faf9f7]">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      name="requestIds"
                      value={request.id}
                      checked={selectedIds.includes(request.id)}
                      onChange={(event) => {
                        setSelectedIds((current) =>
                          event.target.checked
                            ? [...current, request.id]
                            : current.filter((id) => id !== request.id),
                        );
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[#555]">{request.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-[#555]">{request.createdAtLabel}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${request.orderId}`} className="font-medium text-[#1a1a1a] hover:underline">
                      {request.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1a1a1a]">{request.customerName}</p>
                    <p className="text-[11px] text-[#888]">{request.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#555]">{request.assignedOwnerLabel}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-4 py-3">
                    <RefundStatusBadge status={request.refundStatus} />
                  </td>
                  <td className="px-4 py-3 text-[#555]">
                    <p className="text-[12px] font-medium text-[#1a1a1a]">{request.reasonSummary}</p>
                    <p className="mt-1 line-clamp-2 text-[12px]">{request.detailsSummary}</p>
                    {request.bulkRefundReconcileResult ? (
                      <p className="mt-2 text-[11px] font-medium text-[#6b425a]">
                        {bulkRefundResultLabels[request.bulkRefundReconcileResult] ?? request.bulkRefundReconcileResult}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/returns/${request.id}`}
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
    </form>
  );
}
