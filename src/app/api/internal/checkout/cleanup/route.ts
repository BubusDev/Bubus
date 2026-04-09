import { NextResponse } from "next/server";

import { cleanupStaleCheckoutState } from "@/lib/checkout-cleanup";
import { logCheckoutEvent, resolveRequestCorrelationId } from "@/lib/checkout-observability";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return false;
  }

  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  const headerToken = request.headers.get("x-cron-secret");

  return bearerToken === secret || headerToken === secret;
}

export async function POST(request: Request) {
  const correlationId = resolveRequestCorrelationId(request);
  if (!isAuthorized(request)) {
    logCheckoutEvent(
      "warn",
      "stale_checkout_cleanup_request_rejected",
      {
        actorType: "system",
        result: "rejected",
        reason: "unauthorized",
      },
      { correlationId },
    );
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  logCheckoutEvent(
    "log",
    "stale_checkout_cleanup_request_started",
    {
      actorType: "system",
      status: "started",
      trigger: "internal_route",
    },
    { correlationId },
  );

  const result = await cleanupStaleCheckoutState(new Date(), correlationId);

  logCheckoutEvent(
    "log",
    "stale_checkout_cleanup_request_completed",
    {
      actorType: "system",
      status: "completed",
      result: result.expiredOrders > 0 ? "expired_orders_found" : "no_stale_orders",
      trigger: "internal_route",
      expiredOrders: result.expiredOrders,
      staleCutoff: result.staleCutoff.toISOString(),
    },
    { correlationId },
  );

  return NextResponse.json({
    success: true,
    expiredOrders: result.expiredOrders,
    staleCutoff: result.staleCutoff.toISOString(),
  });
}
