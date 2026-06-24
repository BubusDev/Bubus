"use client";

import { useState } from "react";

import { StepIndicator } from "@/components/checkout/StepIndicator";
import { ContactStep } from "@/components/checkout/steps/ContactStep";
import { ShippingStep, type ShippingData } from "@/components/checkout/steps/ShippingStep";
import { PaymentStep } from "@/components/checkout/steps/PaymentStep";
import { useCountryLanguage } from "@/components/international/CountryLanguageProvider";
import type { AppliedPromo } from "@/lib/promo-codes";
import { validateSupportedCountry, type SupportedCountry } from "@/lib/international";

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
    shipping: number;
    discount: number;
    appliedPromo: AppliedPromo | null;
    total: number;
  };
  initialStep?: number;
  userEmail?: string;
  isLoggedIn: boolean;
  initialProfile: {
    name: string;
    phone: string;
    shippingAddress: string;
    shippingAddressLine1?: string;
    shippingAddressLine2?: string;
    shippingPostalCode?: string;
    shippingCity?: string;
    shippingCountryCode?: string;
  };
  hasUnavailableItems: boolean;
  status?: string;
  stripePublishableKey: string;
  stripeConfigured: boolean;
};

export function CheckoutClient({
  cart,
  initialStep = 0,
  userEmail,
  isLoggedIn,
  initialProfile,
  hasUnavailableItems,
  status,
  stripePublishableKey,
  stripeConfigured,
}: CheckoutClientProps) {
  const { country, language } = useCountryLanguage();
  const [step, setStep] = useState(initialStep);
  const [email, setEmail] = useState(userEmail ?? "");
  const [shippingName, setShippingName] = useState(initialProfile.name);
  const [shippingPhone, setShippingPhone] = useState(initialProfile.phone);
  const [shippingCountryCode, setShippingCountryCode] = useState<SupportedCountry>(
    validateSupportedCountry(initialProfile.shippingCountryCode ?? country),
  );
  const [shippingAddressLine1, setShippingAddressLine1] = useState(initialProfile.shippingAddressLine1 ?? initialProfile.shippingAddress);
  const [shippingAddressLine2, setShippingAddressLine2] = useState(initialProfile.shippingAddressLine2 ?? "");
  const [shippingPostalCode, setShippingPostalCode] = useState(initialProfile.shippingPostalCode ?? "");
  const [shippingCity, setShippingCity] = useState(initialProfile.shippingCity ?? "");
  const shippingAddress = [shippingAddressLine1, shippingAddressLine2, `${shippingPostalCode} ${shippingCity}`.trim(), shippingCountryCode]
    .filter(Boolean)
    .join("\n");
  const [shippingMethod, setShippingMethod] = useState(shippingCountryCode === "HU" ? "foxpost" : "international");
  const [foxpostPointCode, setFoxpostPointCode] = useState("");

  // Stock/error status from URL param shown on payment step
  const initialError =
    status === "stock"
      ? "stock"
      : status === "error"
        ? "error"
        : undefined;

  function handleContactNext(confirmedEmail: string) {
    setEmail(confirmedEmail);
    setStep(1);
  }

  function handleShippingNext(data: ShippingData) {
    setShippingName(data.name);
    setShippingPhone(data.phone);
    setShippingCountryCode(data.countryCode);
    setShippingAddressLine1(data.addressLine1);
    setShippingAddressLine2(data.addressLine2);
    setShippingPostalCode(data.postalCode);
    setShippingCity(data.city);
    setShippingMethod(data.mode);

    if (data.mode === "foxpost") {
      setFoxpostPointCode(data.pointCode);
    } else {
      setFoxpostPointCode("");
    }

    setStep(2);
  }

  // Show stock/checkout error banner on the payment step if redirected back
  const paymentStatusBanner =
    initialError === "stock" ? (
      <div className="border border-[#f3cadc] bg-[#fff3f8] px-4 py-3 text-sm text-[#9b476f] mb-5">
        Egy vagy több termék időközben elfogyott vagy már nincs elegendő készleten.
      </div>
    ) : initialError === "error" ? (
      <div className="border border-[#f3cadc] bg-[#fff3f8] px-4 py-3 text-sm text-[#9b476f] mb-5">
        Kérjük, tölts ki minden szükséges mezőt a rendeléshez.
      </div>
    ) : null;

  return (
    <div>
      <StepIndicator currentStep={step} />

      {step === 0 && (
        <ContactStep
          userEmail={isLoggedIn ? email : undefined}
          onNext={handleContactNext}
        />
      )}

      {step === 1 && (
        <ShippingStep
          initialName={shippingName}
          initialPhone={shippingPhone}
          initialAddressLine1={shippingAddressLine1}
          initialAddressLine2={shippingAddressLine2}
          initialPostalCode={shippingPostalCode}
          initialCity={shippingCity}
          initialCountryCode={shippingCountryCode}
          onNext={handleShippingNext}
          onBack={() => setStep(0)}
        />
      )}

      {step === 2 && (
        <>
          {paymentStatusBanner}
          <PaymentStep
            cartTotal={cart.total}
            appliedPromo={cart.appliedPromo}
            shippingName={shippingName}
            shippingPhone={shippingPhone}
            shippingAddress={shippingAddress}
            shippingCountryCode={shippingCountryCode}
            language={language}
            shippingAddressLine1={shippingAddressLine1}
            shippingAddressLine2={shippingAddressLine2}
            shippingPostalCode={shippingPostalCode}
            shippingCity={shippingCity}
            shippingMethod={shippingMethod}
            foxpostPointCode={foxpostPointCode}
            hasUnavailableItems={hasUnavailableItems}
            stripePublishableKey={stripePublishableKey}
            stripeConfigured={stripeConfigured}
            onBack={() => setStep(1)}
          />
        </>
      )}
    </div>
  );
}
