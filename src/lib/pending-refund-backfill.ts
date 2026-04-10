import { db } from "@/lib/db";
import { reconcileReturnRequestRefundFromStripe } from "@/lib/return-refund-reconciliation";
import { getStripe } from "@/lib/stripe";

const DEFAULT_PENDING_REFUND_BACKFILL_MIN_AGE_MS = 15 * 60 * 1000;
const DEFAULT_PENDING_REFUND_BACKFILL_BATCH_SIZE = 50;

export type PendingRefundBackfillResult = {
  attempted: number;
  updated: number;
  stillPending: number;
  failed: number;
  stripeErrors: number;
  skipped: number;
  changedRequestIds: string[];
  minAgeMs: number;
  batchSize: number;
  cutoff: Date;
};

export async function reconcilePendingStripeRefundBackfill(params?: {
  now?: Date;
  minAgeMs?: number;
  batchSize?: number;
}): Promise<PendingRefundBackfillResult> {
  const now = params?.now ?? new Date();
  const minAgeMs = Math.max(60_000, params?.minAgeMs ?? DEFAULT_PENDING_REFUND_BACKFILL_MIN_AGE_MS);
  const batchSize = Math.max(1, Math.min(200, params?.batchSize ?? DEFAULT_PENDING_REFUND_BACKFILL_BATCH_SIZE));
  const cutoff = new Date(now.getTime() - minAgeMs);

  // Only backfill stale pending refunds so recently-created Stripe refunds can settle via webhook first.
  const requests = await db.returnRequest.findMany({
    where: {
      refundStatus: "pending",
      stripeRefundId: {
        not: null,
      },
      refundProcessingAt: null,
      updatedAt: {
        lte: cutoff,
      },
    },
    orderBy: {
      updatedAt: "asc",
    },
    take: batchSize,
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

  let updated = 0;
  let stillPending = 0;
  let failed = 0;
  let stripeErrors = 0;
  let skipped = 0;
  const changedRequestIds: string[] = [];

  for (const request of requests) {
    const result = await reconcileReturnRequestRefundFromStripe({
      request,
      changedById: null,
      retrieveStripeRefund: (refundId) => getStripe().refunds.retrieve(refundId),
      sendConfirmationEmail: false,
      sendFailureEmail: true,
    });

    if (!result.ok) {
      if (result.reason === "stripe_error") {
        stripeErrors += 1;
      } else {
        skipped += 1;
      }
      continue;
    }

    if (result.refundChanged) {
      updated += 1;
      changedRequestIds.push(request.id);
    }

    if (result.refundStatus === "pending") {
      stillPending += 1;
      continue;
    }

    if (result.refundStatus === "failed") {
      failed += 1;
      continue;
    }
  }

  return {
    attempted: requests.length,
    updated,
    stillPending,
    failed,
    stripeErrors,
    skipped,
    changedRequestIds,
    minAgeMs,
    batchSize,
    cutoff,
  };
}
