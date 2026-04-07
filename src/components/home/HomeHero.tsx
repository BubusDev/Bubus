import Link from "next/link";
import { ArrowRight, Gem } from "lucide-react";

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
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-white/60 px-5 py-2 backdrop-blur-sm">
            <span className="text-[#e07a9e]">✦</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#c0517a]">
              Kézzel alkotva · Féldrágakövekből
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
          <p className="mt-5 max-w-[36ch] mx-auto text-center text-[15px] leading-[1.85] text-[#8a6272]">
            Féldrágakövekből készült, egyedi kézműves ékszerek —
            minden darab Borbolya kézjegyével, szeretettel alkotva.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-4">
            {/* Primary CTA */}
            <Link
              href="/new-in"
              className="inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm font-medium text-white transition hover:opacity-90 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #c45a85, #e07a70)",
                boxShadow: "0 8px 32px rgba(196,90,133,.35)",
              }}
            >
              <Gem className="h-4 w-4" />
              Kollekciók felfedezése
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Secondary text links */}
            <div className="flex items-center gap-6 text-[13px] text-[#9a7080]">
              <Link href="/about" className="flex items-center gap-1.5 transition hover:text-[#c45a85]">
                <span>Rólunk</span>
              </Link>
              <span className="text-[#e0c8d4]">·</span>
              <Link href="/contact" className="flex items-center gap-1.5 transition hover:text-[#c45a85]">
                <span>Kapcsolat</span>
              </Link>
              <span className="text-[#e0c8d4]">·</span>
              <Link href="/faq" className="flex items-center gap-1.5 transition hover:text-[#c45a85]">
                <span>GYIK</span>
              </Link>
            </div>
          </div>

          {/* Trust stats */}
          <div className="mt-14 flex items-center justify-center gap-10 border-t border-[#f5e2eb] pt-8">
            <div className="text-center">
              <p className="font-[family:var(--font-display)] text-2xl font-medium text-[#4d2741]">100%</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#b08898]">Kézműves</p>
            </div>
            <div className="h-8 w-px bg-[#f0d4e0]" />
            <div className="text-center">
              <p className="font-[family:var(--font-display)] text-2xl font-medium text-[#4d2741]">Egyedi</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#b08898]">Minden darab</p>
            </div>
            <div className="h-8 w-px bg-[#f0d4e0]" />
            <div className="text-center">
              <p className="font-[family:var(--font-display)] text-2xl font-medium text-[#4d2741]">Etikus</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#b08898]">Alapanyagok</p>
            </div>
            <div className="h-8 w-px bg-[#f0d4e0]" />
            <div className="text-center">
              <p className="font-[family:var(--font-display)] text-2xl font-medium text-[#4d2741]">♡</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#b08898]">Szeretettel alkotva</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
