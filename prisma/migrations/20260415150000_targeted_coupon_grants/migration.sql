-- Normalize any legacy guest-only coupons before removing that eligibility value.
UPDATE "PromoCode"
SET "eligibilityRule" = 'ALL_USERS'
WHERE "eligibilityRule" = 'GUEST_USERS_ONLY';

-- Remove GUEST_USERS_ONLY from the enum by replacing the PostgreSQL enum type.
CREATE TYPE "PromoCodeEligibilityRule_new" AS ENUM ('ALL_USERS', 'REGISTERED_USERS_ONLY');

ALTER TABLE "PromoCode"
  ALTER COLUMN "eligibilityRule" DROP DEFAULT,
  ALTER COLUMN "eligibilityRule" TYPE "PromoCodeEligibilityRule_new"
  USING ("eligibilityRule"::text::"PromoCodeEligibilityRule_new"),
  ALTER COLUMN "eligibilityRule" SET DEFAULT 'ALL_USERS';

DROP TYPE "PromoCodeEligibilityRule";
ALTER TYPE "PromoCodeEligibilityRule_new" RENAME TO "PromoCodeEligibilityRule";

-- Targeted coupon grants for welcome and newsletter coupons.
CREATE TABLE "PromoCodeGrant" (
    "id" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "cycle" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCodeGrant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PromoCodeGrant_promoCodeId_userId_key" ON "PromoCodeGrant"("promoCodeId", "userId");
CREATE UNIQUE INDEX "PromoCodeGrant_userId_source_cycle_key" ON "PromoCodeGrant"("userId", "source", "cycle");
CREATE INDEX "PromoCodeGrant_userId_createdAt_idx" ON "PromoCodeGrant"("userId", "createdAt");
CREATE INDEX "PromoCodeGrant_source_cycle_idx" ON "PromoCodeGrant"("source", "cycle");

ALTER TABLE "PromoCodeGrant" ADD CONSTRAINT "PromoCodeGrant_promoCodeId_fkey"
  FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PromoCodeGrant" ADD CONSTRAINT "PromoCodeGrant_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
