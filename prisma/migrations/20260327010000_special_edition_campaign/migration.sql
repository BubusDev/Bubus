-- CreateTable
CREATE TABLE "SpecialEditionCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL DEFAULT 'gifts',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SpecialEditionEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "promoImageUrl" TEXT NOT NULL,
    "promoImageAlt" TEXT,
    "productImageUrl" TEXT NOT NULL,
    "productImageAlt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SpecialEditionEntry_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "SpecialEditionCampaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SpecialEditionEntry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SpecialEditionCampaign_slug_key" ON "SpecialEditionCampaign"("slug");

-- CreateIndex
CREATE INDEX "SpecialEditionEntry_campaignId_sortOrder_idx" ON "SpecialEditionEntry"("campaignId", "sortOrder");

-- CreateIndex
CREATE INDEX "SpecialEditionEntry_productId_idx" ON "SpecialEditionEntry"("productId");

-- Seed singleton campaign
INSERT INTO "SpecialEditionCampaign" ("id", "slug", "isActive", "createdAt", "updatedAt")
VALUES ('special-edition-gifts', 'gifts', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
