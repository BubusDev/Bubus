import { NextResponse } from "next/server";

import { verifyEmailToken } from "@/lib/auth/email-verification";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = typeof formData.get("token") === "string" ? String(formData.get("token")) : "";
  const status = await verifyEmailToken(token);
  const nextUrl = new URL("/verify-email", request.url);

  nextUrl.searchParams.set("status", status);

  return NextResponse.redirect(nextUrl, { status: 303 });
}
