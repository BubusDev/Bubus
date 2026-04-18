ALTER TABLE "Specialty" ADD COLUMN "previewImageUrl" TEXT;
ALTER TABLE "Specialty" ADD COLUMN "previewImageAlt" TEXT;
ALTER TABLE "Specialty" ADD COLUMN "cardImageUrl" TEXT;
ALTER TABLE "Specialty" ADD COLUMN "cardImageAlt" TEXT;
ALTER TABLE "Specialty" ADD COLUMN "cardTitle" TEXT;
ALTER TABLE "Specialty" ADD COLUMN "cardDescription" TEXT;
ALTER TABLE "Specialty" ADD COLUMN "ctaLabel" TEXT;
ALTER TABLE "Specialty" ADD COLUMN "destinationHref" TEXT;

UPDATE "Specialty"
SET
  "previewImageUrl" = "imageUrl",
  "previewImageAlt" = "imageAlt"
WHERE "imageUrl" IS NOT NULL OR "imageAlt" IS NOT NULL;
