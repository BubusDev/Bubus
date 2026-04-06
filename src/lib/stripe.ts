import Stripe from "stripe";

import { getAuthBaseUrl } from "@/lib/env";
import { STRIPE_CURRENCY } from "@/lib/catalog";

let stripeClient: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );
}

export function getStripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
}

export function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET ?? "";
}

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2025-03-31.basil",
    });
  }

  return stripeClient;
}

export function getStripeReturnUrl(orderId: string) {
  const baseUrl = process.env.STRIPE_RETURN_URL_BASE ?? getAuthBaseUrl();
  const normalized = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalized}/checkout/confirmation/${orderId}`;
}

export { STRIPE_CURRENCY };
