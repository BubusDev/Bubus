import { OrderPaymentStatus, ProductStatus, type Prisma } from "@prisma/client";

export const LOW_STOCK_THRESHOLD = 3;
export const STOCK_RESERVATION_TTL_MS = 1000 * 60 * 30;

export class InsufficientStockError extends Error {
  readonly code = "INSUFFICIENT_STOCK";

  constructor(message = "Insufficient stock for one or more products.") {
    super(message);
    this.name = "InsufficientStockError";
  }
}

export class ProductUnavailableError extends Error {
  readonly code = "PRODUCT_UNAVAILABLE";
  readonly productId: string;

  constructor(productId: string, message = "Product is no longer purchasable.") {
    super(message);
    this.name = "ProductUnavailableError";
    this.productId = productId;
  }
}

type InventoryLike = {
  stockQuantity: number;
  reservedQuantity?: number | null;
  soldOutAt?: Date | null;
  archivedAt?: Date | null;
  status?: ProductStatus | null;
};

export function getReservedQuantity(product: Pick<InventoryLike, "reservedQuantity">) {
  return Math.max(0, product.reservedQuantity ?? 0);
}

export function getAvailableToSell(product: Pick<InventoryLike, "stockQuantity" | "reservedQuantity">) {
  return Math.max(0, product.stockQuantity - getReservedQuantity(product));
}

export function isProductArchived(product: Partial<Pick<InventoryLike, "archivedAt" | "status">>) {
  return product.status === ProductStatus.ARCHIVED || product.archivedAt != null;
}

export function isInStock(
  product: Pick<InventoryLike, "stockQuantity" | "reservedQuantity"> & Partial<Pick<InventoryLike, "archivedAt" | "status">>,
) {
  return !isProductArchived(product) && getAvailableToSell(product) > 0;
}

export function isProductPurchasable(
  product: Pick<InventoryLike, "stockQuantity" | "reservedQuantity"> & Partial<Pick<InventoryLike, "archivedAt" | "status">>,
) {
  return !isProductArchived(product) && getAvailableToSell(product) > 0;
}

export function getProductUnavailableReason(
  product: Pick<InventoryLike, "stockQuantity" | "reservedQuantity"> & Partial<Pick<InventoryLike, "archivedAt" | "status">>,
) {
  if (isProductArchived(product)) {
    return "archived" as const;
  }

  if (getAvailableToSell(product) <= 0) {
    return "out_of_stock" as const;
  }

  return null;
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

export function hasCrossedIntoLowStock(previousStock: number, nextStock: number) {
  return previousStock >= LOW_STOCK_THRESHOLD && nextStock > 0 && nextStock < LOW_STOCK_THRESHOLD;
}

export function hasBecomeOutOfStock(previousStock: number, nextStock: number) {
  return previousStock > 0 && nextStock === 0;
}

type CompleteOrderItem = {
  productId: string;
  quantity: number;
};

type CompleteOrderInput = {
  orderId: string;
  items: CompleteOrderItem[];
};

function getStockReservationExpiry(now = new Date()) {
  return new Date(now.getTime() + STOCK_RESERVATION_TTL_MS);
}

async function getOrderReservationItems(tx: Prisma.TransactionClient, orderId: string) {
  return tx.orderItem.findMany({
    where: { orderId },
    select: {
      productId: true,
      quantity: true,
    },
  });
}

async function reserveProductQuantity(
  tx: Prisma.TransactionClient,
  productId: string,
  quantity: number,
) {
  const updated = await tx.$executeRaw`
    UPDATE "Product"
    SET "reservedQuantity" = "reservedQuantity" + ${quantity},
        "updatedAt" = NOW()
    WHERE "id" = ${productId}
      AND "status" = ${ProductStatus.ACTIVE}::"ProductStatus"
      AND "archivedAt" IS NULL
      AND ("stockQuantity" - "reservedQuantity") >= ${quantity}
  `;

  if (updated !== 1) {
    throw new InsufficientStockError();
  }
}

async function releaseProductReservation(
  tx: Prisma.TransactionClient,
  productId: string,
  quantity: number,
) {
  const updated = await tx.product.updateMany({
    where: {
      id: productId,
      reservedQuantity: { gte: quantity },
    },
    data: {
      reservedQuantity: {
        decrement: quantity,
      },
    },
  });

  if (updated.count !== 1) {
    throw new InsufficientStockError("Reserved stock is lower than the requested release quantity.");
  }
}

export async function reserveOrderInventory(
  tx: Prisma.TransactionClient,
  { orderId, expiresAt = getStockReservationExpiry() }: { orderId: string; expiresAt?: Date },
) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      stockReservedAt: true,
      stockReservationReleasedAt: true,
      stockReservationCompletedAt: true,
      items: {
        select: {
          productId: true,
          quantity: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  if (
    order.stockReservedAt &&
    !order.stockReservationReleasedAt &&
    !order.stockReservationCompletedAt
  ) {
    return false;
  }

  for (const item of order.items) {
    await reserveProductQuantity(tx, item.productId, item.quantity);
  }

  await tx.order.update({
    where: { id: order.id },
    data: {
      stockReservedAt: new Date(),
      stockReservationExpiresAt: expiresAt,
      stockReservationReleasedAt: null,
      stockReservationCompletedAt: null,
    },
  });

  return true;
}

export async function releaseOrderInventoryReservation(
  tx: Prisma.TransactionClient,
  { orderId, releasedAt = new Date() }: { orderId: string; releasedAt?: Date },
) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      paymentStatus: true,
      stockReservedAt: true,
      stockReservationReleasedAt: true,
      stockReservationCompletedAt: true,
    },
  });

  if (
    !order ||
    order.paymentStatus === OrderPaymentStatus.PAID ||
    !order.stockReservedAt ||
    order.stockReservationReleasedAt ||
    order.stockReservationCompletedAt
  ) {
    return false;
  }

  const items = await getOrderReservationItems(tx, order.id);
  const claimed = await tx.order.updateMany({
    where: {
      id: order.id,
      paymentStatus: { not: OrderPaymentStatus.PAID },
      stockReservedAt: { not: null },
      stockReservationReleasedAt: null,
      stockReservationCompletedAt: null,
    },
    data: {
      stockReservationReleasedAt: releasedAt,
    },
  });

  if (claimed.count !== 1) {
    return false;
  }

  for (const item of items) {
    await releaseProductReservation(tx, item.productId, item.quantity);
  }

  return true;
}

