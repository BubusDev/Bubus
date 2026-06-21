-- Add order-scoped inventory reservation tracking.
ALTER TABLE "Order" ADD COLUMN "guestCartToken" TEXT;
ALTER TABLE "Order" ADD COLUMN "stockReservedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "stockReservationExpiresAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "stockReservationReleasedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "stockReservationCompletedAt" TIMESTAMP(3);

CREATE INDEX "Order_guestCartToken_createdAt_idx" ON "Order"("guestCartToken", "createdAt");
CREATE INDEX "Order_stockReservationExpiresAt_idx" ON "Order"("stockReservationExpiresAt");
