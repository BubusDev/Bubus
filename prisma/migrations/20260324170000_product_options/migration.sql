-- CreateTable
CREATE TABLE "ProductOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Seed option rows from the previous enum-backed values.
INSERT INTO "ProductOption" ("id", "type", "name", "slug", "isActive", "sortOrder", "createdAt", "updatedAt") VALUES
('opt_cat_necklaces', 'CATEGORY', 'Necklaces', 'necklaces', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_cat_bracelets', 'CATEGORY', 'Bracelets', 'bracelets', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_cat_anklets', 'CATEGORY', 'Anklets', 'anklets', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_cat_earrings', 'CATEGORY', 'Earrings', 'earrings', 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_stone_pearl', 'STONE_TYPE', 'Pearl', 'pearl', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_stone_crystal', 'STONE_TYPE', 'Crystal', 'crystal', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_stone_opal', 'STONE_TYPE', 'Opal', 'opal', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_stone_moonstone', 'STONE_TYPE', 'Moonstone', 'moonstone', 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_stone_rose_quartz', 'STONE_TYPE', 'Rose Quartz', 'rose-quartz', 1, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_stone_diamond', 'STONE_TYPE', 'Diamond', 'diamond', 1, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_color_gold', 'COLOR', 'Gold', 'gold', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_color_silver', 'COLOR', 'Silver', 'silver', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_color_rose_gold', 'COLOR', 'Rose Gold', 'rose-gold', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_style_minimal', 'STYLE', 'Minimal', 'minimal', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_style_statement', 'STYLE', 'Statement', 'statement', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_style_romantic', 'STYLE', 'Romantic', 'romantic', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_style_layering', 'STYLE', 'Layering', 'layering', 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_style_bridal', 'STYLE', 'Bridal', 'bridal', 1, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_occ_everyday', 'OCCASION', 'Everyday', 'everyday', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_occ_wedding', 'OCCASION', 'Wedding', 'wedding', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_occ_gift_edit', 'OCCASION', 'Gift Edit', 'gift-edit', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_occ_evening', 'OCCASION', 'Evening', 'evening', 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_occ_vacation', 'OCCASION', 'Vacation', 'vacation', 1, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_avail_in_stock', 'AVAILABILITY', 'In Stock', 'in-stock', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_avail_low_stock', 'AVAILABILITY', 'Low Stock', 'low-stock', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_avail_preorder', 'AVAILABILITY', 'Preorder', 'preorder', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_tone_petal', 'VISUAL_TONE', 'Petal', 'petal', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_tone_champagne', 'VISUAL_TONE', 'Champagne', 'champagne', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_tone_blush', 'VISUAL_TONE', 'Blush', 'blush', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_tone_pearl', 'VISUAL_TONE', 'Pearl', 'pearl', 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "compareAtPrice" INTEGER,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "collectionLabel" TEXT NOT NULL,
    "stoneTypeId" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,
    "styleId" TEXT NOT NULL,
    "occasionId" TEXT NOT NULL,
    "availabilityId" TEXT NOT NULL,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isGiftable" BOOLEAN NOT NULL DEFAULT false,
    "isOnSale" BOOLEAN NOT NULL DEFAULT false,
    "toneId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "homepagePlacement" TEXT NOT NULL DEFAULT 'NONE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductOption" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_stoneTypeId_fkey" FOREIGN KEY ("stoneTypeId") REFERENCES "ProductOption" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "ProductOption" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "ProductOption" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_occasionId_fkey" FOREIGN KEY ("occasionId") REFERENCES "ProductOption" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "ProductOption" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_toneId_fkey" FOREIGN KEY ("toneId") REFERENCES "ProductOption" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Product" ("id", "slug", "name", "categoryId", "price", "compareAtPrice", "shortDescription", "description", "badge", "collectionLabel", "stoneTypeId", "colorId", "styleId", "occasionId", "availabilityId", "isNew", "isGiftable", "isOnSale", "toneId", "imageUrl", "homepagePlacement", "createdAt", "updatedAt")
SELECT
    "id",
    "slug",
    "name",
    CASE "category"
        WHEN 'NECKLACES' THEN 'opt_cat_necklaces'
        WHEN 'BRACELETS' THEN 'opt_cat_bracelets'
        WHEN 'ANKLETS' THEN 'opt_cat_anklets'
        WHEN 'EARRINGS' THEN 'opt_cat_earrings'
    END,
    "price",
    "compareAtPrice",
    "shortDescription",
    "description",
    "badge",
    "collectionLabel",
    CASE "stoneType"
        WHEN 'PEARL' THEN 'opt_stone_pearl'
        WHEN 'CRYSTAL' THEN 'opt_stone_crystal'
        WHEN 'OPAL' THEN 'opt_stone_opal'
        WHEN 'MOONSTONE' THEN 'opt_stone_moonstone'
        WHEN 'ROSE_QUARTZ' THEN 'opt_stone_rose_quartz'
        WHEN 'DIAMOND' THEN 'opt_stone_diamond'
    END,
    CASE "color"
        WHEN 'GOLD' THEN 'opt_color_gold'
        WHEN 'SILVER' THEN 'opt_color_silver'
        WHEN 'ROSE_GOLD' THEN 'opt_color_rose_gold'
    END,
    CASE "style"
        WHEN 'MINIMAL' THEN 'opt_style_minimal'
        WHEN 'STATEMENT' THEN 'opt_style_statement'
        WHEN 'ROMANTIC' THEN 'opt_style_romantic'
        WHEN 'LAYERING' THEN 'opt_style_layering'
        WHEN 'BRIDAL' THEN 'opt_style_bridal'
    END,
    CASE "occasion"
        WHEN 'EVERYDAY' THEN 'opt_occ_everyday'
        WHEN 'WEDDING' THEN 'opt_occ_wedding'
        WHEN 'GIFT_EDIT' THEN 'opt_occ_gift_edit'
        WHEN 'EVENING' THEN 'opt_occ_evening'
        WHEN 'VACATION' THEN 'opt_occ_vacation'
    END,
    CASE "availability"
        WHEN 'IN_STOCK' THEN 'opt_avail_in_stock'
        WHEN 'LOW_STOCK' THEN 'opt_avail_low_stock'
        WHEN 'PREORDER' THEN 'opt_avail_preorder'
    END,
    "isNew",
    "isGiftable",
    "isOnSale",
    CASE "tone"
        WHEN 'PETAL' THEN 'opt_tone_petal'
        WHEN 'CHAMPAGNE' THEN 'opt_tone_champagne'
        WHEN 'BLUSH' THEN 'opt_tone_blush'
        WHEN 'PEARL' THEN 'opt_tone_pearl'
    END,
    "imageUrl",
    "homepagePlacement",
    "createdAt",
    "updatedAt"
FROM "Product";

DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_stoneTypeId_idx" ON "Product"("stoneTypeId");
CREATE INDEX "Product_colorId_idx" ON "Product"("colorId");
CREATE INDEX "Product_styleId_idx" ON "Product"("styleId");
CREATE INDEX "Product_occasionId_idx" ON "Product"("occasionId");
CREATE INDEX "Product_availabilityId_idx" ON "Product"("availabilityId");
CREATE INDEX "Product_toneId_idx" ON "Product"("toneId");
CREATE INDEX "Product_homepagePlacement_idx" ON "Product"("homepagePlacement");
CREATE INDEX "Product_isNew_idx" ON "Product"("isNew");
CREATE INDEX "Product_isGiftable_idx" ON "Product"("isGiftable");
CREATE INDEX "Product_isOnSale_idx" ON "Product"("isOnSale");
CREATE UNIQUE INDEX "ProductOption_type_slug_key" ON "ProductOption"("type", "slug");
CREATE UNIQUE INDEX "ProductOption_type_name_key" ON "ProductOption"("type", "name");
CREATE INDEX "ProductOption_type_isActive_sortOrder_idx" ON "ProductOption"("type", "isActive", "sortOrder");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
