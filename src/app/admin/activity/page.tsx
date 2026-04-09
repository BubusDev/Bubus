import { AdminRecentActivityList } from "@/components/admin/AdminRecentActivityList";
import { AdminShell } from "@/components/admin/AdminShell";
import { getRecentAdminActivity } from "@/lib/admin-activity";

export default async function AdminActivityPage() {
  const items = await getRecentAdminActivity(40);

  return (
    <AdminShell
      title="Legutóbbi aktivitás"
      description="A rendelések és visszaküldési kérelmek legfrissebb workflow módosításai egy helyen."
    >
      <div className="overflow-hidden border border-[#e8e5e0] bg-white">
        <div className="border-b border-[#e8e5e0] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#1a1a1a]">Friss workflow események</h2>
        </div>
        <AdminRecentActivityList items={items} />
      </div>
    </AdminShell>
  );
}
