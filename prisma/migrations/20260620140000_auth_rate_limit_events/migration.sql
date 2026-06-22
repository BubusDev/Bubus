CREATE TABLE "AuthRateLimitEvent" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "identifierHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthRateLimitEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuthRateLimitEvent_scope_identifierHash_createdAt_idx" ON "AuthRateLimitEvent"("scope", "identifierHash", "createdAt");
CREATE INDEX "AuthRateLimitEvent_createdAt_idx" ON "AuthRateLimitEvent"("createdAt");
