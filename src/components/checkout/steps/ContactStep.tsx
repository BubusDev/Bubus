"use client";

import { useState } from "react";

type ContactStepProps = {
  email: string;
  isLoggedIn: boolean;
  onNext: (email: string) => void;
};

const inputClass =
  "w-full border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition";

export function ContactStep({ email: initialEmail, isLoggedIn, onNext }: ContactStepProps) {
  const [mode, setMode] = useState<"guest" | "login" | "register">("guest");
  const [guestEmail, setGuestEmail] = useState(initialEmail);

  if (isLoggedIn) {
    return (
      <div className="max-w-[540px] mx-auto">
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-6">
          Kapcsolatfelvételi adatok
        </h2>
        <p className="text-sm text-[#666] mb-4">
          A rendelés visszaigazolása erre az e-mail-címre érkezik.
        </p>
        <div className="w-full border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] bg-[#faf9f7] mb-4 select-none">
          {initialEmail}
        </div>
        <button
          type="button"
          onClick={() => onNext(initialEmail)}
          className="w-full bg-[#1a1a1a] text-white py-3.5 text-sm font-medium hover:bg-[#333] transition"
        >
          Folytatás
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[540px] mx-auto">
      <h2 className="text-base font-semibold text-[#1a1a1a] mb-6">
        Kapcsolatfelvételi adatok
      </h2>

      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        {(
          [
            { key: "guest", label: "Vendégként" },
            { key: "login", label: "Bejelentkezés" },
            { key: "register", label: "Regisztráció" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setMode(opt.key)}
            className={`py-2.5 text-sm border transition ${
              mode === opt.key
                ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                : "border-[#d0ccc8] text-[#555] hover:border-[#1a1a1a]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Guest: email only */}
      {mode === "guest" && (
        <div className="space-y-3">
          <p className="text-sm text-[#666] mb-4">
            Adja meg email-címét a rendelés visszaigazolásához.
          </p>
          <input
            type="email"
            placeholder="E-mail-cím *"
            className={inputClass}
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
          />
          <button
            type="button"
            onClick={() => { if (guestEmail) onNext(guestEmail); }}
            disabled={!guestEmail}
            className="mt-3 w-full bg-[#1a1a1a] text-white py-3.5 text-sm font-medium hover:bg-[#333] transition disabled:opacity-40"
          >
            Folytatás
          </button>
        </div>
      )}

      {/* Login */}
      {mode === "login" && (
        <form action="/auth/login" method="post" className="space-y-3">
          <input type="hidden" name="next" value="/checkout" />
          <input type="email" name="email" placeholder="E-mail-cím *" className={inputClass} />
          <input type="password" name="password" placeholder="Jelszó *" className={inputClass} />
          <button
            type="submit"
            className="w-full bg-[#1a1a1a] text-white py-3 text-sm font-medium hover:bg-[#333] transition"
          >
            Bejelentkezés
          </button>
        </form>
      )}

      {/* Register */}
      {mode === "register" && (
        <form action="/auth/register" method="post" className="space-y-3">
          <input type="hidden" name="next" value="/checkout" />
          <input type="email" name="email" placeholder="E-mail-cím *" className={inputClass} />
          <input type="password" name="password" placeholder="Jelszó *" className={inputClass} />
          <input
            type="password"
            name="passwordConfirm"
            placeholder="Jelszó megerősítése *"
            className={inputClass}
          />
          <button
            type="submit"
            className="w-full bg-[#1a1a1a] text-white py-3 text-sm font-medium hover:bg-[#333] transition"
          >
            Fiók létrehozása
          </button>
        </form>
      )}
    </div>
  );
}
