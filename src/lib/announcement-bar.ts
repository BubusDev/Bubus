import type { AnnouncementVariant } from "@prisma/client";

import { db } from "@/lib/db";
import { getLocalizedPath } from "@/lib/locale-routing";
import { getRequestLocale } from "@/lib/request-locale";
import type { SupportedLanguage } from "@/lib/international";

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

const announcementTranslations = new Map<string, string>([
  ["Hamarosan megnyitunk! Rengeteg új kollekció várható!", "Opening soon. Many new collections are coming."],
]);

function localizeAnnouncementText(text: string, language: SupportedLanguage) {
  if (language !== "en") return text;
  return announcementTranslations.get(text) ?? text;
}

export async function getActiveAnnouncementBar(): Promise<AnnouncementBarView | null> {
  const [announcement, language] = await Promise.all([
    db.announcementBar.findFirst({
      where: {
        isActive: true,
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: {
        text: true,
        href: true,
        variant: true,
      },
    }),
    getRequestLocale(),
  ]);

  if (!announcement) {
    return null;
  }

  const text = normalizeText(announcement.text);

  if (!text) {
    return null;
  }

  const href = normalizeHref(announcement.href);

  return {
    text: localizeAnnouncementText(text, language),
    href: href ? getLocalizedPath(href, language) : undefined,
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
