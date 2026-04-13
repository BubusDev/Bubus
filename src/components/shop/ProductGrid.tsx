import { ProductGridClient } from "@/components/shop/ProductGridClient";
import type { Product } from "@/lib/catalog";

type ProductGridProps = {
  products: Product[];
  redirectTo?: string;
  className?: string;
  showAddToCart?: boolean;
  wishlistPlacement?: "inline" | "image";
};

export async function ProductGrid({
  products,
  redirectTo = "/",
  className,
  showAddToCart,
  wishlistPlacement,
}: ProductGridProps) {
  return (
    <ProductGridClient
      products={products}
      redirectTo={redirectTo}
      className={className}
      showAddToCart={showAddToCart}
      wishlistPlacement={wishlistPlacement}
    />
  );
}
