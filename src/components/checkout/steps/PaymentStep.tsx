"use client";

import { useMemo, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { LoaderCircle, ShieldCheck } from "lucide-react";

import { StripeCheckoutForm } from "@/components/checkout/StripeCheckoutForm";
import { PromoCodeForm } from "@/components/cart/PromoCodeForm";
import { formatPrice } from "@/lib/catalog";
import type { AppliedPromo } from "@/lib/promo-codes";

type PaymentStepProps = {
  cartTotal: number;
  appliedPromo: AppliedPromo | null;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingMethod: string;
  foxpostPointCode: string;
  hasUnavailableItems: boolean;
  stripePublishableKey: string;
  stripeConfigured: boolean;
  onBack: () => void;
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
    case "UNAVAILABLE_CART_ITEMS":
      return "A kosárban lévő egyik termék már nem elérhető. Térj vissza a kosárhoz és távolítsd el.";
    case "CART_EMPTY":
      return "A kosár kiürült. Ellenőrizd a kosarat, mielőtt újra fizetést indítasz.";
    case "CHECKOUT_EMAIL_REQUIRED":
      return "Előbb add meg az e-mail-címed a kapcsolati adatok lépésben.";
    case "STRIPE_NOT_CONFIGURED":
      return "A Stripe fizetés még nincs beállítva ebben a környezetben.";
    case "AMOUNT_BELOW_MINIMUM": {
      const min = details?.minimumAmount;
      const cur = details?.currency;
      return typeof min === "number" && cur === "HUF"
        ? `A rendelés végösszegének legalább ${formatPrice(min)} összegűnek kell lennie a Stripe fizetéshez.`
        : "A rendelés végösszege túl alacsony a Stripe fizetéshez.";
    }
    case "PROMO_INVALID_CODE":
      return "A kosárban lévő promóciós kód már nem található. Térj vissza a kosárhoz és távolítsd el.";
    case "PROMO_INACTIVE_CODE":
      return "A kosárban lévő promóciós kód már nem aktív.";
    case "PROMO_EXPIRED_CODE":
      return "A kosárban lévő promóciós kód lejárt.";
    case "PROMO_NOT_YET_ACTIVE":
      return "A kosárban lévő promóciós kód még nem aktív.";
    case "PROMO_ALREADY_USED":
      return "Ezt a promóciós kódot ezzel az e-mail-címmel már felhasználták.";
    case "PROMO_USAGE_LIMIT_REACHED":
      return "A kosárban lévő promóciós kód elérte a felhasználási limitet.";
    case "PROMO_MINIMUM_ORDER_AMOUNT_NOT_MET":
      return "A kosár értéke már nem éri el a promóciós kód minimum rendelési összegét.";
    default:
      return "A fizetés előkészítése nem sikerült. Próbáld meg újra.";
  }
}

export function PaymentStep({
  cartTotal,
  appliedPromo,
  shippingName,
  shippingPhone,
  shippingAddress,
  shippingMethod,
  foxpostPointCode,
  hasUnavailableItems,
  stripePublishableKey,
  stripeConfigured,
  onBack,
}: PaymentStepProps) {
  const [orderId, setOrderId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isShippingLocked, setIsShippingLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId || undefined,
          shippingName,
          shippingPhone,
          shippingAddress,
          shippingMethod,
          foxpostPointCode: foxpostPointCode || undefined,
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
    <div className="max-w-[540px] mx-auto">
      <h2 className="text-lg font-semibold text-[#1a1a1a] mb-1">Fizetés</h2>
      <p className="text-sm text-[#666] mb-6">
        A fizetés biztonságosan, Stripe-on keresztül történik.
      </p>

      {/* Szállítási összefoglaló */}
      <div className="border border-[#e8e5e0] bg-[#faf9f7] px-4 py-3 mb-5 text-sm">
        <p className="text-[10px] uppercase tracking-[.18em] text-[#888] mb-1">Szállítási adatok</p>
        <p className="text-[#1a1a1a] font-medium">{shippingName}</p>
        <p className="text-[#555]">{shippingAddress}</p>
        <p className="text-[#555]">{shippingPhone}</p>
        {!isShippingLocked && (
          <button
            type="button"
            onClick={onBack}
            className="mt-2 text-xs text-[#888] underline underline-offset-2"
          >
            Módosítás
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="border border-[#f3cadc] bg-[#fff3f8] px-4 py-3 text-sm text-[#9b476f] mb-4">
          {errorMessage}
        </div>
      )}

      {hasUnavailableItems && (
        <div className="border border-[#f3cadc] bg-[#fff3f8] px-4 py-3 text-sm text-[#9b476f] mb-4">
          A kosárban jelenleg van már nem elérhető tétel vagy túl magas mennyiség. Távolítsd el vagy módosítsd a fizetés előtt.
        </div>
      )}

      {!stripeConfigured && (
        <div className="border border-[#e8e5e0] bg-[#faf9f7] px-4 py-3 text-sm text-[#555] mb-4">
          A Stripe fizetés ebben a környezetben még nincs konfigurálva.
        </div>
      )}

      {/* Promóciós kód */}
      {!clientSecret && (
        <div className="mb-5">
          <PromoCodeForm appliedPromo={appliedPromo} />
        </div>
      )}

      <div className="flex items-start gap-3 border border-[#e8e5e0] bg-[#faf9f7] p-4 text-sm text-[#555] mb-5">
        <ShieldCheck className="mt-0.5 h-4 w-4 text-[#888] shrink-0" />
        <p>
          A fizetési összeget a szerver a kosár aktuális tartalmából számolja HUF pénznemben. A
          végösszeg: <span className="font-semibold text-[#1a1a1a]">{formatPrice(cartTotal)}</span>
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
                colorPrimary: "#1a1a1a",
                colorBackground: "#ffffff",
                colorText: "#1a1a1a",
                colorDanger: "#b14d74",
                borderRadius: "0px",
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
          className={`w-full py-3.5 text-sm font-medium transition flex items-center justify-center gap-2 ${
            !stripeConfigured || hasUnavailableItems || isInitializing
              ? "bg-[#ccc] text-white cursor-not-allowed"
              : "bg-[#1a1a1a] text-white hover:bg-[#333]"
          }`}
        >
          {isInitializing && <LoaderCircle className="h-4 w-4 animate-spin" />}
          Fizetési felület megnyitása
        </button>
      )}
    </div>
  );
}
