import { NextResponse } from "next/server";
import { AuthError } from "next-auth";

import { signIn } from "../../../../auth";
import { mergeGuestCartIntoUserCart } from "@/lib/account";
import { verifyCredentials } from "@/lib/auth/credentials";
import { normalizeEmail } from "@/lib/auth/validation";
import { getGuestCartToken } from "@/lib/cartToken";

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
  const nextPath =
    typeof formData.get("next") === "string" ? String(formData.get("next")) : "/account";
  const normalizedNextPath = normalizeNextPath(nextPath);
  const normalizedEmail = normalizeEmail(email);

  try {
    const [guestToken, user] = await Promise.all([
      getGuestCartToken(),
      verifyCredentials(normalizedEmail, password),
    ]);

    if (guestToken && user) {
      await mergeGuestCartIntoUserCart(user.id, guestToken);
    }

    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirect: false,
      redirectTo: normalizedNextPath,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const errorParam = error.type === "CredentialsSignin" ? "invalid" : "service";

      if (errorParam === "service") {
        console.error("[auth/login] Auth.js sign-in failed", {
          email,
          nextPath: normalizedNextPath,
          type: error.type,
          cause: error.cause,
        });
      }

      return NextResponse.redirect(
        new URL(
          `/sign-in?error=${encodeURIComponent(errorParam)}&next=${encodeURIComponent(normalizedNextPath)}`,
          request.url,
        ),
        { status: 303 },
      );
    }

    throw error;
  }

  return NextResponse.redirect(new URL(normalizedNextPath, request.url), { status: 303 });
}
