import type { Metadata } from "next";
import Link from "next/link";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { PASSWORD_RESET_GENERIC_MESSAGE } from "@/lib/auth/password-reset";

export const metadata: Metadata = {
  title: "Elfelejtett jelszó - Chicks Jewelry",
  robots: { index: false, follow: false },
};

type ForgotPasswordPageProps = {
  searchParams: Promise<{ error?: string; status?: string }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "email":
      return "Adj meg érvényes e-mail-címet.";
    case "rate-limited":
      return "Túl sok jelszó-visszaállítási kérés érkezett. Próbáld újra később.";
    case "service":
      return "A jelszó-visszaállítás átmenetileg nem elérhető. Próbáld újra hamarosan.";
    default:
      return null;
  }
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = getErrorMessage(resolvedSearchParams.error);

  return (
    <AuthLayout
      eyebrow="Fiók"
      title="Jelszó visszaállítása."
      description="Add meg a fiókodhoz tartozó e-mail-címet, és elküldjük a visszaállítási linket, ha van hozzá fiók."
      aside={
        <div className="space-y-5 border-t border-rose-100/60 pt-6">
          <div>
            <p className="auth-eyebrow">Eszedbe jutott?</p>
            <p className="mt-2 text-sm leading-7 text-[#7d5b75]">
              Visszaléphetsz a bejelentkezéshez.
            </p>
          </div>
          <Link href="/sign-in" className="auth-btn-primary inline-flex">
            Bejelentkezés
          </Link>
        </div>
      }
    >
      <form action="/auth/forgot-password" method="post" className="space-y-5">
        <div className="mb-6">
          <p className="auth-eyebrow">Elfelejtett jelszó</p>
          <p className="mt-1.5 text-sm leading-7 text-[#7d5b75]">
            Biztonsági okból ugyanazt az üzenetet mutatjuk akkor is, ha az e-mail-címhez nincs fiók.
          </p>
        </div>

        {resolvedSearchParams.status === "sent" && (
          <div className="auth-success-box">{PASSWORD_RESET_GENERIC_MESSAGE}</div>
        )}

        {errorMessage && <div className="auth-error-box">{errorMessage}</div>}

        <label className="auth-field">
          <span className="auth-field-label">E-mail-cím</span>
          <input type="email" name="email" required className="auth-input" placeholder="anna@pelda.hu" />
        </label>

        <button type="submit" className="auth-submit-btn">
          Visszaállítási link kérése
        </button>
      </form>
    </AuthLayout>
  );
}
