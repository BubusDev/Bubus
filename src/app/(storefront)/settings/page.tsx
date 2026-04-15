import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import {
  deleteAccountAction,
  updateNewsletterAction,
  updatePasswordAction,
} from "@/app/(storefront)/account/actions";
import { AccountShell } from "@/components/account/AccountShell";
import { requireAccountUser } from "@/lib/auth";
import { db } from "@/lib/db";

type SettingsPageProps = {
  searchParams: Promise<{ status?: string }>;
};

function StatusBanner({ status }: { status?: string }) {
  if (!status) {
    return null;
  }

  const successStatuses = new Set(["password-saved", "newsletter-saved"]);
  const isSuccess = successStatuses.has(status);

  const text =
    status === "password-saved"
      ? "A jelszavad frissült."
      : status === "newsletter-saved"
        ? "A hírlevél-beállításaidat elmentettük."
        : status === "password-invalid"
          ? "A jelenlegi jelszó nem megfelelő."
          : status === "password-short"
            ? "Az új jelszónak legalább 8 karakter hosszúnak kell lennie."
            : status === "delete-error"
              ? "A törléshez pontosan ezt írd be: TÖRLÉS."
              : "Ellenőrizd az adatokat, és próbáld újra.";

  return (
    <div
      className={`flex items-center gap-3 rounded-md border px-4 py-3 text-sm ${
        isSuccess
          ? "border-[#d8ebdf] bg-[#f5fbf7] text-[#35624b]"
          : "border-[#ead6df] bg-white text-[#8d3f64]"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <AlertTriangle className="h-4 w-4 shrink-0" />
      )}
      <span>{text}</span>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-[#2d1f28]">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-[50rem] text-xs leading-5 text-[#8a7a83]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function SettingsCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-lg border border-[#e8e2dd] bg-white p-4 shadow-[0_12px_28px_rgba(45,31,40,0.04)] sm:p-5 ${className ?? ""}`}
    >
      {children}
    </section>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-[#4f3e48]">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-11 w-full rounded-md border border-[#e4ded9] bg-white px-3.5 text-sm text-[#2d1f28] outline-none transition placeholder:text-[#b7abb2] focus:border-[#4d2741]";

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const currentUser = await requireAccountUser("/settings");
  const user = await db.user.findUniqueOrThrow({
    where: { id: currentUser.id },
  });
  const resolvedSearchParams = await searchParams;

  return (
    <AccountShell title="Beállítások">
      <StatusBanner status={resolvedSearchParams.status} />

      <div className="grid gap-4 lg:grid-cols-12">
        <SettingsCard className="lg:col-span-5">
          <SectionHeading
            title="Belépési e-mail cím"
            description="Az e-mail cím módosítása külön megerősítéssel történik, hogy a fiókod biztonságban maradjon."
          />

          <div className="max-w-[28rem] space-y-6">
            <FieldLabel label="Jelenlegi e-mail cím">
              <input type="email" value={user.email} readOnly className={inputClassName} />
            </FieldLabel>

            <Link
              href="/account"
              className="inline-flex h-11 items-center justify-center rounded-md border border-[#e6dde1] bg-white px-5 text-sm font-medium text-[#5e4d57] transition hover:border-[#d8c7cf] hover:bg-[#fcfbfc]"
            >
              E-mail cím módosítása
            </Link>
          </div>
        </SettingsCard>

        <SettingsCard className="lg:col-span-7">
          <SectionHeading
            title="Jelszó módosítása"
            description="Add meg a jelenlegi jelszavadat, majd válassz egy újat."
          />

          <form action={updatePasswordAction} className="max-w-[44rem]">
            <div className="grid gap-4 md:grid-cols-2">
              <FieldLabel label="Jelenlegi jelszó">
                <input type="password" name="currentPassword" className={inputClassName} />
              </FieldLabel>

              <FieldLabel label="Új jelszó">
                <input type="password" name="newPassword" className={inputClassName} />
              </FieldLabel>
            </div>

            <div className="mt-5">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-md bg-[#1a1a1a] px-5 text-sm font-medium text-white transition hover:bg-[#333]"
              >
                Jelszó mentése
              </button>
            </div>
          </form>
        </SettingsCard>

        <SettingsCard className="lg:col-span-5">
          <SectionHeading
            title="Hírlevél / értesítések"
            description="Itt állíthatod be, hogy kérsz-e újdonságokat és alkalmi ajánlatokat."
          />

          <form action={updateNewsletterAction}>
            <label className="flex items-start gap-3 text-sm leading-7 text-[#5f5059]">
              <input
                type="checkbox"
                name="newsletterSubscribed"
                defaultChecked={user.newsletterSubscribed}
                className="mt-1 h-4 w-4 rounded border border-[#d8cfd4]"
              />
              <span>Kérek értesítést az új darabokról, válogatásokról és kedvezményekről.</span>
            </label>

            <div className="mt-5">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-md bg-[#1a1a1a] px-5 text-sm font-medium text-white transition hover:bg-[#333]"
              >
                Beállítás mentése
              </button>
            </div>
          </form>
        </SettingsCard>

        <SettingsCard className="lg:col-span-7">
          <SectionHeading
            title="Fiók és biztonság"
            description="Ez törli a fiókodat, a kedvenceidet, a kosaradat és a rendelési előzményeidet."
          />

          <form action={deleteAccountAction} className="max-w-[28rem]">
            <FieldLabel label="Megerősítés: TÖRLÉS">
              <input type="text" name="confirmation" className={inputClassName} />
            </FieldLabel>

            <div className="mt-5">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-md bg-[#9b476f] px-5 text-sm font-medium text-white transition hover:bg-[#853a5d]"
              >
                Fiók törlése
              </button>
            </div>
          </form>
        </SettingsCard>
      </div>
    </AccountShell>
  );
}
