CREATE TABLE IF NOT EXISTS "HomepageMaterialPick" (
  "id" TEXT NOT NULL,
  "itemType" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HomepageMaterialPick_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "HomepageMaterialPick_itemType_itemId_key" ON "HomepageMaterialPick"("itemType", "itemId");
CREATE INDEX IF NOT EXISTS "HomepageMaterialPick_sortOrder_idx" ON "HomepageMaterialPick"("sortOrder");
