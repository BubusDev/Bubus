import type { ReactNode } from "react";

import { AtmosphereVisual } from "@/components/AtmosphereVisual";

type EarlyAccessGatePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  email?: string | null;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
};

export function EarlyAccessGatePage({
  eyebrow,
  title,
  description,
  email,
  primaryAction,
  secondaryAction,
}: EarlyAccessGatePageProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#fce4ec_0%,#fdf2f8_50%,#f8d7ea_100%)] text-[#3d1a2e]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] items-stretch px-6 py-8 sm:px-10 lg:px-14 lg:py-0">
        <section className="relative grid min-h-[calc(100vh-4rem)] w-full items-center gap-12 lg:min-h-screen lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-6">
          <div className="relative z-10 mx-auto flex w-full max-w-[560px] flex-col justify-center py-10 text-center lg:mx-0 lg:py-16 lg:text-left">
            <p className="mb-12 font-serif text-sm uppercase tracking-[0.3em] text-rose-400/70">
              Chicks Jewelry
            </p>
            <h1 className="mb-8 font-serif text-[clamp(3rem,13vw,6rem)] font-light leading-[0.95] tracking-tight text-[#3d1a2e] lg:text-[clamp(3rem,8vw,7rem)]">
              {title}
            </h1>
            <p className="max-w-[420px] self-center text-base font-light leading-relaxed text-[#9d4e6e]/80 lg:self-auto">
              {description}
            </p>
            {email ? (
              <div className="mt-8 inline-flex max-w-full self-center rounded-full border border-white/50 bg-white/40 px-4 py-1.5 text-sm text-[#3d1a2e]/70 backdrop-blur-sm lg:self-auto">
                <span className="shrink-0">Fiók:</span>
                <span className="ml-2 truncate font-medium text-[#3d1a2e]">{email}</span>
              </div>
            ) : null}
            <div className="mt-8 flex w-full flex-col gap-3 sm:max-w-sm lg:max-w-none lg:flex-row lg:flex-wrap">
              {primaryAction}
              {secondaryAction}
            </div>
            <div className="mt-12 flex items-center justify-center gap-4 lg:justify-start">
              <div className="h-px w-8 bg-rose-300/50" />
              <span className="text-xs uppercase tracking-[0.2em] text-rose-400/60">{eyebrow}</span>
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
