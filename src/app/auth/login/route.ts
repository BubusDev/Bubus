import { NextResponse } from "next/server";
import { AuthError } from "next-auth";

import { signIn } from "../../../../auth";

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

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: normalizeNextPath(nextPath),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.redirect(
        new URL(
          `/sign-in?error=invalid&next=${encodeURIComponent(normalizeNextPath(nextPath))}`,
          request.url,
        ),
      );
    }

    throw error;
  }

  return NextResponse.redirect(new URL(normalizeNextPath(nextPath), request.url));
}
