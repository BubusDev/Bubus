"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { bulkUpdateOrderInternalStatusAction } from "@/app/admin/orders/actions";
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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-[#e8e5e0] bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-[#6b425a]">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(event) => {
                setSelectedIds(event.target.checked ? orders.map((order) => order.id) : []);
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
        </div>
      </div>

      <div className="overflow-hidden border border-[#e8e5e0] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #e8e5e0", background: "#faf9f7" }}>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">✓</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">#</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">Dátum</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">Vevő</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">Felelős</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">Termékek</th>
              <th className="px-4 py-3 text-right text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">Összeg</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">Státusz</th>
              <th className="px-4 py-3 text-right text-[10px] font-medium uppercase tracking-[.18em] text-[#888]">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-[#888]">
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
                  <td className="px-4 py-3 font-mono text-[12px] text-[#555]">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-[#555]">{order.createdAtLabel}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1a1a1a]">{order.shippingName}</p>
                    <p className="text-[11px] text-[#888]">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#555]">{order.assignedOwnerLabel}</td>
                  <td className="px-4 py-3 text-[#555]">
                    {order.itemLines.map((line) => (
                      <span key={line} className="block text-[12px]">
                        {line}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#1a1a1a]">{order.totalLabel}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <StatusBadge status={order.internalStatus} />
                      {order.hasOpenReturnRequest ? (
                        <span className="text-[11px] font-medium text-[#9b476f]">Nyitott visszaküldési kérelem</span>
                      ) : null}
                      {order.paymentStatus === "STOCK_UNAVAILABLE" ? (
                        <span className="text-[11px] font-medium text-[#9b476f]">Készleteltérés</span>
                      ) : null}
                    </div>
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
    </form>
  );
}
