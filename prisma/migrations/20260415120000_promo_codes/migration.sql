-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "oneTimeUse" BOOLEAN NOT NULL DEFAULT false,
    "totalUsageLimit" INTEGER,
    "perCustomerUsageLimit" INTEGER,
    "minimumOrderAmount" INTEGER,
    "redeemedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCodeRedemption" (
    "id" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT,
    "customerEmail" TEXT,
    "discountAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCodeRedemption_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN "promoCodeId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "discountAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "promoCodeId" TEXT,
ADD COLUMN "promoCodeText" TEXT,
ADD COLUMN "promoDiscountPercent" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_isActive_validFrom_validUntil_idx" ON "PromoCode"("isActive", "validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "PromoCode_redeemedCount_idx" ON "PromoCode"("redeemedCount");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCodeRedemption_orderId_key" ON "PromoCodeRedemption"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCodeRedemption_promoCodeId_userId_key" ON "PromoCodeRedemption"("promoCodeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCodeRedemption_promoCodeId_customerEmail_key" ON "PromoCodeRedemption"("promoCodeId", "customerEmail");

-- CreateIndex
CREATE INDEX "PromoCodeRedemption_promoCodeId_createdAt_idx" ON "PromoCodeRedemption"("promoCodeId", "createdAt");

-- CreateIndex
CREATE INDEX "PromoCodeRedemption_userId_createdAt_idx" ON "PromoCodeRedemption"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PromoCodeRedemption_customerEmail_createdAt_idx" ON "PromoCodeRedemption"("customerEmail", "createdAt");

-- CreateIndex
CREATE INDEX "Cart_promoCodeId_idx" ON "Cart"("promoCodeId");

-- CreateIndex
CREATE INDEX "Order_promoCodeId_idx" ON "Order"("promoCodeId");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeRedemption" ADD CONSTRAINT "PromoCodeRedemption_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeRedemption" ADD CONSTRAINT "PromoCodeRedemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeRedemption" ADD CONSTRAINT "PromoCodeRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
