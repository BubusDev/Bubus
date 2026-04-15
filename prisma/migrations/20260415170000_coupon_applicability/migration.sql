-- CreateEnum
CREATE TYPE "PromoCodeApplicabilityScope" AS ENUM ('ALL_PRODUCTS', 'CATEGORIES', 'PRODUCTS');

-- AlterTable
ALTER TABLE "PromoCode" ADD COLUMN "applicabilityScope" "PromoCodeApplicabilityScope" NOT NULL DEFAULT 'ALL_PRODUCTS';

-- CreateTable
CREATE TABLE "PromoCodeCategory" (
    "id" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCodeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCodeProduct" (
    "id" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCodeProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoCodeCategory_promoCodeId_categoryId_key" ON "PromoCodeCategory"("promoCodeId", "categoryId");

-- CreateIndex
CREATE INDEX "PromoCodeCategory_categoryId_idx" ON "PromoCodeCategory"("categoryId");

-- CreateIndex
CREATE INDEX "PromoCodeCategory_promoCodeId_idx" ON "PromoCodeCategory"("promoCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCodeProduct_promoCodeId_productId_key" ON "PromoCodeProduct"("promoCodeId", "productId");

-- CreateIndex
CREATE INDEX "PromoCodeProduct_productId_idx" ON "PromoCodeProduct"("productId");

-- CreateIndex
CREATE INDEX "PromoCodeProduct_promoCodeId_idx" ON "PromoCodeProduct"("promoCodeId");

-- CreateIndex
CREATE INDEX "PromoCode_applicabilityScope_idx" ON "PromoCode"("applicabilityScope");

-- AddForeignKey
ALTER TABLE "PromoCodeCategory" ADD CONSTRAINT "PromoCodeCategory_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeCategory" ADD CONSTRAINT "PromoCodeCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeProduct" ADD CONSTRAINT "PromoCodeProduct_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeProduct" ADD CONSTRAINT "PromoCodeProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
