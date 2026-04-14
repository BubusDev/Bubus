"use client";

import { useState } from "react";

import { StepIndicator } from "@/components/checkout/StepIndicator";
import { ContactStep } from "@/components/checkout/steps/ContactStep";
import { ShippingStep, type ShippingData } from "@/components/checkout/steps/ShippingStep";
import { PaymentStep } from "@/components/checkout/steps/PaymentStep";

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
    total: number;
  };
  initialStep?: number;
  userEmail?: string;
  isLoggedIn: boolean;
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
  const [step, setStep] = useState(initialStep);
  const [email, setEmail] = useState(userEmail ?? "");
  const [shippingName, setShippingName] = useState(initialProfile.name);
  const [shippingPhone, setShippingPhone] = useState(initialProfile.phone);
  const [shippingAddress, setShippingAddress] = useState(initialProfile.shippingAddress);
  const [shippingMethod, setShippingMethod] = useState("foxpost");
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
    setShippingMethod(data.mode);

    if (data.mode === "foxpost") {
      setFoxpostPointCode(data.pointCode);
      setShippingAddress(`Foxpost csomagpont: ${data.pointCode}`);
    } else {
      setFoxpostPointCode("");
      setShippingAddress(`${data.address}, ${data.zip} ${data.city}`);
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
          initialAddress={shippingMethod === "home" ? shippingAddress : ""}
          onNext={handleShippingNext}
          onBack={() => setStep(0)}
        />
      )}

      {step === 2 && (
        <>
          {paymentStatusBanner}
          <PaymentStep
            cartTotal={cart.total}
            shippingName={shippingName}
            shippingPhone={shippingPhone}
            shippingAddress={shippingAddress}
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
