DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductStatus') THEN
        CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
    END IF;
END $$;

ALTER TABLE "Product"
    ADD COLUMN IF NOT EXISTS "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Product'
          AND column_name = 'archivedAt'
    ) THEN
        EXECUTE 'UPDATE "Product" SET "status" = ''ARCHIVED'' WHERE "archivedAt" IS NOT NULL';
        EXECUTE 'UPDATE "Product" SET "status" = ''ACTIVE'' WHERE "archivedAt" IS NULL';
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ProductSlugHistory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductSlugHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductSlugHistory_slug_key" ON "ProductSlugHistory"("slug");
CREATE INDEX IF NOT EXISTS "ProductSlugHistory_productId_createdAt_idx" ON "ProductSlugHistory"("productId", "createdAt");
CREATE INDEX IF NOT EXISTS "Product_status_idx" ON "Product"("status");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ProductSlugHistory_productId_fkey'
    ) THEN
        ALTER TABLE "ProductSlugHistory"
            ADD CONSTRAINT "ProductSlugHistory_productId_fkey"
            FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
