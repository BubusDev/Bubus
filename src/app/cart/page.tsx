import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";

import {
  removeCartItemAction,
  updateCartItemQuantityAction,
} from "@/app/account/actions";
import { type CartItemSummary, getCartForUser } from "@/lib/account";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/catalog";

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
  return (
    <article className="border-b border-[#f1dfe8] py-6 first:pt-0 last:border-b-0 last:pb-0 sm:py-8">
      <div className="grid gap-5 sm:grid-cols-[140px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)]">
        <Link
          href={`/product/${item.slug}?redirectTo=/cart`}
          className="block overflow-hidden rounded-[1.5rem] bg-[#fff5fa]"
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="aspect-square h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
            />
          ) : (
            <div className="aspect-square h-full w-full bg-[#fff5fa]" />
          )}
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
                  className="px-3.5 font-serif text-lg leading-none text-[#c0a0b4] transition hover:text-[#4d2741]"
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

function CartSummary({ subtotal, total }: { subtotal: number; total: number }) {
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

        <Link
          href="/checkout"
          className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#f183bc] px-6 text-sm font-medium text-white transition hover:bg-[#ea6fb0]"
        >
          Tovább a pénztárhoz
        </Link>

        <p className="mt-4 text-xs leading-6 text-[#8b7080]">
          A rendelés következő lépésében megadhatod a szállítási és fizetési adatokat.
        </p>
      </div>
    </aside>
  );
}

export default async function CartPage() {
  const user = await requireUser("/cart");
  const cart = await getCartForUser(user.id);

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
        {cart.items.length === 0 ? (
          <CartEmptyState />
        ) : (
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

            <CartSummary subtotal={cart.subtotal} total={cart.total} />
          </div>
        )}
      </section>
    </main>
  );
}