import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { EarlyAccessGatePage } from "@/components/early-access/EarlyAccessGatePage";
import { getCurrentUser } from "@/lib/auth";

const EARLY_ACCESS_MODE = process.env.EARLY_ACCESS_MODE === "true";

export const metadata: Metadata = {
  title: "Hamarosan — Chicks Jewelry",
  description: "Korai hozzáférésű indulás előtt álló Chicks Jewelry webshop.",
  robots: { index: false, follow: false },
};

type ComingSoonPageProps = {
  searchParams: Promise<{ next?: string }>;
};

function normalizeNextPath(nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/";
  }

  return nextPath;
}

export default async function ComingSoonPage({ searchParams }: ComingSoonPageProps) {
  const user = await getCurrentUser();
  const resolvedSearchParams = await searchParams;
  const nextPath = normalizeNextPath(resolvedSearchParams.next);

  if (!EARLY_ACCESS_MODE) {
    redirect(nextPath);
  }

  if (user?.role === "ADMIN" || user?.earlyAccess) {
    redirect(nextPath);
  }

  if (user) {
    redirect(`/early-access-pending?next=${encodeURIComponent(nextPath)}`);
  }

  return (
    <EarlyAccessGatePage
      eyebrow="Pre-launch"
      title="Hamarosan"
      description="Valami szép készül. Rövidesen visszatérünk."
      primaryAction={
        <Link
          href={`/sign-in?next=${encodeURIComponent(nextPath)}`}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d95587] px-6 text-sm font-medium text-white transition hover:bg-[#c84d7c]"
        >
          Bejelentkezés
        </Link>
      }
      secondaryAction={
        <Link
          href="https://instagram.com/chicksjewelry"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#e8cbd6] bg-white/70 px-6 text-sm font-medium text-[#7b5567] transition hover:bg-white"
        >
          Instagram
        </Link>
      }
    />
  );
}