export async function completeReservedOrderInventory(
  tx: Prisma.TransactionClient,
  { orderId, items }: CompleteOrderInput,
) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      stockReservedAt: true,
      stockReservationReleasedAt: true,
      stockReservationCompletedAt: true,
    },
  });

  if (!order?.stockReservedAt) {
    return applyCompletedOrderInventory(tx, { orderId, items });
  }

  if (order.stockReservationCompletedAt) {
    return [];
  }

  if (order.stockReservationReleasedAt) {
    throw new InsufficientStockError("Stock reservation was already released.");
  }

  const claimed = await tx.order.updateMany({
    where: {
      id: order.id,
      stockReservedAt: { not: null },
      stockReservationReleasedAt: null,
      stockReservationCompletedAt: null,
    },
    data: {
      stockReservationCompletedAt: new Date(),
    },
  });

  if (claimed.count !== 1) {
    return [];
  }

  return applyCompletedOrderInventory(tx, { orderId, items, useReservation: true });
}

export async function applyCompletedOrderInventory(
  tx: Prisma.TransactionClient,
  {
    orderId,
    items,
    useReservation = false,
  }: CompleteOrderInput & { useReservation?: boolean },
) {
  const adjustments: {
    productId: string;
    productName: string;
    productSlug: string;
    quantity: number;
    previousStock: number;
    stockAfter: number;
  }[] = [];

  for (const item of items) {
    const currentProduct = await tx.product.findUnique({
      where: { id: item.productId },
      select: {
        id: true,
        status: true,
        archivedAt: true,
        stockQuantity: true,
        reservedQuantity: true,
      },
    });

    if (!currentProduct || isProductArchived(currentProduct)) {
      throw new ProductUnavailableError(item.productId);
    }

    if (useReservation) {
      if (currentProduct.reservedQuantity < item.quantity || currentProduct.stockQuantity < item.quantity) {
        throw new InsufficientStockError();
      }
    } else if (getAvailableToSell(currentProduct) < item.quantity) {
      throw new InsufficientStockError();
    }

    const updated = useReservation
      ? await tx.product.updateMany({
          where: {
            id: item.productId,
            archivedAt: null,
            stockQuantity: { gte: item.quantity },
            reservedQuantity: { gte: item.quantity },
          },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
            reservedQuantity: {
              decrement: item.quantity,
            },
          },
        })
      : await tx.product.updateMany({
          where: {
            id: item.productId,
            archivedAt: null,
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
        name: true,
        slug: true,
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
      productName: product.name,
      productSlug: product.slug,
      quantity: item.quantity,
      previousStock: product.stockQuantity + item.quantity,
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

  return adjustments;
}
