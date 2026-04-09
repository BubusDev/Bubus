import Link from "next/link";

import type { AdminActivityItem } from "@/lib/admin-activity";

export function AdminRecentActivityList({
  items,
  emptyMessage = "Még nincs megjeleníthető workflow aktivitás.",
}: {
  items: AdminActivityItem[];
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="border border-[#f0eeec] bg-[#faf9f7] p-4 text-sm text-[#666]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#f0eeec]">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="block px-5 py-4 transition hover:bg-[#faf9f7]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#1a1a1a]">{item.title}</p>
              <p className="mt-1 text-[13px] text-[#555]">{item.summary}</p>
              <p className="mt-1 text-[12px] text-[#888]">
                {item.actorLabel} · {item.entityLabel}
              </p>
            </div>
            <p className="shrink-0 text-[12px] text-[#888]">
              {item.changedAt.toLocaleString("hu-HU")}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
