import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { OrderPaymentStatus } from "@prisma/client";

import {
  finalizePaidOrder,
  markOrderPaymentState,
} from "@/lib/checkout";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  console.log("[stripe-webhook] request received", {
    method: request.method,
    url: request.url,
  });

  const signature = request.headers.get("stripe-signature");
  const webhookSecret = getStripeWebhookSecret();

  if (!signature || !webhookSecret) {
    console.error("[stripe-webhook] configuration error", {
      hasSignature: Boolean(signature),
      hasWebhookSecret: Boolean(webhookSecret),
    });
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe-webhook] signature verification failed", {
      message: error instanceof Error ? error.message : "Invalid webhook signature.",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook signature." },
      { status: 400 },
    );
  }

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

    console.log("[stripe-webhook] event received", {
      eventType: event.type,
      paymentIntentId,
      metadataOrderId,
    });
  } else {
    console.log("[stripe-webhook] event received", {
      eventType: event.type,
      paymentIntentId: null,
      metadataOrderId: null,
    });
  }

  switch (event.type) {
    case "payment_intent.processing": {
      await markOrderPaymentState(
        event.data.object.id,
        OrderPaymentStatus.PROCESSING,
        "Fizetés feldolgozás alatt",
      );
      break;
    }
    case "payment_intent.payment_failed": {
      await markOrderPaymentState(
        event.data.object.id,
        OrderPaymentStatus.FAILED,
        "Sikertelen fizetés",
      );
      break;
    }
    case "payment_intent.canceled": {
      await markOrderPaymentState(
        event.data.object.id,
        OrderPaymentStatus.CANCELED,
        "Megszakított fizetés",
      );
      break;
    }
    case "payment_intent.succeeded": {
      console.log("[stripe-webhook] finalization triggered", {
        eventType: event.type,
        paymentIntentId: event.data.object.id,
        metadataOrderId:
          typeof event.data.object.metadata?.orderId === "string"
            ? event.data.object.metadata.orderId
            : null,
      });

      const result = await finalizePaidOrder({
        paymentIntentId: event.data.object.id,
        stripeAmount: event.data.object.amount_received,
        orderId:
          typeof event.data.object.metadata?.orderId === "string"
            ? event.data.object.metadata.orderId
            : null,
      });

      console.log("[stripe-webhook] finalization result", {
        eventType: event.type,
        paymentIntentId: event.data.object.id,
        resultType: result.type,
      });

      if ("paths" in result && result.paths) {
        for (const path of result.paths) {
          revalidatePath(path);
        }
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
