import { NextResponse } from "next/server";

import { registerUser } from "@/lib/auth/register";

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
        `/sign-up?error=${encodeURIComponent(firstError)}&next=${encodeURIComponent(normalizeNextPath(nextPath))}`,
        request.url,
      ),
    );
  }

  const successUrl = new URL(
    `/sign-up?status=submitted&next=${encodeURIComponent(normalizeNextPath(nextPath))}`,
    request.url,
  );

  if (result.previewUrl && process.env.NODE_ENV !== "production") {
    successUrl.searchParams.set("preview", result.previewUrl);
  }

  return NextResponse.redirect(successUrl);
}
