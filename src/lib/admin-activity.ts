import { db } from "@/lib/db";
import {
  orderStatusConfig,
  returnRefundStatusConfig,
  returnRequestStatusConfig,
} from "@/lib/admin-order-workflow";
import type { Prisma } from "@prisma/client";

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

export type AdminActivityFilters = {
  customerName?: string;
  customerEmail?: string;
  responsible?: string;
  orderNumber?: string;
};

const insensitive = "insensitive" as const;

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

function normalizeFilterValue(value: string | undefined) {
  return value?.trim() || undefined;
}

function textFilter(value: string) {
  return { contains: value, mode: insensitive };
}

function buildOrderActivityWhere(filters: AdminActivityFilters): Prisma.OrderWorkflowHistoryWhereInput {
  const customerName = normalizeFilterValue(filters.customerName);
  const customerEmail = normalizeFilterValue(filters.customerEmail);
  const responsible = normalizeFilterValue(filters.responsible);
  const orderNumber = normalizeFilterValue(filters.orderNumber);
  const orderFilters: Prisma.OrderWhereInput[] = [];
  const activityFilters: Prisma.OrderWorkflowHistoryWhereInput[] = [];

  if (customerName) {
    orderFilters.push({
      OR: [
        { shippingName: textFilter(customerName) },
        { user: { is: { name: textFilter(customerName) } } },
      ],
    });
  }

  if (customerEmail) {
    orderFilters.push({
      OR: [
        { guestEmail: textFilter(customerEmail) },
        { user: { is: { email: textFilter(customerEmail) } } },
      ],
    });
  }

  if (orderNumber) {
    orderFilters.push({ orderNumber: textFilter(orderNumber) });
  }

  if (responsible) {
    activityFilters.push({
      OR: [
        { previousAssigneeLabel: textFilter(responsible) },
        { newAssigneeLabel: textFilter(responsible) },
        { order: { assignedTo: { is: { name: textFilter(responsible) } } } },
        { order: { assignedTo: { is: { email: textFilter(responsible) } } } },
      ],
    });
  }

  if (orderFilters.length > 0) {
    activityFilters.push({ order: { AND: orderFilters } });
  }

  return activityFilters.length > 0 ? { AND: activityFilters } : {};
}

function buildReturnActivityWhere(filters: AdminActivityFilters): Prisma.ReturnRequestHistoryWhereInput {
  const customerName = normalizeFilterValue(filters.customerName);
  const customerEmail = normalizeFilterValue(filters.customerEmail);
  const responsible = normalizeFilterValue(filters.responsible);
  const orderNumber = normalizeFilterValue(filters.orderNumber);
  const requestFilters: Prisma.ReturnRequestWhereInput[] = [];
  const orderFilters: Prisma.OrderWhereInput[] = [];
  const activityFilters: Prisma.ReturnRequestHistoryWhereInput[] = [];

  if (customerName) {
    orderFilters.push({
      OR: [
        { shippingName: textFilter(customerName) },
        { user: { is: { name: textFilter(customerName) } } },
      ],
    });
  }

  if (customerEmail) {
    requestFilters.push({
      OR: [
        { requesterEmail: textFilter(customerEmail) },
        { order: { guestEmail: textFilter(customerEmail) } },
        { order: { user: { is: { email: textFilter(customerEmail) } } } },
      ],
    });
  }

  if (orderNumber) {
    orderFilters.push({ orderNumber: textFilter(orderNumber) });
  }

  if (orderFilters.length > 0) {
    requestFilters.push({ order: { AND: orderFilters } });
  }

  if (responsible) {
    activityFilters.push({
      OR: [
        { previousAssigneeLabel: textFilter(responsible) },
        { newAssigneeLabel: textFilter(responsible) },
        { returnRequest: { assignedTo: { is: { name: textFilter(responsible) } } } },
        { returnRequest: { assignedTo: { is: { email: textFilter(responsible) } } } },
      ],
    });
  }

  if (requestFilters.length > 0) {
    activityFilters.push({ returnRequest: { AND: requestFilters } });
  }

  return activityFilters.length > 0 ? { AND: activityFilters } : {};
}

export async function getRecentAdminActivity(limit = 12, filters: AdminActivityFilters = {}) {
  const fetchSize = Math.max(limit * 3, 24);

  const [orderHistory, returnHistory] = await Promise.all([
    db.orderWorkflowHistory.findMany({
      where: buildOrderActivityWhere(filters),
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
      where: buildReturnActivityWhere(filters),
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
