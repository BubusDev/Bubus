import { AdminSpecialEditionManager } from "@/components/admin/AdminSpecialEditionManager";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  getAdminSelectableProducts,
  getAdminSpecialEditionCampaign,
} from "@/lib/products";

export default async function AdminSpecialEditionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const [campaign, products] = await Promise.all([
    getAdminSpecialEditionCampaign(),
    getAdminSelectableProducts(),
  ]);

  return (
    <AdminShell title="Special Edition">
      {error && (
        <div className="mb-5 border border-[#fca5a5] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#b91c1c]">
          {decodeURIComponent(error)}
        </div>
      )}
      <AdminSpecialEditionManager campaign={campaign} products={products} />
    </AdminShell>
  );
}
