ALTER TABLE "HomepageMaterialPick"
  ADD COLUMN IF NOT EXISTS "featuredProductId" TEXT;

CREATE INDEX IF NOT EXISTS "HomepageMaterialPick_featuredProductId_idx"
  ON "HomepageMaterialPick"("featuredProductId");
