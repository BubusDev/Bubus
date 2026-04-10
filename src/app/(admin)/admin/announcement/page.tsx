import { AdminAnnouncementBarForm } from "@/components/admin/AdminAnnouncementBarForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminAnnouncementBar } from "@/lib/announcement-bar";

export default async function AdminAnnouncementPage() {
  const announcement = await getAdminAnnouncementBar();

  return (
    <AdminShell
      title="Announcement"
      description="Manage the single editorial announcement strip that can appear above the storefront header."
    >
      <AdminAnnouncementBarForm announcement={announcement} />
    </AdminShell>
  );
}
