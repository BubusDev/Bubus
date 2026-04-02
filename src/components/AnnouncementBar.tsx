import Link from "next/link";
import type { AnnouncementVariant } from "@prisma/client";

import type { AnnouncementBarView } from "@/lib/announcement-bar";

type AnnouncementBarProps = {
  announcement: AnnouncementBarView | null;
};

const variantStyles: Record<AnnouncementVariant, string> = {
  DEFAULT:
    "border-[#e8d6db] bg-[linear-gradient(180deg,rgba(252,245,242,0.96),rgba(248,237,239,0.94))] text-[#5f4353]",
  SALE:
    "border-[#e4d0d6] bg-[linear-gradient(180deg,rgba(248,239,233,0.97),rgba(245,231,229,0.94))] text-[#694352]",
  SPECIAL_EDITION:
    "border-[#ddd1d8] bg-[linear-gradient(180deg,rgba(245,239,236,0.96),rgba(241,232,235,0.94))] text-[#533847]",
  NEW_COLLECTION:
    "border-[#e7d7de] bg-[linear-gradient(180deg,rgba(250,244,238,0.96),rgba(246,236,237,0.94))] text-[#624454]",
};

export function AnnouncementBar({ announcement }: AnnouncementBarProps) {
  if (!announcement?.text) {
    return null;
  }

  const content = (
    <span className="mx-auto block max-w-[900px] truncate px-4 text-center text-[10px] font-medium uppercase tracking-[0.28em] sm:px-6">
      {announcement.text}
    </span>
  );

  return (
    <div className={`border-b ${variantStyles[announcement.variant]} backdrop-blur-md`}>
      {announcement.href ? (
        <Link
          href={announcement.href}
          className="block py-2.5 transition-colors duration-200 hover:text-[#3f2734] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b7c4] focus-visible:ring-inset"
        >
          {content}
        </Link>
      ) : (
        <div className="py-2.5">{content}</div>
      )}
    </div>
  );
}
