import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

import {
  moveFavouriteToCartAction,
  removeFavouriteAction,
} from "@/app/account/actions";
import { AccountShell } from "@/components/account/AccountShell";
import { EmptyStateCard } from "@/components/account/EmptyStateCard";
import { ProductImageFrame } from "@/components/shop/ProductImageFrame";
import {
  type FavouriteProduct,
  getFavouriteProducts,
} from "@/lib/account";
import { requireUser } from "@/lib/auth";
import { formatPrice, isProductOutOfStock } from "@/lib/catalog";
import { getCuratedProductRecommendations } from "@/lib/products";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function FavouritesPage() {
  const user = await requireUser("/favourites");
  const favourites = await getFavouriteProducts(user.id);
  const wishlistProductIds = favourites.map((f) => f.productId);
  const recommended = favourites.length > 0
    ? await getCuratedProductRecommendations(wishlistProductIds, 4)
    : [];

  return (
    <AccountShell
      title="Kedvencek"
      description="Az elmentett darabok egyetlen letisztult nézetben."
      currentPath="/favourites"
    >
      {favourites.length === 0 ? (
        <EmptyStateCard
          icon={Heart}
          eyebrow="Nincs még mentett termék"
          title="A kedvenceid itt jelennek meg"
          description="Amikor elmentesz egy ékszert, itt visszatalálsz hozzá, és egy mozdulattal a táskádba teheted."
          actionHref="/"
          actionLabel="Kollekció böngészése"
        />
      ) : (
        <section className="space-y-10 px-6 sm:px-10 lg:px-16">

          {/* Header */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#b06b8e]">
                Kedvencek
              </p>
              <h2 className="mt-2 font-[family:var(--font-display)] text-[2rem] leading-none text-[#2d1f28]">
                Elmentett darabok
              </h2>
            </div>
            <span className="text-xs uppercase tracking-[0.16em] text-[#9a738c]">
              {favourites.length} mentett
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
            {favourites.map((item: FavouriteProduct) => (
              <article key={item.productId} className="group flex flex-col">
                {(() => {
                  const isOutOfStock = isProductOutOfStock(item);

                  return (
                    <>

                      <Link href={`/product/${item.slug}?redirectTo=/favourites`} className="relative block aspect-[4/5] overflow-hidden">
                        <ProductImageFrame
                          alt={item.name}
                          imageUrl={item.imageUrl}
                          soldOut={isOutOfStock}
                          className="relative h-full w-full overflow-hidden"
                          imageClassName={`h-full w-full object-cover transition duration-500 ${
                            isOutOfStock ? "" : "group-hover:scale-[1.03]"
                          }`}
                          palette={["#fff8fb", "#f8edf3", "#f3e3ec"]}
                        />
                        <div className="absolute right-2.5 top-2.5">
                          <Heart className="h-4 w-4 fill-[#df6da8] text-[#df6da8]" />
                        </div>
                      </Link>

                      <div className="mt-3 flex flex-col gap-1">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[#b484a6]">
                          {item.collectionLabel}
                        </p>
                        <Link
                          href={`/product/${item.slug}?redirectTo=/favourites`}
                          className="line-clamp-2 text-[1.1rem] leading-snug tracking-[-0.01em] text-[#2f2230] transition hover:text-[#7d4a69]"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-[#2f2230]">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-[#f0e8ee] pt-3">
                        <form action={moveFavouriteToCartAction}>
                          <input type="hidden" name="productId" value={item.productId} />
                          <button
                            type="submit"
                            disabled={isOutOfStock}
                            aria-label={`${item.name} hozzáadása a táskához`}
                            className={`flex items-center gap-1.5 text-[12px] uppercase tracking-[0.14em] transition ${
                              isOutOfStock
                                ? "cursor-not-allowed text-[#b69dad]"
                                : "text-[#6b425a] hover:text-[#d45c9c]"
                            }`}
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            {isOutOfStock ? "Elfogyott" : "Kosárba"}
                          </button>
                        </form>

                        <form action={removeFavouriteAction}>
                          <input type="hidden" name="productId" value={item.productId} />
                          <button
                            type="submit"
                            aria-label={`${item.name} törlése`}
                            className="text-[#c4a8ba] transition hover:text-[#d45c9c]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>

                    </>
                  );
                })()}
              </article>
            ))}
          </div>

        </section>
      )}

      {/* Esetleg érdekelheti */}
      {recommended.length > 0 && (
        <section className="mt-16 border-t-2 border-[#1a1a1a] pt-12 px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[.3em] text-[#888] mb-2">Ajánlott</p>
            <h2 className="font-[family:var(--font-display)] text-2xl text-[#1a1a1a]">
              Esetleg érdekelheti Önt
            </h2>
          </div>

          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-6 max-w-[900px] w-full sm:grid-cols-4">
              {recommended.map((product) => (
                <article key={product.id} className="group">
                  <Link href={`/product/${product.slug}`}>
                    <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f3f0] mb-3">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 50vw, 225px"
                        />
                      ) : (
                        <div className="h-full w-full bg-[#f0ede8]" />
                      )}
                    </div>
                  </Link>
                  <p className="text-[10px] uppercase tracking-[.2em] text-[#888] mb-1">
                    {product.collectionLabel}
                  </p>
                  <Link
                    href={`/product/${product.slug}`}
                    className="text-sm text-[#1a1a1a] hover:text-[#555] transition line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm font-medium text-[#1a1a1a] mt-0.5">
                    {formatPrice(product.price)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </AccountShell>
  );
}
