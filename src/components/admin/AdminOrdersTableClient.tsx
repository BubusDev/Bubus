"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { bulkUpdateOrderInternalStatusAction } from "@/app/(admin)/admin/orders/actions";
import { orderStatusConfig } from "@/lib/admin-order-workflow";

type AdminOrderRow = {
  id: string;
  orderNumber: string;
  createdAtLabel: string;
  shippingName: string;
  customerEmail: string;
  assignedOwnerLabel: string;
  itemLines: string[];
  totalLabel: string;
  internalStatus: string;
  paymentStatus: string;
  hasOpenReturnRequest: boolean;
};

const bulkActionOptions = [
  { value: "move_to_in_production", label: "Beérkezett -> Elkészítés alatt" },
  { value: "move_to_packed", label: "Elkészítés alatt -> Becsomagolva" },
  { value: "move_to_label_ready", label: "Becsomagolva -> Címke kész" },
  { value: "move_to_shipped", label: "Címke kész -> Feladva" },
  { value: "move_to_closed", label: "Feladva -> Lezárva" },
  { value: "move_to_issue", label: "Kijelöltek -> Problémás" },
] as const;

function StatusBadge({ status }: { status: string }) {
  const cfg = orderStatusConfig[status] ?? orderStatusConfig.received;

  return (
    <span
      className="admin-pill"
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

export function AdminOrdersTableClient({
  orders,
  currentFilter,
}: {
  orders: AdminOrderRow[];
  currentFilter: string;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>(bulkActionOptions[0].value);
  const allSelected = useMemo(
    () => orders.length > 0 && selectedIds.length === orders.length,
    [orders.length, selectedIds.length],
  );

  return (
    <form action={bulkUpdateOrderInternalStatusAction}>
      <input type="hidden" name="currentFilter" value={currentFilter} />

      <div className="admin-panel-soft mb-4 flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <label className="inline-flex min-h-10 items-center gap-2 text-sm text-[var(--admin-ink-700)]">
            <input
              className="h-4 w-4"
              type="checkbox"
              checked={allSelected}
              onChange={(event) => {
                setSelectedIds(event.target.checked ? orders.map((order) => order.id) : []);
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
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {orders.length === 0 ? (
          <div className="admin-panel-soft px-4 py-10 text-center text-sm text-[var(--admin-ink-500)]">
            Nincs rendelés
          </div>
        ) : (
          orders.map((order) => (
            <article key={order.id} className="admin-panel-soft p-4">
              <div className="flex items-start justify-between gap-3">
                <label className="flex min-w-0 items-start gap-3">
                  <input
                    className="mt-1 h-4 w-4 shrink-0"
                    type="checkbox"
                    name="orderIds"
                    value={order.id}
                    checked={selectedIds.includes(order.id)}
                    onChange={(event) => {
                      setSelectedIds((current) =>
                        event.target.checked
                          ? [...current, order.id]
                          : current.filter((id) => id !== order.id),
                      );
                    }}
                  />
                  <span className="min-w-0">
                    <span className="block font-mono text-[12px] text-[var(--admin-ink-600)]">
                      {order.orderNumber} · {order.createdAtLabel}
                    </span>
                    <span className="mt-1 block text-base font-semibold leading-snug text-[var(--admin-ink-900)]">
                      {order.shippingName}
                    </span>
                    <span className="mt-0.5 block break-all text-xs text-[var(--admin-ink-500)]">
                      {order.customerEmail}
                    </span>
                  </span>
                </label>
                <p className="shrink-0 text-right text-sm font-semibold text-[var(--admin-ink-900)]">
                  {order.totalLabel}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={order.internalStatus} />
                {order.hasOpenReturnRequest ? (
                  <span className="admin-status-note text-[12px] font-medium">Nyitott visszaküldés</span>
                ) : null}
                {order.paymentStatus === "STOCK_UNAVAILABLE" ? (
                  <span className="admin-status-note text-[12px] font-medium">Készleteltérés</span>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 text-sm text-[var(--admin-ink-700)]">
                <div>
                  <p className="text-[12px] font-medium text-[var(--admin-ink-500)]">Termékek</p>
                  <div className="mt-1 space-y-1">
                    {order.itemLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-line-100)] pt-3">
                  <p className="text-[12px] text-[var(--admin-ink-500)]">
                    Felelős: <span className="font-medium text-[var(--admin-ink-700)]">{order.assignedOwnerLabel}</span>
                  </p>
                  <Link href={`/admin/orders/${order.id}`} className="admin-table-action admin-table-action-link">
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
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">#</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">Dátum</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">Vevő</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">Felelős</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">Termékek</th>
              <th className="px-4 py-3 text-right text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">Összeg</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">Státusz</th>
              <th className="px-4 py-3 text-right text-[10px] font-medium uppercase tracking-[.18em] text-[var(--admin-ink-500)]">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-[var(--admin-ink-500)]">
                  Nincs rendelés
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="admin-table-row">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      name="orderIds"
                      value={order.id}
                      checked={selectedIds.includes(order.id)}
                      onChange={(event) => {
                        setSelectedIds((current) =>
                          event.target.checked
                            ? [...current, order.id]
                            : current.filter((id) => id !== order.id),
                        );
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[var(--admin-ink-700)]">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-[var(--admin-ink-700)]">{order.createdAtLabel}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--admin-ink-900)]">{order.shippingName}</p>
                    <p className="text-[11px] text-[var(--admin-ink-500)]">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[var(--admin-ink-700)]">{order.assignedOwnerLabel}</td>
                  <td className="px-4 py-3 text-[var(--admin-ink-700)]">
                    {order.itemLines.map((line) => (
                      <span key={line} className="block text-[12px]">
                        {line}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[var(--admin-ink-900)]">{order.totalLabel}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <StatusBadge status={order.internalStatus} />
                      {order.hasOpenReturnRequest ? (
                        <span className="admin-status-note text-[11px] font-medium">Nyitott visszaküldési kérelem</span>
                      ) : null}
                      {order.paymentStatus === "STOCK_UNAVAILABLE" ? (
                        <span className="admin-status-note text-[11px] font-medium">Készleteltérés</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                    <Link
                      href={`/admin/orders/${order.id}`}
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
