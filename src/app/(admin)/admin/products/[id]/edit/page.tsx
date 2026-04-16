import { notFound } from "next/navigation";

import { updateProductAction } from "@/app/(admin)/admin/products/actions";
import { AdminOptionManager } from "@/components/admin/AdminOptionManager";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductCouponSection } from "@/components/admin/ProductCouponSection";
import { db } from "@/lib/db";
import {
  getAdminProductById,
  getAdminProductFormOptions,
  getProductOptionGroups,
  toAdminProductFormValues,
} from "@/lib/products";

type EditAdminProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAdminProductPage({
  params,
}: EditAdminProductPageProps) {
  const { id } = await params;
  const [product, options, optionGroups, assignedCouponRows, allPromoCodes] = await Promise.all([
    getAdminProductById(id),
    getAdminProductFormOptions(),
    getProductOptionGroups(true),
    db.promoCodeProduct.findMany({
      where: { productId: id },
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
      orderBy: { promoCode: { code: "asc" } },
    }),
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
  ]);

  if (!product) {
    notFound();
  }

  const assignedCoupons = assignedCouponRows.map((row) => ({
    promoCodeId: row.promoCode.id,
    code: row.promoCode.code,
    discountPercent: row.promoCode.discountPercent,
    validFrom: row.promoCode.validFrom,
    validUntil: row.promoCode.validUntil,
    isActive: row.promoCode.isActive,
  }));

  return (
    <AdminShell title="Termék szerkesztése">
      <div className="grid gap-6">
        <AdminProductForm
          action={updateProductAction}
          options={options}
          optionGroups={optionGroups}
          submitLabel="Módosítások mentése"
          values={toAdminProductFormValues(product, options)}
        />
        <ProductCouponSection
          productId={id}
          assignedCoupons={assignedCoupons}
          availableCoupons={allPromoCodes}
        />
        <AdminOptionManager groups={optionGroups} />
      </div>
    </AdminShell>
  );
}
