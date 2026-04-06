import Link from "next/link";
import { Gem, Heart, Leaf, ShoppingBag, Shield, Sparkles, Star } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Főoldal", active: true },
  { href: "/about", label: "Rólunk" },
  { href: "/contact", label: "Kapcsolat" },
  { href: "/gyik", label: "GYIK" },
];

const BOTTOM_VALUES = [
  { Icon: Sparkles, label: "KÉZZEL ALKOTVA" },
  { Icon: Gem, label: "FÉLDRÁGAKÖVEK" },
  { Icon: Leaf, label: "ETIKUS BESZERZÉS" },
  { Icon: Star, label: "LIMITÁLT DARABOK" },
  { Icon: Shield, label: "MINŐSÉG GARANTÁLT" },
];

export function HomeHero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#2b1220]">
      {/* Dark blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-40 h-[700px] w-[700px] rounded-full"
          style={{ background: "#c45a85", filter: "blur(80px)", opacity: 0.18 }}
        />
        <div
          className="absolute top-1/4 -right-48 h-[600px] w-[600px] rounded-full"
          style={{ background: "#e07a70", filter: "blur(80px)", opacity: 0.18 }}
        />
      </div>

      {/* Inner nav bar */}
      <nav className="relative z-10 flex items-center justify-between py-3 px-8 bg-[#2b1220]/80">
        {/* Logo */}
        <span
          className="font-[family:var(--font-display)] text-[1.3rem] font-semibold"
          style={{
            background: "linear-gradient(135deg, #c45a85, #e07a70)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Bubus
        </span>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, active }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm text-white px-4 py-1 rounded-full transition-colors ${
                active ? "bg-white/15" : "hover:bg-white/10"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <ShoppingBag className="w-5 h-5 text-white" strokeWidth={1.5} />
          <Heart className="w-5 h-5 text-white" strokeWidth={1.5} />
        </div>
      </nav>

      {/* Main body */}
      <div
        className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 items-center px-8 lg:px-16 py-16 lg:py-20"
        style={{ minHeight: "70vh" }}
      >
        {/* Left: text */}
        <div className="space-y-6">
          <p className="text-rose-400 text-[10px] tracking-widest font-semibold uppercase">
            ✦ KÉZZEL ALKOTVA · FÉLDRÁGAKÖVEKBŐL
          </p>

          <h1
            className="font-[family:var(--font-display)] text-white leading-[0.95] tracking-[-0.03em]"
            style={{ fontSize: "clamp(2.8rem, 5vw, 4.5rem)" }}
          >
            Ékszerek,
            <br />
            amelyek
            <br />
            <span style={{ color: "#e07a70" }}>mesélnek.</span>
          </h1>

          <p
            className="text-white/65 text-sm leading-[1.9]"
            style={{ maxWidth: "38ch" }}
          >
            Minden kő más. Minden darab egyedi. Minden Bubus ékszer egy apró történet, amelyet te viselsz.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/new-in"
              className="inline-flex items-center rounded-full px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-[1px]"
              style={{ background: "linear-gradient(135deg, #c45a85, #e07a70)" }}
            >
              Kollekciók böngészése
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
            >
              Rólunk
            </Link>
          </div>
        </div>

        {/* Right: floating cards */}
        <div className="hidden lg:flex items-center justify-center">
          <DarkFloatingCards />
        </div>
      </div>

      {/* Bottom value strip */}
      <div className="relative z-10 border-t border-white/10 py-6 px-8">
        <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
          {BOTTOM_VALUES.map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-white/70">
              <Icon className="w-4 h-4 text-white/80" strokeWidth={1.5} />
              <span className="text-[10px] font-semibold tracking-[0.28em] whitespace-nowrap">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DarkFloatingCards() {
  const cards = [
    {
      label: "Rózsakvarc karkötő",
      stone: "Rose Quartz",
      wrapperStyle: {
        transform: "rotate(-4deg) translateY(-10px)",
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.15)",
        zIndex: 1,
        left: "0px",
        top: "0px",
      },
    },
    {
      label: "Holdkő nyaklánc",
      stone: "Moonstone",
      wrapperStyle: {
        transform: "rotate(2deg) translateY(10px)",
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.15)",
        zIndex: 2,
        left: "50px",
        top: "30px",
      },
    },
  ];

  return (
    <div className="relative h-[380px] w-[320px]">
      {cards.map((card) => (
        <div
          key={card.label}
          className="absolute rounded-[1.5rem] overflow-hidden"
          style={{
            ...card.wrapperStyle,
            width: "200px",
            padding: "16px",
          }}
        >
          <div
            className="w-full rounded-xl"
            style={{ aspectRatio: "3/4", background: "rgba(196,90,133,0.3)" }}
          />
          <div className="mt-3">
            <p className="text-sm font-medium text-white">{card.label}</p>
            <p className="mt-0.5 text-xs text-white/60">{card.stone}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
