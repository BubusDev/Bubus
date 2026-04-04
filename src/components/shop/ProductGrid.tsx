import { ProductGridClient } from "@/components/shop/ProductGridClient";
import type { Product } from "@/lib/catalog";

type ProductGridProps = {
  products: Product[];
  redirectTo?: string;
};

export async function ProductGrid({
  products,
  redirectTo = "/",
}: ProductGridProps) {
  return <ProductGridClient products={products} redirectTo={redirectTo} />;
}
