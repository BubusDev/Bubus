"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/lib/catalog";

type ProductGridClientProps = {
  products: Product[];
  redirectTo?: string;
};

export function ProductGridClient({
  products,
  redirectTo = "/",
}: ProductGridClientProps) {
  const { status } = useSession();
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isCancelled = false;

    async function loadFavouriteIds() {
      if (status !== "authenticated") {
        setFavouriteIds(new Set());
        return;
      }

      const response = await fetch("/api/account/favourite-product-ids", {
        credentials: "same-origin",
      });

      if (!response.ok) {
        if (!isCancelled) {
          setFavouriteIds(new Set());
        }
        return;
      }

      const data = (await response.json()) as { productIds?: string[] };

      if (!isCancelled) {
        setFavouriteIds(new Set(data.productIds ?? []));
      }
    }

    void loadFavouriteIds();

    return () => {
      isCancelled = true;
    };
  }, [status]);

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
