import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { verifyEmailToken } from "@/lib/auth/email-verification";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type VerifyEmailPageProps = {
  searchParams: Promise<{
    status?: string;
    token?: string;
  }>;
};

function getContent(status: "pending" | "success" | "invalid" | "expired" | "already-used") {
  switch (status) {
    case "pending":
      return {
        title: "Check your email.",
        description: "Open the verification link to finish setup, or request another one below.",
      };
    case "success":
      return {
        title: "Email verified.",
        description: "Your account is ready. You can sign in normally now.",
      };
    case "expired":
      return {
        title: "This link has expired.",
        description: "Request another verification email below.",
      };
    case "already-used":
      return {
        title: "This link was already used.",
        description: "If your email is already verified, you can sign in.",
      };
    default:
      return {
        title: "This verification link is not valid.",
        description: "Check the full URL or request another verification email.",
      };
  }
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const resolvedSearchParams = await searchParams;
  const currentUser = await getCurrentUser();
  const status = resolvedSearchParams.token
    ? await verifyEmailToken(resolvedSearchParams.token)
    : "pending";
  const content = getContent(status);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-[760px] items-center px-6 py-16">
      <section className="w-full space-y-8 border border-[#e7dfd7] bg-[#fffdf9] px-8 py-10 sm:px-12 sm:py-14">
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em] text-[#9b8978]">
            Verification
          </p>
          <h1 className="mt-6 font-[family:var(--font-display)] text-[3rem] leading-[0.96] tracking-[-0.05em] text-[#201a17] sm:text-[3.8rem]">
            {content.title}
          </h1>
          <p className="mt-6 max-w-[34rem] text-[15px] leading-8 text-[#655b54]">
            {content.description}
          </p>
        </div>

        {resolvedSearchParams.status === "verification-sent" ? (
          <div className="space-y-2 border border-[#e7dfd7] bg-[#faf8f4] px-4 py-4 text-sm text-[#514740]">
            <p>
              If there is an unverified account for that email, a fresh verification link has been
              prepared.
            </p>
          </div>
        ) : null}

        {resolvedSearchParams.status === "verification-cooldown" ? (
          <p className="border border-[#e7dfd7] bg-[#faf8f4] px-4 py-3 text-sm text-[#514740]">
            A recent verification link was already prepared. Please wait a few minutes before
            trying again.
          </p>
        ) : null}

        {status !== "success" ? (
          <form action="/auth/resend-verification" method="post" className="space-y-4 border-t border-[#e7dfd7] pt-8">
            <input type="hidden" name="redirectTo" value="/verify-email" />
            <label className="block space-y-2">
              <span className="text-sm text-[#201a17]">Email</span>
              <input
                type="email"
                name="email"
                required
                defaultValue={currentUser?.email ?? ""}
                className="h-12 w-full border border-[#d9d0c8] bg-transparent px-4 text-sm text-[#201a17] outline-none transition focus:border-[#201a17]"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-11 items-center bg-[#201a17] px-5 text-sm text-[#fffdf9] transition hover:bg-[#3a2f29]"
            >
              Resend verification
            </button>
          </form>
        ) : null}

        <div className="flex flex-wrap gap-4">
          <Link
            href="/sign-in"
            className="inline-flex h-11 items-center bg-[#201a17] px-5 text-sm text-[#fffdf9] transition hover:bg-[#3a2f29]"
          >
            Go to sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center border border-[#201a17] px-5 text-sm text-[#201a17] transition hover:bg-[#201a17] hover:text-[#fffdf9]"
          >
            Back to sign up
          </Link>
        </div>
      </section>
    </main>
  );
}
