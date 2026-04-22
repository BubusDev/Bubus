import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { CONSENT_VERSION, type ConsentState } from "@/lib/cookie-consent-client";

type ConsentRequestBody = {
  state?: Partial<ConsentState>;
  version?: number;
};

function readClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (!forwardedFor) {
    return null;
  }

  const firstIp = forwardedFor.split(",")[0]?.trim();
  return firstIp || null;
}

function hashIp(ip: string | null) {
  if (!ip) {
    return null;
  }

  const salt = process.env.CONSENT_LOG_SALT;

  if (!salt) {
    throw new Error("CONSENT_LOG_SALT is not set.");
  }

  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function isValidState(state: Partial<ConsentState> | undefined): state is ConsentState {
  return (
    state?.essential === true &&
    typeof state.statistics === "boolean" &&
    typeof state.marketing === "boolean"
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConsentRequestBody;

    if (!isValidState(body.state) || body.version !== CONSENT_VERSION) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // TODO: Add rate limiting to reduce consent-log flooding and abuse.
    await db.consentLog.create({
      data: {
        state: body.state,
        version: body.version,
        userAgent: request.headers.get("user-agent") ?? null,
        ipHash: hashIp(readClientIp(request)),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
