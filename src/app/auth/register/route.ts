import { NextResponse } from "next/server";

import {
  assertAuthRateLimit,
  AuthRateLimitExceededError,
  getRateLimitIp,
} from "@/lib/auth/rate-limit";
import { RegisterUserError, registerUser } from "@/lib/auth/register";

export const runtime = "nodejs";

function normalizeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/account";
  }

  return nextPath;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = typeof formData.get("email") === "string" ? String(formData.get("email")) : "";
  const password =
    typeof formData.get("password") === "string" ? String(formData.get("password")) : "";
  const passwordConfirm =
    typeof formData.get("passwordConfirm") === "string"
      ? String(formData.get("passwordConfirm"))
      : "";
  const termsAccepted = formData.get("termsAccepted") === "true";
  const nextPath =
    typeof formData.get("next") === "string" ? String(formData.get("next")) : "/account";
  const normalizedNextPath = normalizeNextPath(nextPath);

  try {
    await assertAuthRateLimit({
      scope: "auth:register",
      identifiers: [`ip:${getRateLimitIp(request)}`],
      limit: 3,
      windowMs: 30 * 60 * 1000,
    });

    const result = await registerUser({
      email,
      password,
      passwordConfirm,
      termsAccepted,
    });

    if (!result.ok) {
      const firstError = Object.keys(result.fieldErrors)[0] ?? "email";

      return NextResponse.redirect(
        new URL(
          `/sign-up?error=${encodeURIComponent(firstError)}&next=${encodeURIComponent(normalizedNextPath)}`,
          request.url,
        ),
        { status: 303 },
      );
    }

    const successUrl = new URL(
      `/sign-up?status=submitted&next=${encodeURIComponent(normalizedNextPath)}`,
      request.url,
    );

    return NextResponse.redirect(successUrl, { status: 303 });
  } catch (error) {
    if (error instanceof AuthRateLimitExceededError) {
      return NextResponse.redirect(
        new URL(
          `/sign-up?status=submitted&next=${encodeURIComponent(normalizedNextPath)}`,
          request.url,
        ),
        { status: 303 },
      );
    }

    console.error("[auth/register] Registration failed", {
      email,
      nextPath: normalizedNextPath,
      error,
    });

    if (error instanceof RegisterUserError) {
      return NextResponse.redirect(
        new URL(
          `/sign-up?error=emailDelivery&message=${encodeURIComponent(error.message)}&next=${encodeURIComponent(normalizedNextPath)}`,
          request.url,
        ),
        { status: 303 },
      );
    }

    return NextResponse.redirect(
      new URL(
        `/sign-up?error=service&next=${encodeURIComponent(normalizedNextPath)}`,
        request.url,
      ),
      { status: 303 },
    );
  }
}
