import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import {
  deleteAccountAction,
  updateNewsletterAction,
  updatePasswordAction,
} from "@/app/(storefront)/account/actions";
import { AccountShell } from "@/components/account/AccountShell";
import { requireUser } from "@/lib/auth";
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
      ? "Your password has been updated."
      : status === "newsletter-saved"
        ? "Your newsletter preference has been saved."
        : status === "password-invalid"
          ? "Your current password is not correct."
          : status === "password-short"
            ? "Your new password must be at least 8 characters."
            : status === "delete-error"
              ? "Type TÖRLÉS exactly to delete the account."
              : "Check the form and try again.";

  return (
    <div
      className={`flex items-center gap-3 border-b px-8 py-4 text-sm sm:px-10 ${
        isSuccess
          ? "border-[#e4eee8] bg-[#f8fbf9] text-[#355b48]"
          : "border-[#f1d8e3] bg-[#fff8fb] text-[#9b476f]"
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
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-[10px] uppercase tracking-[0.32em] text-[#b3a0aa]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-[1.2rem] font-semibold text-[#2d1f28]">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-[62ch] text-sm leading-7 text-[#756771]">{description}</p>
      ) : null}
    </div>
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
    <label className="space-y-2.5">
      <span className="text-sm font-medium text-[#4f3e48]">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-12 w-full border border-[#e9e3e6] bg-white px-4 text-sm text-[#2d1f28] outline-none transition placeholder:text-[#b7abb2] focus:border-[#dcc6d0]";

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const currentUser = await requireUser("/settings");
  const user = await db.user.findUniqueOrThrow({
    where: { id: currentUser.id },
  });
  const resolvedSearchParams = await searchParams;

  return (
    <AccountShell
      title="Settings"
      description="Password, newsletter, and account deletion."
      currentPath="/settings"
    >
      <section className="w-full bg-white">
        <div className="grid w-full lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="border-b border-[#eee7ea] bg-[#fffefe] lg:min-h-[980px] lg:border-b-0 lg:border-r">
            <div className="px-10 py-10">
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#b3a0aa]">
                Account
              </p>
              <h1 className="mt-4 font-[family:var(--font-display)] text-[2.4rem] leading-none text-[#2d1f28]">
                Settings
              </h1>
              <p className="mt-5 max-w-[24ch] text-sm leading-7 text-[#756771]">
                Practical account controls without mixing them into the auth verification domain.
              </p>
            </div>

            <nav aria-label="Settings navigation" className="space-y-1 px-6 pb-10">
              <div className="flex min-h-12 w-full items-center rounded-2xl bg-[#f7f4f5] px-4 text-[15px] font-medium text-[#2d1f28]">
                General settings
              </div>
            </nav>
          </aside>

          <div className="min-w-0 bg-white">
            <StatusBanner status={resolvedSearchParams.status} />

            <div className="px-8 py-8 sm:px-10 sm:py-10">
              <div className="border-b border-[#eee7ea] pb-10">
                <SectionHeading
                  eyebrow="Email"
                  title="Login email"
                  description="Email changes now use the dedicated pending-email verification flow on the account page."
                />

                <div className="max-w-[40rem] space-y-4">
                  <FieldLabel label="Current email">
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className={inputClassName}
                    />
                  </FieldLabel>

                  <p className="text-sm leading-7 text-[#756771]">
                    Go to the account page to request an email change with your current password and
                    confirm the new address before it replaces the current one.
                  </p>

                  <Link
                    href="/account"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[#e6dde1] bg-white px-6 text-sm font-medium text-[#5e4d57] transition hover:border-[#d8c7cf] hover:bg-[#fcfbfc]"
                  >
                    Manage email on account page
                  </Link>
                </div>
              </div>

              <div className="border-b border-[#eee7ea] py-10">
                <SectionHeading
                  eyebrow="Password"
                  title="Change password"
                  description="Confirm your current password first, then set a new one."
                />

                <form action={updatePasswordAction} className="max-w-[46rem]">
                  <div className="grid gap-5 md:grid-cols-2">
                    <FieldLabel label="Current password">
                      <input
                        type="password"
                        name="currentPassword"
                        className={inputClassName}
                      />
                    </FieldLabel>

                    <FieldLabel label="New password">
                      <input type="password" name="newPassword" className={inputClassName} />
                    </FieldLabel>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      className="inline-flex h-12 items-center justify-center rounded-full bg-[#f183bc] px-6 text-sm font-medium text-white transition hover:bg-[#ea6fb0]"
                    >
                      Update password
                    </button>
                  </div>
                </form>
              </div>

              <div className="border-b border-[#eee7ea] py-10">
                <SectionHeading
                  eyebrow="Newsletter"
                  title="Notifications"
                  description="Choose whether to receive store updates and editorial mail."
                />

                <form action={updateNewsletterAction} className="max-w-[52rem]">
                  <label className="flex items-start gap-3 text-sm leading-7 text-[#5f5059]">
                    <input
                      type="checkbox"
                      name="newsletterSubscribed"
                      defaultChecked={user.newsletterSubscribed}
                      className="mt-1 h-4 w-4 border border-[#d8cfd4]"
                    />
                    <span>Send me new arrivals, editorial updates, and occasional offers.</span>
                  </label>

                  <div className="mt-6">
                    <button
                      type="submit"
                      className="inline-flex h-12 items-center justify-center rounded-full border border-[#e6dde1] bg-white px-6 text-sm font-medium text-[#5e4d57] transition hover:border-[#d8c7cf] hover:bg-[#fcfbfc]"
                    >
                      Save preference
                    </button>
                  </div>
                </form>
              </div>

              <div className="py-10">
                <SectionHeading
                  eyebrow="Delete account"
                  title="Delete account permanently"
                  description="This removes the account, favourites, cart, and order history."
                />

                <form action={deleteAccountAction} className="max-w-[40rem]">
                  <FieldLabel label="Type: TÖRLÉS">
                    <input type="text" name="confirmation" className={inputClassName} />
                  </FieldLabel>

                  <div className="mt-6">
                    <button
                      type="submit"
                      className="inline-flex h-12 items-center justify-center rounded-full bg-[#c85d86] px-6 text-sm font-medium text-white transition hover:bg-[#b74b75]"
                    >
                      Delete account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AccountShell>
  );
}
