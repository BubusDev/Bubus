import type { AnnouncementVariant } from "@prisma/client";

import { db } from "@/lib/db";

export type AnnouncementBarView = {
  text: string;
  href?: string;
  variant: AnnouncementVariant;
};

export type AdminAnnouncementBarValues = {
  id: string;
  text: string;
  href: string;
  isActive: boolean;
  variant: AnnouncementVariant;
};

function normalizeText(value: string | null) {
  return value?.trim() ?? "";
}

function normalizeHref(value: string | null) {
  const href = value?.trim() ?? "";
  return href.length > 0 ? href : undefined;
}

export async function getActiveAnnouncementBar(): Promise<AnnouncementBarView | null> {
  const announcement = await db.announcementBar.findFirst({
    where: {
      isActive: true,
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      text: true,
      href: true,
      variant: true,
    },
  });

  if (!announcement) {
    return null;
  }

  const text = normalizeText(announcement.text);

  if (!text) {
    return null;
  }

  return {
    text,
    href: normalizeHref(announcement.href),
    variant: announcement.variant,
  };
}

export async function getAdminAnnouncementBar(): Promise<AdminAnnouncementBarValues> {
  const announcement = await db.announcementBar.findFirst({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      text: true,
      href: true,
      isActive: true,
      variant: true,
    },
  });

  if (!announcement) {
    return {
      id: "",
      text: "",
      href: "",
      isActive: false,
      variant: "DEFAULT",
    };
  }

  return {
    id: announcement.id,
    text: normalizeText(announcement.text),
    href: announcement.href ?? "",
    isActive: announcement.isActive,
    variant: announcement.variant,
  };
}
