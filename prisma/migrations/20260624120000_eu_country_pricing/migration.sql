ALTER TABLE "Product" ADD COLUMN "priceEur" INTEGER;

ALTER TABLE "Order" ADD COLUMN "shippingCountryCode" TEXT NOT NULL DEFAULT 'HU';
ALTER TABLE "Order" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'hu';
ALTER TABLE "Order" ADD COLUMN "shippingAddressLine1" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingAddressLine2" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingPostalCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingCity" TEXT;

ALTER TABLE "OrderItem" ADD COLUMN "unitPriceCurrency" TEXT NOT NULL DEFAULT 'HUF';
