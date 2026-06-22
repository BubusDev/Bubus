import type { Metadata } from "next";

import {
  AdminMediaInventory,
  type AdminCleanupQueueRow,
  type AdminMediaInventoryRow,
} from "@/components/admin/AdminMediaInventory";
import { AdminShell } from "@/components/admin/AdminShell";
import { db } from "@/lib/db";
import { getHomepageContent } from "@/lib/homepage-content";
import { getBrowserDisplayImageUrl } from "@/lib/image-safety";

export const metadata: Metadata = {
  title: "Média — Chicks Jewelry Admin",
  description: "Read-only admin média inventory és Blob cleanup queue.",
  robots: { index: false, follow: false },
};

type AdminMediaPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type SourceKey =
  | "product"
  | "homepage"
  | "promo_tile"
  | "special_edition"
  | "specialty"
  | "gemstone"
  | "order_snapshot"
  | "user"
  | "cleanup_queue";

type StatusKey =
  | "active"
  | "archived"
  | "referenced"
  | "cleanup_pending"
  | "cleanup_failed"
  | "cleanup_kept"
  | "cleanup_deleted";

const sourceLabels: Record<SourceKey, string> = {
  product: "Product",
  homepage: "Homepage",
  promo_tile: "Promo tile",
  special_edition: "Special Edition",
  specialty: "Specialty",
  gemstone: "Gemstone",
  order_snapshot: "Order snapshot",
  user: "User avatar",
  cleanup_queue: "Cleanup queue",
};

const statusLabels: Record<StatusKey, string> = {
  active: "active",
  archived: "archived product",
  referenced: "referenced",
  cleanup_pending: "cleanup pending",
  cleanup_failed: "cleanup failed",
  cleanup_kept: "kept",
  cleanup_deleted: "deleted",
};

