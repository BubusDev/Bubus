import { NextResponse } from "next/server";

import { sendWeeklyAdminSummaries } from "@/lib/admin-notifications";

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

  const result = await sendWeeklyAdminSummaries();

  return NextResponse.json({
    success: true,
    sent: result.sent,
    orderCount: result.orderCount,
    revenue: result.revenue,
    weekStart: result.weekStart.toISOString(),
    weekEnd: result.weekEnd.toISOString(),
  });
}
