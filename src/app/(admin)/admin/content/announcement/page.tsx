import { AdminAnnouncementBarForm } from "@/components/admin/AdminAnnouncementBarForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminAnnouncementBar } from "@/lib/announcement-bar";

export default async function AdminAnnouncementPage() {
  const announcement = await getAdminAnnouncementBar();

  return (
    <AdminShell
      title="Üzenetsáv"
      description="Az üzlet fejlécében megjelenő szerkesztői csík kezelése."
    >
      <AdminAnnouncementBarForm announcement={announcement} />
    </AdminShell>
  );
}
