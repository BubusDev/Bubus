import { createProductAction } from "@/app/(admin)/admin/products/actions";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  getAdminProductFormOptions,
  toAdminProductFormValues,
} from "@/lib/products";

export default async function NewAdminProductPage() {
  const options = await getAdminProductFormOptions();

  return (
    <AdminShell title="Új termék">
      <AdminProductForm
        action={createProductAction}
        options={options}
        submitLabel="Termék létrehozása"
        values={toAdminProductFormValues(null, options)}
      />
    </AdminShell>
  );
}
