import { NextResponse } from "next/server";

import {
  getNewsletterCouponCycle,
  grantMonthlyNewsletterCoupons,
} from "@/lib/coupon-grants";

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

  const url = new URL(request.url);
  const cycle = url.searchParams.get("cycle") ?? getNewsletterCouponCycle();
  const result = await grantMonthlyNewsletterCoupons(cycle);

  return NextResponse.json({
    success: true,
    ...result,
  });
}

export async function GET(request: Request) {
  return POST(request);
}
