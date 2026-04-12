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

function ArrowIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

const BUBBLE_SPECS = [
  { size: 7, delay: "0s",   duration: "2s"   },
  { size: 5, delay: "0.4s", duration: "1.8s" },
  { size: 9, delay: "0.8s", duration: "2.2s" },
  { size: 4, delay: "1.2s", duration: "1.6s" },
  { size: 6, delay: "0.2s", duration: "2.4s" },
] as const;

function Bubbles() {
  return (
    <span
      style={{ display: "flex", alignItems: "flex-end", height: 22, gap: 3 }}
      aria-hidden="true"
    >
      {BUBBLE_SPECS.map((b, i) => (
        <span
          key={i}
          style={{
            width:  b.size,
            height: b.size,
            borderRadius: "50%",
            background: "rgba(236, 72, 153, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            animation: `rise ${b.duration} ${b.delay} infinite ease-out`,
            flexShrink: 0,
          }}
        />
      ))}
    </span>
  );
}

/* AR aesthetic: thin crosshair accent (CSS only, no images) */
function Crosshair({ className }: { className?: string }) {
  return (
    <span className={`relative inline-flex h-3.5 w-3.5 flex-shrink-0 ${className ?? ""}`} aria-hidden="true">
      <span className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-current opacity-50" />
      <span className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-current opacity-50" />
      <span className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current opacity-80" />
    </span>
  );
}

/* AR aesthetic: corner bracket accents inside each tile */
function CornerBrackets() {
  return (
    <>
      <span className="pointer-events-none absolute top-2.5 left-2.5 h-3.5 w-3.5 border-t border-l border-white/50" />
      <span className="pointer-events-none absolute top-2.5 right-2.5 h-3.5 w-3.5 border-t border-r border-white/50" />
      <span className="pointer-events-none absolute bottom-2.5 left-2.5 h-3.5 w-3.5 border-b border-l border-white/50" />
      <span className="pointer-events-none absolute bottom-2.5 right-2.5 h-3.5 w-3.5 border-b border-r border-white/50" />
    </>
  );
}

/* Decorative SVG jewelry motifs inside each tile */
function TileMotif({ variant }: { variant: number }) {
  if (variant === 0) {
    return (
      <svg viewBox="0 0 80 80" className="absolute inset-0 m-auto h-16 w-16 opacity-25 transition-opacity duration-500 group-hover:opacity-45">
        <circle cx="40" cy="40" r="22" stroke="#c45a85" strokeWidth="1" fill="none" />
        <circle cx="40" cy="18" r="6" stroke="#c45a85" strokeWidth="1" fill="none" />
        <circle cx="40" cy="18" r="3" fill="#c45a85" opacity="0.6" />
      </svg>
    );
  }
  if (variant === 1) {
    return (
      <svg viewBox="0 0 80 80" className="absolute inset-0 m-auto h-16 w-16 opacity-25 transition-opacity duration-500 group-hover:opacity-45">
        <ellipse cx="40" cy="40" rx="28" ry="14" stroke="#b87a50" strokeWidth="1" fill="none" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const r = Math.PI / 180;
          const x = 40 + 28 * Math.cos(deg * r);
          const y = 40 + 14 * Math.sin(deg * r);
          return <circle key={deg} cx={x} cy={y} r="2.5" fill="#b87a50" opacity="0.7" />;
        })}
      </svg>
    );
  }
  if (variant === 2) {
    return (
      <svg viewBox="0 0 80 80" className="absolute inset-0 m-auto h-16 w-16 opacity-25 transition-opacity duration-500 group-hover:opacity-45">
        <polygon points="40,12 52,32 40,38 28,32" stroke="#8b6cb5" strokeWidth="1" fill="none" />
        <polygon points="40,38 52,44 40,64 28,44" stroke="#8b6cb5" strokeWidth="1" fill="none" />
        <circle cx="40" cy="38" r="4" fill="#8b6cb5" opacity="0.6" />
        <circle cx="52" cy="38" r="3" fill="#8b6cb5" opacity="0.4" />
        <circle cx="28" cy="38" r="3" fill="#8b6cb5" opacity="0.4" />
      </svg>
    );
  }
  if (variant === 3) {
    return (
      <svg viewBox="0 0 80 80" className="absolute inset-0 m-auto h-16 w-16 opacity-25 transition-opacity duration-500 group-hover:opacity-45">
        <circle cx="40" cy="20" r="5" stroke="#c45a85" strokeWidth="1" fill="none" />
        <line x1="40" y1="25" x2="40" y2="38" stroke="#c45a85" strokeWidth="1" />
        <ellipse cx="40" cy="52" rx="9" ry="14" stroke="#c45a85" strokeWidth="1" fill="none" />
        <ellipse cx="40" cy="52" rx="4" ry="6" fill="#c45a85" opacity="0.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 80" className="absolute inset-0 m-auto h-16 w-16 opacity-25 transition-opacity duration-500 group-hover:opacity-45">
      <path d="M20 20 Q40 28 60 20" stroke="#b08898" strokeWidth="1" fill="none" />
      <line x1="40" y1="28" x2="40" y2="44" stroke="#b08898" strokeWidth="1" />
      <circle cx="40" cy="52" r="10" stroke="#b08898" strokeWidth="1" fill="none" />
      <circle cx="40" cy="52" r="5" fill="#b08898" opacity="0.5" />
    </svg>
  );
}

