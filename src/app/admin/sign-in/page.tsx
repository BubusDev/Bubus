import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type AdminSignInPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

function normalizeNextPath(nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith("/admin")) {
    return "/admin";
  }

  return nextPath;
}

export default async function AdminSignInPage({ searchParams }: AdminSignInPageProps) {
  const user = await getCurrentUser();
  const resolvedSearchParams = await searchParams;
  const nextPath = normalizeNextPath(resolvedSearchParams.next);

  if (user?.emailVerifiedAt && user.role === "ADMIN") {
    redirect(nextPath);
  }

  if (user?.emailVerifiedAt) {
    redirect("/");
  }

  return (
    <AdminAuthShell
      title="Admin bejelentkezés"
      description="Jelentkezz be rendszergazdai fiókkal az admin felület eléréséhez. Ez a belépési útvonal külön admin shellt használ, nem a storefront felületet."
      aside={
        <div className="border-t border-[var(--admin-line-100)] pt-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--admin-ink-500)]">
            Megjegyzés
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--admin-ink-600)]">
            Ha vásárlói fiókba szeretnél belépni, használd a{" "}
            <Link href={`/sign-in?next=${encodeURIComponent("/")}`} className="admin-inline-link">
              normál bejelentkezési oldalt
            </Link>
            .
          </p>
        </div>
      }
    >
      <form action="/auth/login" method="post" className="space-y-5">
        <input type="hidden" name="next" value={nextPath} />

        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--admin-ink-500)]">
            Hozzáférés
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--admin-ink-600)]">
            Add meg az admin felhasználó e-mail-címét és jelszavát.
          </p>
        </div>

        {resolvedSearchParams.error === "invalid" && (
          <div className="border border-[#d9b8b8] bg-[#fff8f8] px-4 py-3 text-sm text-[#8b3d3d]">
            Érvénytelen admin e-mail-cím vagy jelszó.
          </div>
        )}
        {resolvedSearchParams.error === "service" && (
          <div className="border border-[#d9b8b8] bg-[#fff8f8] px-4 py-3 text-sm text-[#8b3d3d]">
            A bejelentkezés átmenetileg nem elérhető. Ellenőrizd a konfigurációt és a szerverlógokat.
          </div>
        )}

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--admin-ink-500)]">
            E-mail-cím
          </span>
          <input
            type="email"
            name="email"
            required
            className="h-11 w-full border border-[var(--admin-line-200)] bg-white px-3.5 text-sm text-[var(--admin-ink-900)] outline-none transition placeholder:text-[var(--admin-ink-500)] focus:border-[var(--admin-blue-600)] focus:shadow-[0_0_0_3px_rgba(63,122,210,0.12)]"
            placeholder="admin@pelda.hu"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--admin-ink-500)]">
            Jelszó
          </span>
          <input
            type="password"
            name="password"
            required
            className="h-11 w-full border border-[var(--admin-line-200)] bg-white px-3.5 text-sm text-[var(--admin-ink-900)] outline-none transition placeholder:text-[var(--admin-ink-500)] focus:border-[var(--admin-blue-600)] focus:shadow-[0_0_0_3px_rgba(63,122,210,0.12)]"
            placeholder="••••••••"
          />
        </label>

        <button type="submit" className="admin-button-primary h-11 w-full justify-center text-sm">
          Bejelentkezés az adminba
        </button>
      </form>
    </AdminAuthShell>
  );
}
