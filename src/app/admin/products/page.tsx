import Link from "next/link";

import { deleteProductAction } from "@/app/admin/products/actions";
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
        <Link
          href="/admin/products/new"
          className="inline-flex h-12 items-center justify-center rounded-full bg-[#f183bc] px-5 text-sm font-medium text-white shadow-[0_16px_35px_rgba(241,131,188,0.28)] transition hover:bg-[#ea6fb0]"
        >
          Új termék
        </Link>
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
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-[#ecd3e3] bg-white/90 px-4 text-sm font-medium text-[#6b425a] transition hover:border-[#e9b6d0] hover:bg-white"
                      >
                        Szerkesztés
                      </Link>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="productId" value={product.id} />
                        <button
                          type="submit"
                          className="inline-flex h-10 items-center justify-center rounded-full border border-[#f1cedf] bg-[#fff3f8] px-4 text-sm font-medium text-[#9b476f] transition hover:bg-[#ffe8f2]"
                        >
                          Törlés
                        </button>
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
