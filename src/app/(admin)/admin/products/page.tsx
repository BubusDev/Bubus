import {
  deleteProductAction,
  toggleProductArchiveAction,
  toggleProductFlagAction,
} from "@/app/(admin)/admin/products/actions";
import {
  AdminActionButton,
  AdminActionLink,
} from "@/components/admin/AdminActionButton";
import { AdminOptionManager } from "@/components/admin/AdminOptionManager";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatPrice, homepagePlacementLabels } from "@/lib/catalog";
import { getAdminProducts, getProductOptionGroups } from "@/lib/products";

export default async function AdminProductsPage() {
  const [products, optionGroups] = await Promise.all([
    getAdminProducts(),
    getProductOptionGroups(true),
  ]);

  return (
    <AdminShell
      title="Termékek"
      description="Termékek létrehozása, szerkesztése és törlése egységes szűrési és kezdőlapi kihelyezési adatokkal."
    >
      <div className="mb-5 flex justify-end">
        <AdminActionLink href="/admin/products/new" variant="primary">
          Új termék
        </AdminActionLink>
      </div>

      <div className="admin-table-shell">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="admin-table-head text-[10px] uppercase tracking-[0.28em] text-[var(--admin-ink-500)]">
              <tr>
                <th className="px-5 py-4">Termék</th>
                <th className="px-5 py-4">Kategória</th>
                <th className="px-5 py-4">Ár</th>
                <th className="px-5 py-4">Kihelyezés</th>
                <th className="px-5 py-4">Jelölések</th>
                <th className="px-5 py-4">Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="admin-table-row last:border-b-0">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[var(--admin-ink-900)]">{product.name}</p>
                    <p className="mt-1 text-sm text-[var(--admin-ink-600)]">/{product.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--admin-ink-700)]">
                    {product.category.name}
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--admin-ink-700)]">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--admin-ink-700)]">
                    {
                      homepagePlacementLabels[
                        product.homepagePlacement.toLowerCase() as keyof typeof homepagePlacementLabels
                      ]
                    }
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <ProductFlagToggle
                        productId={product.id}
                        flag="isNew"
                        active={product.isNew}
                        label="Új"
                      />
                      <ProductFlagToggle
                        productId={product.id}
                        flag="isGiftable"
                        active={product.isGiftable}
                        label="Ajándékozható"
                      />
                      <ProductFlagToggle
                        productId={product.id}
                        flag="isOnSale"
                        active={product.isOnSale}
                        label="Akciós"
                      />
                      <ProductArchiveToggle productId={product.id} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <AdminActionLink
                        href={`/admin/products/${product.id}/edit`}
                        size="sm"
                        className="!h-8 !px-3 !text-xs"
                      >
                        Szerkesztés
                      </AdminActionLink>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="productId" value={product.id} />
                        <AdminActionButton type="submit" variant="danger" size="sm" className="!h-8 !px-3 !text-xs">
                          Törlés
                        </AdminActionButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <AdminOptionManager groups={optionGroups} />
      </div>
    </AdminShell>
  );
}

function ProductFlagToggle({
  productId,
  flag,
  active,
  label,
}: {
  productId: string;
  flag: "isNew" | "isGiftable" | "isOnSale";
  active: boolean;
  label: string;
}) {
  return (
    <form action={toggleProductFlagAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="flag" value={flag} />
      <input type="hidden" name="nextValue" value={String(!active)} />
      <AdminActionButton
        type="submit"
        size="sm"
        variant={active ? "primary" : "secondary"}
        className="!h-8 !px-3 !text-xs"
      >
        {label}
      </AdminActionButton>
    </form>
  );
}

function ProductArchiveToggle({ productId }: { productId: string }) {
  return (
    <form action={toggleProductArchiveAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="nextArchived" value="true" />
      <input type="hidden" name="archiveReason" value="DISCONTINUED" />
      <AdminActionButton
        type="submit"
        size="sm"
        variant="danger"
        className="!h-8 !px-3 !text-xs"
      >
        Archiválás
      </AdminActionButton>
    </form>
  );
}
