CREATE TYPE "InventoryEventType" AS ENUM ('INITIAL_STOCK', 'MANUAL_ADJUSTMENT', 'ORDER_COMPLETED');

ALTER TABLE "Product"
ADD COLUMN "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "soldOutAt" TIMESTAMP(3);

CREATE TABLE "InventoryEvent" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderId" TEXT,
    "type" "InventoryEventType" NOT NULL,
    "quantityDelta" INTEGER NOT NULL,
    "stockAfter" INTEGER NOT NULL,
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Product_stockQuantity_reservedQuantity_idx" ON "Product"("stockQuantity", "reservedQuantity");
CREATE INDEX "InventoryEvent_productId_createdAt_idx" ON "InventoryEvent"("productId", "createdAt");
CREATE INDEX "InventoryEvent_orderId_idx" ON "InventoryEvent"("orderId");
CREATE INDEX "InventoryEvent_type_createdAt_idx" ON "InventoryEvent"("type", "createdAt");

ALTER TABLE "InventoryEvent"
ADD CONSTRAINT "InventoryEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
