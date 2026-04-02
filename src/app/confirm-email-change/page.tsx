import Link from "next/link";

import { confirmEmailChangeToken } from "@/lib/auth/email-change";

type ConfirmEmailChangePageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

function getContent(status: "success" | "invalid" | "expired" | "already-used" | "email-taken") {
  switch (status) {
    case "success":
      return {
        title: "Email updated.",
        description: "Your account email has been changed successfully.",
      };
    case "expired":
      return {
        title: "This email-change link has expired.",
        description: "Request another email change from your account page.",
      };
    case "already-used":
      return {
        title: "This link was already used.",
        description: "If the change already completed, your account now uses the new address.",
      };
    case "email-taken":
      return {
        title: "That new email can no longer be used.",
        description: "Someone else is already using it. Start a new email change request.",
      };
    default:
      return {
        title: "This email-change link is not valid.",
        description: "Check the URL or request a fresh email change from your account page.",
      };
  }
}

export default async function ConfirmEmailChangePage({
  searchParams,
}: ConfirmEmailChangePageProps) {
  const resolvedSearchParams = await searchParams;
  const status = resolvedSearchParams.token
    ? await confirmEmailChangeToken(resolvedSearchParams.token)
    : "invalid";
  const content = getContent(status);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-[760px] items-center px-6 py-16">
      <section className="w-full border border-[#e7dfd7] bg-[#fffdf9] px-8 py-10 sm:px-12 sm:py-14">
        <p className="text-[11px] uppercase tracking-[0.34em] text-[#9b8978]">
          Email change
        </p>
        <h1 className="mt-6 font-[family:var(--font-display)] text-[3rem] leading-[0.96] tracking-[-0.05em] text-[#201a17] sm:text-[3.8rem]">
          {content.title}
        </h1>
        <p className="mt-6 max-w-[34rem] text-[15px] leading-8 text-[#655b54]">
          {content.description}
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/account"
            className="inline-flex h-11 items-center bg-[#201a17] px-5 text-sm text-[#fffdf9] transition hover:bg-[#3a2f29]"
          >
            Back to account
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex h-11 items-center border border-[#201a17] px-5 text-sm text-[#201a17] transition hover:bg-[#201a17] hover:text-[#fffdf9]"
          >
            Go to sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
