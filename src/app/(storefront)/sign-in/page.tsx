import type { Metadata } from "next";
import Link from "next/link";

import { AuthLayout } from "@/components/auth/AuthLayout";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type SignInPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

function normalizeNextPath(nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith("/")) return "/new-in";
  return nextPath;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = normalizeNextPath(resolvedSearchParams.next);

  return (
    <AuthLayout
      eyebrow="Fiók"
      title="Üdvözlünk vissza."
      description="Jelentkezz be mentett tételeid, rendeléseid és fiókod adatainak eléréséhez."
      aside={
        <div className="space-y-5 border-t border-rose-100/60 pt-6">
          <div>
            <p className="auth-eyebrow">Még nincs fiókod?</p>
            <p className="mt-2 text-sm leading-7 text-[#7d5b75]">
              Hozz létre egyet, majd erősítsd meg az e-mail-címedet a teljes hozzáféréshez.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <a
              href={`/sign-up?next=${encodeURIComponent(nextPath)}`}
              className="auth-btn-primary"
            >
              Regisztráció
            </a>
            <Link href="/verify-email" className="auth-btn-ghost">
              Visszaigazoló e-mail újraküldése
            </Link>
          </div>
        </div>
      }
    >
      <form action="/auth/login" method="post" className="space-y-5">
        <input type="hidden" name="next" value={nextPath} />

        <div className="mb-6">
          <p className="auth-eyebrow">Bejelentkezés</p>
          <p className="mt-1.5 text-sm leading-7 text-[#7d5b75]">
            Add meg a fiókodhoz tartozó e-mail-címedet és jelszavadat.
          </p>
        </div>

        {resolvedSearchParams.error === "invalid" && (
          <div className="auth-error-box">
            Érvénytelen e-mail-cím vagy jelszó.
          </div>
        )}
        {resolvedSearchParams.error === "service" && (
          <div className="auth-error-box">
            A bejelentkezés átmenetileg nem elérhető. Ellenőrizd a konfigurációt és a szerverlógokat.
          </div>
        )}

        <label className="auth-field">
          <span className="auth-field-label">E-mail-cím</span>
          <input type="email" name="email" required className="auth-input" placeholder="anna@pelda.hu" />
        </label>

        <label className="auth-field">
          <span className="auth-field-label">Jelszó</span>
          <input type="password" name="password" required className="auth-input" placeholder="••••••••" />
        </label>

        <button type="submit" className="auth-submit-btn">
          Bejelentkezés
        </button>
      </form>
    </AuthLayout>
  );
}
