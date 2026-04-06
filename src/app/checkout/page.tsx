import { CreditCard, ShoppingBag, Sparkles } from "lucide-react";

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
    (item) => !item.isAvailable || item.exceedsStock
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
    <main className="checkout-root mx-auto max-w-[1400px] px-4 pb-32 pt-12 sm:px-6 lg:px-8">

      {/* ── AMBIENT BACKGROUND BLOBS ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="blob blob-rose" />
        <div className="blob blob-peach" />
        <div className="blob blob-lilac" />
      </div>

      {/* ── HEADER ── */}
      <header className="mb-14">
        {/* pill tag */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200/70 bg-white/60 px-4 py-1.5 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-rose-400" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-rose-500">
            Checkout
          </span>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="checkout-heading">
              Rendelés
              <br />
              <span className="checkout-heading-accent">véglegesítése</span>
            </h1>
            <p className="mt-4 max-w-[460px] text-sm leading-[1.85] text-[#8a6272]">
              Ellenőrizd az adataidat, majd fejezd be a vásárlást. A fizetés{" "}
              <span className="font-medium text-[#6b3f5a]">
                biztonságosan, Stripe-on
              </span>{" "}
              keresztül történik.
            </p>
          </div>

          {/* cart badge */}
          <div className="flex items-center gap-3 self-start rounded-2xl border border-rose-100 bg-white/70 px-5 py-3 shadow-sm backdrop-blur-md lg:self-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50">
              <ShoppingBag className="h-4 w-4 text-rose-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#b08898]">Kosár</p>
              <p className="text-sm font-semibold text-[#3a1f2d]">
                {cart.items.length} termék
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN GRID ── */}
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">

        {/* LEFT — form area */}
        <div className="checkout-form-area rounded-[2.5rem] border border-white/80 bg-white/60 p-8 shadow-xl shadow-rose-100/30 backdrop-blur-xl sm:p-10">
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
        </div>

        {/* RIGHT — order summary */}
        <aside className="h-fit">
          <div className="sticky top-24 overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/70 shadow-xl shadow-rose-100/30 backdrop-blur-xl">

            {/* summary header */}
            <div className="summary-header px-7 py-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-rose-300">
                Összegzés
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {cart.items.length} tétel a kosárban
              </p>
            </div>

            {/* items list */}
            <div className="divide-y divide-[#f5e2eb] px-7">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-3.5"
                >
                  {/* quantity chip */}
                  <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-rose-50 px-2 text-xs font-semibold text-rose-500">
                    {item.quantity}×
                  </span>
                  <span className="flex-1 truncate text-sm text-[#5c3348]">
                    {item.name}
                  </span>
                  <span className="shrink-0 text-sm font-medium text-[#3a1f2d]">
                    {formatPrice(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* total */}
            <div className="px-7 pb-7 pt-5">
              <div className="flex items-center justify-between rounded-2xl bg-[#fdf3f7] px-5 py-4">
                <span className="text-sm font-medium text-[#9a6a7e]">Végösszeg</span>
                <span className="checkout-total">{formatPrice(cart.total)}</span>
              </div>

              {/* stripe trust badge */}
              <div className="mt-4 flex items-center justify-center gap-2 opacity-50">
                <svg className="h-4 w-4 text-[#7a5a6c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-[11px] tracking-wide text-[#9a6a7e]">
                  Biztonságos fizetés · Stripe
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── STYLES ── */}
      <style>{`
        /* Ambient blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.45;
          animation: drift 18s ease-in-out infinite alternate;
        }
        .blob-rose {
          width: 520px; height: 520px;
          background: #fbc7d8;
          top: -120px; left: -80px;
          animation-duration: 20s;
        }
        .blob-peach {
          width: 380px; height: 380px;
          background: #fddcb0;
          top: 60px; right: 10%;
          animation-duration: 16s;
          animation-delay: -6s;
        }
        .blob-lilac {
          width: 300px; height: 300px;
          background: #d8c8f5;
          bottom: 80px; left: 35%;
          animation-duration: 22s;
          animation-delay: -10s;
        }
        @keyframes drift {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(30px, -20px) scale(1.05); }
          100% { transform: translate(-20px, 30px) scale(0.97); }
        }

        /* Heading */
        .checkout-heading {
          font-family: var(--font-display, 'Georgia', serif);
          font-size: clamp(2.8rem, 5vw, 4.2rem);
          line-height: 1.05;
          font-weight: 400;
          color: #2b1220;
          letter-spacing: -0.03em;
        }
        .checkout-heading-accent {
          background: linear-gradient(135deg, #c45a85 0%, #e8826d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Summary header gradient bar */
        .summary-header {
          background: linear-gradient(135deg, #c45a85 0%, #e07a70 100%);
        }

        /* Total price */
        .checkout-total {
          font-family: var(--font-display, 'Georgia', serif);
          font-size: 1.6rem;
          font-weight: 500;
          color: #2b1220;
          letter-spacing: -0.02em;
        }

        /* Form area — subtle inner shadow for depth */
        .checkout-form-area {
          box-shadow:
            0 20px 60px -10px rgba(196, 90, 133, 0.12),
            inset 0 1px 0 rgba(255,255,255,0.9);
        }
      `}</style>
    </main>
  );
}
