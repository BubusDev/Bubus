import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Lightbulb, ShoppingBag, TicketPercent, Trash2 } from "lucide-react";

import {
  removeCartItemAction,
  updateCartItemQuantityAction,
} from "@/app/(storefront)/account/actions";
import { PromoCodeForm } from "@/components/cart/PromoCodeForm";
import { AddToCartIconButton } from "@/components/shop/AddToCartButtons";
import { ProductImageFrame } from "@/components/shop/ProductImageFrame";
import { type CartItemSummary, getRequestCart } from "@/lib/account";
import { formatPrice, isProductOutOfStock, type Product } from "@/lib/catalog";
import { getHomepageContent } from "@/lib/homepage-content";
import { getCuratedProductRecommendations } from "@/lib/products";
import type { AppliedPromo } from "@/lib/promo-codes";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function CartEmptyState() {
  return (
    <section>
      <CartPageHeading />

      <div className="mx-auto flex min-h-[340px] max-w-[760px] items-center justify-center rounded-lg border border-[#eadce3] bg-white/70 px-5 py-10">
        <div className="max-w-[420px] text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-[#fff4f8] text-[#c56da0]">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h2 className="font-[family:var(--font-display)] text-[2rem] leading-none text-[#4d2741]">
            Még nincs kiválasztott termék
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#7a6070]">
            Nézz körül az újdonságok és kiemelt darabok között, és építsd fel a saját
            válogatásodat.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-[#f183bc] px-6 text-sm font-medium text-white transition hover:bg-[#ea6fb0]"
          >
            Vásárlás folytatása
          </Link>
        </div>
      </div>
    </section>
  );
}

function CartPageHeading() {
  return (
    <header className="mx-auto mb-7 max-w-[720px] text-center sm:mb-8">
      <h1 className="font-[family:var(--font-display)] text-[2.15rem] leading-none tracking-[-0.03em] text-[#4d2741] sm:text-[2.55rem]">
        Az Ön kosara
      </h1>
    </header>
  );
}

function CartItemRow({ item }: { item: CartItemSummary }) {
  const isOutOfStock = isProductOutOfStock(item);
  const isArchived = item.unavailableReason === "archived";
  const isUnavailable = isArchived || !item.isAvailable;
  const incrementDisabled = isUnavailable || item.quantity >= item.availableToSell;
  const decrementDisabled = isUnavailable;

  return (
    <article className={`rounded-lg border p-3.5 sm:p-4 ${isUnavailable ? "border-[#e0d8d8] bg-[#faf8f8]" : "border-[#eadce3] bg-white/80"}`}>
      <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-4 sm:grid-cols-[116px_minmax(0,1fr)] lg:grid-cols-[128px_minmax(0,1fr)]">
        <Link
          href={`/product/${item.slug}?redirectTo=/cart`}
          className={`block overflow-hidden rounded-lg bg-[#fff5fa] ${isUnavailable ? "opacity-50" : ""}`}
        >
          <ProductImageFrame
            alt={item.name}
            imageUrl={item.imageUrl}
            soldOut={isOutOfStock || isArchived}
            className="relative aspect-square h-full w-full overflow-hidden bg-[#fff5fa]"
            imageClassName={`aspect-square h-full w-full object-cover transition duration-500 ${
              isOutOfStock || isArchived ? "" : "hover:scale-[1.02]"
            }`}
            palette={["#fff8fb", "#f8edf3", "#f3e3ec"]}
          />
        </Link>

        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_150px_140px] lg:items-center">
          <div className={`min-w-0 space-y-2 ${isUnavailable ? "opacity-60" : ""}`}>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#b06b8e]">
              {item.category}
            </p>
            <div className="space-y-1">
              <Link
                href={`/product/${item.slug}?redirectTo=/cart`}
                className={`block font-[family:var(--font-display)] text-[1.25rem] leading-[1.08] transition hover:opacity-75 sm:text-[1.42rem] ${isUnavailable ? "text-[#999]" : "text-[#4d2741]"}`}
              >
                {item.name}
              </Link>
              <p className={`text-[13px] ${isUnavailable ? "text-[#aaa]" : "text-[#7a6070]"}`}>
                Egységár: {formatPrice(item.price)}
              </p>
            </div>
            <div className="min-h-5">
              {isArchived ? (
                <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#cc4444]">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Már nem elérhető
                </p>
              ) : isOutOfStock ? (
                <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#cc4444]">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Elfogyott
                </p>
              ) : item.exceedsStock ? (
                <p className="text-xs text-[#9b476f]">
                  Már csak {item.availableToSell} db érhető el.
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[auto_auto] sm:items-end sm:justify-between lg:grid-cols-1 lg:items-stretch lg:justify-normal">
            <div className={isUnavailable ? "opacity-50" : ""}>
              <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-[#b06b8e]">
                Mennyiség
              </p>
              <form action={updateCartItemQuantityAction} className="flex items-center">
                <input type="hidden" name="itemId" value={item.id} />
                <div className="inline-flex h-10 items-center overflow-hidden rounded-md border border-[#d8bfce] bg-[#fffafd]">
                  <button
                    type="submit"
                    name="quantity"
                    value={Math.max(1, item.quantity - 1)}
                    aria-label={`${item.name} mennyiségének csökkentése`}
                    disabled={decrementDisabled}
                    className={`flex h-10 w-10 items-center justify-center text-lg leading-none transition ${
                      decrementDisabled
                        ? "cursor-not-allowed bg-[#f7f0f4] text-[#d2c1cb]"
                        : "text-[#8d6f80] hover:bg-[#f8eef4] hover:text-[#4d2741]"
                    }`}
                  >
                    −
                  </button>
                  <span className="flex h-10 min-w-10 items-center justify-center border-x border-[#eadce3] px-3 text-center text-[14px] font-medium text-[#2f2230]">
                    {item.quantity}
                  </span>
                  <button
                    type="submit"
                    name="quantity"
                    value={item.quantity + 1}
                    aria-label={`${item.name} mennyiségének növelése`}
                    disabled={incrementDisabled}
                    className={`flex h-10 w-10 items-center justify-center text-lg leading-none transition ${
                      incrementDisabled
                        ? "cursor-not-allowed bg-[#f7f0f4] text-[#d2c1cb]"
                        : "text-[#8d6f80] hover:bg-[#f8eef4] hover:text-[#4d2741]"
                    }`}
                  >
                    +
                  </button>
                </div>
              </form>
            </div>

            <div className="sm:justify-self-end lg:justify-self-start">
              <form action={removeCartItemAction}>
                <input type="hidden" name="itemId" value={item.id} />
                <button
                  type="submit"
                  aria-label={`${item.name} törlése`}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-[12px] font-medium transition ${
                    isUnavailable
                      ? "border-[#c45a85] bg-[#fff4f8] text-[#c45a85] hover:bg-[#ffeaf3] hover:text-[#a03d68]"
                      : "border-[#eadce3] text-[#7a6070] hover:border-[#d7becb] hover:bg-[#fff7fa] hover:text-[#4d2741]"
                  }`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eltávolítás
                </button>
              </form>
              {isUnavailable && (
                <p className="mt-1.5 text-[11px] leading-4 text-[#aaa]">
                  Távolítsd el a rendelés folytatásához
                </p>
              )}
            </div>
          </div>

          <div className={`border-t border-[#f1dfe8] pt-3 sm:flex sm:items-end sm:justify-between sm:gap-4 lg:block lg:border-t-0 lg:pt-0 lg:text-right ${isUnavailable ? "opacity-50" : ""}`}>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#b06b8e]">
                Összesen
              </p>
              {isUnavailable ? (
                <p className="mt-1 text-[1.32rem] font-semibold tracking-[-0.03em] text-[#bbb] line-through sm:text-[1.48rem]">
                  {formatPrice(item.lineTotal)}
                </p>
              ) : (
                <p className="mt-1 text-[1.32rem] font-semibold tracking-[-0.03em] text-[#4d2741] sm:text-[1.48rem]">
                  {formatPrice(item.lineTotal)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function CartSummary({
  subtotal,
  shipping,
  discount,
  appliedPromo,
  total,
  hasUnavailableItems,
  instagramHref,
}: {
  subtotal: number;
  shipping: number;
  discount: number;
  appliedPromo: AppliedPromo | null;
  total: number;
  hasUnavailableItems: boolean;
  instagramHref: string;
}) {
  return (
    <aside className="lg:sticky lg:top-28 lg:h-fit">
      <div className="rounded-lg border border-[#eadce3] bg-white/82 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 border-b border-[#f1dfe8] pb-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#b760aa]">
            Rendelési összegzés
          </p>
          <ShoppingBag className="h-4 w-4 text-[#c895ad]" aria-hidden="true" />
        </div>

        <div className="mt-5 space-y-3 text-sm text-[#6e5262]">
          <div className="flex items-center justify-between">
            <span>Részösszeg</span>
            <span className="font-medium text-[#4d2741]">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Szállítás</span>
            <span className="font-medium text-[#4d2741]">
              {shipping > 0 ? formatPrice(shipping) : "Ingyenes"}
            </span>
          </div>
          {discount > 0 ? (
            <div className="flex items-center justify-between">
              <span>Kedvezmény</span>
              <span className="font-medium text-[#7a4f67]">-{formatPrice(discount)}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#f1dfe8] pt-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#b06b8e]">
            Végösszeg
          </p>
          <p className="text-[1.65rem] font-semibold leading-none tracking-[-0.04em] text-[#4d2741] sm:text-[1.85rem]">
            {formatPrice(total)}
          </p>
        </div>

        {hasUnavailableItems ? (
          <div className="mt-6 rounded-lg border border-[#f0d7e4] bg-[#fff7fa] px-4 py-3 text-sm text-[#8c6077]">
            Egy vagy több termék már nem elérhető. Távolítsd el ezeket a kosárból a pénztár előtt.
          </div>
        ) : (
          <Link
            href="/checkout"
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#f183bc] px-6 text-sm font-medium text-white transition hover:bg-[#ea6fb0]"
          >
            Tovább a pénztárhoz
          </Link>
        )}

        <p className="mt-4 text-xs leading-6 text-[#8b7080]">
          A rendelés következő lépésében megadhatod a szállítási és fizetési adatokat.
        </p>

        <div className="mt-6 border-t border-[#f1dfe8] pt-5">
          <PromoCodeForm appliedPromo={appliedPromo} />

          <h2 className="mt-5 font-[family:var(--font-display)] text-[1.28rem] leading-[1.08] text-[#4d2741]">
            Hogyan válthatom be a promóciós kódokat?
          </h2>

          <div className="mt-4 grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 text-sm leading-6 text-[#765a6a]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#efdbe6] bg-[#fff7fa] text-[#c56da0]">
              <TicketPercent className="h-[18px] w-[18px]" aria-hidden="true" />
            </div>
            <p className="min-w-0">
              A promóciós kódokat közvetlenül itt, a bevásárlókosár oldalon válthatod be.
            </p>
          </div>

          <div className="my-5 h-px bg-gradient-to-r from-transparent via-[#ead6e2] to-transparent shadow-[0_1px_0_rgba(255,255,255,0.75)]" />

          <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#b06b8e]">
            HOL TUDSZ HOZZÁJUTNI KÓDJAINKHOZ?
          </h3>

          <div className="mt-4 grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 text-sm leading-6 text-[#765a6a]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#efdbe6] bg-[#fff7fa] text-[#c56da0]">
              <Lightbulb className="h-[18px] w-[18px]" aria-hidden="true" />
            </div>
            <p className="min-w-0">
              Kövess{" "}
              <a
                href={instagramHref}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#4d2741] underline decoration-[#d7a1bd] underline-offset-4 transition hover:text-[#b7608f]"
              >
                Instagram
              </a>
              on és iratkozz fel hírlevelünkre! Ott posztoljuk és küldünk nektek
              rendszeresen kedvezményeket!
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function CartRecommendationCard({ product }: { product: Product }) {
  const isOutOfStock = isProductOutOfStock(product);
  const productHref = `/product/${product.slug}?redirectTo=/cart`;
  const [from, via, to] = product.imagePalette;

  return (
    <article className="group flex h-full flex-col rounded-[1.5rem] border border-[#f1dfe8] bg-white p-3 sm:p-4">
      <Link href={productHref} className="block overflow-hidden rounded-[1.1rem]">
        <ProductImageFrame
          alt={product.name}
          imageUrl={product.imageUrl}
          soldOut={isOutOfStock}
          palette={[from, via, to]}
          className="relative aspect-[4/5] overflow-hidden bg-[#f9f3f6]"
          imageClassName={`h-full w-full object-cover transition duration-500 ${
            isOutOfStock ? "" : "group-hover:scale-[1.02]"
          }`}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 px-1 pt-3">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#b484a6]">
            {product.collectionLabel}
          </p>
          <Link
            href={productHref}
            className="line-clamp-2 text-[1rem] leading-[1.2] tracking-[-0.02em] text-[#2f2230] transition hover:text-[#7d4a69]"
          >
            {product.name}
          </Link>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <div>
            <p className="text-[0.95rem] font-medium leading-none text-[#2f2230]">
              {formatPrice(product.price)}
            </p>
            {product.compareAtPrice ? (
              <p className="mt-1 text-[11px] text-[#bb95ac] line-through">
                {formatPrice(product.compareAtPrice)}
              </p>
            ) : null}
          </div>

          <AddToCartIconButton
            productId={product.id}
            quantity={1}
            redirectTo="/cart"
            disabled={isOutOfStock}
            ariaLabel={`Kosárba: ${product.name}`}
            soldOutAriaLabel={`${product.name} elfogyott`}
            iconClassName="h-4 w-4 translate-y-[1px]"
            baseClassName="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d45c9c] focus-visible:ring-offset-2"
            disabledClassName="cursor-not-allowed bg-[#f5edf1] text-[#b197a7]"
            addedClassName="bg-[#f3e3eb] text-[#7d4a69]"
            idleClassName="text-[#2f2230] hover:bg-[#f8eef4] hover:text-[#d45c9c]"
          />
        </div>
      </div>
    </article>
  );
}

function CartRecommendations({ products }: { products: Product[] }) {
  return (
    <section className="mt-12 border-t border-[#f1dfe8] pt-8 sm:mt-14 sm:pt-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#b06b8e]">
            Kurált ajánlás
          </p>
          <h2 className="mt-2 font-[family:var(--font-display)] text-[1.7rem] leading-none text-[#4d2741] sm:text-[2rem]">
            Ezek is tetszhetnek
          </h2>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <CartRecommendationCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.4rem] border border-[#f0e4ea] bg-[#fcfafb] px-4 py-4 text-sm text-[#8b7080]">
          Jelenleg nincs a kosárhoz illő további akciós, limitált vagy új darab.
        </div>
      )}
    </section>
  );
}

export default async function CartPage() {
  const [{ cart }, homepageContent] = await Promise.all([
    getRequestCart(),
    getHomepageContent(),
  ]);
  const hasUnavailableItems = cart.items.some((item) => !item.isAvailable || item.exceedsStock);
  const recommendations = await getCuratedProductRecommendations(
    cart.items.map((item) => item.productId),
    4,
  );

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-[1360px] px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
        {cart.items.length === 0 ? (
          <CartEmptyState />
        ) : (
          <>
            <CartPageHeading />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
              <section>
                <div className="space-y-3">
                  {cart.items.map((item: CartItemSummary) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>
              </section>

              <CartSummary
                subtotal={cart.subtotal}
                shipping={cart.shipping}
                discount={cart.discount}
                appliedPromo={cart.appliedPromo}
                total={cart.total}
                hasUnavailableItems={hasUnavailableItems}
                instagramHref={homepageContent.instagram.buttonHref}
              />
            </div>

            <CartRecommendations products={recommendations} />
          </>
        )}
      </section>
    </main>
  );
}
