import { notFound } from "next/navigation";

import { updateProductAction } from "@/app/(admin)/admin/products/actions";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { AdminShell } from "@/components/admin/AdminShell";
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
  const [product, options, optionGroups] = await Promise.all([
    getAdminProductById(id),
    getAdminProductFormOptions(),
    getProductOptionGroups(true),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <AdminShell
      title="Termék szerkesztése"
      description="A termék adatainak, kezdőlapi kihelyezésének és szűrési mezőinek frissítése a publikus felület átírása nélkül."
    >
      <AdminProductForm
        action={updateProductAction}
        options={options}
        optionGroups={optionGroups}
        submitLabel="Módosítások mentése"
        values={toAdminProductFormValues(product, options)}
      />
    </AdminShell>
  );
}
