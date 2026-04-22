CREATE TABLE IF NOT EXISTS "ReturnRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "assignedToId" TEXT,
    "refundStatus" TEXT NOT NULL DEFAULT 'not_refunded',
    "refundedAmount" INTEGER,
    "refundedAt" TIMESTAMP(3),
    "stripeRefundId" TEXT,
    "refundFailureReason" TEXT,
    "refundProcessingAt" TIMESTAMP(3),
    "refundConfirmationEmailSendingAt" TIMESTAMP(3),
    "refundConfirmationEmailSentAt" TIMESTAMP(3),
    "refundFailureEmailSendingAt" TIMESTAMP(3),
    "refundFailureEmailSentAt" TIMESTAMP(3),
    "reason" TEXT,
    "details" TEXT NOT NULL,
    "adminNote" TEXT,
    "resolution" TEXT,
    "adminNotificationSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ReturnRequestHistory" (
    "id" TEXT NOT NULL,
    "returnRequestId" TEXT NOT NULL,
    "previousStatus" TEXT,
    "newStatus" TEXT NOT NULL,
    "previousRefundStatus" TEXT,
    "newRefundStatus" TEXT,
    "refundChanged" BOOLEAN NOT NULL DEFAULT false,
    "refundedAmount" INTEGER,
    "stripeRefundId" TEXT,
    "adminNoteChanged" BOOLEAN NOT NULL DEFAULT false,
    "resolutionChanged" BOOLEAN NOT NULL DEFAULT false,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT,
    "previousAssigneeLabel" TEXT,
    "newAssigneeLabel" TEXT,
    "assignmentChanged" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReturnRequestHistory_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ReturnRequest"
    ADD COLUMN IF NOT EXISTS "refundFailureEmailSendingAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "refundFailureEmailSentAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "refundConfirmationEmailSendingAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "refundConfirmationEmailSentAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "refundFailureReason" TEXT,
    ADD COLUMN IF NOT EXISTS "refundProcessingAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "adminNotificationSentAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "requesterEmail" TEXT,
    ADD COLUMN IF NOT EXISTS "refundStatus" TEXT NOT NULL DEFAULT 'not_refunded',
    ADD COLUMN IF NOT EXISTS "details" TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ReturnRequest_orderId_fkey'
    ) THEN
        ALTER TABLE "ReturnRequest"
            ADD CONSTRAINT "ReturnRequest_orderId_fkey"
            FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ReturnRequest_assignedToId_fkey'
    ) THEN
        ALTER TABLE "ReturnRequest"
            ADD CONSTRAINT "ReturnRequest_assignedToId_fkey"
            FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ReturnRequestHistory_returnRequestId_fkey'
    ) THEN
        ALTER TABLE "ReturnRequestHistory"
            ADD CONSTRAINT "ReturnRequestHistory_returnRequestId_fkey"
            FOREIGN KEY ("returnRequestId") REFERENCES "ReturnRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ReturnRequestHistory_changedById_fkey'
    ) THEN
        ALTER TABLE "ReturnRequestHistory"
            ADD CONSTRAINT "ReturnRequestHistory_changedById_fkey"
            FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "ReturnRequest_stripeRefundId_key" ON "ReturnRequest"("stripeRefundId");
CREATE INDEX IF NOT EXISTS "ReturnRequest_status_createdAt_idx" ON "ReturnRequest"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "ReturnRequest_orderId_createdAt_idx" ON "ReturnRequest"("orderId", "createdAt");
CREATE INDEX IF NOT EXISTS "ReturnRequest_assignedToId_createdAt_idx" ON "ReturnRequest"("assignedToId", "createdAt");
CREATE INDEX IF NOT EXISTS "ReturnRequestHistory_returnRequestId_changedAt_idx" ON "ReturnRequestHistory"("returnRequestId", "changedAt");
CREATE INDEX IF NOT EXISTS "ReturnRequestHistory_changedById_changedAt_idx" ON "ReturnRequestHistory"("changedById", "changedAt");