function getSearchValue(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function toIso(value?: Date | null) {
  return value ? value.toISOString() : null;
}

function getThumbnailUrl(url: string) {
  return getBrowserDisplayImageUrl(url);
}

function makeRow(input: {
  adminHref?: string | null;
  createdAt?: Date | null;
  id: string;
  imageUrl: string | null | undefined;
  source: SourceKey;
  status: StatusKey;
  updatedAt?: Date | null;
  usageLabel: string;
}): AdminMediaInventoryRow | null {
  const imageUrl = input.imageUrl?.trim();

  if (!imageUrl) return null;

  return {
    id: input.id,
    adminHref: input.adminHref ?? null,
    createdAt: toIso(input.createdAt),
    imageUrl,
    source: input.source,
    sourceLabel: sourceLabels[input.source],
    status: input.status,
    statusLabel: statusLabels[input.status],
    thumbnailUrl: getThumbnailUrl(imageUrl),
    updatedAt: toIso(input.updatedAt),
    usageLabel: input.usageLabel,
  };
}

function matchesSearch(row: AdminMediaInventoryRow, search: string) {
  if (!search) return true;
  const normalized = search.toLowerCase();
  return [
    row.imageUrl,
    row.sourceLabel,
    row.statusLabel,
    row.usageLabel,
  ].some((value) => value.toLowerCase().includes(normalized));
}

async function getMediaInventoryRows() {
  const [
    products,
    homepageContent,
    specialEditionCampaigns,
    specialties,
    stones,
    orderItems,
    users,
    cleanupItems,
  ] = await Promise.all([
    db.product.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
        status: true,
        archivedAt: true,
        createdAt: true,
        updatedAt: true,
        images: {
          select: { id: true, url: true, alt: true, isCover: true, createdAt: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    }),
    getHomepageContent(),
    db.specialEditionCampaign.findMany({
      include: {
        entries: {
          include: { product: { select: { name: true } } },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    }),
    db.specialty.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
        previewImageUrl: true,
        cardImageUrl: true,
        isVisible: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    db.stone.findMany({
      select: { id: true, name: true, imageUrl: true, createdAt: true, updatedAt: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    db.orderItem.findMany({
      where: { imageUrl: { not: null } },
      select: {
        id: true,
        imageUrl: true,
        productName: true,
        orderId: true,
        order: { select: { orderNumber: true, createdAt: true, updatedAt: true } },
      },
      orderBy: [{ order: { createdAt: "desc" } }],
      take: 100,
    }),
    db.user.findMany({
      where: { profileImageUrl: { not: null } },
      select: { id: true, name: true, profileImageUrl: true, createdAt: true, updatedAt: true },
      orderBy: [{ updatedAt: "desc" }],
      take: 100,
    }),
    db.blobCleanupQueueItem.findMany({
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 200,
    }),
  ]);

  const rows: AdminMediaInventoryRow[] = [];

  for (const product of products) {
    const productStatus = product.archivedAt || product.status === "ARCHIVED" ? "archived" : "active";
    const imageUrls = new Set(product.images.map((image) => image.url));

    for (const image of product.images) {
      const row = makeRow({
        adminHref: `/admin/products?edit=${product.id}`,
        createdAt: image.createdAt,
        id: `product-image:${image.id}`,
        imageUrl: image.url,
        source: "product",
        status: productStatus,
        updatedAt: product.updatedAt,
        usageLabel: `${product.name}${image.isCover ? " - cover" : ""}`,
      });
      if (row) rows.push(row);
    }

    if (product.imageUrl && !imageUrls.has(product.imageUrl)) {
      const row = makeRow({
        adminHref: `/admin/products?edit=${product.id}`,
        createdAt: product.createdAt,
        id: `product-cover:${product.id}`,
        imageUrl: product.imageUrl,
        source: "product",
        status: productStatus,
        updatedAt: product.updatedAt,
        usageLabel: `${product.name} - product imageUrl`,
      });
      if (row) rows.push(row);
    }
  }

  const homepageBlockRows = [
    { block: homepageContent.hero, label: "Homepage hero" },
    { block: homepageContent.instagram, label: "Homepage Instagram" },
  ];
  for (const { block, label } of homepageBlockRows) {
    const row = makeRow({
      adminHref: "/admin/content/homepage",
      id: `homepage-block:${block.key}`,
      imageUrl: block.imageUrl,
      source: "homepage",
      status: block.isVisible ? "active" : "referenced",
      usageLabel: label,
    });
    if (row) rows.push(row);
  }

  for (const tile of homepageContent.promoTiles) {
    const row = makeRow({
      adminHref: "/admin/content/homepage",
      id: `homepage-promo-tile:${tile.slotIndex}`,
      imageUrl: tile.imageUrl,
      source: "promo_tile",
      status: tile.isVisible ? "active" : "referenced",
      usageLabel: `Promo tile ${tile.slotIndex}: ${tile.title}`,
    });
    if (row) rows.push(row);
  }

  for (const pick of homepageContent.materialPicks) {
    const row = makeRow({
      adminHref: "/admin/content/homepage",
      id: `homepage-material-pick:${pick.id}`,
      imageUrl: pick.imageUrl,
      source: "homepage",
      status: pick.hasUnavailableFeaturedProduct ? "archived" : "referenced",
      usageLabel: `Material pick: ${pick.title}`,
    });
    if (row) rows.push(row);
  }

  for (const campaign of specialEditionCampaigns) {
    const bannerRow = makeRow({
      adminHref: "/admin/special-edition",
      createdAt: campaign.createdAt,
      id: `special-edition-campaign:${campaign.id}:banner`,
      imageUrl: campaign.bannerImageUrl,
      source: "special_edition",
      status: campaign.isActive ? "active" : "referenced",
      updatedAt: campaign.updatedAt,
      usageLabel: "Special Edition banner",
    });
    if (bannerRow) rows.push(bannerRow);

    for (const entry of campaign.entries) {
      const promoRow = makeRow({
        adminHref: "/admin/special-edition",
        createdAt: entry.createdAt,
        id: `special-edition-entry:${entry.id}:promo`,
        imageUrl: entry.promoImageUrl,
        source: "special_edition",
        status: campaign.isActive ? "active" : "referenced",
        updatedAt: entry.updatedAt,
        usageLabel: `Special Edition promo: ${entry.product.name}`,
      });
      const productRow = makeRow({
        adminHref: "/admin/special-edition",
        createdAt: entry.createdAt,
        id: `special-edition-entry:${entry.id}:product`,
        imageUrl: entry.productImageUrl,
        source: "special_edition",
        status: campaign.isActive ? "active" : "referenced",
        updatedAt: entry.updatedAt,
        usageLabel: `Special Edition product image: ${entry.product.name}`,
      });
      if (promoRow) rows.push(promoRow);
      if (productRow) rows.push(productRow);
    }
  }

  for (const specialty of specialties) {
    const specialtyStatus = specialty.isVisible ? "active" : "referenced";
    for (const [key, imageUrl] of [
      ["image", specialty.imageUrl],
      ["preview", specialty.previewImageUrl],
      ["card", specialty.cardImageUrl],
    ] as const) {
      const row = makeRow({
        adminHref: "/admin/content/specialties",
        createdAt: specialty.createdAt,
        id: `specialty:${specialty.id}:${key}`,
        imageUrl,
        source: "specialty",
        status: specialtyStatus,
        updatedAt: specialty.updatedAt,
        usageLabel: `${specialty.name} - ${key}`,
      });
      if (row) rows.push(row);
    }
  }

  for (const stone of stones) {
    const row = makeRow({
      adminHref: "/admin/gemstones",
      createdAt: stone.createdAt,
      id: `stone:${stone.id}`,
      imageUrl: stone.imageUrl,
      source: "gemstone",
      status: "active",
      updatedAt: stone.updatedAt,
      usageLabel: stone.name,
    });
    if (row) rows.push(row);
  }

  for (const item of orderItems) {
    const row = makeRow({
      adminHref: `/admin/orders/${item.orderId}`,
      createdAt: item.order.createdAt,
      id: `order-item:${item.id}`,
      imageUrl: item.imageUrl,
      source: "order_snapshot",
      status: "referenced",
      updatedAt: item.order.updatedAt,
      usageLabel: `${item.productName} - ${item.order.orderNumber}`,
    });
    if (row) rows.push(row);
  }

  for (const user of users) {
    const row = makeRow({
      createdAt: user.createdAt,
      id: `user:${user.id}`,
      imageUrl: user.profileImageUrl,
      source: "user",
      status: "referenced",
      updatedAt: user.updatedAt,
      usageLabel: `${user.name} profile image`,
    });
    if (row) rows.push(row);
  }

  const cleanupRows: AdminCleanupQueueRow[] = cleanupItems.map((item) => ({
    id: item.id,
    createdAt: item.createdAt.toISOString(),
    failureMessage: item.failureMessage,
    reason: item.reason,
    scheduledAt: item.scheduledAt.toISOString(),
    status: item.status,
    updatedAt: item.updatedAt.toISOString(),
    url: item.url,
  }));

  for (const item of cleanupItems) {
    const status = `cleanup_${item.status.toLowerCase()}` as StatusKey;
    const row = makeRow({
      createdAt: item.createdAt,
      id: `cleanup:${item.id}`,
      imageUrl: item.url,
      source: "cleanup_queue",
      status,
      updatedAt: item.updatedAt,
      usageLabel: item.reason ? `Cleanup queue: ${item.reason}` : "Cleanup queue item",
    });
    if (row) rows.push(row);
  }

  return { cleanupRows, rows };
}

function buildOptions<T extends string>(
  rows: AdminMediaInventoryRow[],
  key: "source" | "status",
  labels: Record<T, string>,
) {
  const values = [...new Set(rows.map((row) => row[key]))].sort();
  return [
    { label: "Összes", value: "all" },
    ...values.map((value) => ({ label: labels[value as T] ?? value, value })),
  ];
}

export default async function AdminMediaPage({ searchParams }: AdminMediaPageProps) {
  const params = await searchParams;
  const search = getSearchValue(params, "q").trim();
  const selectedSource = getSearchValue(params, "source") || "all";
  const selectedStatus = getSearchValue(params, "status") || "all";
  const { cleanupRows, rows } = await getMediaInventoryRows();
  const filteredRows = rows.filter((row) => {
    if (selectedSource !== "all" && row.source !== selectedSource) return false;
    if (selectedStatus !== "all" && row.status !== selectedStatus) return false;
    return matchesSearch(row, search);
  });

  const summary = {
    cleanupFailed: cleanupRows.filter((row) => row.status === "FAILED").length,
    cleanupPending: cleanupRows.filter((row) => row.status === "PENDING").length,
    homepageImages: rows.filter((row) => row.source === "homepage" || row.source === "promo_tile").length,
    productImages: rows.filter((row) => row.source === "product").length,
    totalImages: rows.length,
  };

  return (
    <AdminShell
      title="Média"
      description="Read-only kép inventory és Blob cleanup queue áttekintés. Ebben a körben nincs törlés vagy retry action."
    >
      <AdminMediaInventory
        cleanupRows={cleanupRows}
        rows={filteredRows}
        search={search}
        selectedSource={selectedSource}
        selectedStatus={selectedStatus}
        sourceOptions={buildOptions<SourceKey>(rows, "source", sourceLabels)}
        statusOptions={buildOptions<StatusKey>(rows, "status", statusLabels)}
        summary={summary}
      />
    </AdminShell>
  );
}
