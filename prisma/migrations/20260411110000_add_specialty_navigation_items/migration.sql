CREATE TABLE "SpecialtyNavigationItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialtyNavigationItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SpecialtyNavigationItem_isVisible_sortOrder_idx" ON "SpecialtyNavigationItem"("isVisible", "sortOrder");

INSERT INTO "SpecialtyNavigationItem" ("id", "label", "href", "isVisible", "sortOrder", "createdAt", "updatedAt")
VALUES
    ('specialty_nav_napfogo', 'Napfogó', '/napfogo', true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('specialty_nav_alomfogo', 'Álomfogó', '/alomfogo', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('specialty_nav_bokalancok', 'Bokaláncok', '/anklets', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
