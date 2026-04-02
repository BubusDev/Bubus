import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminAnnouncementBar } from "@/lib/announcement-bar";
import { db } from "@/lib/db";
import { getSpecialEditionCampaign } from "@/lib/products";

export default async function AdminPage() {
  const [
    productCount,
    spotlightCount,
    newArrivalCount,
    userCount,
    specialEditionCampaign,
    announcement,
  ] =
    await Promise.all([
      db.product.count(),
      db.product.count({ where: { homepagePlacement: "SPOTLIGHT" } }),
      db.product.count({ where: { homepagePlacement: "NEW_ARRIVALS" } }),
      db.user.count(),
      getSpecialEditionCampaign(),
      getAdminAnnouncementBar(),
    ]);

  return (
    <AdminShell
      title="Boutique Control"
      description="Manage the product catalog, homepage editorial placement, and Special Edition campaign state from one workspace."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
        {[
          { label: "Products", value: productCount, note: "SQLite-backed catalog records" },
          { label: "Spotlight", value: spotlightCount, note: "Homepage spotlight items" },
          {
            label: "New Arrivals",
            value: newArrivalCount,
            note: "Homepage new-arrival items",
          },
          { label: "Users", value: userCount, note: "Temporary auth accounts" },
          {
            label: "Special Edition",
            value: specialEditionCampaign?.isActive ? "Live" : "Off",
            note: `${specialEditionCampaign?.entries.length ?? 0} campaign entries`,
          },
          {
            label: "Announcement",
            value: announcement.isActive ? "Live" : "Off",
            note: announcement.text || "No current campaign microcopy",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[2rem] border border-white/70 bg-white/76 p-6 shadow-[0_20px_45px_rgba(191,117,162,0.1)] backdrop-blur-xl"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#af7795]">
              {item.label}
            </p>
            <p className="mt-3 font-[family:var(--font-display)] text-[3rem] leading-none text-[#4d2741]">
              {item.value}
            </p>
            <p className="mt-3 text-sm leading-6 text-[#765f6d]">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[2.2rem] border border-white/70 bg-white/76 p-6 shadow-[0_20px_45px_rgba(191,117,162,0.1)] backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#af7795]">
          Next Actions
        </p>
        <h2 className="mt-3 font-[family:var(--font-display)] text-[2.2rem] text-[#4d2741]">
          Product and campaign operations are live.
        </h2>
        <p className="mt-3 max-w-[58ch] text-sm leading-7 text-[#765f6d]">
          Standard catalog products keep their existing admin flow. Special Edition now has a
          dedicated campaign workspace with its own active state and entry-specific image mapping.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/announcement"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#ecd3e3] bg-white/90 px-5 text-sm font-medium text-[#6b425a] transition hover:border-[#e9b6d0] hover:bg-white"
          >
            Edit Announcement
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#f183bc] px-5 text-sm font-medium text-white shadow-[0_16px_35px_rgba(241,131,188,0.28)] transition hover:bg-[#ea6fb0]"
          >
            Open Product Management
          </Link>
          <Link
            href="/admin/special-edition"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#ecd3e3] bg-white/90 px-5 text-sm font-medium text-[#6b425a] transition hover:border-[#e9b6d0] hover:bg-white"
          >
            Open Special Edition
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
