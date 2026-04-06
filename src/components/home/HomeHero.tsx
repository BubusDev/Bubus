import Link from "next/link";
import { Sparkles, ArrowDown } from "lucide-react";

const navLinks = [
  { href: "/contact", label: "Lépj velünk kapcsolatba" },
  { href: "/privacy", label: "Adatkezelési tájékoztató" },
  { href: "/cookies", label: "Cookie Irányelv" },
  { href: "/terms", label: "ÁSZF" },
  { href: "/faq", label: "GYIK" },
  { href: "/about", label: "Rólunk" },
];

export function HomeHero() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Main hero content */}
      <div className="flex flex-1 items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
          {/* Left: text content */}
          <div className="space-y-8">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#b06b8e] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Kézzel alkotva · Féldrágakövekből
            </div>

            {/* Heading */}
            <h1
              className="font-[family:var(--font-display)] leading-[0.9] tracking-[-0.04em] text-[#4d2741]"
              style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
            >
              Ékszerek,
              <br />
              amelyek{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #c45a85 0%, #e07a70 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                mesélnek.
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-[#7a5a6c]"
              style={{ maxWidth: "44ch", lineHeight: "1.9" }}
            >
              Minden kő más. Minden darab egyedi. Minden Bubus ékszer egy apró történet, amelyet te
              viselsz.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/new-in"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#c45a85,#e07a70)] px-7 py-3.5 text-sm font-medium text-white shadow-[0_18px_38px_rgba(196,90,133,0.3)] transition hover:-translate-y-[1px] hover:shadow-[0_22px_44px_rgba(196,90,133,0.36)]"
              >
                Kollekció böngészése
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-full border border-[#edd1e1] bg-white/80 px-7 py-3.5 text-sm font-medium text-[#6b425a] backdrop-blur-sm transition hover:border-[#e9b6d0] hover:bg-white"
              >
                Rólunk
              </Link>
            </div>
          </div>

          {/* Right: floating cards (desktop) */}
          <div className="hidden lg:block">
            <FloatingCards />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="flex justify-center pb-8">
        <ArrowDown
          className="h-5 w-5 animate-bounce text-[#c45a85]/60"
          strokeWidth={1.5}
        />
      </div>

      {/* Bottom nav strip */}
      <div className="border-t border-rose-100/50 bg-white/30 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-1 gap-y-1 px-4 py-3 sm:px-6 lg:px-8">
          {navLinks.map(({ href, label }, i) => (
            <span key={href} className="flex items-center">
              <Link
                href={href}
                className="rounded-full px-3 py-1.5 text-xs text-[#9b7a8b] transition hover:bg-white/60 hover:text-[#4d2741]"
              >
                {label}
              </Link>
              {i < navLinks.length - 1 && (
                <span className="text-[#e4c8d6] text-xs">·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FloatingCards() {
  const cards = [
    {
      label: "Rózsakvarc karkötő",
      stone: "Rose Quartz",
      rotate: "-6deg",
      translateY: "0px",
      bg: "linear-gradient(145deg, #fff0f7, #fcdeed)",
    },
    {
      label: "Holdkő nyaklánc",
      stone: "Moonstone",
      rotate: "4deg",
      translateY: "-24px",
      bg: "linear-gradient(145deg, #f8f4ff, #eadff5)",
    },
    {
      label: "Ametiszt gyűrű",
      stone: "Amethyst",
      rotate: "-3deg",
      translateY: "16px",
      bg: "linear-gradient(145deg, #fff7f0, #fde8d6)",
    },
  ];

  return (
    <div className="relative h-[340px] w-[280px]">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="absolute overflow-hidden rounded-[1.6rem] border border-white/75 shadow-[0_20px_48px_rgba(198,129,167,0.16)] backdrop-blur-xl"
          style={{
            background: card.bg,
            transform: `rotate(${card.rotate}) translateY(${card.translateY})`,
            left: `${i * 20}px`,
            top: `${i * 30}px`,
            width: "180px",
            zIndex: cards.length - i,
          }}
        >
          <div className="h-28 w-full bg-gradient-to-br from-[#f8e8f2] to-[#e8d0e8]" />
          <div className="p-3">
            <p className="text-xs font-medium text-[#4d2741]">{card.label}</p>
            <p className="mt-0.5 text-[10px] text-[#b08898]">{card.stone}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
