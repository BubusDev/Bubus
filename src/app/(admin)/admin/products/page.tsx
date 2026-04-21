import { AdminShell } from "@/components/admin/AdminShell";
import { db } from "@/lib/db";
import { getAdminProducts, getAdminProductFormOptions, getProductOptionGroups } from "@/lib/products";

import { ProductsListClient } from "./components/ProductsListClient";

type AdminProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const [products, options, optionGroups, allPromoCodes, allAssignedCoupons, params] =
    await Promise.all([
      getAdminProducts(),
      getAdminProductFormOptions(),
      getProductOptionGroups(true),
      db.promoCode.findMany({
        select: {
          id: true,
          code: true,
          discountPercent: true,
          validFrom: true,
          validUntil: true,
          isActive: true,
        },
        orderBy: { code: "asc" },
      }),
      db.promoCodeProduct.findMany({
        include: {
          promoCode: {
            select: {
              id: true,
              code: true,
              discountPercent: true,
              validFrom: true,
              validUntil: true,
              isActive: true,
            },
          },
        },
      }),
      searchParams,
    ]);

  const assignedCouponsByProductId: Record<
    string,
    { promoCodeId: string; code: string; discountPercent: number; validFrom: Date; validUntil: Date | null; isActive: boolean }[]
  > = {};
  for (const row of allAssignedCoupons) {
    const list = assignedCouponsByProductId[row.productId] ?? [];
    list.push({
      promoCodeId: row.promoCode.id,
      code: row.promoCode.code,
      discountPercent: row.promoCode.discountPercent,
      validFrom: row.promoCode.validFrom,
      validUntil: row.promoCode.validUntil,
      isActive: row.promoCode.isActive,
    });
    assignedCouponsByProductId[row.productId] = list;
  }

  const editParam = typeof params.edit === "string" ? params.edit : null;
  const isNew = params.new === "1";

  return (
    <AdminShell title="Termékek">
      <ProductsListClient
        products={products}
        options={options}
        optionGroups={optionGroups}
        allPromoCodes={allPromoCodes}
        assignedCouponsByProductId={assignedCouponsByProductId}
        initialMode={isNew ? "new" : null}
        initialEditProductId={editParam}
      />
    </AdminShell>
  );
}
