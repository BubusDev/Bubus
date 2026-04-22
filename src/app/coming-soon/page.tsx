import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AtmosphereVisual } from "@/components/AtmosphereVisual";
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

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

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
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#fce4ec_0%,#fdf2f8_50%,#f8d7ea_100%)] text-[#3d1a2e]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] items-stretch px-6 py-8 sm:px-10 lg:px-14 lg:py-0">
        <section className="relative grid min-h-[calc(100vh-4rem)] w-full items-center gap-12 lg:min-h-screen lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-6">
          <div className="relative z-10 mx-auto flex w-full max-w-[560px] flex-col justify-center py-10 text-center lg:mx-0 lg:py-16 lg:text-left">
            <p className="mb-12 font-serif text-sm uppercase tracking-[0.3em] text-rose-400/70">
              Chicks Jewelry
            </p>
            <h1 className="mb-8 whitespace-nowrap font-serif text-[clamp(3rem,13vw,6rem)] font-light leading-[0.95] tracking-tight text-[#3d1a2e] lg:text-[clamp(3rem,8vw,7rem)]">
              Hamarosan
            </h1>
            <p className="mb-12 max-w-[280px] self-center text-base font-light leading-relaxed text-[#9d4e6e]/80 lg:self-auto">
              Valami szép készül.
            </p>
            <div className="flex w-full flex-col gap-3 sm:max-w-sm lg:max-w-none lg:flex-row lg:flex-wrap">
              <Link
                href={`/sign-in?next=${encodeURIComponent(nextPath)}`}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#3d1a2e] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#53253e] lg:w-auto"
              >
                Bejelentkezés
              </Link>
              <Link
                href="https://instagram.com/chicksjewelry"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-rose-300/50 px-6 py-3 text-sm font-medium text-[#7d4a62] transition hover:border-rose-400/60 hover:bg-white/20 lg:w-auto"
              >
                <InstagramIcon className="h-4 w-4" />
                <span>@chicksjewelry</span>
              </Link>
            </div>
            <div className="mt-16 flex items-center justify-center gap-4 lg:justify-start">
              <div className="h-px w-8 bg-rose-300/50" />
              <span className="text-xs uppercase tracking-[0.2em] text-rose-400/60">Pre-launch</span>
            </div>
          </div>

          <div className="absolute inset-x-0 top-20 bottom-0 lg:hidden">
            <AtmosphereVisual />
          </div>

          <div className="relative hidden h-full min-h-screen items-center justify-center lg:flex">
            <AtmosphereVisual />
          </div>
        </section>
      </div>
    </main>
  );
}
