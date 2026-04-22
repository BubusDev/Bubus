import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EarlyAccessGatePage } from "@/components/early-access/EarlyAccessGatePage";
import { getCurrentUser } from "@/lib/auth";

const EARLY_ACCESS_MODE = process.env.EARLY_ACCESS_MODE === "true";

export const metadata: Metadata = {
  title: "Hozzáférés folyamatban — Chicks Jewelry",
  description: "Korai hozzáférés jóváhagyására váró Chicks Jewelry fiók.",
  robots: { index: false, follow: false },
};

type EarlyAccessPendingPageProps = {
  searchParams: Promise<{ next?: string }>;
};

function normalizeNextPath(nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/";
  }

  return nextPath;
}

export default async function EarlyAccessPendingPage({
  searchParams,
}: EarlyAccessPendingPageProps) {
  const user = await getCurrentUser();
  const resolvedSearchParams = await searchParams;
  const nextPath = normalizeNextPath(resolvedSearchParams.next);

  if (!EARLY_ACCESS_MODE) {
    redirect(nextPath);
  }

  if (!user) {
    redirect(`/coming-soon?next=${encodeURIComponent(nextPath)}`);
  }

  if (user.role === "ADMIN" || user.earlyAccess) {
    redirect(nextPath);
  }

  return (
    <EarlyAccessGatePage
      eyebrow="Korai hozzáférés"
      title="Köszönjük a regisztrációt!"
      description="Fiókod létrejött, hamarosan jóváhagyjuk a hozzáférésed. Értesítünk e-mailben."
      email={user.email}
      primaryAction={
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d95587] px-6 text-sm font-medium text-white transition hover:bg-[#c84d7c]"
          >
            Kijelentkezés
          </button>
        </form>
      }
    />
  );
}
