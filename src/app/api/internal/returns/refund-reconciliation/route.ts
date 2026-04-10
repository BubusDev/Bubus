import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { reconcilePendingStripeRefundBackfill } from "@/lib/pending-refund-backfill";

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
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const result = await reconcilePendingStripeRefundBackfill();

  if (result.changedRequestIds.length > 0) {
    revalidatePath("/admin");
    revalidatePath("/admin/activity");
    revalidatePath("/admin/returns");

    for (const requestId of result.changedRequestIds) {
      revalidatePath(`/admin/returns/${requestId}`);
    }
  }

  return NextResponse.json({
    success: true,
    attempted: result.attempted,
    updated: result.updated,
    stillPending: result.stillPending,
    failed: result.failed,
    stripeErrors: result.stripeErrors,
    skipped: result.skipped,
    batchSize: result.batchSize,
    minAgeMinutes: Math.round(result.minAgeMs / 60_000),
    cutoff: result.cutoff.toISOString(),
  });
}
