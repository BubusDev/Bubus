import { NextResponse } from "next/server";

import { confirmEmailChangeToken } from "@/lib/auth/email-change";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = typeof formData.get("token") === "string" ? String(formData.get("token")) : "";
  const status = await confirmEmailChangeToken(token);
  const nextUrl = new URL("/confirm-email-change", request.url);

  nextUrl.searchParams.set("status", status);

  return NextResponse.redirect(nextUrl, { status: 303 });
}
