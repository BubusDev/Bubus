import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";

import {
  removeCartItemAction,
  updateCartItemQuantityAction,
} from "@/app/account/actions";
import { AddToCartIconButton } from "@/components/shop/AddToCartButtons";
import { ProductImageFrame } from "@/components/shop/ProductImageFrame";
import { type CartItemSummary, getCartForUser } from "@/lib/account";
import { requireUser } from "@/lib/auth";
import { formatPrice, isProductOutOfStock, type Product } from "@/lib/catalog";
import { getCuratedProductRecommendations } from "@/lib/products";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function CartEmptyState() {
  return (
    <section className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] xl:gap-10">
      <aside className="px-2 py-2 lg:sticky lg:top-28">
        <div className="max-w-[360px] space-y-8">
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[#b760aa]">
              Saját táskám
            </p>
            <div className="space-y-2">
              <h1 className="font-sans text-[2.9rem] font-semibold leading-[0.9] tracking-[-0.06em] text-[#4f2348] sm:text-[3.5rem]">
                Kosár
              </h1>
              <p className="max-w-[16ch] font-serif text-[2rem] leading-[0.95] tracking-[-0.03em] text-[#4f2348] sm:text-[2.3rem]">
                most még
                <span className="relative ml-2 inline-block text-[#f77ff0]">
                  üres
                  <span className="absolute inset-x-0 bottom-[0.08em] -z-10 h-[0.28em] rounded-full bg-[#f7ff7a]/70 blur-[1px]" />
                </span>
                .
              </p>
            </div>
          </div>

          <div className="h-px w-16 bg-gradient-to-r from-[#f77ff0] to-transparent" />

          <p className="max-w-[24ch] text-sm leading-7 text-[#7d5b75] sm:text-[15px]">
            Amint hozzáadsz egy ékszert, itt látod majd az összesített végösszeget,
            és innen indíthatod a pénztárat.
          </p>
        </div>
      </aside>

      <div className="flex min-h-[360px] items-center justify-center border-t border-[#f1dfe8] pt-8 lg:pt-0">
        <div className="max-w-[420px] text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff4f8] text-[#c56da0]">
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
            className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-[#f183bc] px-6 text-sm font-medium text-white transition hover:bg-[#ea6fb0]"
          >
            Vásárlás folytatása
          </Link>
        </div>
      </div>
    </section>
  );
}

function CartItemRow({ item }: { item: CartItemSummary }) {
  const isOutOfStock = isProductOutOfStock(item);
  const incrementDisabled = isOutOfStock || item.quantity >= item.availableToSell;

  return (
    <article className="border-b border-[#f1dfe8] py-6 first:pt-0 last:border-b-0 last:pb-0 sm:py-8">
      <div className="grid gap-5 sm:grid-cols-[140px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)]">
        <Link
          href={`/product/${item.slug}?redirectTo=/cart`}
          className="block overflow-hidden rounded-[1.5rem] bg-[#fff5fa]"
        >
          <ProductImageFrame
            alt={item.name}
            imageUrl={item.imageUrl}
            soldOut={isOutOfStock}
            className="relative aspect-square h-full w-full overflow-hidden bg-[#fff5fa]"
            imageClassName={`aspect-square h-full w-full object-cover transition duration-500 ${
              isOutOfStock ? "" : "hover:scale-[1.02]"
            }`}
            palette={["#fff8fb", "#f8edf3", "#f3e3ec"]}
          />
        </Link>

        <div className="flex min-w-0 flex-col justify-between gap-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 space-y-2">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#b06b8e]">
                Kiválasztott darab
              </p>
              <Link
                href={`/product/${item.slug}?redirectTo=/cart`}
                className="block font-[family:var(--font-display)] text-[1.7rem] leading-[0.98] text-[#4d2741] transition hover:opacity-75"
              >
                {item.name}
              </Link>
              <p className="pt-1 text-sm text-[#7a6070]">
                Egységár: {formatPrice(item.price)}
              </p>
              {isOutOfStock ? (
                <p className="text-xs uppercase tracking-[0.22em] text-[#8f6c7d]">
                  Elfogyott
                </p>
              ) : item.exceedsStock ? (
                <p className="text-xs text-[#9b476f]">
                  Már csak {item.availableToSell} db érhető el.
                </p>
              ) : null}
            </div>

            <div className="shrink-0 text-left md:text-right">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#b06b8e]">
                Összesen
              </p>
              <p className="mt-2 text-[1.8rem] font-semibold tracking-[-0.03em] text-[#4d2741]">
                {formatPrice(item.lineTotal)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <form action={updateCartItemQuantityAction} className="flex items-center">
              <input type="hidden" name="itemId" value={item.id} />
              <div className="inline-flex items-center gap-0 border-b border-[#d8bfce] pb-1.5">
                <button
                  type="submit"
                  name="quantity"
                  value={Math.max(1, item.quantity - 1)}
                  aria-label={`${item.name} mennyiségének csökkentése`}
                  className="px-3.5 font-serif text-lg leading-none text-[#c0a0b4] transition hover:text-[#4d2741]"
                >
                  −
                </button>
                <span className="min-w-[1.75rem] text-center font-serif text-[15px] tracking-[0.06em] text-[#2f2230]">
                  {item.quantity}
                </span>
                <button
                  type="submit"
                  name="quantity"
                  value={item.quantity + 1}
                  aria-label={`${item.name} mennyiségének növelése`}
                  disabled={incrementDisabled}
                  className={`px-3.5 font-serif text-lg leading-none transition ${
                    incrementDisabled
                      ? "cursor-not-allowed text-[#d2c1cb]"
                      : "text-[#c0a0b4] hover:text-[#4d2741]"
                  }`}
                >
                  +
                </button>
              </div>
            </form>

            <form action={removeCartItemAction}>
              <input type="hidden" name="itemId" value={item.id} />
              <button
                type="submit"
                aria-label={`${item.name} törlése`}
                className="text-[#c0a0b4] transition hover:text-[#4d2741]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </article>
  );
}

function CartSummary({
  subtotal,
  total,
  hasUnavailableItems,
}: {
  subtotal: number;
  total: number;
  hasUnavailableItems: boolean;
}) {
  return (
    <aside className="lg:sticky lg:top-28 lg:h-fit">
      <div className="border-t border-[#f1dfe8] pt-6 lg:border-t-0 lg:pt-0">
        <p className="text-[11px] uppercase tracking-[0.34em] text-[#b760aa]">
          Rendelési összegzés
        </p>

        <div className="mt-6 space-y-4 text-sm text-[#6e5262]">
          <div className="flex items-center justify-between">
            <span>Részösszeg</span>
            <span className="font-medium text-[#4d2741]">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Szállítás</span>
            <span className="font-medium text-[#4d2741]">Ingyenes</span>
          </div>
        </div>

        <div className="mt-8 h-px w-full bg-[#f1dfe8]" />

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#b06b8e]">
              Végösszeg
            </p>
            <p className="mt-2 text-[2.2rem] font-semibold leading-none tracking-[-0.04em] text-[#4d2741]">
              {formatPrice(total)}
            </p>
          </div>
        </div>

        {hasUnavailableItems ? (
          <div className="mt-8 rounded-[1.4rem] border border-[#f0d7e4] bg-[#fff7fa] px-4 py-3 text-sm text-[#8c6077]">
            Egy vagy több termék már nem elérhető a jelenlegi mennyiségben. Frissítsd a kosarat a pénztár előtt.
          </div>
        ) : (
          <Link
            href="/checkout"
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#f183bc] px-6 text-sm font-medium text-white transition hover:bg-[#ea6fb0]"
          >
            Tovább a pénztárhoz
          </Link>
        )}

        <p className="mt-4 text-xs leading-6 text-[#8b7080]">
          A rendelés következő lépésében megadhatod a szállítási és fizetési adatokat.
        </p>
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
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#b06b8e]">
            Kurált ajánlás
          </p>
          <h2 className="mt-2 font-[family:var(--font-display)] text-[2rem] leading-none text-[#4d2741]">
            Ezek is tetszhetnek
          </h2>
        </div>
        <p className="max-w-[28ch] text-right text-[12px] leading-5 text-[#8b7080]">
          Először az akciós darabokat, majd a limitált és új érkezéseket mutatjuk.
        </p>
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
  const user = await requireUser("/cart");
  const cart = await getCartForUser(user.id);
  const hasUnavailableItems = cart.items.some((item) => !item.isAvailable || item.exceedsStock);
  const recommendations = await getCuratedProductRecommendations(
    cart.items.map((item) => item.productId),
    4,
  );

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
        {cart.items.length === 0 ? (
          <CartEmptyState />
        ) : (
          <>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-10">
              <section>
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.34em] text-[#b760aa]">
                      Saját táskám
                    </p>
                    <h1 className="mt-3 font-sans text-[2.4rem] font-semibold leading-[0.95] tracking-[-0.05em] text-[#4f2348] sm:text-[2.9rem]">
                      Kosár
                    </h1>
                  </div>
                  <div className="border-t border-[#f1dfe8] pt-6 sm:pt-8">
                    {cart.items.map((item: CartItemSummary) => (
                      <CartItemRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </section>

              <CartSummary
                subtotal={cart.subtotal}
                total={cart.total}
                hasUnavailableItems={hasUnavailableItems}
              />
            </div>

            <CartRecommendations products={recommendations} />
          </>
        )}
      </section>
    </main>
  );
}
