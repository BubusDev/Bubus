"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/lib/catalog";

type ProductGridClientProps = {
  products: Product[];
  redirectTo?: string;
  className?: string;
  showAddToCart?: boolean;
  wishlistPlacement?: "inline" | "image";
};

export function ProductGridClient({
  products,
  redirectTo = "/",
  className = "grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 xl:grid-cols-4",
  showAddToCart = true,
  wishlistPlacement = "inline",
}: ProductGridClientProps) {
  const { status } = useSession();
  const router = useRouter();
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

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

  async function handleFavouriteToggle(productId: string, isFavourite: boolean) {
    setPendingIds((current) => new Set(current).add(productId));
    setFavouriteIds((current) => {
      const next = new Set(current);
      if (isFavourite) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });

    try {
      const response = await fetch("/api/account/favourites", {
        method: isFavourite ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          productId,
          redirectTo,
        }),
      });

      if (response.status === 401) {
        const data = (await response.json()) as { redirectTo?: string };
        router.push(data.redirectTo ?? `/sign-in?next=${encodeURIComponent(redirectTo)}`);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update favourites.");
      }
    } catch {
      setFavouriteIds((current) => {
        const next = new Set(current);
        if (isFavourite) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(productId);
        return next;
      });
    }
  }

  return (
    <div className={className}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isFavourite={favouriteIds.has(product.id)}
          isFavouritePending={pendingIds.has(product.id)}
          onFavouriteToggle={handleFavouriteToggle}
          redirectTo={redirectTo}
          showAddToCart={showAddToCart}
          wishlistPlacement={wishlistPlacement}
        />
      ))}
    </div>
  );
}
