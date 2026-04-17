import { NextResponse } from "next/server";

import { processBlobCleanupQueue } from "@/lib/blob-cleanup";

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

async function handleCleanupRequest(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get("limit"));
  const batchSize = Number.isFinite(requestedLimit) ? requestedLimit : undefined;
  const result = await processBlobCleanupQueue({ batchSize });

  return NextResponse.json({
    success: true,
    ...result,
  });
}

export async function POST(request: Request) {
  return handleCleanupRequest(request);
}

export async function GET(request: Request) {
  return handleCleanupRequest(request);
}
