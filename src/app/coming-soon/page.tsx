import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

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

function AtmosphereVisual() {
  return (
    <div className="relative flex h-full min-h-[400px] w-full items-center justify-center lg:min-h-[560px]">
      <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-rose-300/20 blur-[90px]" />
      <div className="absolute bottom-8 left-8 h-64 w-64 rounded-full bg-pink-200/30 blur-[80px]" />
      <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-rose-300/40" />
      <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-rose-200/30" />
      <svg
        viewBox="0 0 520 520"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="coming-soon-glow-1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e9a7be" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#e9a7be" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="coming-soon-glow-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f7ccd8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f7ccd8" stopOpacity="0" />
          </radialGradient>
          <filter id="coming-soon-blur">
            <feGaussianBlur stdDeviation="36" />
          </filter>
        </defs>
        <g filter="url(#coming-soon-blur)">
          <circle cx="390" cy="130" r="110" fill="url(#coming-soon-glow-1)" />
          <circle cx="170" cy="360" r="90" fill="url(#coming-soon-glow-2)" />
        </g>
        <circle cx="280" cy="250" r="118" fill="none" stroke="rgba(184, 117, 145, 0.25)" />
        <circle cx="280" cy="250" r="82" fill="none" stroke="rgba(227, 178, 196, 0.24)" />
      </svg>
      <span className="pointer-events-none select-none font-serif text-[140px] font-thin leading-none text-rose-300/15 sm:text-[180px] lg:text-[220px]">
        C
      </span>
    </div>
  );
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
            <h1 className="mb-8 font-serif text-[clamp(3.5rem,15vw,6rem)] font-light leading-[0.95] tracking-tight text-[#3d1a2e] lg:text-[clamp(3rem,8vw,7rem)]">
              Hamar
              <br />
              osan
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
