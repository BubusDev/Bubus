import { type Prisma } from "@prisma/client";

export class InsufficientStockError extends Error {
  readonly code = "INSUFFICIENT_STOCK";

  constructor(message = "Insufficient stock for one or more products.") {
    super(message);
    this.name = "InsufficientStockError";
  }
}

type InventoryLike = {
  stockQuantity: number;
  reservedQuantity?: number | null;
  soldOutAt?: Date | null;
};

export function getReservedQuantity(product: Pick<InventoryLike, "reservedQuantity">) {
  return Math.max(0, product.reservedQuantity ?? 0);
}

export function getAvailableToSell(product: Pick<InventoryLike, "stockQuantity" | "reservedQuantity">) {
  return Math.max(0, product.stockQuantity - getReservedQuantity(product));
}

export function isInStock(product: Pick<InventoryLike, "stockQuantity" | "reservedQuantity">) {
  return getAvailableToSell(product) > 0;
}

export function getSoldOutTimestamp(
  currentSoldOutAt: Date | null | undefined,
  stockQuantity: number,
) {
  if (stockQuantity <= 0) {
    return currentSoldOutAt ?? new Date();
  }

  return null;
}

type CompleteOrderItem = {
  productId: string;
  quantity: number;
};

type CompleteOrderInput = {
  orderId: string;
  items: CompleteOrderItem[];
};

export async function applyCompletedOrderInventory(
  tx: Prisma.TransactionClient,
  { orderId, items }: CompleteOrderInput,
) {
  const adjustments: { productId: string; quantity: number; stockAfter: number }[] = [];

  for (const item of items) {
    const updated = await tx.product.updateMany({
      where: {
        id: item.productId,
        stockQuantity: { gte: item.quantity },
      },
      data: {
        stockQuantity: {
          decrement: item.quantity,
        },
      },
    });

    if (updated.count === 0) {
      throw new InsufficientStockError();
    }

    const product = await tx.product.findUniqueOrThrow({
      where: { id: item.productId },
      select: {
        id: true,
        stockQuantity: true,
        soldOutAt: true,
      },
    });

    const soldOutAt = getSoldOutTimestamp(product.soldOutAt, product.stockQuantity);

    if (soldOutAt?.getTime() !== product.soldOutAt?.getTime()) {
      await tx.product.update({
        where: { id: product.id },
        data: { soldOutAt },
      });
    }

    adjustments.push({
      productId: item.productId,
      quantity: item.quantity,
      stockAfter: product.stockQuantity,
    });
  }

  if (adjustments.length > 0) {
    await tx.inventoryEvent.createMany({
      data: adjustments.map((adjustment) => ({
        productId: adjustment.productId,
        orderId,
        type: "ORDER_COMPLETED",
        quantityDelta: -adjustment.quantity,
        stockAfter: adjustment.stockAfter,
        metadata: {
          source: "checkout",
        },
      })),
    });
  }
}
