import Link from "next/link";
import type { ReactNode } from "react";

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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_rgba(255,240,246,0.96)_40%,_#f9dbe6_100%)] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-8 shadow-[0_30px_80px_rgba(196,90,133,0.18)] backdrop-blur-xl sm:p-12">
          <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(255,255,255,0))]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-xl">
              <p className="text-[10px] uppercase tracking-[0.42em] text-[#b67f97]">{eyebrow}</p>
              <p className="mt-4 font-[family:var(--font-display)] text-4xl font-medium tracking-[-0.04em] text-[#4d2741] sm:text-6xl">
                Chicks Jewelry
              </p>
              <h1 className="mt-6 font-[family:var(--font-display)] text-5xl leading-none tracking-[-0.05em] text-[#2f1a27] sm:text-7xl">
                {title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-[#6f4b5d] sm:text-lg">
                {description}
              </p>
              {email ? (
                <div className="mt-6 inline-flex items-center rounded-full border border-[#edd1dc] bg-[#fff7fa] px-4 py-2 text-sm text-[#8d5c72]">
                  Fiók: <span className="ml-2 font-medium text-[#4d2741]">{email}</span>
                </div>
              ) : null}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {primaryAction}
                {secondaryAction}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-10 top-8 h-32 w-32 rounded-full bg-[#f2c2d2]/50 blur-3xl" />
              <div className="absolute -bottom-4 right-0 h-36 w-36 rounded-full bg-[#ffdfe9]/60 blur-3xl" />
              <div className="relative rounded-[2rem] border border-[#f1d7e1] bg-[linear-gradient(180deg,_rgba(255,250,252,0.96),_rgba(253,241,246,0.96))] p-6">
                <div className="rounded-[1.5rem] border border-[#f3d8e3] bg-white/80 p-6">
                  <p className="text-[10px] uppercase tracking-[0.38em] text-[#b67f97]">Korai hozzáférés</p>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-[1.25rem] border border-[#f1d7e1] bg-[#fff8fb] p-4">
                      <p className="font-[family:var(--font-display)] text-2xl text-[#4d2741]">Lágy indulás</p>
                      <p className="mt-2 text-sm leading-7 text-[#7b5a69]">
                        Jelenleg meghívásos hozzáféréssel érhető el a teljes webshop. A kezdőlap nyilvános, a többi oldal jóváhagyást követően nyílik meg.
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-[#f1d7e1] bg-white p-4">
                      <p className="text-sm leading-7 text-[#7b5a69]">
                        Friss hírekért és kulisszák mögötti pillanatokért kövess minket Instagramon.
                      </p>
                      <Link
                        href="https://instagram.com/chicksjewelry"
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-sm font-medium text-[#c45a85] underline underline-offset-4"
                      >
                        @chicksjewelry
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
