import { ProductStatus } from "@prisma/client";

import { getProductAvailabilitySnapshot } from "@/lib/product-lifecycle";

type HomepageWarningProduct = {
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

export function getStorefrontUnavailableProductReason(product?: HomepageWarningProduct | null) {
  if (!product) return "termék nem található";

  const snapshot = getProductAvailabilitySnapshot(product);

  if (snapshot.lifecycleStatus === "draft") return "nem aktív";
  if (snapshot.lifecycleStatus === "archived") return "archivált";

  if (snapshot.lifecycleStatus === "incomplete") {
    if (snapshot.readinessIssues.some((issue) => issue.code === "missing_image")) {
      return "nincs képe";
    }

    return "hiányos adatok";
  }

  return null;
}
