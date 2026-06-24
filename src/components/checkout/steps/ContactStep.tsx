"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { submitContactStep } from "@/app/actions/checkout";
import { useCountryLanguage } from "@/components/international/CountryLanguageProvider";
import { getDictionary } from "@/lib/i18n";

type ContactStepProps = {
  userEmail?: string;
  onNext: (email: string) => void;
};

const inputClass =
  "w-full rounded-md border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#8b8580] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#c45a85]/20";

export function ContactStep({ userEmail, onNext }: ContactStepProps) {
  const { language } = useCountryLanguage();
  const dictionary = getDictionary(language);
  const [mode, setMode] = useState<"guest" | "login" | "register">("guest");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (userEmail) {
    return (
      <div>
        <h2 className="mb-2 text-base font-semibold text-[#1a1a1a]">
          {dictionary["checkout.contact"]}
        </h2>
        <p className="mb-5 text-sm leading-6 text-[#666]">
          {language === "en" ? "We will use this email address for your order confirmation." : "Ezt az email címet használjuk a rendelés visszaigazolásához."}
        </p>
        <div className="mb-6 flex items-center justify-between rounded-md border border-[#e8e5e0] p-4">
          <div>
            <p className="mb-0.5 text-[11px] uppercase tracking-[.18em] text-[#888]">
              {language === "en" ? "Signed in" : "Bejelentkezve"}
            </p>
            <p className="text-sm font-medium text-[#1a1a1a]">{userEmail}</p>
          </div>
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="text-xs text-[#888] transition hover:text-[#1a1a1a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
            >
              {language === "en" ? "Sign out" : "Kijelentkezés"}
            </button>
          </form>
        </div>
        <button
          type="button"
          onClick={() => onNext(userEmail)}
          className="w-full rounded-md bg-[#1a1a1a] py-3.5 text-sm font-medium text-white transition hover:bg-[#333] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
        >
          {language === "en" ? "Continue to shipping" : "Folytatás a szállításhoz"}
        </button>
      </div>
    );
  }

  function handleGuestSubmit() {
    setError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(language === "en" ? "Enter a valid email address." : "Adjon meg érvényes e-mail-címet");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("mode", "guest");

      const result = await submitContactStep(formData);

      if (result.success) {
        onNext(result.email ?? email);
        return;
      }

      setError(result.error ?? (language === "en" ? "Something went wrong." : "Hiba történt"));
    });
  }

  return (
    <div>
      <h2 className="mb-2 text-base font-semibold text-[#1a1a1a]">
        {dictionary["checkout.contact"]}
      </h2>
      <p className="mb-5 text-sm leading-6 text-[#666]">
        {language === "en"
          ? "You can checkout without an account. We will send the confirmation by email."
          : "Fiók nélkül is végig tudod vinni a rendelést. A visszaigazolást emailben küldjük."}
      </p>

      <div className="mb-6 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-[#e8e5e0] bg-[#e8e5e0] sm:grid-cols-3">
        {([
          ["guest", language === "en" ? "Guest" : "Vendégként"],
          ["login", language === "en" ? "Sign in" : "Bejelentkezés"],
          ["register", language === "en" ? "Register" : "Regisztráció"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setMode(key);
              setError("");
            }}
            className={`py-3 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-inset ${
              mode === key
                ? "bg-[#1a1a1a] font-medium text-white"
                : "bg-white text-[#555] hover:bg-[#f5f4f2]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "guest" && (
        <div className="space-y-4">
          <p className="text-sm text-[#666]">
            {language === "en"
              ? "You can shop without an account. Enter your email for the order confirmation."
              : "Fiók nélkül is vásárolhatsz. Add meg az email címedet a rendelés visszaigazolásához."}
          </p>
          <input
            type="email"
            placeholder="Email *"
            className={inputClass}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleGuestSubmit();
              }
            }}
          />
          {error ? <p className="text-xs font-medium text-[#9b476f]">{error}</p> : null}
          <button
            type="button"
            onClick={handleGuestSubmit}
            disabled={isPending}
            className="w-full rounded-md bg-[#1a1a1a] py-3.5 text-sm font-medium text-white transition hover:bg-[#333] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? language === "en" ? "Saving..." : "Adatok mentése..."
              : language === "en" ? "Continue to shipping" : "Folytatás a szállításhoz"}
          </button>
          <p className="text-center text-xs text-[#888]">
            {language === "en" ? "Already have an account?" : "Van már fiókja?"}{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-[#1a1a1a] underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
            >
              {language === "en" ? "Sign in" : "Jelentkezzen be"}
            </button>
          </p>
        </div>
      )}

      {mode === "login" && (
        <div className="space-y-3">
          <p className="mb-4 text-sm text-[#666]">
            {language === "en"
              ? "After signing in, your saved shipping details will be filled automatically."
              : "Bejelentkezés után a mentett szállítási adataid automatikusan kitöltődnek."}
          </p>
          <form action="/auth/login" method="post" className="space-y-3">
            <input type="hidden" name="next" value="/checkout" />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              className={inputClass}
            />
            <input
              type="password"
              name="password"
              placeholder={language === "en" ? "Password *" : "Jelszó *"}
              className={inputClass}
            />
            <button
              type="submit"
              className="w-full rounded-md bg-[#1a1a1a] py-3.5 text-sm font-medium text-white transition hover:bg-[#333] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
            >
              {language === "en" ? "Sign in and continue" : "Bejelentkezés és folytatás"}
            </button>
          </form>
          <p className="text-center text-xs text-[#888]">
            <button
              type="button"
              onClick={() => setMode("guest")}
              className="text-[#1a1a1a] underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
            >
              {language === "en" ? "Checkout as guest instead" : "Inkább vendégként vásárolok"}
            </button>
          </p>
        </div>
      )}

      {mode === "register" && (
        <div className="space-y-3">
          <p className="mb-4 text-sm text-[#666]">
            {language === "en" ? "Create an account to track orders more easily." : "Hozz létre fiókot a rendelések egyszerű követéséhez."}
          </p>
          <form action="/auth/register" method="post" className="space-y-3">
            <input type="hidden" name="next" value="/checkout" />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              className={inputClass}
            />
            <input
              type="password"
              name="password"
              placeholder={language === "en" ? "Password (min. 8 characters) *" : "Jelszó (min. 8 karakter) *"}
              className={inputClass}
            />
            <input
              type="password"
              name="passwordConfirm"
              placeholder={language === "en" ? "Confirm password *" : "Jelszó megerősítése *"}
              className={inputClass}
            />
            <label className="flex items-start gap-3 text-sm text-[#555]">
              <input type="checkbox" name="termsAccepted" value="true" className="mt-0.5" />
              <span>
                {language === "en" ? "I accept the " : "Elfogadom az "}
                <Link href="/terms" className="underline">{language === "en" ? "Terms" : "ÁSZF"}</Link>
                {language === "en" ? " and the " : "-et és az "}
                <Link href="/privacy" className="underline">{language === "en" ? "Privacy policy" : "adatvédelmi irányelveket"}</Link>.
              </span>
            </label>
            <button
              type="submit"
              className="w-full rounded-md bg-[#1a1a1a] py-3.5 text-sm font-medium text-white transition hover:bg-[#333] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
            >
              {language === "en" ? "Create account and continue" : "Fiók létrehozása és folytatás"}
            </button>
          </form>
          <p className="text-center text-xs text-[#888]">
            <button
              type="button"
              onClick={() => setMode("guest")}
              className="text-[#1a1a1a] underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
            >
              {language === "en" ? "Checkout as guest instead" : "Inkább vendégként vásárolok"}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
