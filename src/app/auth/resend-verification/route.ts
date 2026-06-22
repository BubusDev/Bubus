import { NextResponse } from "next/server";

import {
  assertAuthRateLimit,
  AuthRateLimitExceededError,
  getRateLimitIp,
} from "@/lib/auth/rate-limit";
import { resendVerificationEmail } from "@/lib/auth/resend-verification";
import { normalizeEmail } from "@/lib/auth/validation";

export const runtime = "nodejs";

function normalizeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/verify-email";
  }

  return value;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = typeof formData.get("email") === "string" ? String(formData.get("email")) : "";
  const redirectTo =
    typeof formData.get("redirectTo") === "string" ? String(formData.get("redirectTo")) : "/verify-email";
  const normalizedEmail = normalizeEmail(email);
  const ip = getRateLimitIp(request);
  let status = "verification-sent";

  try {
    await assertAuthRateLimit({
      scope: "auth:resend-verification",
      identifiers: [
        `ip:${ip}`,
        `email:${normalizedEmail}`,
        `email-ip:${normalizedEmail}:${ip}`,
      ],
      limit: 3,
      windowMs: 30 * 60 * 1000,
    });

    const result = await resendVerificationEmail(email);
    status = result.status === "cooldown" ? "verification-cooldown" : "verification-sent";
  } catch (error) {
    if (!(error instanceof AuthRateLimitExceededError)) {
      throw error;
    }
  }

  const nextUrl = new URL(normalizeRedirectPath(redirectTo), request.url);
  nextUrl.searchParams.set("status", status);

  return NextResponse.redirect(nextUrl);
}
