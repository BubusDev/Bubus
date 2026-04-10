"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { sendReturnRequestAdminNotificationIfNeeded } from "@/lib/admin-notifications";
import { db } from "@/lib/db";
import { getAccessibleCheckoutOrder } from "@/lib/order-access";
import { requestGuestOrderRecovery } from "@/lib/order-recovery";
import {
  resolveClientIp,
  resolveRecoveryCorrelationId,
} from "@/lib/order-recovery-observability";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function requestGuestOrderRecoveryAction(formData: FormData) {
  const orderNumber = readString(formData, "orderNumber");
  const email = readString(formData, "email");
  const headerStore = await headers();

  await requestGuestOrderRecovery(orderNumber, email, {
    clientIp: resolveClientIp(headerStore),
    correlationId: resolveRecoveryCorrelationId(headerStore),
  });

  redirect("/order-status/recover?status=sent");
}

export async function submitReturnRequestAction(formData: FormData) {
  const orderId = readString(formData, "orderId");
  const redirectTo = readString(formData, "redirectTo");
  const reason = readString(formData, "reason");
  const details = readString(formData, "details");

  if (!orderId || !redirectTo) {
    redirect("/");
  }

  const order = await getAccessibleCheckoutOrder(orderId);

  if (!order || details.length < 10) {
    redirect(`${redirectTo}?return=error`);
  }

  const orderWithRecipient = await db.order.findUnique({
    where: { id: order.id },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!orderWithRecipient) {
    redirect(`${redirectTo}?return=error`);
  }

  const request = await db.returnRequest.create({
    data: {
      orderId: order.id,
      requesterEmail: orderWithRecipient.user?.email ?? orderWithRecipient.guestEmail ?? "nincs@megadva.hu",
      reason: reason || null,
      details,
    },
  });

  await sendReturnRequestAdminNotificationIfNeeded(request.id);

  redirect(`${redirectTo}?return=requested`);
}
