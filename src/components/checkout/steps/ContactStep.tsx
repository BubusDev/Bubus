"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { submitContactStep } from "@/app/actions/checkout";

type ContactStepProps = {
  userEmail?: string;
  onNext: (email: string) => void;
};

const inputClass =
  "w-full border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition";

export function ContactStep({ userEmail, onNext }: ContactStepProps) {
  const [mode, setMode] = useState<"guest" | "login" | "register">("guest");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (userEmail) {
    return (
      <div>
        <h2 className="mb-6 text-base font-semibold text-[#1a1a1a]">
          Kapcsolatfelvételi adatok
        </h2>
        <div className="mb-6 flex items-center justify-between border border-[#e8e5e0] p-4">
          <div>
            <p className="mb-0.5 text-[11px] uppercase tracking-[.18em] text-[#888]">
              Bejelentkezve
            </p>
            <p className="text-sm font-medium text-[#1a1a1a]">{userEmail}</p>
          </div>
          <Link
            href="/auth/logout"
            className="text-xs text-[#888] transition hover:text-[#1a1a1a]"
          >
            Kijelentkezés
          </Link>
        </div>
        <button
          type="button"
          onClick={() => onNext(userEmail)}
          className="w-full bg-[#1a1a1a] py-3.5 text-sm font-medium text-white transition hover:bg-[#333]"
        >
          Folytatás a szállításhoz
        </button>
      </div>
    );
  }

  function handleGuestSubmit() {
    setError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Adjon meg érvényes e-mail-címet");
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

      setError(result.error ?? "Hiba történt");
    });
  }

  return (
    <div>
      <h2 className="mb-6 text-base font-semibold text-[#1a1a1a]">
        Kapcsolatfelvételi adatok
      </h2>

      <div className="mb-6 grid grid-cols-3 gap-px border border-[#e8e5e0] bg-[#e8e5e0]">
        {([
          ["guest", "Vendégként"],
          ["login", "Bejelentkezés"],
          ["register", "Regisztráció"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setMode(key);
              setError("");
            }}
            className={`py-3 text-sm transition ${
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
            Fiók nélkül is vásárolhat. Adja meg e-mail-címét a rendelés
            visszaigazolásához.
          </p>
          <input
            type="email"
            placeholder="E-mail-cím *"
            className={inputClass}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleGuestSubmit();
              }
            }}
          />
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <button
            type="button"
            onClick={handleGuestSubmit}
            disabled={isPending}
            className="w-full bg-[#1a1a1a] py-3.5 text-sm font-medium text-white transition hover:bg-[#333] disabled:opacity-50"
          >
            {isPending ? "Folyamatban..." : "Folytatás"}
          </button>
          <p className="text-center text-xs text-[#888]">
            Van már fiókja?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-[#1a1a1a] underline hover:no-underline"
            >
              Jelentkezzen be
            </button>
          </p>
        </div>
      )}

      {mode === "login" && (
        <div className="space-y-3">
          <p className="mb-4 text-sm text-[#666]">
            Bejelentkezés után a szállítási adatai automatikusan kitöltődnek.
          </p>
          <form action="/auth/login" method="post" className="space-y-3">
            <input type="hidden" name="next" value="/checkout" />
            <input
              type="email"
              name="email"
              placeholder="E-mail-cím *"
              className={inputClass}
            />
            <input
              type="password"
              name="password"
              placeholder="Jelszó *"
              className={inputClass}
            />
            <button
              type="submit"
              className="w-full bg-[#1a1a1a] py-3.5 text-sm font-medium text-white transition hover:bg-[#333]"
            >
              Bejelentkezés és folytatás
            </button>
          </form>
          <p className="text-center text-xs text-[#888]">
            <button
              type="button"
              onClick={() => setMode("guest")}
              className="text-[#1a1a1a] underline hover:no-underline"
            >
              Inkább vendégként vásárolok
            </button>
          </p>
        </div>
      )}

      {mode === "register" && (
        <div className="space-y-3">
          <p className="mb-4 text-sm text-[#666]">
            Hozzon létre fiókot a rendelések egyszerű követéséhez.
          </p>
          <form action="/auth/register" method="post" className="space-y-3">
            <input type="hidden" name="next" value="/checkout" />
            <input
              type="email"
              name="email"
              placeholder="E-mail-cím *"
              className={inputClass}
            />
            <input
              type="password"
              name="password"
              placeholder="Jelszó (min. 8 karakter) *"
              className={inputClass}
            />
            <input
              type="password"
              name="passwordConfirm"
              placeholder="Jelszó megerősítése *"
              className={inputClass}
            />
            <label className="flex items-start gap-3 text-sm text-[#555]">
              <input type="checkbox" name="termsAccepted" value="true" className="mt-0.5" />
              <span>
                Elfogadom az <Link href="/terms" className="underline">ÁSZF</Link>-et és az{" "}
                <Link href="/privacy" className="underline">adatvédelmi irányelveket</Link>.
              </span>
            </label>
            <button
              type="submit"
              className="w-full bg-[#1a1a1a] py-3.5 text-sm font-medium text-white transition hover:bg-[#333]"
            >
              Fiók létrehozása és folytatás
            </button>
          </form>
          <p className="text-center text-xs text-[#888]">
            <button
              type="button"
              onClick={() => setMode("guest")}
              className="text-[#1a1a1a] underline hover:no-underline"
            >
              Inkább vendégként vásárolok
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
