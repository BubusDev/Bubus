CREATE TYPE "HomepageContentBlockKey" AS ENUM ('HERO', 'INSTAGRAM');

CREATE TABLE "HomepageContentBlock" (
    "id" TEXT NOT NULL,
    "key" "HomepageContentBlockKey" NOT NULL,
    "title" TEXT,
    "eyebrow" TEXT,
    "body" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "buttonText" TEXT,
    "buttonHref" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageContentBlock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HomepagePromoTile" (
    "id" TEXT NOT NULL,
    "slotIndex" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "href" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepagePromoTile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HomepageContentBlock_key_key" ON "HomepageContentBlock"("key");
CREATE INDEX "HomepageContentBlock_isVisible_key_idx" ON "HomepageContentBlock"("isVisible", "key");
CREATE UNIQUE INDEX "HomepagePromoTile_slotIndex_key" ON "HomepagePromoTile"("slotIndex");
CREATE INDEX "HomepagePromoTile_isVisible_slotIndex_idx" ON "HomepagePromoTile"("isVisible", "slotIndex");
