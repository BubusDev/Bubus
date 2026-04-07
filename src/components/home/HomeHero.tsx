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
    <section
      className="relative w-full overflow-hidden flex flex-col min-h-[80vh]"
      style={{
        background: "linear-gradient(160deg, #fff5f8 0%, #fdf0f5 40%, #fef6ee 100%)",
      }}
    >
      {/* Decorative background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* CSS orbs */}
        <div className="hero-orb-1" />
        <div className="hero-orb-2" />
        <div className="hero-orb-3" />

        {/* Outline circles */}
        <div className="absolute top-[15%] right-[8%] h-[160px] w-[160px] rounded-full border border-[#e8c0d4]/30" />
        <div className="absolute top-[45%] left-[5%] h-[80px] w-[80px] rounded-full border border-[#e8c0d4]/30" />
        <div className="absolute bottom-[20%] right-[15%] h-[120px] w-[120px] rounded-full border border-[#e8c0d4]/30" />

        {/* Sparkle characters */}
        <span className="absolute top-[10%] left-[15%] select-none text-2xl text-[#e0a0c0]/40">✦</span>
        <span className="absolute top-[25%] right-[20%] select-none text-4xl text-[#e0a0c0]/40">✦</span>
        <span className="absolute bottom-[30%] left-[25%] select-none text-lg text-[#e0a0c0]/40">✦</span>
        <span className="absolute top-[60%] right-[8%] select-none text-3xl text-[#e0a0c0]/40">✦</span>
        <span className="absolute bottom-[15%] left-[8%] select-none text-xl text-[#e0a0c0]/40">✦</span>

        {/* Subtle wave at bottom */}
        <div className="absolute bottom-16 left-0 w-full overflow-hidden opacity-10">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full"
          >
            <path d="M0 30C360 60 1080 0 1440 30V60H0V30Z" fill="#c45a85" />
          </svg>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          {/* Eyebrow pill */}
          <div className="mb-8 inline-flex items-center rounded-full border border-rose-200/60 bg-white/80 px-5 py-2 backdrop-blur-sm">
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "0.32em",
                color: "#c0517a",
              }}
            >
              ✦ Kézzel alkotva · Féldrágakövekből
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-[family:var(--font-display)] leading-[1.05] tracking-[-0.03em]"
            style={{ fontSize: "clamp(3rem, 6vw, 5rem)", color: "#2b1220" }}
          >
            Ékszerek,
            <br />
            amelyek
            <br />
            <span style={{ color: "#c45a85" }}>mesélnek.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="mx-auto mt-4 text-sm leading-[1.9]"
            style={{ maxWidth: "38ch", color: "#7d5b75" }}
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
                boxShadow: "0 8px 32px rgba(196,90,133,.35)",
              }}
            >
              Kollekciók böngészése
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-full border border-[#e8c0d4] bg-white/70 px-7 py-3.5 text-sm text-[#6b425a] backdrop-blur-sm transition hover:bg-white/90"
            >
              Rólunk
            </Link>
          </div>

          {/* Floating stone chips */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <span
              className="rounded-full border border-rose-200/50 bg-white/80 px-4 py-2 text-xs text-[#7a5a6c] backdrop-blur-sm"
              style={{ transform: "rotate(-2deg)" }}
            >
              Rózsakvarc
            </span>
            <span
              className="rounded-full border border-rose-200/50 bg-white/80 px-4 py-2 text-xs text-[#7a5a6c] backdrop-blur-sm"
              style={{ transform: "rotate(1deg)" }}
            >
              Ametiszt
            </span>
            <span
              className="rounded-full border border-rose-200/50 bg-white/80 px-4 py-2 text-xs text-[#7a5a6c] backdrop-blur-sm"
              style={{ transform: "rotate(-1deg)" }}
            >
              Citrin
            </span>
          </div>
        </div>
      </div>

      {/* Bottom value strip */}
      <div className="relative z-10 border-t border-[#f5e2eb] bg-white/40 py-6 px-8 backdrop-blur-sm">
        <div className="flex flex-wrap justify-center gap-10">
          {BOTTOM_VALUES.map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-[#c45a85]" strokeWidth={1.5} />
              <span
                className="uppercase text-[#9a7080]"
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
