CREATE TABLE IF NOT EXISTS "Stone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "longDesc" TEXT NOT NULL,
    "effects" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "origin" TEXT,
    "chakra" TEXT,
    "imageUrl" TEXT,
    "accent_color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stone_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Stone_name_key" ON "Stone"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Stone_slug_key" ON "Stone"("slug");
CREATE INDEX IF NOT EXISTS "Stone_sortOrder_idx" ON "Stone"("sortOrder");

ALTER TABLE "Stone"
    ADD COLUMN IF NOT EXISTS "accent_color" TEXT;

UPDATE "Stone"
SET "accent_color" = CASE
  WHEN "name" IN ('Opál', 'Opal') THEN '#e8d5c4'
  WHEN "name" IN ('Rózsakvarc', 'Rózsakvarcz') THEN '#f4a6b8'
  WHEN "name" = 'Ametiszt' THEN '#9b5de5'
  WHEN "name" = 'Smaragd' THEN '#52b788'
  ELSE "accent_color"
END;

UPDATE "Stone"
SET
  "name" = 'Rózsakvarc',
  "slug" = 'rozsakvarc'
WHERE "name" = 'Rózsakvarcz'
  AND NOT EXISTS (
    SELECT 1 FROM "Stone" existing
    WHERE existing."slug" = 'rozsakvarc'
      AND existing."id" <> "Stone"."id"
  );

UPDATE "Stone"
SET
  "shortDesc" = replace("shortDesc", 'had segítsen', 'hadd segítsen'),
  "longDesc" = replace("longDesc", 'had segítsen', 'hadd segítsen');

UPDATE "Stone"
SET "chakra" = 'heart'
WHERE "chakra" ILIKE '%tricepsz%';
