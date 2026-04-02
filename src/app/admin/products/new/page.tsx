import { createProductAction } from "@/app/admin/products/actions";
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
    <AdminShell
      title="Create Product"
      description="Add a new storefront product with complete merchandising, filtering, and homepage-placement metadata."
    >
      <AdminProductForm
        action={createProductAction}
        options={options}
        optionGroups={optionGroups}
        submitLabel="Create Product"
        values={toAdminProductFormValues(null, options)}
      />
    </AdminShell>
  );
}
