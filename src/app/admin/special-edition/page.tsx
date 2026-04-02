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
      description="Manage the dedicated Special Edition campaign flow, including the global active state and the explicit left/right image assignment for each entry."
    >
      <AdminSpecialEditionManager campaign={campaign} products={products} />
    </AdminShell>
  );
}
