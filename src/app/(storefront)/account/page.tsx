import type { Metadata } from "next";
import {
  requestEmailChangeAction,
  resendVerificationAction,
} from "@/app/(storefront)/account/actions";
import { AccountShell } from "@/components/account/AccountShell";
import { requireAuthenticatedUser } from "@/lib/auth";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type AccountPageProps = {
  searchParams: Promise<{
    emailPreview?: string;
    emailStatus?: string;
    status?: string;
  }>;
};

function renderEmailChangeStatus(status?: string, preview?: string) {
  if (!status) {
    return null;
  }

  if (status === "invalid-password") {
    return (
      <p className="rounded-md border border-[#f1d8e3] bg-[#fff8fb] px-4 py-3 text-sm text-[#9b476f]">
        A jelenlegi jelszó nem megfelelő.
      </p>
    );
  }

  if (status === "invalid-email") {
    return (
      <p className="rounded-md border border-[#f1d8e3] bg-[#fff8fb] px-4 py-3 text-sm text-[#9b476f]">
        Adj meg egy érvényes új e-mail címet.
      </p>
    );
  }

  if (status === "unchanged") {
    return (
      <p className="rounded-md border border-[#e8e5e0] bg-[#fffdfb] px-4 py-3 text-sm text-[#514740]">
        Ez az e-mail cím már be van állítva a fiókodhoz.
      </p>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-[#e8e5e0] bg-[#fffdfb] px-4 py-4 text-sm text-[#514740]">
      <p>Ha az új cím használható, elküldtük rá a megerősítéshez szükséges hivatkozást.</p>
      {process.env.NODE_ENV !== "production" && preview ? (
        <p>
          Fejlesztői előnézet:{" "}
          <a href={preview} className="underline underline-offset-4">
            megerősítő link megnyitása
          </a>
        </p>
      ) : null}
    </div>
  );
}

const inputClassName =
  "h-12 w-full rounded-md border border-[#e8e5e0] bg-white px-4 text-sm text-[#2d1f28] outline-none transition placeholder:text-[#b7abb2] focus:border-[#4d2741]";

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const user = await requireAuthenticatedUser("/account");
  const resolvedSearchParams = await searchParams;

  return (
    <AccountShell
      title="E-mail és hozzáférés"
      description="Itt ellenőrizheted az e-mail címed állapotát, és biztonságosan kérhetsz e-mail cím módosítást."
      currentPath="/settings"
    >
      <section className="rounded-lg border border-[#e8e5e0] bg-white/84">
        <div className="border-b border-[#e8e5e0] px-5 py-6 sm:px-7">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8c7f86]">
            Ellenőrzés
          </p>
          <h2 className="mt-3 text-[1.2rem] font-semibold text-[#2d1f28]">
            E-mail cím állapota
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#655b54]">
            Bejelentkezve ezzel a címmel: <span className="font-medium text-[#2d1f28]">{user.email}</span>
          </p>
          <p className="mt-2 text-sm leading-7 text-[#655b54]">
            {user.emailVerifiedAt
              ? "Az e-mail címed megerősítve, a fiókod teljesen használható."
              : "Az e-mail címed még nincs megerősítve. A teljes fiókhasználathoz erősítsd meg a címed."}
          </p>

          {!user.emailVerifiedAt ? (
            <form action={resendVerificationAction} className="mt-5">
              <input type="hidden" name="email" value={user.email} />
              <input type="hidden" name="redirectTo" value="/account" />
              <button
                type="submit"
                className="inline-flex h-11 items-center rounded-md bg-[#1a1a1a] px-5 text-sm font-medium text-white transition hover:bg-[#333]"
              >
                Megerősítő e-mail újraküldése
              </button>
            </form>
          ) : null}

          {resolvedSearchParams.status === "verification-sent" ? (
            <p className="mt-5 rounded-md border border-[#e8e5e0] bg-[#fffdfb] px-4 py-3 text-sm text-[#514740]">
              Ha ehhez a címhez tartozik megerősítésre váró fiók, elküldtük az új linket.
            </p>
          ) : null}

          {resolvedSearchParams.status === "verification-cooldown" ? (
            <p className="mt-5 rounded-md border border-[#e8e5e0] bg-[#fffdfb] px-4 py-3 text-sm text-[#514740]">
              Nemrég már kértél megerősítő linket. Kérjük, várj néhány percet az újraküldés előtt.
            </p>
          ) : null}
        </div>

        <div className="px-5 py-6 sm:px-7">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8c7f86]">
            Módosítás
          </p>
          <h2 className="mt-3 text-[1.2rem] font-semibold text-[#2d1f28]">
            E-mail cím módosítása
          </h2>
          <p className="mt-3 max-w-[62ch] text-sm leading-7 text-[#655b54]">
            A jelenlegi jelszavad megadása után megerősítő linket küldünk az új címre.
            A régi címed addig marad aktív, amíg az újat meg nem erősíted.
          </p>

          <div className="mt-6">
            {renderEmailChangeStatus(
              resolvedSearchParams.emailStatus,
              resolvedSearchParams.emailPreview,
            )}
          </div>

          <form action={requestEmailChangeAction} className="mt-6 max-w-[46rem] space-y-5">
            <label className="block space-y-2.5">
              <span className="text-sm font-medium text-[#4f3e48]">Jelenlegi jelszó</span>
              <input
                type="password"
                name="currentPassword"
                required
                className={inputClassName}
              />
            </label>

            <label className="block space-y-2.5">
              <span className="text-sm font-medium text-[#4f3e48]">Új e-mail cím</span>
              <input
                type="email"
                name="newEmail"
                required
                className={inputClassName}
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-11 items-center rounded-md bg-[#1a1a1a] px-5 text-sm font-medium text-white transition hover:bg-[#333]"
            >
              Módosítás kérése
            </button>
          </form>
        </div>
      </section>
    </AccountShell>
  );
}
