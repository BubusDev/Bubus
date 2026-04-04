import { ProductGrid } from "@/components/shop/ProductGrid";
import type { Product } from "@/lib/catalog";

type RelatedProductsProps = {
  products: Product[];
  redirectTo?: string;
};

export function RelatedProducts({
  products,
  redirectTo = "/",
}: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.32em] text-[#b06b8e]">
          Kapcsolódó darabok
        </p>
        <h2 className="mt-3 font-[family:var(--font-display)] text-[2.5rem] leading-none text-[#4d2741]">
          Illenek ehhez a termékhez
        </h2>
      </div>
      <ProductGrid products={products} redirectTo={redirectTo} />
    </section>
  );
}
