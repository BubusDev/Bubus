import { AdminAnnouncementBarForm } from "@/components/admin/AdminAnnouncementBarForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminAnnouncementBar } from "@/lib/announcement-bar";

export default async function AdminAnnouncementPage() {
  const announcement = await getAdminAnnouncementBar();

  return (
    <AdminShell title="Üzenetsáv">
      <AdminAnnouncementBarForm announcement={announcement} />
    </AdminShell>
  );
}
