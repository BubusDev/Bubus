CREATE TYPE "OrderPaymentStatus" AS ENUM (
  'PENDING',
  'PROCESSING',
  'FINALIZING',
  'PAID',
  'FAILED',
  'CANCELED',
  'STOCK_UNAVAILABLE'
);

ALTER TABLE "Order"
ADD COLUMN "paymentStatus" "OrderPaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'HUF',
ADD COLUMN "stripePaymentIntentId" TEXT,
ADD COLUMN "paidAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");
CREATE INDEX "Order_paymentStatus_createdAt_idx" ON "Order"("paymentStatus", "createdAt");
