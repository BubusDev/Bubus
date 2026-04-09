import { NextResponse } from "next/server";

import { fromStripeAmount } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { getGuestCartToken } from "@/lib/cartToken";
import { getCheckoutSession } from "@/lib/checkoutSession";
import {
  CheckoutAmountTooLowError,
  CheckoutConfigurationError,
  initializeStripeCheckout,
} from "@/lib/checkout";
import { logCheckoutEvent, resolveRequestCorrelationId } from "@/lib/checkout-observability";
import { InsufficientStockError } from "@/lib/inventory";
import { setGuestOrderAccessToken } from "@/lib/orderAccessToken";

type CheckoutIntentPayload = {
  orderId?: string | null;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  shippingMethod?: string;
  foxpostPointCode?: string | null;
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const correlationId = resolveRequestCorrelationId(request);
  const [user, guestToken, checkoutSession] = await Promise.all([
    getCurrentUser(),
    getGuestCartToken(),
    getCheckoutSession(),
  ]);

  const body = (await request.json()) as CheckoutIntentPayload;
  const email = user?.emailVerifiedAt ? user.email : checkoutSession?.email ?? "";

  if (!email) {
    logCheckoutEvent(
      "warn",
      "payment_intent_initialization_rejected",
      { actorType: user?.emailVerifiedAt ? "authenticated" : "guest", result: "rejected", reason: "missing_checkout_email" },
      { correlationId },
    );
    return NextResponse.json({ error: "CHECKOUT_EMAIL_REQUIRED" }, { status: 400 });
  }

  try {
    const checkout = await initializeStripeCheckout(
      {
        userId: user?.emailVerifiedAt ? user.id : null,
        guestToken: user?.emailVerifiedAt ? null : guestToken,
        email,
      },
      {
        orderId: readString(body.orderId) || null,
        email,
        shippingName: readString(body.shippingName),
        shippingPhone: readString(body.shippingPhone),
        shippingAddress: readString(body.shippingAddress),
        shippingMethod: readString(body.shippingMethod) || "foxpost",
        foxpostPointCode: readString(body.foxpostPointCode) || null,
      },
      { correlationId },
    );

    if (checkout.guestOrderAccessToken) {
      await setGuestOrderAccessToken(checkout.orderId, checkout.guestOrderAccessToken);
    }

    return NextResponse.json(checkout);
  } catch (error) {
    if (error instanceof CheckoutConfigurationError) {
      return NextResponse.json({ error: "STRIPE_NOT_CONFIGURED" }, { status: 503 });
    }

    if (error instanceof InsufficientStockError) {
      return NextResponse.json({ error: "INSUFFICIENT_STOCK" }, { status: 409 });
    }

    if (error instanceof CheckoutAmountTooLowError) {
      return NextResponse.json(
        {
          error: "AMOUNT_BELOW_MINIMUM",
          minimumAmount: fromStripeAmount(error.minimumStripeAmount, "huf"),
          currency: error.currency.toUpperCase(),
        },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "INVALID_SHIPPING") {
      return NextResponse.json({ error: "INVALID_SHIPPING" }, { status: 400 });
    }

    if (error instanceof Error && error.message === "CART_EMPTY") {
      return NextResponse.json({ error: "CART_EMPTY" }, { status: 400 });
    }

    if (error instanceof Error && error.message === "CART_OWNER_REQUIRED") {
      return NextResponse.json({ error: "CART_EMPTY" }, { status: 400 });
    }

    throw error;
  }
}
