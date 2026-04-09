import { db } from "@/lib/db";
import {
  orderStatusConfig,
  returnRefundStatusConfig,
  returnRequestStatusConfig,
} from "@/lib/admin-order-workflow";

export type AdminActivityItem = {
  id: string;
  kind: "order" | "return_request";
  href: string;
  entityLabel: string;
  title: string;
  summary: string;
  actorLabel: string;
  changedAt: Date;
};

function formatActorLabel(input: { name?: string | null; email?: string | null } | null | undefined) {
  return input?.name?.trim() || input?.email?.trim() || "ismeretlen admin";
}

function formatOrderStatus(status: string | null | undefined) {
  if (!status) {
    return "nincs";
  }

  return orderStatusConfig[status]?.label ?? status;
}

function formatReturnStatus(status: string | null | undefined) {
  if (!status) {
    return "nincs";
  }

  return returnRequestStatusConfig[status]?.label ?? status;
}

function formatRefundStatus(status: string | null | undefined) {
  if (!status) {
    return "nincs";
  }

  return returnRefundStatusConfig[status]?.label ?? status;
}

export async function getRecentAdminActivity(limit = 12) {
  const fetchSize = Math.max(limit * 3, 24);

  const [orderHistory, returnHistory] = await Promise.all([
    db.orderWorkflowHistory.findMany({
      orderBy: { changedAt: "desc" },
      take: fetchSize,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
          },
        },
        changedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    db.returnRequestHistory.findMany({
      orderBy: { changedAt: "desc" },
      take: fetchSize,
      include: {
        returnRequest: {
          select: {
            id: true,
            order: {
              select: {
                id: true,
                orderNumber: true,
              },
            },
          },
        },
        changedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const orderItems: AdminActivityItem[] = orderHistory.map((entry) => ({
    id: `order-${entry.id}`,
    kind: "order",
    href: `/admin/orders/${entry.orderId}`,
    entityLabel: entry.order.orderNumber,
    title: entry.assignmentChanged ? "Rendelés újraosztva" : "Rendelés státusz módosítva",
    summary: entry.assignmentChanged
      ? `${entry.order.orderNumber} · ${entry.previousAssigneeLabel ?? "nincs"} -> ${entry.newAssigneeLabel ?? "nincs"}`
      : `${entry.order.orderNumber} · ${formatOrderStatus(entry.previousStatus)} -> ${formatOrderStatus(entry.newStatus)}${entry.source === "bulk" ? " · bulk" : ""}`,
    actorLabel: formatActorLabel(entry.changedBy),
    changedAt: entry.changedAt,
  }));

  const returnItems: AdminActivityItem[] = returnHistory.flatMap((entry) => {
      const requestLabel = `${entry.returnRequest.order.orderNumber} / ${entry.returnRequest.id.slice(0, 8)}`;

      if (entry.refundChanged) {
        return [{
          id: `return-${entry.id}`,
          kind: "return_request" as const,
          href: `/admin/returns/${entry.returnRequestId}`,
          entityLabel: requestLabel,
          title: "Visszatérítés állapot módosítva",
          summary: `${requestLabel} · ${formatRefundStatus(entry.previousRefundStatus)} -> ${formatRefundStatus(entry.newRefundStatus)}`,
          actorLabel: formatActorLabel(entry.changedBy),
          changedAt: entry.changedAt,
        }];
      }

      if (entry.assignmentChanged) {
        return [{
          id: `return-${entry.id}`,
          kind: "return_request" as const,
          href: `/admin/returns/${entry.returnRequestId}`,
          entityLabel: requestLabel,
          title: "Visszaküldés újraosztva",
          summary: `${requestLabel} · ${entry.previousAssigneeLabel ?? "nincs"} -> ${entry.newAssigneeLabel ?? "nincs"}`,
          actorLabel: formatActorLabel(entry.changedBy),
          changedAt: entry.changedAt,
        }];
      }

      if ((entry.previousStatus ?? null) !== entry.newStatus) {
        return [{
          id: `return-${entry.id}`,
          kind: "return_request" as const,
          href: `/admin/returns/${entry.returnRequestId}`,
          entityLabel: requestLabel,
          title: "Visszaküldési kérelem státusz módosítva",
          summary: `${requestLabel} · ${formatReturnStatus(entry.previousStatus)} -> ${formatReturnStatus(entry.newStatus)}`,
          actorLabel: formatActorLabel(entry.changedBy),
          changedAt: entry.changedAt,
        }];
      }

      return [];
    });

  return [...orderItems, ...returnItems]
    .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime())
    .slice(0, limit);
}
