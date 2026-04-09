"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordOrderWorkflowHistory } from "@/lib/admin-workflow-history";
import {
  resendOrderStatusUpdateEmailByAdmin,
  sendOrderStatusUpdateEmailIfNeeded,
} from "@/lib/order-status-email";
import { getCustomerOrderStatusView } from "@/lib/order-status";

const bulkTransitionMap = {
  move_to_in_production: { from: "received", to: "in_production" },
  move_to_packed: { from: "in_production", to: "packed" },
  move_to_label_ready: { from: "packed", to: "label_ready" },
  move_to_shipped: { from: "label_ready", to: "shipped" },
  move_to_closed: { from: "shipped", to: "closed" },
  move_to_issue: { from: null, to: "issue" },
} as const;

function formatAssigneeLabel(input: { name?: string | null; email?: string | null } | null | undefined) {
  if (!input) {
    return null;
  }

  return input.name?.trim() || input.email?.trim() || null;
}

export async function updateOrderInternalStatusAction(formData: FormData) {
  const admin = await requireAdminUser("/admin/orders");

  const orderId = formData.get("orderId");
  const internalStatus = formData.get("internalStatus");
  const trackingNumber = formData.get("trackingNumber");
  const shippingMethod = formData.get("shippingMethod");
  const internalNote = formData.get("internalNote");

  if (typeof orderId !== "string" || !orderId) return;

  const previousOrder = await db.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      paymentStatus: true,
      internalStatus: true,
      trackingNumber: true,
      shippingMethod: true,
      statusUpdatedAt: true,
    },
  });

  const updatedOrder = await db.order.update({
    where: { id: orderId },
    data: {
      internalStatus: typeof internalStatus === "string" ? internalStatus : undefined,
      trackingNumber: typeof trackingNumber === "string" ? trackingNumber || null : undefined,
      shippingMethod: typeof shippingMethod === "string" ? shippingMethod || null : undefined,
      internalNote: typeof internalNote === "string" ? internalNote || null : undefined,
      statusUpdatedAt: new Date(),
    },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      internalStatus: true,
      trackingNumber: true,
      shippingMethod: true,
      statusUpdatedAt: true,
    },
  });

  const previousEmailUpdateKey = previousOrder
    ? getCustomerOrderStatusView(previousOrder).emailUpdateKey
    : null;
  const nextEmailUpdateKey = getCustomerOrderStatusView(updatedOrder).emailUpdateKey;

  await recordOrderWorkflowHistory({
    orderId,
    previousStatus: previousOrder?.internalStatus ?? null,
    newStatus: updatedOrder.internalStatus,
    changedById: admin.id,
    source: "single",
  });

  if (nextEmailUpdateKey && nextEmailUpdateKey !== previousEmailUpdateKey) {
    await sendOrderStatusUpdateEmailIfNeeded(orderId);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}`);
}

export async function resendOrderStatusUpdateEmailAction(formData: FormData) {
  await requireAdminUser("/admin/orders");

  const orderId = formData.get("orderId");

  if (typeof orderId !== "string" || !orderId) return;

  await resendOrderStatusUpdateEmailByAdmin(orderId);

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}`);
}

export async function updateOrderAssignmentAction(formData: FormData) {
  const admin = await requireAdminUser("/admin/orders");
  const orderId = formData.get("orderId");
  const assignedToId = formData.get("assignedToId");

  if (typeof orderId !== "string" || !orderId) {
    return;
  }

  const previousOrder = await db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      internalStatus: true,
      assignedTo: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const nextAssignedToId =
    typeof assignedToId === "string" && assignedToId.trim().length > 0 ? assignedToId : null;

  const updatedOrder = await db.order.update({
    where: { id: orderId },
    data: {
      assignedToId: nextAssignedToId,
    },
    select: {
      id: true,
      internalStatus: true,
      assignedTo: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  await recordOrderWorkflowHistory({
    orderId,
    previousStatus: previousOrder?.internalStatus ?? null,
    newStatus: updatedOrder.internalStatus,
    changedById: admin.id,
    source: "single",
    previousAssigneeLabel: formatAssigneeLabel(previousOrder?.assignedTo),
    newAssigneeLabel: formatAssigneeLabel(updatedOrder.assignedTo),
    assignmentChanged:
      formatAssigneeLabel(previousOrder?.assignedTo) !== formatAssigneeLabel(updatedOrder.assignedTo),
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}`);
}

export async function bulkUpdateOrderInternalStatusAction(formData: FormData) {
  const admin = await requireAdminUser("/admin/orders");

  const selectedOrderIds = formData
    .getAll("orderIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);
  const bulkAction = formData.get("bulkAction");
  const currentFilter =
    typeof formData.get("currentFilter") === "string" ? String(formData.get("currentFilter")) : "";

  if (
    typeof bulkAction !== "string" ||
    !(bulkAction in bulkTransitionMap) ||
    selectedOrderIds.length === 0
  ) {
    redirect(
      currentFilter
        ? `/admin/orders?status=${encodeURIComponent(currentFilter)}&bulk=invalid`
        : "/admin/orders?bulk=invalid",
    );
  }

  const transition = bulkTransitionMap[bulkAction as keyof typeof bulkTransitionMap];
  const orders = await db.order.findMany({
    where: {
      id: { in: selectedOrderIds },
    },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      internalStatus: true,
      trackingNumber: true,
      shippingMethod: true,
      statusUpdatedAt: true,
    },
  });

  let updated = 0;
  let skipped = 0;

  for (const order of orders) {
    const validTransition =
      order.paymentStatus === "PAID" &&
      (transition.from === null || order.internalStatus === transition.from);

    if (!validTransition) {
      skipped += 1;
      continue;
    }

    const previousEmailUpdateKey = getCustomerOrderStatusView(order).emailUpdateKey;
    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: {
        internalStatus: transition.to,
        statusUpdatedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        internalStatus: true,
        trackingNumber: true,
        shippingMethod: true,
        statusUpdatedAt: true,
      },
    });

    const nextEmailUpdateKey = getCustomerOrderStatusView(updatedOrder).emailUpdateKey;

    await recordOrderWorkflowHistory({
      orderId: order.id,
      previousStatus: order.internalStatus,
      newStatus: updatedOrder.internalStatus,
      changedById: admin.id,
      source: "bulk",
    });

    if (nextEmailUpdateKey && nextEmailUpdateKey !== previousEmailUpdateKey) {
      await sendOrderStatusUpdateEmailIfNeeded(order.id);
    }

    updated += 1;
  }

  skipped += Math.max(0, selectedOrderIds.length - orders.length);

  revalidatePath("/admin/orders");
  revalidatePath("/orders");
  revalidatePath("/order-status");
  for (const orderId of selectedOrderIds) {
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/orders/${orderId}`);
    revalidatePath(`/order-status/${orderId}`);
  }

  const targetUrl = new URL("http://localhost/admin/orders");
  if (currentFilter) {
    targetUrl.searchParams.set("status", currentFilter);
  }
  targetUrl.searchParams.set("bulk", "done");
  targetUrl.searchParams.set("updated", String(updated));
  targetUrl.searchParams.set("skipped", String(skipped));
  targetUrl.searchParams.set("action", bulkAction);

  redirect(`${targetUrl.pathname}${targetUrl.search}`);
}
