ALTER TABLE "Stone" ADD COLUMN "accent_color" TEXT;

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
