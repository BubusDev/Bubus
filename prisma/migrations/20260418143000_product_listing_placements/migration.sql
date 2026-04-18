CREATE TABLE "ProductListingPlacement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "listingKey" TEXT NOT NULL,
    "listingType" TEXT NOT NULL,
    "categoryId" TEXT,
    "specialtyId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductListingPlacement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductListingPlacement_listingKey_productId_key" ON "ProductListingPlacement"("listingKey", "productId");
CREATE INDEX "ProductListingPlacement_listingKey_sortOrder_idx" ON "ProductListingPlacement"("listingKey", "sortOrder");
CREATE INDEX "ProductListingPlacement_listingType_idx" ON "ProductListingPlacement"("listingType");
CREATE INDEX "ProductListingPlacement_productId_idx" ON "ProductListingPlacement"("productId");
CREATE INDEX "ProductListingPlacement_categoryId_idx" ON "ProductListingPlacement"("categoryId");
CREATE INDEX "ProductListingPlacement_specialtyId_idx" ON "ProductListingPlacement"("specialtyId");

ALTER TABLE "ProductListingPlacement" ADD CONSTRAINT "ProductListingPlacement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductListingPlacement" ADD CONSTRAINT "ProductListingPlacement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductListingPlacement" ADD CONSTRAINT "ProductListingPlacement_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
