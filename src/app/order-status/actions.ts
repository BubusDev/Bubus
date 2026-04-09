"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
