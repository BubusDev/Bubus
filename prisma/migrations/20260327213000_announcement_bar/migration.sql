-- CreateTable
CREATE TABLE "AnnouncementBar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "href" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "variant" TEXT NOT NULL DEFAULT 'DEFAULT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "AnnouncementBar_isActive_updatedAt_idx" ON "AnnouncementBar"("isActive", "updatedAt");
