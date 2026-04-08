import { auth } from "../../../../../auth";
import { NextResponse } from "next/server";

import { fromStripeAmount } from "@/lib/catalog";
import {
  CheckoutAmountTooLowError,
  CheckoutConfigurationError,
  initializeStripeCheckoutForUser,
} from "@/lib/checkout";
import { InsufficientStockError } from "@/lib/inventory";

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
  const session = await auth();

  if (!session?.user?.id || !session.user.emailVerifiedAt) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const body = (await request.json()) as CheckoutIntentPayload;

  try {
    const checkout = await initializeStripeCheckoutForUser(session.user.id, {
      orderId: readString(body.orderId) || null,
      shippingName: readString(body.shippingName),
      shippingPhone: readString(body.shippingPhone),
      shippingAddress: readString(body.shippingAddress),
      shippingMethod: readString(body.shippingMethod) || "foxpost",
      foxpostPointCode: readString(body.foxpostPointCode) || null,
    });

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

    throw error;
  }
}
