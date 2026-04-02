import { ProductCard } from "@/components/shop/ProductCard";
import { getFavouriteProductIds } from "@/lib/account";
import { getCurrentUser } from "@/lib/auth";
import type { Product } from "@/lib/catalog";

type ProductGridProps = {
  products: Product[];
  redirectTo?: string;
};

export async function ProductGrid({
  products,
  redirectTo = "/",
}: ProductGridProps) {
  const user = await getCurrentUser();
  const favouriteIds = user ? await getFavouriteProductIds(user.id) : new Set<string>();

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isFavourite={favouriteIds.has(product.id)}
          redirectTo={redirectTo}
        />
      ))}
    </div>
  );
}
