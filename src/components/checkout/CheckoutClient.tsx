"use client";

import { useMemo, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CreditCard, LoaderCircle, MapPin, ShieldCheck } from "lucide-react";

import { StripeCheckoutForm } from "@/components/checkout/StripeCheckoutForm";
import { formatPrice } from "@/lib/catalog";

type CheckoutItem = {
  id: string;
  name: string;
  quantity: number;
  lineTotal: number;
};

type CheckoutClientProps = {
  cart: {
    items: CheckoutItem[];
    subtotal: number;
    total: number;
  };
  initialProfile: {
    name: string;
    phone: string;
    shippingAddress: string;
  };
  hasUnavailableItems: boolean;
  status?: string;
  stripePublishableKey: string;
  stripeConfigured: boolean;
};

type CheckoutIntentResponse = {
  orderId: string;
  clientSecret: string;
  minimumAmount?: number;
  currency?: string;
};

function buildErrorMessage(
  errorCode: string,
  details?: Pick<CheckoutIntentResponse, "minimumAmount" | "currency">,
) {
  switch (errorCode) {
    case "INVALID_SHIPPING":
      return "Kérjük, tölts ki minden szükséges szállítási mezőt a fizetés indításához.";
    case "INSUFFICIENT_STOCK":
      return "Az egyik termék időközben elfogyott vagy már nincs elegendő készleten.";
    case "CART_EMPTY":
      return "A kosár kiürült. Ellenőrizd a kosarat, mielőtt újra fizetést indítasz.";
    case "STRIPE_NOT_CONFIGURED":
      return "A Stripe fizetés még nincs beállítva ebben a környezetben.";
    case "AMOUNT_BELOW_MINIMUM": {
      const minimumAmount = details?.minimumAmount;
      const currency = details?.currency;
      return typeof minimumAmount === "number" && currency === "HUF"
        ? `A rendelés végösszegének legalább ${formatPrice(minimumAmount)} összegűnek kell lennie a Stripe fizetéshez.`
        : "A rendelés végösszege túl alacsony a Stripe fizetéshez.";
    }
    default:
      return "A fizetés előkészítése nem sikerült. Próbáld meg újra.";
  }
}

