import { deleteProductAction } from "@/app/admin/products/actions";
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

      <div className="overflow-hidden rounded-[2.2rem] border border-white/70 bg-white/76 shadow-[0_20px_45px_rgba(191,117,162,0.1)] backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-[#f0d8e5] bg-[#fff7fb] text-[10px] uppercase tracking-[0.28em] text-[#af7795]">
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
                <tr key={product.id} className="border-b border-[#f6e6ee] last:border-b-0">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#4d2741]">{product.name}</p>
                    <p className="mt-1 text-sm text-[#7a6070]">/{product.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#6d5260]">
                    {product.category.name}
                  </td>
                  <td className="px-5 py-4 text-sm text-[#6d5260]">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-5 py-4 text-sm text-[#6d5260]">
                    {
                      homepagePlacementLabels[
                        product.homepagePlacement.toLowerCase() as keyof typeof homepagePlacementLabels
                      ]
                    }
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {product.isNew ? (
                        <span className="rounded-full border border-[#f2d0e1] bg-[#fff4f9] px-2.5 py-1 text-xs text-[#9b476f]">
                          Új
                        </span>
                      ) : null}
                      {product.isGiftable ? (
                        <span className="rounded-full border border-[#f2d0e1] bg-[#fff4f9] px-2.5 py-1 text-xs text-[#9b476f]">
                          Ajándékozható
                        </span>
                      ) : null}
                      {product.isOnSale ? (
                        <span className="rounded-full border border-[#f2d0e1] bg-[#fff4f9] px-2.5 py-1 text-xs text-[#9b476f]">
                          Akciós
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <AdminActionLink
                        href={`/admin/products/${product.id}/edit`}
                        size="sm"
                      >
                        Szerkesztés
                      </AdminActionLink>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="productId" value={product.id} />
                        <AdminActionButton type="submit" variant="danger" size="sm">
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
