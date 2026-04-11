ALTER TABLE "Product" ADD COLUMN "specialtyKey" TEXT;

ALTER TABLE "SpecialtyNavigationItem" ADD COLUMN "filterKey" TEXT;

CREATE INDEX "Product_specialtyKey_idx" ON "Product"("specialtyKey");

UPDATE "SpecialtyNavigationItem"
SET "href" = '/karkotok', "filterKey" = 'napfogo', "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'specialty_nav_napfogo';

UPDATE "SpecialtyNavigationItem"
SET "href" = '/karkotok', "filterKey" = 'alomfogo', "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'specialty_nav_alomfogo';

UPDATE "Product"
SET "specialtyKey" = 'napfogo'
WHERE "slug" IN ('seraphine-cuff-bracelet', 'vera-crystal-tennis-bracelet');

UPDATE "Product"
SET "specialtyKey" = 'alomfogo'
WHERE "slug" = 'mirren-charm-bracelet';