export function CheckoutClient({
  cart,
  initialProfile,
  hasUnavailableItems,
  status,
  stripePublishableKey,
  stripeConfigured,
}: CheckoutClientProps) {
  const [shippingName, setShippingName] = useState(initialProfile.name);
  const [shippingPhone, setShippingPhone] = useState(initialProfile.phone);
  const [shippingAddress, setShippingAddress] = useState(initialProfile.shippingAddress);
  const [orderId, setOrderId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isShippingLocked, setIsShippingLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    status === "stock"
      ? "Egy vagy több termék időközben elfogyott vagy már nincs elegendő készleten."
      : status === "error"
        ? "Kérjük, tölts ki minden szükséges mezőt a rendeléshez."
        : "",
  );

  const stripePromise = useMemo(
    () => (stripeConfigured ? loadStripe(stripePublishableKey) : null),
    [stripeConfigured, stripePublishableKey],
  );

  async function initializePayment() {
    setIsInitializing(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/checkout/payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId || undefined,
          shippingName,
          shippingPhone,
          shippingAddress,
        }),
      });

      const data = (await response.json()) as CheckoutIntentResponse & { error?: string };

      if (!response.ok || !data.clientSecret || !data.orderId) {
        setErrorMessage(
          buildErrorMessage(data.error ?? "UNKNOWN", {
            minimumAmount: data.minimumAmount,
            currency: data.currency,
          }),
        );
        setIsInitializing(false);
        return;
      }

      setOrderId(data.orderId);
      setClientSecret(data.clientSecret);
      setIsShippingLocked(true);
    } catch {
      setErrorMessage(buildErrorMessage("UNKNOWN"));
    } finally {
      setIsInitializing(false);
    }
  }

  function unlockShipping() {
    setClientSecret("");
    setIsShippingLocked(false);
    setErrorMessage("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        {errorMessage ? (
          <div className="rounded-[1.4rem] border border-[#f3cadc] bg-[#fff3f8] px-4 py-3 text-sm text-[#9b476f]">
            {errorMessage}
          </div>
        ) : null}
        {hasUnavailableItems ? (
          <div className="rounded-[1.4rem] border border-[#f3cadc] bg-[#fff3f8] px-4 py-3 text-sm text-[#9b476f]">
            A kosárban jelenleg van nem elérhető tétel vagy túl magas mennyiség. Frissítsd a kosarat, mielőtt fizetsz.
          </div>
        ) : null}
        {!stripeConfigured ? (
          <div className="rounded-[1.4rem] border border-[#f0d7e4] bg-[#fff7fa] px-4 py-3 text-sm text-[#8c6077]">
            A Stripe fizetés ebben a környezetben még nincs konfigurálva. Add meg a szükséges `STRIPE_*` környezeti változókat.
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
                value={shippingName}
                onChange={(event) => setShippingName(event.target.value)}
                disabled={isShippingLocked}
                className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white/90 px-4 text-sm text-[#4d2741] outline-none focus:border-[#e9b6d0] disabled:bg-[#fbf6f8]"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[#5a374e]">Telefonszám</span>
              <input
                type="tel"
                value={shippingPhone}
                onChange={(event) => setShippingPhone(event.target.value)}
                disabled={isShippingLocked}
                className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white/90 px-4 text-sm text-[#4d2741] outline-none focus:border-[#e9b6d0] disabled:bg-[#fbf6f8]"
              />
            </label>
          </div>

          <label className="mt-5 block space-y-2">
            <span className="text-sm font-medium text-[#5a374e]">Cím</span>
            <textarea
              rows={4}
              value={shippingAddress}
              onChange={(event) => setShippingAddress(event.target.value)}
              disabled={isShippingLocked}
              className="w-full rounded-[1.4rem] border border-[#edd1e1] bg-white/90 px-4 py-3 text-sm leading-7 text-[#4d2741] outline-none focus:border-[#e9b6d0] disabled:bg-[#fbf6f8]"
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
                Stripe Payment Element
              </h2>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-[1.4rem] border border-[#f0d8e5] bg-white/90 p-4 text-sm text-[#6e5262]">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-[#8e5f79]" />
            <p>
              A fizetési összeget a szerver a kosár aktuális tartalmából számolja HUF pénznemben, és a készlet csak sikeres Stripe visszaigazolás után csökken.
            </p>
          </div>

          {clientSecret && stripePromise ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#a45b82",
                    colorBackground: "#fffafb",
                    colorText: "#4d2741",
                    colorDanger: "#b14d74",
                    borderRadius: "18px",
                    fontFamily: "var(--font-sans)",
                  },
                },
              }}
            >
              <StripeCheckoutForm orderId={orderId} onEditShipping={unlockShipping} />
            </Elements>
          ) : (
            <button
              type="button"
              onClick={initializePayment}
              disabled={!stripeConfigured || hasUnavailableItems || isInitializing}
              className={`mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium text-white shadow-[0_16px_35px_rgba(241,131,188,0.28)] transition ${
                !stripeConfigured || hasUnavailableItems || isInitializing
                  ? "cursor-not-allowed bg-[#d8c1cc] shadow-none"
                  : "bg-[#f183bc] hover:bg-[#ea6fb0]"
              }`}
            >
              {isInitializing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Fizetési űrlap megnyitása
            </button>
          )}
        </section>
      </div>

      <aside className="h-fit rounded-[2rem] border border-white/70 bg-white/78 p-6 shadow-[0_18px_40px_rgba(198,129,167,0.12)] backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.32em] text-[#b06b8e]">
          Összegzés
        </p>
        <div className="mt-5 space-y-4 border-b border-[#f0d8e5] pb-5">
          {cart.items.map((item) => (
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
      </aside>
    </div>
  );
}
