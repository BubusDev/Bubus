-- DropIndex
DROP INDEX "PromoCodeRedemption_promoCodeId_userId_key";

-- DropIndex
DROP INDEX "PromoCodeRedemption_promoCodeId_customerEmail_key";

-- AlterTable
ALTER TABLE "PromoCodeRedemption" ADD COLUMN "customerKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PromoCodeRedemption_promoCodeId_customerKey_key" ON "PromoCodeRedemption"("promoCodeId", "customerKey");
