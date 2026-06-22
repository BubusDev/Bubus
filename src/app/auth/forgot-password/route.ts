import { NextResponse } from "next/server";

import {
  assertAuthRateLimit,
  AuthRateLimitExceededError,
  getRateLimitIp,
} from "@/lib/auth/rate-limit";
import { EmailDeliveryError } from "@/lib/auth/email";
import { createPasswordResetTokenForEmail } from "@/lib/auth/password-reset";
import { normalizeEmail } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = typeof formData.get("email") === "string" ? String(formData.get("email")) : "";
  const normalizedEmail = normalizeEmail(email);
  const ip = getRateLimitIp(request);

  try {
    await assertAuthRateLimit({
      scope: "auth:forgot-password:email-ip",
      identifiers: [`email-ip:${normalizedEmail}:${ip}`],
      limit: 3,
      windowMs: 30 * 60 * 1000,
    });

    await assertAuthRateLimit({
      scope: "auth:forgot-password:ip",
      identifiers: [`ip:${ip}`],
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });

    const result = await createPasswordResetTokenForEmail(normalizedEmail);

    if (!result.ok) {
      return NextResponse.redirect(new URL("/forgot-password?error=email", request.url), { status: 303 });
    }
  } catch (error) {
    if (error instanceof AuthRateLimitExceededError) {
      return NextResponse.redirect(new URL("/forgot-password?error=rate-limited", request.url), { status: 303 });
    }

    if (error instanceof EmailDeliveryError) {
      console.error("[auth/forgot-password] Password reset email delivery failed", {
        code: error.code,
        cause: error.cause,
      });

      return NextResponse.redirect(new URL("/forgot-password?status=sent", request.url), { status: 303 });
    }

    console.error("[auth/forgot-password] Password reset request failed", {
      error,
    });

    return NextResponse.redirect(new URL("/forgot-password?error=service", request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL("/forgot-password?status=sent", request.url), { status: 303 });
}
