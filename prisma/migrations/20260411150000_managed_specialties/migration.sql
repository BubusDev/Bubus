CREATE TABLE "Specialty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specialty_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductSpecialty" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductSpecialty_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Specialty_slug_key" ON "Specialty"("slug");
CREATE INDEX "Specialty_isVisible_sortOrder_idx" ON "Specialty"("isVisible", "sortOrder");

CREATE UNIQUE INDEX "ProductSpecialty_productId_specialtyId_key" ON "ProductSpecialty"("productId", "specialtyId");
CREATE INDEX "ProductSpecialty_specialtyId_idx" ON "ProductSpecialty"("specialtyId");
CREATE INDEX "ProductSpecialty_productId_idx" ON "ProductSpecialty"("productId");

INSERT INTO "Specialty" ("id", "name", "slug", "isVisible", "sortOrder", "createdAt", "updatedAt")
SELECT
    'specialty_' || COALESCE(NULLIF("filterKey", ''), regexp_replace(trim(both '/' from "href"), '[^a-zA-Z0-9]+', '-', 'g')),
    "label",
    COALESCE(NULLIF("filterKey", ''), regexp_replace(trim(both '/' from "href"), '[^a-zA-Z0-9]+', '-', 'g')),
    "isVisible",
    "sortOrder",
    "createdAt",
    "updatedAt"
FROM "SpecialtyNavigationItem"
WHERE COALESCE(NULLIF("filterKey", ''), regexp_replace(trim(both '/' from "href"), '[^a-zA-Z0-9]+', '-', 'g')) <> ''
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "ProductSpecialty" ("id", "productId", "specialtyId", "createdAt")
SELECT
    'product_specialty_' || "Product"."id" || '_' || "Specialty"."id",
    "Product"."id",
    "Specialty"."id",
    CURRENT_TIMESTAMP
FROM "Product"
INNER JOIN "Specialty" ON "Specialty"."slug" = "Product"."specialtyKey"
WHERE "Product"."specialtyKey" IS NOT NULL
ON CONFLICT DO NOTHING;

ALTER TABLE "ProductSpecialty" ADD CONSTRAINT "ProductSpecialty_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductSpecialty" ADD CONSTRAINT "ProductSpecialty_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE "SpecialtyNavigationItem";
