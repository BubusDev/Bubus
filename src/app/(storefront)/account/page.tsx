import type { Metadata } from "next";
import {
  requestEmailChangeAction,
  resendVerificationAction,
} from "@/app/account/actions";
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
      <p className="border border-[#e7dfd7] bg-[#faf6f1] px-4 py-3 text-sm text-[#6e5e52]">
        Your current password is not correct.
      </p>
    );
  }

  if (status === "invalid-email") {
    return (
      <p className="border border-[#e7dfd7] bg-[#faf6f1] px-4 py-3 text-sm text-[#6e5e52]">
        Enter a valid new email address.
      </p>
    );
  }

  if (status === "unchanged") {
    return (
      <p className="border border-[#e7dfd7] bg-[#faf8f4] px-4 py-3 text-sm text-[#514740]">
        Your email address is already set to that value.
      </p>
    );
  }

  return (
    <div className="space-y-2 border border-[#e7dfd7] bg-[#faf8f4] px-4 py-4 text-sm text-[#514740]">
      <p>If the new address can be used, we prepared a confirmation link for it.</p>
      {process.env.NODE_ENV !== "production" && preview ? (
        <p>
          Development preview:{" "}
          <a href={preview} className="underline underline-offset-4">
            open confirmation link
          </a>
        </p>
      ) : null}
    </div>
  );
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const user = await requireAuthenticatedUser("/account");
  const resolvedSearchParams = await searchParams;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-[1100px] px-6 py-16 sm:px-8 lg:px-10">
      <section className="w-full max-w-[44rem] space-y-12">
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em] text-[#9b8978]">
            Account
          </p>
          <h1 className="mt-6 font-[family:var(--font-display)] text-[3.4rem] leading-[0.94] tracking-[-0.05em] text-[#201a17] sm:text-[4.2rem]">
            Email and access.
          </h1>
          <p className="mt-6 text-[15px] leading-8 text-[#655b54]">
            Signed in as {user.email}. The rest of the account area stays protected, and
            verification-sensitive flows remain separate from the Auth.js session layer.
          </p>
        </div>

        <section className="space-y-4 border-t border-[#e7dfd7] pt-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#9b8978]">
            Verification status
          </p>
          <p className="text-sm leading-7 text-[#655b54]">
            {user.emailVerifiedAt
              ? "Verified. Normal signed-in usage is enabled."
              : "Unverified. Normal signed-in usage stays restricted until your email is confirmed."}
          </p>

          {!user.emailVerifiedAt ? (
            <form action={resendVerificationAction} className="space-y-4">
              <input type="hidden" name="email" value={user.email} />
              <input type="hidden" name="redirectTo" value="/account" />
              <button
                type="submit"
                className="inline-flex h-11 items-center bg-[#201a17] px-5 text-sm text-[#fffdf9] transition hover:bg-[#3a2f29]"
              >
                Resend verification
              </button>
            </form>
          ) : null}

          {resolvedSearchParams.status === "verification-sent" ? (
            <div className="space-y-2 border border-[#e7dfd7] bg-[#faf8f4] px-4 py-4 text-sm text-[#514740]">
              <p>
                If there is an unverified account for that email, a fresh verification link has
                been prepared.
              </p>
            </div>
          ) : null}

          {resolvedSearchParams.status === "verification-cooldown" ? (
            <p className="border border-[#e7dfd7] bg-[#faf8f4] px-4 py-3 text-sm text-[#514740]">
              A recent verification link was already prepared. Please wait a few minutes before
              trying again.
            </p>
          ) : null}
        </section>

        <section className="space-y-6 border-t border-[#e7dfd7] pt-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#9b8978]">
              Change email
            </p>
            <p className="mt-3 text-sm leading-7 text-[#655b54]">
              Confirm your current password first. Your active email stays unchanged until the new
              address is verified.
            </p>
          </div>

          {renderEmailChangeStatus(
            resolvedSearchParams.emailStatus,
            resolvedSearchParams.emailPreview,
          )}

          <form action={requestEmailChangeAction} className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm text-[#201a17]">Current password</span>
              <input
                type="password"
                name="currentPassword"
                required
                className="h-12 w-full border border-[#d9d0c8] bg-transparent px-4 text-sm text-[#201a17] outline-none transition focus:border-[#201a17]"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-[#201a17]">New email</span>
              <input
                type="email"
                name="newEmail"
                required
                className="h-12 w-full border border-[#d9d0c8] bg-transparent px-4 text-sm text-[#201a17] outline-none transition focus:border-[#201a17]"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-11 items-center bg-[#201a17] px-5 text-sm text-[#fffdf9] transition hover:bg-[#3a2f29]"
            >
              Request email change
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
