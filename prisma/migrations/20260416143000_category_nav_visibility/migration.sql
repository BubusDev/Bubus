ALTER TABLE "ProductOption"
ADD COLUMN "isStorefrontVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "showInMainNav" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "navSortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "navLabel" TEXT;

UPDATE "ProductOption"
SET
  "showInMainNav" = true,
  "navSortOrder" = CASE
    WHEN "slug" IN ('necklaces', 'nyaklancok', 'nyakl-ncok') THEN 30
    WHEN "slug" IN ('bracelets', 'karkotok', 'kark-t-k') THEN 40
    ELSE "navSortOrder"
  END
WHERE "type" = 'CATEGORY'
  AND "slug" IN ('necklaces', 'nyaklancok', 'nyakl-ncok', 'bracelets', 'karkotok', 'kark-t-k');

CREATE INDEX "ProductOption_type_isActive_isStorefrontVisible_showInMainNav_navSortOrder_idx"
ON "ProductOption"("type", "isActive", "isStorefrontVisible", "showInMainNav", "navSortOrder");
