import { AdminHomepageContentForm } from "@/components/admin/AdminHomepageContentForm";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  getHomepageContent,
  getHomepageMaterialPickOptions,
} from "@/lib/homepage-content";

export default async function AdminHomepageContentPage() {
  const [content, materialPickOptions] = await Promise.all([
    getHomepageContent(),
    getHomepageMaterialPickOptions(),
  ]);

  return (
    <AdminShell title="Kezdőlap tartalom">
      <AdminHomepageContentForm content={content} materialPickOptions={materialPickOptions} />
    </AdminShell>
  );
}
