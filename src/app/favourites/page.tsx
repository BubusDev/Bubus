import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

import {
  moveFavouriteToCartAction,
  removeFavouriteAction,
} from "@/app/account/actions";
import { AccountShell } from "@/components/account/AccountShell";
import { EmptyStateCard } from "@/components/account/EmptyStateCard";
import {
  type FavouriteProduct,
  getFavouriteProducts,
} from "@/lib/account";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/catalog";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function FavouritesPage() {
  const user = await requireUser("/favourites");
  const favourites = await getFavouriteProducts(user.id);

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

                {/* Image */}
                <Link href={`/product/${item.slug}?redirectTo=/favourites`} className="relative block aspect-[4/5] overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{
                        background:
                          "linear-gradient(160deg, #fff8fb, #f8edf3 55%, #f3e3ec)",
                      }}
                    />
                  )}
                  <div className="absolute right-2.5 top-2.5">
                    <Heart className="h-4 w-4 fill-[#df6da8] text-[#df6da8]" />
                  </div>
                </Link>

                {/* Info */}
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

                {/* Actions */}
                <div className="mt-3 flex items-center justify-between border-t border-[#f0e8ee] pt-3">
                  <form action={moveFavouriteToCartAction}>
                    <input type="hidden" name="productId" value={item.productId} />
                    <button
                      type="submit"
                      aria-label={`${item.name} hozzáadása a táskához`}
                      className="flex items-center gap-1.5 text-[12px] uppercase tracking-[0.14em] text-[#6b425a] transition hover:text-[#d45c9c]"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      
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

              </article>
            ))}
          </div>

        </section>
      )}
    </AccountShell>
  );
}