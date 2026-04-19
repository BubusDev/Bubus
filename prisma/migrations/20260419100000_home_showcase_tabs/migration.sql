CREATE TABLE IF NOT EXISTS "HomeShowcaseTab" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "filterType" TEXT NOT NULL,
  "filterValue" TEXT,
  "maxItems" INTEGER NOT NULL DEFAULT 8,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "HomeShowcaseTab_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "HomeShowcaseTab_key_key" ON "HomeShowcaseTab"("key");
CREATE INDEX IF NOT EXISTS "HomeShowcaseTab_isActive_sortOrder_idx" ON "HomeShowcaseTab"("isActive", "sortOrder");
