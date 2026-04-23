import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type SignUpPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
    status?: string;
  }>;
};

function normalizeNextPath(nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith("/")) return "/account";
  return nextPath;
}

function getErrorMessage(error?: string, message?: string) {
  switch (error) {
    case "email":           return "Adj meg érvényes e-mail-címet.";
    case "password":        return "A jelszónak legalább 8 karakteresnek kell lennie.";
    case "passwordConfirm": return "A két jelszó nem egyezik.";
    case "termsAccepted":   return "A folytatáshoz el kell fogadnod a feltételeket.";
    case "emailDelivery":   return message ?? "A fiók létrejött, de a visszaigazoló e-mail elküldése nem sikerült. Kérjük, próbáld újra.";
    case "service":         return "A regisztráció átmenetileg nem elérhető. Próbáld újra hamarosan.";
    default:                return null;
  }
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = normalizeNextPath(resolvedSearchParams.next);
  const errorMessage = getErrorMessage(resolvedSearchParams.error, resolvedSearchParams.message);

  return (
    <AuthLayout
      eyebrow="Regisztráció"
      title="Hozd létre fiókodat."
      description="A teljes hozzáférés az e-mail-cím visszaigazolása után aktiválódik."
      aside={
        <div className="space-y-5 border-t border-rose-100/60 pt-6">
          <div>
            <p className="auth-eyebrow">Már van fiókod?</p>
            <p className="mt-2 text-sm leading-7 text-[#7d5b75]">
              Jelentkezz be, miután megerősítetted az e-mail-címedet.
            </p>
          </div>
          <a
            href={`/sign-in?next=${encodeURIComponent(nextPath)}`}
            className="auth-btn-primary inline-flex"
          >
            Bejelentkezés
          </a>
        </div>
      }
    >
      <form action="/auth/register" method="post" className="space-y-5">
        <input type="hidden" name="next" value={nextPath} />

        <div className="mb-6">
          <p className="auth-eyebrow">Új fiók</p>
          <p className="mt-1.5 text-sm leading-7 text-[#7d5b75]">
            A teljes fiók-hozzáférés az e-mail-visszaigazolás után lép életbe.
          </p>
        </div>

        {errorMessage && (
          <div className="auth-error-box">{errorMessage}</div>
        )}

        {resolvedSearchParams.status === "submitted" && (
          <div className="auth-success-box">
            Ha az adatok érvényesek, előkészítjük a fiókodat és elküldjük a visszaigazoló linket.
          </div>
        )}

        <label className="auth-field">
          <span className="auth-field-label">E-mail-cím</span>
          <input type="email" name="email" required className="auth-input" placeholder="anna@pelda.hu" />
        </label>

        <label className="auth-field">
          <span className="auth-field-label">Jelszó</span>
          <input type="password" name="password" required className="auth-input" placeholder="Legalább 8 karakter" />
        </label>

        <label className="auth-field">
          <span className="auth-field-label">Jelszó megerősítése</span>
          <input type="password" name="passwordConfirm" required className="auth-input" placeholder="••••••••" />
        </label>

        <label className="flex items-start gap-3 pt-1">
          <div className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
            <input
              type="checkbox"
              name="termsAccepted"
              value="true"
              className="auth-checkbox peer"
            />
            <div className="auth-checkbox-custom pointer-events-none" />
          </div>
          <span className="text-sm leading-[1.75] text-[#7d5b75]">
            Elfogadom az áruház feltételeit és a fiók adatvédelmi irányelveit.
          </span>
        </label>

        <button type="submit" className="auth-submit-btn">
          Fiók létrehozása
        </button>
      </form>
    </AuthLayout>
  );
}
