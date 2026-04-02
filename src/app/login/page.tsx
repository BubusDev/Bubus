import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type LoginPageProps = {
  searchParams: Promise<{
    mode?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath =
    resolvedSearchParams.next && resolvedSearchParams.next.startsWith("/")
      ? resolvedSearchParams.next
      : "/account";

  redirect(
    resolvedSearchParams.mode === "register"
      ? `/sign-up?next=${encodeURIComponent(nextPath)}`
      : `/sign-in?next=${encodeURIComponent(nextPath)}`,
  );
}
