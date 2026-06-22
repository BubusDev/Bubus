import type { Metadata } from "next";
import Link from "next/link";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { getPasswordMinLength } from "@/lib/auth/validation";
import { getPasswordResetTokenState } from "@/lib/auth/password-reset";

export const metadata: Metadata = {
  title: "Új jelszó megadása - Chicks Jewelry",
  robots: { index: false, follow: false },
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ error?: string; token?: string }>;
};

function getTokenMessage(status: string) {
  switch (status) {
    case "missing":
      return "Hiányzik a jelszó-visszaállítási token. Kérj új visszaállítási linket.";
    case "expired":
      return "Ez a jelszó-visszaállítási link lejárt. Kérj új linket.";
    case "used":
      return "Ezt a jelszó-visszaállítási linket már felhasználták. Kérj új linket, ha még szükséged van rá.";
    default:
      return "Ez a jelszó-visszaállítási link érvénytelen. Kérj új linket.";
  }
}

function getFormErrorMessage(error?: string) {
  switch (error) {
    case "password":
      return `Az új jelszónak legalább ${getPasswordMinLength()} karakter hosszúnak kell lennie.`;
    case "password-confirm":
      return "A két jelszó nem egyezik.";
    case "invalid-token":
      return "A jelszó-visszaállítási link már nem érvényes. Kérj új linket.";
    default:
      return null;
  }
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams.token ?? "";
  const tokenState = await getPasswordResetTokenState(token);
  const formErrorMessage = getFormErrorMessage(resolvedSearchParams.error);
  const canReset = tokenState.status === "valid";

  return (
    <AuthLayout
      eyebrow="Fiók"
      title="Adj meg új jelszót."
      description="Válassz új jelszót a fiókodhoz. A visszaállítási link egyszer használható és rövid ideig érvényes."
      aside={
        <div className="space-y-5 border-t border-rose-100/60 pt-6">
          <div>
            <p className="auth-eyebrow">Új link kell?</p>
            <p className="mt-2 text-sm leading-7 text-[#7d5b75]">
              Ha a link lejárt vagy már használtad, kérj új visszaállítási linket.
            </p>
          </div>
          <Link href="/forgot-password" className="auth-btn-primary inline-flex">
            Új link kérése
          </Link>
        </div>
      }
    >
      {!canReset ? (
        <div className="space-y-5">
          <div className="auth-error-box">{getTokenMessage(tokenState.status)}</div>
          <Link href="/forgot-password" className="auth-submit-btn inline-flex justify-center">
            Új visszaállítási link kérése
          </Link>
        </div>
      ) : (
        <form action="/auth/reset-password" method="post" className="space-y-5">
          <input type="hidden" name="token" value={token} />

          <div className="mb-6">
            <p className="auth-eyebrow">Új jelszó</p>
            <p className="mt-1.5 text-sm leading-7 text-[#7d5b75]">
              A sikeres mentés után a régi visszaállítási link érvénytelenné válik.
            </p>
          </div>

          {formErrorMessage && <div className="auth-error-box">{formErrorMessage}</div>}

          <label className="auth-field">
            <span className="auth-field-label">Új jelszó</span>
            <input
              type="password"
              name="password"
              required
              minLength={getPasswordMinLength()}
              className="auth-input"
              placeholder={`Legalább ${getPasswordMinLength()} karakter`}
            />
          </label>

          <label className="auth-field">
            <span className="auth-field-label">Új jelszó megerősítése</span>
            <input type="password" name="passwordConfirm" required className="auth-input" placeholder="••••••••" />
          </label>

          <button type="submit" className="auth-submit-btn">
            Jelszó mentése
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