const POSTS: {
  label: string;
  variant: number;
  from: string;
  to: string;
}[] = [
  { label: "#chicksjewelry", variant: 0, from: "#fce8f0", to: "#fdf3f8" },
  { label: "#karkötő",        variant: 1, from: "#fdf3e8", to: "#fef8f2" },
  { label: "#féldrágakő",     variant: 2, from: "#ece8f8", to: "#f4f0fc" },
  { label: "#fülbevaló",      variant: 3, from: "#fce8f2", to: "#fdf5f9" },
  { label: "#nyaklánc",       variant: 4, from: "#e8f8f2", to: "#f0faf6" },
];

export function InstagramBanner() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <style>{`
        @keyframes rise {
          0%   { transform: translateY(0) scale(1);      opacity: 0.7; }
          50%  { transform: translateY(-8px) scale(1.1); opacity: 1;   }
          100% { transform: translateY(-16px) scale(0.6); opacity: 0;  }
        }
      `}</style>
      {/* ── Layered depth planes (AR / glassmorphism backdrop) ── */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#fdf6f8] via-[#faf2f6] to-[#fef0f8]" />
      <div className="pointer-events-none absolute -top-48 -left-48 h-[560px] w-[560px] rounded-full bg-[#f9d4e6]/50 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[440px] w-[440px] rounded-full bg-[#e4d4f8]/35 blur-[80px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[280px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-[70px]" />

      <div className="relative mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-8">

        {/* ── Top rule with AR crosshair accents ── */}
        <div className="mb-14 flex items-center gap-5">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8d0da] to-[#e8d0da]" />
          <div className="flex items-center gap-2.5 text-[#b08898]">
            <Crosshair className="text-[#c45a85]" />
            <InstagramIcon className="h-3.5 w-3.5" />
            <span className="text-[9px] uppercase tracking-[0.46em] font-light">Instagram</span>
            <Crosshair className="text-[#c45a85]" />
          </div>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#e8d0da] to-[#e8d0da]" />
        </div>

        {/* ── Main layout: heading + stats ── */}
        <div className="grid items-end gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">

          {/* Left: editorial heading */}
          <div className="max-w-2xl">
            <p className="mb-4 text-[10px] font-thin uppercase tracking-[0.48em] text-[#b08898]">
              Kövess minket
            </p>
            <h3
              className="font-[family:var(--font-display)] font-normal leading-[1.08] tracking-[-0.025em] text-[#2e1a28]"
              style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)" }}
            >
              @chicksjewelry
              <br />
              <span className="text-[#c45a85]">az Instagramon</span>
            </h3>
            <p className="mt-6 max-w-[52ch] text-[13.5px] font-extralight leading-[2] text-[#9a7080]">
              Párosítási ötletek karkötőkhöz, előzetes betekintés az új
              kollekciókba és exkluzív kampányok — elsőként értesülj mindenről.
            </p>

            {/* ── CTA ── */}
            <div className="relative mt-9 inline-block">

              <a
                href="https://instagram.com/chicksjewelry"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3.5
                           rounded-full
                           bg-[#2e1a28]/88 backdrop-blur-sm
                           border border-white/10
                           shadow-[0_0_0_1px_rgba(196,90,133,0.18),inset_0_1px_0_rgba(255,255,255,0.09)]
                           px-7 py-3.5
                           text-[11px] uppercase tracking-[0.24em] text-white font-light
                           transition duration-300
                           hover:-translate-y-0.5
                           hover:bg-[#c45a85]
                           hover:shadow-[0_10px_28px_rgba(196,90,133,0.38),inset_0_1px_0_rgba(255,255,255,0.18)]
                           focus:outline-none focus:ring-2 focus:ring-[#c45a85] focus:ring-offset-2"
              >
                <InstagramIcon className="h-4 w-4" />
                Követés most
                <Bubbles />
                <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* Right: glass stats card */}
          <div className="hidden lg:block">
            <div
              className="relative rounded-2xl px-8 py-8
                         backdrop-blur-md
                         bg-white/28
                         border border-white/30
                         shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_32px_rgba(196,90,133,0.09)]"
            >
              <CornerBrackets />
              <div className="flex flex-col items-end gap-6">
                <div className="text-right">
                  <p className="font-[family:var(--font-display)] text-[2rem] text-[#2e1a28] leading-none">2.4K+</p>
                  <p className="mt-1.5 text-[9.5px] font-thin uppercase tracking-[0.34em] text-[#b08898]">Követő</p>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#e8d4de] to-transparent" />
                <div className="text-right">
                  <p className="font-[family:var(--font-display)] text-[2rem] text-[#2e1a28] leading-none">180+</p>
                  <p className="mt-1.5 text-[9.5px] font-thin uppercase tracking-[0.34em] text-[#b08898]">Poszt</p>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#e8d4de] to-transparent" />
                <div className="text-right">
                  <p className="font-[family:var(--font-display)] text-[2rem] text-[#2e1a28] leading-none">98%</p>
                  <p className="mt-1.5 text-[9.5px] font-thin uppercase tracking-[0.34em] text-[#b08898]">Pozitív visszajelzés</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Frosted-glass post grid ── */}
        <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {POSTS.map((post, i) => (
            <a
              key={i}
              href="https://instagram.com/chicksjewelry"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-2xl
                         backdrop-blur-[8px]
                         border border-white/28
                         shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_4px_18px_rgba(196,90,133,0.07)]
                         transition duration-500
                         hover:-translate-y-2
                         hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_22px_52px_rgba(196,90,133,0.24)]
                         hover:border-white/50"
              style={{
                background: `linear-gradient(140deg, ${post.from}aa 0%, ${post.to}77 100%)`,
              }}
            >
              {/* AR corner brackets */}
              <CornerBrackets />

              {/* Jewelry motif */}
              <TileMotif variant={post.variant} />

              {/* Soft inner glow layer */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-white/12" />

              {/* Hover overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#2e1a28]/0 transition-all duration-300 group-hover:bg-[#2e1a28]/28">
                <InstagramIcon className="h-6 w-6 translate-y-1 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" />
                <span className="text-[9px] font-light uppercase tracking-[0.26em] text-white/90 opacity-0 transition-all duration-300 delay-75 group-hover:opacity-100">
                  {post.label}
                </span>
              </div>

              {/* Bottom label — always visible */}
              <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5">
                <span className="inline-block rounded-full bg-white/45 backdrop-blur-sm border border-white/20 px-2.5 py-1 text-[8.5px] font-light uppercase tracking-[0.22em] text-[#6b3850]">
                  {post.label}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* ── Bottom rule ── */}
        <div className="mt-12 flex items-center gap-6">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8d0da] to-[#e8d0da]" />
          <span className="text-[9px] font-thin uppercase tracking-[0.38em] text-[#c8a8b4]">
            chicksjewelry
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#e8d0da] to-[#e8d0da]" />
        </div>

      </div>
    </section>
  );
}
