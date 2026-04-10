import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { OrderPaymentStatus } from "@prisma/client";

import {
  finalizePaidOrder,
  markOrderPaymentState,
} from "@/lib/checkout";
import { logCheckoutEvent, resolveRequestCorrelationId } from "@/lib/checkout-observability";
import { db } from "@/lib/db";
import { reconcileReturnRequestRefundWithStripeRefund } from "@/lib/return-refund-reconciliation";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestCorrelationId = resolveRequestCorrelationId(request);
  logCheckoutEvent("log", "webhook_request_received", {
    actorType: "system",
    status: "received",
    method: request.method,
    url: request.url,
    requestCorrelationId,
  }, { correlationId: requestCorrelationId });

  const signature = request.headers.get("stripe-signature");
  const webhookSecret = getStripeWebhookSecret();

  if (!signature || !webhookSecret) {
    logCheckoutEvent("error", "webhook_configuration_error", {
      actorType: "system",
      result: "invalid_configuration",
      hasSignature: Boolean(signature),
      hasWebhookSecret: Boolean(webhookSecret),
      requestCorrelationId,
    }, { correlationId: requestCorrelationId });
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    logCheckoutEvent("error", "webhook_signature_verification_failed", {
      actorType: "system",
      result: "signature_verification_failed",
      message: error instanceof Error ? error.message : "Invalid webhook signature.",
      requestCorrelationId,
    }, { correlationId: requestCorrelationId });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook signature." },
      { status: 400 },
    );
  }

  let checkoutCorrelationId = requestCorrelationId;

  if ("object" in event.data && event.data.object && typeof event.data.object === "object") {
    const paymentIntentId =
      "id" in event.data.object && typeof event.data.object.id === "string"
        ? event.data.object.id
        : null;
    const metadataOrderId =
      "metadata" in event.data.object &&
      event.data.object.metadata &&
      typeof event.data.object.metadata === "object" &&
      "orderId" in event.data.object.metadata &&
      typeof event.data.object.metadata.orderId === "string"
        ? event.data.object.metadata.orderId
        : null;
    const metadataCorrelationId =
      "metadata" in event.data.object &&
      event.data.object.metadata &&
      typeof event.data.object.metadata === "object" &&
      "correlationId" in event.data.object.metadata &&
      typeof event.data.object.metadata.correlationId === "string" &&
      event.data.object.metadata.correlationId
        ? event.data.object.metadata.correlationId
        : null;

    checkoutCorrelationId = metadataCorrelationId ?? requestCorrelationId;

    logCheckoutEvent("log", "webhook_event_received", {
      actorType: "system",
      status: "received",
      eventType: event.type,
      paymentIntentId,
      metadataOrderId,
      requestCorrelationId,
    }, { correlationId: checkoutCorrelationId });
  } else {
    logCheckoutEvent("log", "webhook_event_received", {
      actorType: "system",
      status: "received",
      eventType: event.type,
      paymentIntentId: null,
      metadataOrderId: null,
      requestCorrelationId,
    }, { correlationId: checkoutCorrelationId });
  }

  switch (event.type) {
    case "refund.created":
    case "refund.updated":
    case "refund.failed": {
      const refund = event.data.object;
      const request = await db.returnRequest.findUnique({
        where: { stripeRefundId: refund.id },
        select: {
          id: true,
          status: true,
          refundStatus: true,
          refundedAmount: true,
          refundedAt: true,
          stripeRefundId: true,
          order: {
            select: {
              currency: true,
            },
          },
        },
      });

      if (!request) {
        logCheckoutEvent("log", "webhook_refund_reconciliation_skipped", {
          actorType: "system",
          status: "ignored",
          eventType: event.type,
          refundId: refund.id,
          reason: "return_request_not_found",
          requestCorrelationId,
        }, { correlationId: checkoutCorrelationId });
        break;
      }

      if (request.refundStatus !== "pending") {
        logCheckoutEvent("log", "webhook_refund_reconciliation_skipped", {
          actorType: "system",
          status: "ignored",
          eventType: event.type,
          refundId: refund.id,
          returnRequestId: request.id,
          currentRefundStatus: request.refundStatus,
          reason: "local_refund_not_pending",
          requestCorrelationId,
        }, { correlationId: checkoutCorrelationId });
        break;
      }

      const result = await reconcileReturnRequestRefundWithStripeRefund({
        request,
        stripeRefund: refund,
        changedById: null,
        sendConfirmationEmail: false,
      });

      logCheckoutEvent("log", "webhook_refund_reconciliation_result", {
        actorType: "system",
        status: result.ok ? "completed" : "ignored",
        eventType: event.type,
        refundId: refund.id,
        returnRequestId: request.id,
        previousRefundStatus: request.refundStatus,
        result: result.ok ? result.refundStatus : result.reason,
        refundChanged: result.ok ? result.refundChanged : false,
        requestCorrelationId,
      }, { correlationId: checkoutCorrelationId });

      revalidatePath("/admin/returns");
      revalidatePath(`/admin/returns/${request.id}`);
      revalidatePath("/admin/activity");
      revalidatePath("/admin");
      break;
    }
    case "payment_intent.processing": {
      await markOrderPaymentState(
        event.data.object.id,
        OrderPaymentStatus.PROCESSING,
        "Fizetés feldolgozás alatt",
        checkoutCorrelationId,
      );
      break;
    }
    case "payment_intent.payment_failed": {
      await markOrderPaymentState(
        event.data.object.id,
        OrderPaymentStatus.FAILED,
        "Sikertelen fizetés",
        checkoutCorrelationId,
      );
      break;
    }
    case "payment_intent.canceled": {
      await markOrderPaymentState(
        event.data.object.id,
        OrderPaymentStatus.CANCELED,
        "Megszakított fizetés",
        checkoutCorrelationId,
      );
      break;
    }
    case "payment_intent.succeeded": {
      logCheckoutEvent("log", "webhook_finalization_triggered", {
        actorType: "system",
        status: "started",
        eventType: event.type,
        paymentIntentId: event.data.object.id,
        metadataOrderId:
          typeof event.data.object.metadata?.orderId === "string"
            ? event.data.object.metadata.orderId
            : null,
        requestCorrelationId,
      }, { correlationId: checkoutCorrelationId });

      const result = await finalizePaidOrder({
        paymentIntentId: event.data.object.id,
        stripeAmount: event.data.object.amount_received,
        orderId:
          typeof event.data.object.metadata?.orderId === "string"
            ? event.data.object.metadata.orderId
            : null,
        cartId:
          typeof event.data.object.metadata?.cartId === "string"
            ? event.data.object.metadata.cartId
            : null,
      }, checkoutCorrelationId);

      logCheckoutEvent("log", "webhook_finalization_result", {
        actorType: "system",
        status: "completed",
        result: result.type,
        eventType: event.type,
        paymentIntentId: event.data.object.id,
        resultType: result.type,
        requestCorrelationId,
      }, { correlationId: checkoutCorrelationId });

      if ("paths" in result && result.paths) {
        for (const path of result.paths) {
          revalidatePath(path);
        }
      }

      if (result.type === "paid" || result.type === "already_paid") {
        revalidatePath("/", "layout");
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
