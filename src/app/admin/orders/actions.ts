"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function updateOrderInternalStatusAction(formData: FormData) {
  await requireAdminUser("/admin/orders");

  const orderId = formData.get("orderId");
  const internalStatus = formData.get("internalStatus");
  const trackingNumber = formData.get("trackingNumber");
  const shippingMethod = formData.get("shippingMethod");
  const internalNote = formData.get("internalNote");

  if (typeof orderId !== "string" || !orderId) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db.order.update as any)({
    where: { id: orderId },
    data: {
      internalStatus: typeof internalStatus === "string" ? internalStatus : undefined,
      trackingNumber: typeof trackingNumber === "string" ? trackingNumber || null : undefined,
      shippingMethod: typeof shippingMethod === "string" ? shippingMethod || null : undefined,
      internalNote: typeof internalNote === "string" ? internalNote || null : undefined,
      statusUpdatedAt: new Date(),
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}`);
}
