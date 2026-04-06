import { CreditCard } from "lucide-react";

import { EmptyStateCard } from "@/components/account/EmptyStateCard";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { getCheckoutContext } from "@/lib/account";
import { requireUser } from "@/lib/auth";
import { getStripePublishableKey, isStripeConfigured } from "@/lib/stripe";

type CheckoutPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const user = await requireUser("/checkout");
  const { user: profile, cart } = await getCheckoutContext(user.id);
  const resolvedSearchParams = await searchParams;
  const hasUnavailableItems = cart.items.some((item) => !item.isAvailable || item.exceedsStock);

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

      <CheckoutClient
        cart={cart}
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
    </main>
  );
}
