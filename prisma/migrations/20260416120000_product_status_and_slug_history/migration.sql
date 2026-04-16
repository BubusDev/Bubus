-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';

-- Backfill existing lifecycle intent from the previous archivedAt-based model.
UPDATE "Product"
SET "status" = 'ARCHIVED'
WHERE "archivedAt" IS NOT NULL;

UPDATE "Product"
SET "status" = 'ACTIVE'
WHERE "archivedAt" IS NULL;

-- CreateTable
CREATE TABLE "ProductSlugHistory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductSlugHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductSlugHistory_slug_key" ON "ProductSlugHistory"("slug");

-- CreateIndex
CREATE INDEX "ProductSlugHistory_productId_createdAt_idx" ON "ProductSlugHistory"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- AddForeignKey
ALTER TABLE "ProductSlugHistory" ADD CONSTRAINT "ProductSlugHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
