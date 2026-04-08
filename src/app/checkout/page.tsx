import { CreditCard, Lock } from "lucide-react";
import Link from "next/link";

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
    <div className="min-h-screen bg-[#f8f7f5]">

      {/* Checkout header — logo centered, security right */}
      <header className="border-b border-[#e8e5e0] bg-white px-8 py-4 flex items-center justify-between">
        <div className="w-32" />
        <Link href="/" className="text-center">
          <span className="font-[family:var(--font-display)] text-xl tracking-[-0.02em] text-[#1a1a1a]">
            Chicks Jewelry
          </span>
        </Link>
        <div className="flex items-center gap-2 text-[12px] text-[#888]">
          <Lock className="h-3.5 w-3.5" />
          Biztonságos fizetés
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-[1000px] px-6 py-10">
        <div className="grid grid-cols-1 gap-10 items-start lg:grid-cols-[1fr_380px]">

          {/* Left: checkout steps */}
          <div className="bg-white border border-[#e8e5e0] p-8">
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

          {/* Right: order summary — sticky */}
          <div className="sticky top-6 bg-white border border-[#e8e5e0]">

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
                <Lock className="h-3.5 w-3.5" />
                Biztonságos fizetés · Stripe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
