import { ProductStatus, type Prisma } from "@prisma/client";

import { isBrowserSafeImageUrl } from "@/lib/image-safety";
import { getAvailableToSell, isProductArchived, isProductPurchasable } from "@/lib/inventory";

type ProductLifecycleInput = {
  status?: ProductStatus | null;
  archivedAt?: Date | null;
  name?: string | null;
  slug?: string | null;
  price?: number | null;
  compareAtPrice?: number | null;
  shortDescription?: string | null;
  description?: string | null;
  badge?: string | null;
  collectionLabel?: string | null;
  stockQuantity?: number | null;
  reservedQuantity?: number | null;
  imageUrl?: string | null;
  images?: { url?: string | null }[];
  isOnSale?: boolean | null;
};

export type ProductLifecycleStatus = "draft" | "archived" | "incomplete" | "sold_out" | "active";

export type ProductReadinessIssueCode =
  | "missing_name"
  | "missing_slug"
  | "invalid_price"
  | "invalid_compare_at_price"
  | "missing_short_description"
  | "missing_description"
  | "missing_badge"
  | "missing_collection_label"
  | "invalid_stock"
  | "missing_image";

export type ProductReadinessIssue = {
  code: ProductReadinessIssueCode;
  message: string;
};

export const storefrontProductWhere: Prisma.ProductWhereInput = {
  status: ProductStatus.ACTIVE,
  archivedAt: null,
  name: { not: "" },
  slug: { not: "" },
  price: { gt: 0 },
  shortDescription: { not: "" },
  description: { not: "" },
  badge: { not: "" },
  collectionLabel: { not: "" },
  OR: [{ images: { some: {} } }, { imageUrl: { not: null } }],
};

function hasText(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

export function getProductImageUrls(product: ProductLifecycleInput) {
  const urls = [
    ...(product.images ?? []).map((image) => image.url),
    product.imageUrl,
  ].filter((url): url is string => hasText(url));

  return [...new Set(urls)];
}

export function hasPublishableProductImage(product: ProductLifecycleInput) {
  return getProductImageUrls(product).some((url) => isBrowserSafeImageUrl(url));
}

export function getProductReadinessIssues(product: ProductLifecycleInput): ProductReadinessIssue[] {
  const issues: ProductReadinessIssue[] = [];

  if (!hasText(product.name)) {
    issues.push({ code: "missing_name", message: "A terméknév kötelező." });
  }

  if (!hasText(product.slug)) {
    issues.push({ code: "missing_slug", message: "A slug kötelező." });
  }

  if (!Number.isInteger(product.price) || (product.price ?? 0) <= 0) {
    issues.push({ code: "invalid_price", message: "Az aktív termék ára legyen pozitív egész Ft összeg." });
  }

  if (
    product.compareAtPrice != null &&
    (!Number.isInteger(product.compareAtPrice) ||
      product.compareAtPrice <= 0 ||
      (Number.isInteger(product.price) && product.compareAtPrice <= (product.price ?? 0)))
  ) {
    issues.push({
      code: "invalid_compare_at_price",
      message: "Az eredeti ár csak a termékárnál magasabb pozitív egész Ft összeg lehet.",
    });
  }

  if (product.isOnSale && product.compareAtPrice == null) {
    issues.push({
      code: "invalid_compare_at_price",
      message: "Akciós jelöléshez adj meg a termékárnál magasabb eredeti árat.",
    });
  }

  if (!hasText(product.shortDescription)) {
    issues.push({ code: "missing_short_description", message: "A rövid leírás kötelező." });
  }

  if (!hasText(product.description)) {
    issues.push({ code: "missing_description", message: "A leírás kötelező." });
  }

  if (!hasText(product.badge)) {
    issues.push({ code: "missing_badge", message: "A címke kötelező." });
  }

  if (!hasText(product.collectionLabel)) {
    issues.push({ code: "missing_collection_label", message: "A kollekciócímke kötelező." });
  }

  if (!Number.isInteger(product.stockQuantity) || (product.stockQuantity ?? 0) < 0) {
    issues.push({ code: "invalid_stock", message: "A készlet legyen nem negatív egész szám." });
  }

  if (!hasPublishableProductImage(product)) {
    issues.push({ code: "missing_image", message: "Legalább egy böngészőben használható termékkép kötelező." });
  }

  return issues;
}

export function isProductPublishReady(product: ProductLifecycleInput) {
  return getProductReadinessIssues(product).length === 0;
}

export function getProductLifecycleStatus(product: ProductLifecycleInput): ProductLifecycleStatus {
  if (isProductArchived(product)) {
    return "archived";
  }

  if ((product.status ?? ProductStatus.ACTIVE) === ProductStatus.DRAFT) {
    return "draft";
  }

  if (!isProductPublishReady(product)) {
    return "incomplete";
  }

  if (!isProductPurchasable({ status: product.status, stockQuantity: product.stockQuantity ?? 0, reservedQuantity: product.reservedQuantity, archivedAt: product.archivedAt })) {
    return "sold_out";
  }

  return "active";
}

export function getProductAvailabilitySnapshot(product: ProductLifecycleInput) {
  const lifecycleStatus = getProductLifecycleStatus(product);
  const inventory = {
    stockQuantity: product.stockQuantity ?? 0,
    reservedQuantity: product.reservedQuantity,
    archivedAt: product.archivedAt,
    status: product.status,
  };

  return {
    lifecycleStatus,
    storedStatus: product.status ?? ProductStatus.ACTIVE,
    isPublishReady: isProductPublishReady(product),
    isVisibleOnStorefront: lifecycleStatus === "active" || lifecycleStatus === "sold_out",
    isPdpAvailable: lifecycleStatus === "active" || lifecycleStatus === "sold_out",
    isPurchasable: lifecycleStatus === "active" && getAvailableToSell(inventory) > 0,
    availableToSell:
      lifecycleStatus === "archived" || lifecycleStatus === "draft" || lifecycleStatus === "incomplete"
        ? 0
        : getAvailableToSell(inventory),
    readinessIssues: getProductReadinessIssues(product),
  };
}

export function assertProductPublishReady(product: ProductLifecycleInput) {
  const issues = getProductReadinessIssues(product);

  if (issues.length > 0) {
    throw new Error(issues[0]?.message ?? "A termék nem publikálható.");
  }
}
