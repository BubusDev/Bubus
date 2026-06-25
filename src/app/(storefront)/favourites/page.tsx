import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";

import {
  addFavouriteToCartAction,
  deleteFavouriteAction,
} from "@/app/(storefront)/account/actions";
import { AccountShell } from "@/components/account/AccountShell";
import { ProductCard } from "@/components/shop/ProductCard";
import {
  type FavouriteProduct,
  getFavouriteProducts,
} from "@/lib/account";
import { requireAccountUser } from "@/lib/auth";
import { getLocalizedPath } from "@/lib/locale-routing";
import { getCuratedProductRecommendations } from "@/lib/products-server";
import { getRequestLocale } from "@/lib/request-locale";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function FavouritesPage() {
  const user = await requireAccountUser("/favourites");
  const language = await getRequestLocale();
  const favourites = await getFavouriteProducts(user.id);
  const wishlistProductIds = favourites.map((f) => f.productId);
  const recommended = favourites.length > 0
    ? await getCuratedProductRecommendations(wishlistProductIds, 4)
    : [];

  return (
    <AccountShell
      title={language === "en" ? "Favourites" : "Kedvencek"}
      description={language === "en" ? "Saved pieces in one clean view." : "Az elmentett darabok egyetlen letisztult nézetben."}
    >
      {favourites.length === 0 ? (
        <section className="rounded-[1.25rem] border border-rose-100 bg-[linear-gradient(135deg,#fff7fa_0%,#fdf2f6_48%,#fff_100%)] px-5 py-7 shadow-[0_18px_54px_rgba(159,79,119,0.09)] sm:px-7 sm:py-8">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-rose-100 bg-white/78 text-[#c45a85] shadow-[0_12px_34px_rgba(196,90,133,0.14)]">
              <Heart className="h-5 w-5" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#a36b85]">
              {language === "en" ? "Saved pieces" : "Elmentett darabok"}
            </p>
            <h2 className="mt-3 font-[family:var(--font-display)] text-[1.9rem] leading-tight text-[#2d1f28] sm:text-[2.25rem]">
              {language === "en" ? "You have no saved pieces yet." : "Még nincs elmentett darabod."}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#735f6b] sm:text-base">
              {language === "en"
                ? "Use the heart icon to save pieces for later and return to the ones that caught your eye."
                : "A szív ikonra kattintva későbbre teheted a kedvenceidet, és visszaválogathatsz azokhoz, amelyek elsőre megfogtak."}
            </p>
            <Link
              href={getLocalizedPath("/", language)}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#2d1f28] px-6 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#4a2c3c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
            >
              {language === "en" ? "Explore new pieces" : "Fedezd fel az újdonságokat"}
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-[#ece8e3] bg-[#fffdfb] px-4 py-5 shadow-[0_12px_28px_rgba(45,31,40,0.04)] sm:px-5 sm:py-5">
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-[#f0e2e8] pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-[family:var(--font-display)] text-[1.7rem] leading-tight text-[#2d1f28] sm:text-[1.95rem]">
                {language === "en" ? "Saved pieces" : "Elmentett darabok"}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-[#655b54]">
                {language === "en" ? "Pieces saved for later in one place." : "A későbbre eltett darabok egy helyen."}
              </p>
            </div>
            <span className="w-fit rounded-full border border-[#efd7e3] bg-[#fff7fa] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#8d4b6d] sm:mt-1">
              {language === "en" ? `${favourites.length} saved` : `${favourites.length} mentett`}
            </span>
          </div>

          {/* Grid */}
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4">
            {favourites.map((item: FavouriteProduct) => (
              <ProductCard
                key={item.productId}
                product={{
                  id: item.productId,
                  slug: item.slug,
                  name: item.name,
                  price: item.price,
                  collectionLabel: item.collectionLabel,
                  stockQuantity: item.stockQuantity,
                  reservedQuantity: item.reservedQuantity,
                  imageUrl: item.imageUrl,
                  images: item.images,
                }}
                variant="saved"
                redirectTo="/favourites"
                onAddToCart={addFavouriteToCartAction.bind(null, item.productId)}
                onRemove={deleteFavouriteAction.bind(null, item.productId)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Esetleg érdekelheti */}
      {favourites.length > 0 && (
        <section className="rounded-lg border border-[#ece8e3] bg-white px-5 py-7 shadow-[0_10px_30px_rgba(45,31,40,0.04)] sm:px-7">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[.28em] text-[#9a9189]">
                {language === "en" ? "Recommended" : "Ajánlott"}
              </p>
              <h2 className="font-[family:var(--font-display)] text-[1.65rem] leading-none text-[#2d2829]">
                {language === "en" ? "You may also like" : "Esetleg érdekelheti Önt"}
              </h2>
            </div>
            <p className="text-sm text-[#7c736c]">
              {language === "en" ? "Curated from your favourites." : "A kedvenceid alapján válogatva."}
            </p>
          </div>

          {recommended.length > 0 ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-6">
              {recommended.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  redirectTo="/favourites"
                  showWishlistToggle={false}
                  showAddToCart={false}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-[#f0e4ea] bg-[#fcfafb] px-4 py-4 text-sm text-[#8b7080]">
              {language === "en"
                ? "There are no additional pieces to recommend beyond your favourites right now."
                : "Jelenleg nincs további ajánlható darab a kedvenceiden kívül."}
            </div>
          )}
        </section>
      )}
    </AccountShell>
  );
}
