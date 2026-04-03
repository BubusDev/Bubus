import { NextResponse } from "next/server";

import { resendVerificationEmail } from "@/lib/auth/resend-verification";

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
  const result = await resendVerificationEmail(email);

  const nextUrl = new URL(normalizeRedirectPath(redirectTo), request.url);
  nextUrl.searchParams.set(
    "status",
    result.status === "cooldown" ? "verification-cooldown" : "verification-sent",
  );

  if (result.previewUrl && process.env.NODE_ENV !== "production") {
    nextUrl.searchParams.set("preview", result.previewUrl);
  }

  return NextResponse.redirect(nextUrl);
}
