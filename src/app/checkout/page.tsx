import { CreditCard, MapPin, ShieldCheck } from "lucide-react";

import { placeOrderAction } from "@/app/account/actions";
import { EmptyStateCard } from "@/components/account/EmptyStateCard";
import { type CartItemSummary, getCheckoutContext } from "@/lib/account";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/catalog";

type CheckoutPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const user = await requireUser("/checkout");
  const { user: profile, cart } = await getCheckoutContext(user.id);
  const resolvedSearchParams = await searchParams;

  if (cart.items.length === 0) {
    return (
      <main className="mx-auto max-w-[1100px] px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <EmptyStateCard
          icon={CreditCard}
          eyebrow="Nincs mit fizetni"
          title="A pénztár jelenleg üres"
          description="Előbb tegyél egy vagy több terméket a kosaradba, és utána folytathatod a rendelést."
          actionHref="/cart"
          actionLabel="Vissza a kosárhoz"
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1450px] px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.32em] text-[#b06b8e]">
          Pénztár
        </p>
        <h1 className="mt-3 font-[family:var(--font-display)] text-[3rem] leading-none text-[#4d2741]">
          Rendelés véglegesítése
        </h1>
      </div>

      <form action={placeOrderAction} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {resolvedSearchParams.status === "error" ? (
            <div className="rounded-[1.4rem] border border-[#f3cadc] bg-[#fff3f8] px-4 py-3 text-sm text-[#9b476f]">
              Kérjük, tölts ki minden szükséges mezőt a rendelés leadásához.
            </div>
          ) : null}

          <section className="rounded-[2rem] border border-white/70 bg-white/78 p-6 shadow-[0_18px_40px_rgba(198,129,167,0.12)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eed8e5] bg-[#fff7fb] text-[#8e5f79]">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-[#b06b8e]">
                  Szállítási cím
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[#4d2741]">
                  Kézbesítési adatok
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[#5a374e]">Teljes név</span>
                <input
                  type="text"
                  name="shippingName"
                  required
                  defaultValue={profile.name}
                  className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white/90 px-4 text-sm text-[#4d2741] outline-none focus:border-[#e9b6d0]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[#5a374e]">Telefonszám</span>
                <input
                  type="tel"
                  name="shippingPhone"
                  required
                  defaultValue={profile.phone ?? ""}
                  className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white/90 px-4 text-sm text-[#4d2741] outline-none focus:border-[#e9b6d0]"
                />
              </label>
            </div>

            <label className="mt-5 block space-y-2">
              <span className="text-sm font-medium text-[#5a374e]">Cím</span>
              <textarea
                name="shippingAddress"
                rows={4}
                required
                defaultValue={profile.defaultShippingAddress ?? ""}
                className="w-full rounded-[1.4rem] border border-[#edd1e1] bg-white/90 px-4 py-3 text-sm leading-7 text-[#4d2741] outline-none focus:border-[#e9b6d0]"
              />
            </label>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/78 p-6 shadow-[0_18px_40px_rgba(198,129,167,0.12)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eed8e5] bg-[#fff7fb] text-[#8e5f79]">
                <CreditCard className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-[#b06b8e]">
                  Fizetés
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[#4d2741]">
                  Fizetési mód
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="flex items-start gap-3 rounded-[1.4rem] border border-[#f0d8e5] bg-[#fff9fc] p-4">
                <input type="radio" name="paymentMethod" value="Bankkártya" defaultChecked />
                <span>
                  <span className="block text-sm font-medium text-[#4d2741]">Bankkártya</span>
                  <span className="mt-1 block text-sm leading-6 text-[#7a6070]">
                    Gyors és biztonságos online fizetés.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-[1.4rem] border border-[#f0d8e5] bg-[#fff9fc] p-4">
                <input type="radio" name="paymentMethod" value="Utánvét" />
                <span>
                  <span className="block text-sm font-medium text-[#4d2741]">Utánvét</span>
                  <span className="mt-1 block text-sm leading-6 text-[#7a6070]">
                    Fizetés a csomag átvételekor.
                  </span>
                </span>
              </label>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-[1.4rem] border border-[#f0d8e5] bg-white/90 p-4 text-sm text-[#6e5262]">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-[#8e5f79]" />
              <p>A rendelés leadása után visszaigazoló oldalra érkezel, a rendelés pedig megjelenik a fiókodban.</p>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-[2rem] border border-white/70 bg-white/78 p-6 shadow-[0_18px_40px_rgba(198,129,167,0.12)] backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#b06b8e]">
            Összegzés
          </p>
          <div className="mt-5 space-y-4 border-b border-[#f0d8e5] pb-5">
            {cart.items.map((item: CartItemSummary) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-[#4d2741]">{item.name}</p>
                  <p className="text-[#7a6070]">{item.quantity} db</p>
                </div>
                <span className="font-medium text-[#4d2741]">{formatPrice(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 text-sm text-[#6e5262]">
            <div className="flex items-center justify-between">
              <span>Részösszeg</span>
              <span className="font-medium text-[#4d2741]">{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Szállítás</span>
              <span className="font-medium text-[#4d2741]">Ingyenes</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-medium text-[#4d2741]">Végösszeg</span>
              <span className="text-2xl font-semibold text-[#4d2741]">
                {formatPrice(cart.total)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#f183bc] px-6 text-sm font-medium text-white shadow-[0_16px_35px_rgba(241,131,188,0.28)] transition hover:bg-[#ea6fb0]"
          >
            Rendelés leadása
          </button>
        </aside>
      </form>
    </main>
  );
}
