import "server-only";

import { createHmac } from "crypto";

import { db } from "@/lib/db";
import { getAuthSecret } from "@/lib/env";

type AuthRateLimitConfig = {
  scope: string;
  identifiers: string[];
  limit: number;
  windowMs: number;
};

export class AuthRateLimitExceededError extends Error {
  constructor(readonly scope: string) {
    super("Auth rate limit exceeded.");
    this.name = "AuthRateLimitExceededError";
  }
}

function getHashSecret() {
  const secret = getAuthSecret();

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET or NEXTAUTH_SECRET is required for auth rate limiting.");
  }

  return secret ?? "bubus-dev-auth-rate-limit-secret";
}

function hashIdentifier(identifier: string) {
  return createHmac("sha256", getHashSecret()).update(identifier).digest("hex");
}

function normalizeIdentifier(identifier: string) {
  return identifier.trim().toLowerCase();
}

export function getRateLimitIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    firstForwardedIp ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

export async function assertAuthRateLimit({
  scope,
  identifiers,
  limit,
  windowMs,
}: AuthRateLimitConfig) {
  const normalizedIdentifiers = Array.from(
    new Set(identifiers.map(normalizeIdentifier).filter(Boolean)),
  );

  if (normalizedIdentifiers.length === 0) {
    return;
  }

  const cutoff = new Date(Date.now() - windowMs);
  const identifierHashes = normalizedIdentifiers.map(hashIdentifier);

  const counts = await Promise.all(
    identifierHashes.map((identifierHash) =>
      db.authRateLimitEvent.count({
        where: {
          scope,
          identifierHash,
          createdAt: { gte: cutoff },
        },
      }),
    ),
  );

  if (counts.some((count) => count >= limit)) {
    throw new AuthRateLimitExceededError(scope);
  }

  await db.$transaction([
    db.authRateLimitEvent.createMany({
      data: identifierHashes.map((identifierHash) => ({
        scope,
        identifierHash,
      })),
    }),
    db.authRateLimitEvent.deleteMany({
      where: {
        createdAt: { lt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      },
    }),
  ]);
}
