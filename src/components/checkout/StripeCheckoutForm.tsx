"use client";

import { useState } from "react";
import { ExpressCheckoutElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { LoaderCircle, LockKeyhole, PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";

type StripeCheckoutFormProps = {
  orderId: string;
  onEditShipping: () => void;
};

export function StripeCheckoutForm({
  orderId,
  onEditShipping,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function confirmPayment() {
    if (!stripe || !elements) {
      return false;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const returnUrl = new URL(
      `/checkout/confirmation/${orderId}`,
      window.location.origin,
    ).toString();

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setErrorMessage(result.error.message ?? "A fizetés megerősítése nem sikerült.");
      setIsSubmitting(false);
      return false;
    }

    const paymentIntentId = result.paymentIntent?.id;
    const redirectStatus = result.paymentIntent?.status ?? "processing";
    const nextUrl = new URL(returnUrl);

    if (paymentIntentId) {
      nextUrl.searchParams.set("payment_intent", paymentIntentId);
    }

    nextUrl.searchParams.set("redirect_status", redirectStatus);
    router.push(nextUrl.toString());
    return true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await confirmPayment();
  }

  async function handleExpressCheckoutConfirm() {
    await confirmPayment();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-5">
      <div className="rounded-[1.6rem] border border-[#eed7e3] bg-[#fffafb] p-4 shadow-[0_18px_40px_rgba(198,129,167,0.08)]">
        <ExpressCheckoutElement
          onConfirm={handleExpressCheckoutConfirm}
          options={{
            buttonType: {
              applePay: "buy",
              googlePay: "buy",
            },
            paymentMethods: {
              applePay: "always",
              googlePay: "always",
              link: "auto",
              paypal: "never",
              amazonPay: "never",
            },
            layout: {
              maxColumns: 1,
              maxRows: 5,
              overflow: "never",
            },
            buttonHeight: 48,
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#ead8e1]" />
        <span className="text-xs uppercase tracking-[0.24em] text-[#8f7181]">vagy</span>
        <div className="h-px flex-1 bg-[#ead8e1]" />
      </div>

      <div className="rounded-[1.6rem] border border-[#eed7e3] bg-[#fffafb] p-4 shadow-[0_18px_40px_rgba(198,129,167,0.08)]">
        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card", "apple_pay", "google_pay"],
          }}
        />
      </div>

      {errorMessage ? (
        <div className="rounded-[1.4rem] border border-[#f3cadc] bg-[#fff3f8] px-4 py-3 text-sm text-[#9b476f]">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={!stripe || !elements || isSubmitting}
          className={`inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium text-white shadow-[0_16px_35px_rgba(241,131,188,0.28)] transition ${
            !stripe || !elements || isSubmitting
              ? "cursor-not-allowed bg-[#d8c1cc] shadow-none"
              : "bg-[#f183bc] hover:bg-[#ea6fb0]"
          }`}
        >
          {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
          Fizetés véglegesítése
        </button>

        <button
          type="button"
          onClick={onEditShipping}
          disabled={isSubmitting}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#ead0df] bg-white/90 px-5 text-sm font-medium text-[#6b425a] transition hover:border-[#e6b4cf] hover:bg-white disabled:opacity-60"
        >
          <PencilLine className="h-4 w-4" />
          Adatok módosítása
        </button>
      </div>
    </form>
  );
}
