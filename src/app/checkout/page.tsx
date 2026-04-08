import { CreditCard } from "lucide-react";

import { EmptyStateCard } from "@/components/account/EmptyStateCard";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { getCheckoutContext } from "@/lib/account";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/catalog";
import { getStripePublishableKey, isStripeConfigured } from "@/lib/stripe";

type CheckoutPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const user = await requireUser("/checkout");
  const { user: profile, cart } = await getCheckoutContext(user.id);
  const resolvedSearchParams = await searchParams;

  const hasUnavailableItems = cart.items.some(
    (item) => !item.isAvailable || item.exceedsStock,
  );

  if (cart.items.length === 0) {
    return (
      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <EmptyStateCard
          icon={CreditCard}
          eyebrow="Nincs mit fizetni"
          title="A pénztár jelenleg üres"
          description="Előbb tegyél terméket a kosaradba, majd térj vissza a rendelés véglegesítéséhez."
          actionHref="/cart"
          actionLabel="Kosár megnyitása"
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-32 pt-12 sm:px-6 lg:px-8">

      {/* Header */}
      <header className="mb-12">
        <p className="text-[10px] uppercase tracking-[.28em] text-[#888] mb-3">Rendelés</p>
        <h1 className="text-[2.4rem] font-semibold leading-tight tracking-[-0.03em] text-[#1a1a1a] sm:text-[3rem]">
          Rendelés véglegesítése
        </h1>
        <p className="mt-3 max-w-[480px] text-sm leading-relaxed text-[#666]">
          Ellenőrizze az adatait, majd fejezze be a vásárlást. A fizetés biztonságosan, Stripe-on
          keresztül történik.
        </p>
      </header>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

        {/* LEFT — wizard */}
        <div className="border border-[#e8e5e0] bg-white p-8 sm:p-10">
          <CheckoutClient
            cart={cart}
            userEmail={user.email}
            isLoggedIn={true}
            initialProfile={{
              name: profile.name,
              phone: profile.phone ?? "",
              shippingAddress: profile.defaultShippingAddress ?? "",
            }}
            hasUnavailableItems={hasUnavailableItems}
            status={resolvedSearchParams.status}
            stripePublishableKey={getStripePublishableKey()}
            stripeConfigured={isStripeConfigured()}
          />
        </div>

        {/* RIGHT — order summary */}
        <aside>
          <div className="sticky top-24 border border-[#e8e5e0] bg-white">

            <div className="bg-[#1a1a1a] px-6 py-5">
              <p className="text-[10px] uppercase tracking-[.28em] text-[#999] mb-1">
                Összegzés
              </p>
              <p className="text-lg font-semibold text-white">
                {cart.items.length} tétel a kosárban
              </p>
            </div>

            <div className="divide-y divide-[#f0eeec] px-6">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-3.5"
                >
                  <span className="flex h-5 min-w-[1.25rem] items-center justify-center bg-[#f0eeec] px-1.5 text-[11px] font-medium text-[#555]">
                    {item.quantity}×
                  </span>
                  <span className="flex-1 truncate text-sm text-[#333]">{item.name}</span>
                  <span className="shrink-0 text-sm font-medium text-[#1a1a1a]">
                    {formatPrice(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-6 pb-6 pt-4">
              <div className="flex items-center justify-between border-t border-[#e8e5e0] pt-4">
                <span className="text-sm text-[#555]">Végösszeg</span>
                <span className="text-xl font-semibold text-[#1a1a1a]">
                  {formatPrice(cart.total)}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#aaa]">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Biztonságos fizetés · Stripe
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
