import { createProductAction } from "@/app/(admin)/admin/products/actions";
import { AdminOptionManager } from "@/components/admin/AdminOptionManager";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  getAdminProductFormOptions,
  getProductOptionGroups,
  toAdminProductFormValues,
} from "@/lib/products";

export default async function NewAdminProductPage() {
  const [options, optionGroups] = await Promise.all([
    getAdminProductFormOptions(),
    getProductOptionGroups(true),
  ]);

  return (
    <AdminShell title="Új termék">
      <div className="grid gap-6">
        <AdminProductForm
          action={createProductAction}
          options={options}
          optionGroups={optionGroups}
          submitLabel="Termék létrehozása"
          values={toAdminProductFormValues(null, options)}
        />
        <AdminOptionManager groups={optionGroups} />
      </div>
    </AdminShell>
  );
}
