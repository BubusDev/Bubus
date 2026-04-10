import { AdminSpecialEditionManager } from "@/components/admin/AdminSpecialEditionManager";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  getAdminSelectableProducts,
  getAdminSpecialEditionCampaign,
} from "@/lib/products";

export default async function AdminSpecialEditionPage() {
  const [campaign, products] = await Promise.all([
    getAdminSpecialEditionCampaign(),
    getAdminSelectableProducts(),
  ]);

  return (
    <AdminShell
      title="Special Edition"
      description="A limitált kampány kezelése — aktív állapot és termékenkénti képek beállítása."
    >
      <AdminSpecialEditionManager campaign={campaign} products={products} />
    </AdminShell>
  );
}
