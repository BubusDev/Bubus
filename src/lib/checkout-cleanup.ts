import { OrderPaymentStatus, type Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { createDurationTracker, logCheckoutEvent } from "@/lib/checkout-observability";

export const STALE_CHECKOUT_WINDOW_MS = 1000 * 60 * 60 * 24;
export const REUSABLE_DRAFT_STATUSES = [
  OrderPaymentStatus.PENDING,
  OrderPaymentStatus.PROCESSING,
  OrderPaymentStatus.FAILED,
  OrderPaymentStatus.CANCELED,
  OrderPaymentStatus.STOCK_UNAVAILABLE,
] as const;

type CheckoutCleanupOwner =
  | { userId: string; guestEmail?: never }
  | { guestEmail: string; userId?: never };

export function getStaleCheckoutCutoff(now = new Date()) {
  return new Date(now.getTime() - STALE_CHECKOUT_WINDOW_MS);
}

function buildStaleCheckoutOwnerWhere(owner?: CheckoutCleanupOwner): Prisma.OrderWhereInput {
  if (!owner) {
    return {};
  }

  if ("userId" in owner) {
    return { userId: owner.userId };
  }

  return {
    userId: null,
    guestEmail: owner.guestEmail,
  };
}

export async function expireStaleCheckoutOrders(
  tx: Prisma.TransactionClient,
  owner?: CheckoutCleanupOwner,
  now = new Date(),
  correlationId?: string,
) {
  const duration = createDurationTracker();
  const staleCutoff = getStaleCheckoutCutoff(now);
  const result = await tx.order.updateMany({
    where: {
      ...buildStaleCheckoutOwnerWhere(owner),
      paymentStatus: {
        in: [
          OrderPaymentStatus.PENDING,
          OrderPaymentStatus.PROCESSING,
          OrderPaymentStatus.FAILED,
        ],
      },
      paidAt: null,
      updatedAt: {
        lt: staleCutoff,
      },
    },
    data: {
      paymentStatus: OrderPaymentStatus.CANCELED,
      status: "Lejárt pénztárfolyamat",
      statusUpdatedAt: now,
    },
  });

  logCheckoutEvent(
    "log",
    "stale_checkout_cleanup_run",
    {
      actorType: owner ? ("userId" in owner ? "authenticated" : "guest") : "system",
      status: "completed",
      result: result.count > 0 ? "expired_orders_found" : "no_stale_orders",
      scope: owner ? ("userId" in owner ? "user" : "guest_email") : "global",
      ownerUserId: owner && "userId" in owner ? owner.userId : null,
      ownerGuestEmailPresent: owner ? "guestEmail" in owner : false,
      expiredOrders: result.count,
      staleCutoff: staleCutoff.toISOString(),
      durationMs: duration.elapsedMs(),
    },
    { correlationId },
  );

  return {
    expiredOrders: result.count,
    staleCutoff,
  };
}

export async function cleanupStaleCheckoutState(now = new Date(), correlationId?: string) {
  const duration = createDurationTracker();
  const result = await db.$transaction((tx) =>
    expireStaleCheckoutOrders(tx, undefined, now, correlationId),
  );

  logCheckoutEvent(
    "log",
    "stale_checkout_cleanup_completed",
    {
      actorType: "system",
      status: "completed",
      result: result.expiredOrders > 0 ? "expired_orders_found" : "no_stale_orders",
      scope: "global",
      expiredOrders: result.expiredOrders,
      staleCutoff: result.staleCutoff.toISOString(),
      durationMs: duration.elapsedMs(),
    },
    { correlationId },
  );

  return result;
}
