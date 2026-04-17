UPDATE "BlobCleanupQueueItem"
SET
    "status" = 'PENDING',
    "scheduledAt" = CURRENT_TIMESTAMP,
    "failureMessage" = NULL,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "status" = 'KEPT'
  AND "url" LIKE 'https://%.vercel-storage.com/%';
