"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  resendOrderStatusUpdateEmailByAdmin,
  sendOrderStatusUpdateEmailIfNeeded,
} from "@/lib/order-status-email";
import { getCustomerOrderStatusView } from "@/lib/order-status";

export async function updateOrderInternalStatusAction(formData: FormData) {
  await requireAdminUser("/admin/orders");

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
