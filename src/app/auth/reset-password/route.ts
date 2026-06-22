import { NextResponse } from "next/server";

import { resetPasswordWithToken } from "@/lib/auth/password-reset";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = typeof formData.get("token") === "string" ? String(formData.get("token")) : "";
  const password = typeof formData.get("password") === "string" ? String(formData.get("password")) : "";
  const passwordConfirm =
    typeof formData.get("passwordConfirm") === "string" ? String(formData.get("passwordConfirm")) : "";

  const result = await resetPasswordWithToken({
    token,
    password,
    passwordConfirm,
  });

  if (!result.ok) {
    return NextResponse.redirect(
      new URL(`/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent(result.error)}`, request.url),
      { status: 303 },
    );
  }

  return NextResponse.redirect(new URL("/sign-in?reset=success", request.url), { status: 303 });
}
