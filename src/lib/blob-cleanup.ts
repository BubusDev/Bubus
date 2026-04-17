import { del } from "@vercel/blob";
import { BlobCleanupStatus } from "@prisma/client";

import { db } from "@/lib/db";

const VERCEL_BLOB_HOST_SUFFIX = "vercel-storage.com";
const DEFAULT_BATCH_SIZE = 25;
const REFERENCED_RECHECK_DELAY_MS = 7 * 24 * 60 * 60 * 1000;

type EnqueueBlobCleanupOptions = {
  reason?: string;
  scheduledAt?: Date;
};

export type BlobCleanupResult = {
  processed: number;
  deleted: number;
  kept: number;
  rescheduled: number;
  failed: number;
};

function getReferencedRecheckAt(now: Date) {
  return new Date(now.getTime() + REFERENCED_RECHECK_DELAY_MS);
}

export function isVercelBlobUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "https:" && parsedUrl.hostname.endsWith(VERCEL_BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

export function getBlobPathnameFromUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, "")) || null;
  } catch {
    return null;
  }
}

export async function enqueueBlobCleanup(url: string | null | undefined, options: EnqueueBlobCleanupOptions = {}) {
  const normalizedUrl = typeof url === "string" ? url.trim() : "";

  if (!normalizedUrl || !isVercelBlobUrl(normalizedUrl)) {
    return null;
  }

  const existingActive = await db.blobCleanupQueueItem.findFirst({
    where: {
      url: normalizedUrl,
      status: {
        in: [
          BlobCleanupStatus.PENDING,
          BlobCleanupStatus.KEPT,
          BlobCleanupStatus.FAILED,
        ],
      },
    },
    select: { id: true },
  });

  if (existingActive) {
    return db.blobCleanupQueueItem.update({
      where: { id: existingActive.id },
      data: {
        status: BlobCleanupStatus.PENDING,
        reason: options.reason,
        scheduledAt: options.scheduledAt ?? new Date(),
        failureMessage: null,
        deletedAt: null,
      },
    });
  }

  return db.blobCleanupQueueItem.create({
    data: {
      url: normalizedUrl,
      pathname: getBlobPathnameFromUrl(normalizedUrl),
      reason: options.reason,
      scheduledAt: options.scheduledAt,
    },
  });
}

export async function isBlobUrlReferenced(url: string) {
  const [
    products,
    productImages,
    specialties,
    homepageBlocks,
    homepagePromoTiles,
    specialEditionCampaigns,
    specialEditionPromoEntries,
    specialEditionProductEntries,
    stones,
    orderItems,
    users,
  ] = await Promise.all([
    db.product.count({ where: { imageUrl: url } }),
    db.productImage.count({ where: { url } }),
    db.specialty.count({ where: { imageUrl: url } }),
    db.homepageContentBlock.count({ where: { imageUrl: url } }),
    db.homepagePromoTile.count({ where: { imageUrl: url } }),
    db.specialEditionCampaign.count({ where: { bannerImageUrl: url } }),
    db.specialEditionEntry.count({ where: { promoImageUrl: url } }),
    db.specialEditionEntry.count({ where: { productImageUrl: url } }),
    db.stone.count({ where: { imageUrl: url } }),
    db.orderItem.count({ where: { imageUrl: url } }),
    db.user.count({ where: { profileImageUrl: url } }),
  ]);

  return (
    products +
      productImages +
      specialties +
      homepageBlocks +
      homepagePromoTiles +
      specialEditionCampaigns +
      specialEditionPromoEntries +
      specialEditionProductEntries +
      stones +
      orderItems +
      users >
    0
  );
}

export async function processBlobCleanupQueue(options: { batchSize?: number; now?: Date } = {}): Promise<BlobCleanupResult> {
  const now = options.now ?? new Date();
  const batchSize = Math.max(1, Math.min(options.batchSize ?? DEFAULT_BATCH_SIZE, 100));
  const rows = await db.blobCleanupQueueItem.findMany({
    where: {
      status: BlobCleanupStatus.PENDING,
      scheduledAt: { lte: now },
    },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "asc" }],
    take: batchSize,
  });

  const result: BlobCleanupResult = {
    processed: 0,
    deleted: 0,
    kept: 0,
    rescheduled: 0,
    failed: 0,
  };

  for (const row of rows) {
    result.processed += 1;

    try {
      if (!isVercelBlobUrl(row.url)) {
        await db.blobCleanupQueueItem.update({
          where: { id: row.id },
          data: {
            status: BlobCleanupStatus.KEPT,
            lastCheckedAt: now,
            failureMessage: "Skipped non-Vercel Blob URL.",
          },
        });
        result.kept += 1;
        continue;
      }

      const isReferenced = await isBlobUrlReferenced(row.url);

      if (isReferenced) {
        await db.blobCleanupQueueItem.update({
          where: { id: row.id },
          data: {
            status: BlobCleanupStatus.PENDING,
            scheduledAt: getReferencedRecheckAt(now),
            lastCheckedAt: now,
            failureMessage: "Still referenced; rescheduled for a later cleanup check.",
          },
        });
        result.rescheduled += 1;
        continue;
      }

      await del(row.pathname || row.url);

      await db.blobCleanupQueueItem.update({
        where: { id: row.id },
        data: {
          status: BlobCleanupStatus.DELETED,
          lastCheckedAt: now,
          deletedAt: now,
          failureMessage: null,
        },
      });
      result.deleted += 1;
    } catch (error) {
      await db.blobCleanupQueueItem.update({
        where: { id: row.id },
        data: {
          status: BlobCleanupStatus.FAILED,
          lastCheckedAt: now,
          failureMessage: error instanceof Error ? error.message : "Unknown Blob cleanup failure.",
        },
      });
      result.failed += 1;
    }
  }

  return result;
}
