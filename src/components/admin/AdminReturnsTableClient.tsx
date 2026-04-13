"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { bulkUpdateReturnRequestAction } from "@/app/(admin)/admin/returns/actions";
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
      className="admin-pill"
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
      className="admin-pill"
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

      <div className="admin-panel-soft mb-4 flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <label className="inline-flex min-h-10 items-center gap-2 text-sm text-[var(--admin-ink-700)]">
            <input
              className="h-4 w-4"
              type="checkbox"
              checked={allSelected}
              onChange={(event) => {
                setSelectedIds(event.target.checked ? requests.map((request) => request.id) : []);
              }}
            />
            Oldalon látható összes kijelölése
          </label>
          <span className="text-sm text-[var(--admin-ink-500)]">{selectedIds.length} kiválasztva</span>
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] lg:min-w-[28rem]">
          <select
            name="bulkAction"
            value={bulkAction}
            onChange={(event) => setBulkAction(event.target.value)}
            className="admin-select admin-control-md min-w-0"
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
            className="admin-button-primary admin-control-md"
          >
            Bulk művelet
          </button>
          {bulkAction === "reconcile_refunds" ? (
            <p className="text-[12px] leading-relaxed text-[var(--admin-ink-600)] sm:col-span-2">
              Csak a `pending` vagy `failed` refund státuszú, Stripe refund azonosítóval rendelkező kérelmek frissülnek.
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {requests.length === 0 ? (
          <div className="admin-panel-soft px-4 py-10 text-center text-sm text-[var(--admin-ink-500)]">
            Nincs megjeleníthető kérelem.
          </div>
        ) : (
          requests.map((request) => (
            <article key={request.id} className="admin-panel-soft p-4">
              <div className="flex items-start gap-3">
                <input
                  className="mt-1 h-4 w-4 shrink-0"
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
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[12px] text-[var(--admin-ink-600)]">
                    {request.id.slice(0, 8)} · {request.createdAtLabel}
                  </p>
                  <p className="mt-1 text-base font-semibold leading-snug text-[var(--admin-ink-900)]">
                    {request.customerName}
                  </p>
                  <p className="mt-0.5 break-all text-xs text-[var(--admin-ink-500)]">
                    {request.customerEmail}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={request.status} />
                <RefundStatusBadge status={request.refundStatus} />
                {request.bulkRefundReconcileResult ? (
                  <span className="admin-status-note text-[12px] font-medium">
                    {bulkRefundResultLabels[request.bulkRefundReconcileResult] ?? request.bulkRefundReconcileResult}
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 text-sm text-[var(--admin-ink-700)]">
                <div>
                  <p className="text-[12px] font-medium text-[var(--admin-ink-500)]">Ok / összefoglaló</p>
                  <p className="mt-1 font-medium text-[var(--admin-ink-900)]">{request.reasonSummary}</p>
                  <p className="mt-1 line-clamp-3">{request.detailsSummary}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-line-100)] pt-3">
                  <div className="space-y-1 text-[12px] text-[var(--admin-ink-500)]">
                    <p>
                      Rendelés:{" "}
                      <Link href={`/admin/orders/${request.orderId}`} className="admin-table-link font-medium hover:underline">
                        {request.orderNumber}
                      </Link>
                    </p>
                    <p>
                      Felelős: <span className="font-medium text-[var(--admin-ink-700)]">{request.assignedOwnerLabel}</span>
                    </p>
                  </div>
                  <Link href={`/admin/returns/${request.id}`} className="admin-table-action admin-table-action-link">
                    Részletek
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="admin-table-shell hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="admin-table-head">
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">✓</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">Azonosító</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">Dátum</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">Rendelés</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">Vásárló</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">Felelős</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">Státusz</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">Refund</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">Ok / összefoglaló</th>
              <th className="px-4 py-3 text-right text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-[var(--admin-ink-500)]">
                  Nincs megjeleníthető kérelem.
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="admin-table-row">
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
                  <td className="px-4 py-3 font-mono text-[12px] text-[var(--admin-ink-700)]">{request.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-[var(--admin-ink-700)]">{request.createdAtLabel}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${request.orderId}`} className="admin-table-link font-medium hover:underline">
                      {request.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--admin-ink-900)]">{request.customerName}</p>
                    <p className="text-[11px] text-[var(--admin-ink-500)]">{request.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[var(--admin-ink-700)]">{request.assignedOwnerLabel}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-4 py-3">
                    <RefundStatusBadge status={request.refundStatus} />
                  </td>
                  <td className="px-4 py-3 text-[var(--admin-ink-700)]">
                    <p className="text-[12px] font-medium text-[var(--admin-ink-900)]">{request.reasonSummary}</p>
                    <p className="mt-1 line-clamp-2 text-[12px]">{request.detailsSummary}</p>
                    {request.bulkRefundReconcileResult ? (
                      <p className="admin-status-note mt-2 text-[11px] font-medium">
                        {bulkRefundResultLabels[request.bulkRefundReconcileResult] ?? request.bulkRefundReconcileResult}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                    <Link
                      href={`/admin/returns/${request.id}`}
                      className="admin-table-action admin-table-action-link"
                    >
                      Részletek
                    </Link>
                    </div>
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
