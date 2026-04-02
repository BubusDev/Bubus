import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type SignUpPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
    preview?: string;
    status?: string;
  }>;
};

function normalizeNextPath(nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/account";
  }

  return nextPath;
}

function getErrorMessage(error?: string) {
  switch (error) {
    case "email":
      return "Enter a valid email address.";
    case "password":
      return "Password must be at least 8 characters.";
    case "passwordConfirm":
      return "Passwords do not match.";
    case "termsAccepted":
      return "You must accept the terms to continue.";
    default:
      return null;
  }
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const user = await getCurrentUser();
  const resolvedSearchParams = await searchParams;
  const nextPath = normalizeNextPath(resolvedSearchParams.next);
  const errorMessage = getErrorMessage(resolvedSearchParams.error);

  if (user?.emailVerifiedAt) {
    redirect(nextPath);
  }

  return (
    <AuthLayout
      eyebrow="Registration"
      title="Create your account."
      description="Registration stays in the app domain so verification and password reset can evolve without coupling them to the session layer."
      aside={
        <div className="space-y-6 border-t border-[#e7dfd7] pt-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#9b8978]">
              Already registered
            </p>
            <p className="mt-3 text-sm leading-7 text-[#655b54]">
              Sign in once your email has been verified.
            </p>
          </div>

          <a
            href={`/sign-in?next=${encodeURIComponent(nextPath)}`}
            className="inline-flex h-11 items-center border border-[#201a17] px-5 text-sm text-[#201a17] transition hover:bg-[#201a17] hover:text-[#fffdf9]"
          >
            Go to sign in
          </a>
        </div>
      }
    >
      <form action="/auth/register" method="post" className="space-y-6">
        <input type="hidden" name="next" value={nextPath} />

        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#9b8978]">
            Sign up
          </p>
          <p className="text-sm leading-7 text-[#655b54]">
            We will only enable full account access after email verification.
          </p>
        </div>

        {errorMessage ? (
          <p className="border border-[#e7dfd7] bg-[#faf6f1] px-4 py-3 text-sm text-[#6e5e52]">
            {errorMessage}
          </p>
        ) : null}

        {resolvedSearchParams.status === "submitted" ? (
          <div className="space-y-3 border border-[#e7dfd7] bg-[#faf8f4] px-4 py-4 text-sm text-[#514740]">
            <p>
              If the details are valid, we will prepare your account and email a verification link.
            </p>
            {process.env.NODE_ENV !== "production" && resolvedSearchParams.preview ? (
              <p>
                Development preview:{" "}
                <a
                  href={resolvedSearchParams.preview}
                  className="underline underline-offset-4"
                >
                  open verification link
                </a>
              </p>
            ) : null}
          </div>
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

        <label className="block space-y-2">
          <span className="text-sm text-[#201a17]">Confirm password</span>
          <input
            type="password"
            name="passwordConfirm"
            required
            className="h-12 w-full border border-[#d9d0c8] bg-transparent px-4 text-sm text-[#201a17] outline-none transition focus:border-[#201a17]"
          />
        </label>

        <label className="flex items-start gap-3 text-sm leading-7 text-[#655b54]">
          <input
            type="checkbox"
            name="termsAccepted"
            value="true"
            className="mt-1 h-4 w-4 border border-[#d9d0c8]"
          />
          <span>I accept the store terms and the account privacy policy.</span>
        </label>

        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center bg-[#201a17] px-6 text-sm text-[#fffdf9] transition hover:bg-[#3a2f29]"
        >
          Create account
        </button>
      </form>
    </AuthLayout>
  );
}
