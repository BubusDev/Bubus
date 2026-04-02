import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

function normalizeNextPath(nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/account";
  }

  return nextPath;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const user = await getCurrentUser();
  const resolvedSearchParams = await searchParams;
  const nextPath = normalizeNextPath(resolvedSearchParams.next);

  if (user?.emailVerifiedAt) {
    redirect(nextPath);
  }

  return (
    <AuthLayout
      eyebrow="Account"
      title="Sign in with your email."
      description="A quiet, direct sign-in flow for saved items, orders, and your account details."
      aside={
        <div className="border-t border-[#e7dfd7] pt-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#9b8978]">
            New here
          </p>
          <p className="mt-3 text-sm leading-7 text-[#655b54]">
            Create an account, then verify your email before normal account access is enabled.
          </p>
          <a
            href={`/sign-up?next=${encodeURIComponent(nextPath)}`}
            className="mt-6 inline-flex h-11 items-center border border-[#201a17] px-5 text-sm text-[#201a17] transition hover:bg-[#201a17] hover:text-[#fffdf9]"
          >
            Create account
          </a>
          <Link
            href="/verify-email"
            className="mt-3 inline-flex h-11 items-center border border-[#d9d0c8] px-5 text-sm text-[#655b54] transition hover:border-[#201a17] hover:text-[#201a17]"
          >
            Resend verification
          </Link>
        </div>
      }
    >
      <form action="/auth/login" method="post" className="space-y-6">
        <input type="hidden" name="next" value={nextPath} />

        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#9b8978]">
            Sign in
          </p>
          <p className="text-sm leading-7 text-[#655b54]">
            Use the email and password connected to your account.
          </p>
        </div>

        {resolvedSearchParams.error === "invalid" ? (
          <p className="border border-[#e7dfd7] bg-[#faf6f1] px-4 py-3 text-sm text-[#6e5e52]">
            Invalid email or password.
          </p>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm text-[#201a17]">Email</span>
          <input
            type="email"
            name="email"
            required
            className="h-12 w-full border border-[#d9d0c8] bg-transparent px-4 text-sm text-[#201a17] outline-none transition focus:border-[#201a17]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-[#201a17]">Password</span>
          <input
            type="password"
            name="password"
            required
            className="h-12 w-full border border-[#d9d0c8] bg-transparent px-4 text-sm text-[#201a17] outline-none transition focus:border-[#201a17]"
          />
        </label>

        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center bg-[#201a17] px-6 text-sm text-[#fffdf9] transition hover:bg-[#3a2f29]"
        >
          Sign in
        </button>
      </form>
    </AuthLayout>
  );
}
