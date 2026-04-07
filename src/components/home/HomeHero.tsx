import Link from "next/link";
import { Gem, Leaf, Shield, Sparkles, Star } from "lucide-react";

const BOTTOM_VALUES = [
  { Icon: Sparkles, label: "KÉZZEL ALKOTVA" },
  { Icon: Gem, label: "FÉLDRÁGAKÖVEK" },
  { Icon: Leaf, label: "ETIKUS BESZERZÉS" },
  { Icon: Star, label: "LIMITÁLT DARABOK" },
  { Icon: Shield, label: "MINŐSÉG GARANTÁLT" },
];

export function HomeHero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#2b1220] flex flex-col min-h-[80vh]">
      {/* Decorative background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* CSS orbs */}
        <div className="hero-orb-1" />
        <div className="hero-orb-2" />
        <div className="hero-orb-3" />

        {/* Outline circles */}
        <div className="absolute top-[15%] right-[8%] h-[160px] w-[160px] rounded-full border border-white/10" />
        <div className="absolute top-[45%] left-[5%] h-[80px] w-[80px] rounded-full border border-white/10" />
        <div className="absolute bottom-[20%] right-[15%] h-[120px] w-[120px] rounded-full border border-white/10" />

        {/* Sparkle characters */}
        <span className="absolute top-[10%] left-[15%] select-none text-2xl text-rose-400/30">✦</span>
        <span className="absolute top-[25%] right-[20%] select-none text-4xl text-white/15">✦</span>
        <span className="absolute bottom-[30%] left-[25%] select-none text-lg text-rose-400/25">✦</span>
        <span className="absolute top-[60%] right-[8%] select-none text-3xl text-white/10">✦</span>
        <span className="absolute bottom-[15%] left-[8%] select-none text-xl text-rose-300/20">✦</span>

        {/* Subtle wave at bottom */}
        <div className="absolute bottom-16 left-0 w-full overflow-hidden opacity-10">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full"
          >
            <path d="M0 30C360 60 1080 0 1440 30V60H0V30Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          {/* Eyebrow pill */}
          <div className="mb-8 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-5 py-2">
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "0.32em",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              ✦ Kézzel alkotva · Féldrágakövekből
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-[family:var(--font-display)] leading-[1.05] tracking-[-0.03em] text-white"
            style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}
          >
            Ékszerek,
            <br />
            amelyek
            <br />
            <span style={{ color: "#e07a70" }}>mesélnek.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="mx-auto mt-4 text-sm leading-[1.9] text-white/60"
            style={{ maxWidth: "38ch" }}
          >
            Minden kő más. Minden darab egyedi.
            <br />
            Minden Bubus ékszer egy apró történet, amelyet te viselsz.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/new-in"
              className="inline-flex items-center rounded-full px-7 py-3.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(196,90,133,.5)]"
              style={{
                background: "linear-gradient(135deg, #c45a85, #e07a70)",
                boxShadow: "0 8px 32px rgba(196,90,133,.4)",
              }}
            >
              Kollekciók böngészése
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-full border border-white/25 px-7 py-3.5 text-sm text-white/80 transition hover:bg-white/10"
            >
              Rólunk
            </Link>
          </div>

          {/* Floating stone chips */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <span
              className="rounded-full border border-rose-400/30 bg-white/10 px-4 py-2 text-xs text-white/70"
              style={{ transform: "rotate(-2deg)" }}
            >
              Rózsakvarc
            </span>
            <span
              className="rounded-full bg-rose-500/20 px-4 py-2 text-xs text-white/70"
              style={{ transform: "rotate(1deg)" }}
            >
              Ametiszt
            </span>
            <span
              className="rounded-full px-4 py-2 text-xs text-white/70"
              style={{
                background: "rgba(245,158,11,0.15)",
                transform: "rotate(-1deg)",
              }}
            >
              Citrin
            </span>
          </div>
        </div>
      </div>

      {/* Bottom value strip */}
      <div className="relative z-10 border-t border-white/10 py-6 px-8">
        <div className="flex flex-wrap justify-center gap-10">
          {BOTTOM_VALUES.map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-rose-300" strokeWidth={1.5} />
              <span
                className="uppercase text-white/60"
                style={{ fontSize: "9px", letterSpacing: "0.28em" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
