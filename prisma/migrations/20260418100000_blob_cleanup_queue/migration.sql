CREATE TYPE "BlobCleanupStatus" AS ENUM ('PENDING', 'DELETED', 'KEPT', 'FAILED');

CREATE TABLE "BlobCleanupQueueItem" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pathname" TEXT,
    "reason" TEXT,
    "status" "BlobCleanupStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "failureMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlobCleanupQueueItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BlobCleanupQueueItem_status_scheduledAt_idx" ON "BlobCleanupQueueItem"("status", "scheduledAt");
CREATE INDEX "BlobCleanupQueueItem_url_status_idx" ON "BlobCleanupQueueItem"("url", "status");
