-- CreateEnum
CREATE TYPE "PromoCodeEligibilityRule" AS ENUM ('ALL_USERS', 'REGISTERED_USERS_ONLY', 'GUEST_USERS_ONLY');

-- AlterTable
ALTER TABLE "PromoCode" ADD COLUMN "eligibilityRule" "PromoCodeEligibilityRule" NOT NULL DEFAULT 'ALL_USERS';

-- CreateIndex
CREATE INDEX "PromoCode_eligibilityRule_isActive_idx" ON "PromoCode"("eligibilityRule", "isActive");
