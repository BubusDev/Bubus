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

/* Decorative SVG jewelry motifs inside each tile */
function TileMotif({ variant }: { variant: number }) {
  if (variant === 0) {
    /* Ring with stone */
    return (
      <svg viewBox="0 0 80 80" className="absolute inset-0 m-auto h-16 w-16 opacity-30 transition-opacity duration-500 group-hover:opacity-50">
        <circle cx="40" cy="40" r="22" stroke="#c45a85" strokeWidth="1" fill="none" />
        <circle cx="40" cy="18" r="6" stroke="#c45a85" strokeWidth="1" fill="none" />
        <circle cx="40" cy="18" r="3" fill="#c45a85" opacity="0.6" />
      </svg>
    );
  }
  if (variant === 1) {
    /* Bracelet chain */
    return (
      <svg viewBox="0 0 80 80" className="absolute inset-0 m-auto h-16 w-16 opacity-30 transition-opacity duration-500 group-hover:opacity-50">
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
    /* Stone cluster */
    return (
      <svg viewBox="0 0 80 80" className="absolute inset-0 m-auto h-16 w-16 opacity-30 transition-opacity duration-500 group-hover:opacity-50">
        <polygon points="40,12 52,32 40,38 28,32" stroke="#8b6cb5" strokeWidth="1" fill="none" />
        <polygon points="40,38 52,44 40,64 28,44" stroke="#8b6cb5" strokeWidth="1" fill="none" />
        <circle cx="40" cy="38" r="4" fill="#8b6cb5" opacity="0.6" />
        <circle cx="52" cy="38" r="3" fill="#8b6cb5" opacity="0.4" />
        <circle cx="28" cy="38" r="3" fill="#8b6cb5" opacity="0.4" />
      </svg>
    );
  }
  if (variant === 3) {
    /* Drop earring */
    return (
      <svg viewBox="0 0 80 80" className="absolute inset-0 m-auto h-16 w-16 opacity-30 transition-opacity duration-500 group-hover:opacity-50">
        <circle cx="40" cy="20" r="5" stroke="#c45a85" strokeWidth="1" fill="none" />
        <line x1="40" y1="25" x2="40" y2="38" stroke="#c45a85" strokeWidth="1" />
        <ellipse cx="40" cy="52" rx="9" ry="14" stroke="#c45a85" strokeWidth="1" fill="none" />
        <ellipse cx="40" cy="52" rx="4" ry="6" fill="#c45a85" opacity="0.5" />
      </svg>
    );
  }
  /* Necklace pendant */
  return (
    <svg viewBox="0 0 80 80" className="absolute inset-0 m-auto h-16 w-16 opacity-30 transition-opacity duration-500 group-hover:opacity-50">
      <path d="M20 20 Q40 28 60 20" stroke="#b08898" strokeWidth="1" fill="none" />
      <line x1="40" y1="28" x2="40" y2="44" stroke="#b08898" strokeWidth="1" />
      <circle cx="40" cy="52" r="10" stroke="#b08898" strokeWidth="1" fill="none" />
      <circle cx="40" cy="52" r="5" fill="#b08898" opacity="0.5" />
    </svg>
  );
}

const POSTS: {
  bg: string;
  label: string;
  variant: number;
}[] = [
  { bg: "bg-[#fce8f0]", label: "#chicksjewelry", variant: 0 },
  { bg: "bg-[#fdf3e8]", label: "#karkötő", variant: 1 },
  { bg: "bg-[#eee8f8]", label: "#féldrágakő", variant: 2 },
  { bg: "bg-[#fce8f0]", label: "#fülbevaló", variant: 3 },
  { bg: "bg-[#f0f8f4]", label: "#nyaklánc", variant: 4 },
];

export function InstagramBanner() {
  return (
    <section className="mx-auto my-16 max-w-[1450px] px-4 sm:px-6 lg:px-8">
      {/* Top rule */}
      <div className="mb-12 flex items-center gap-6">
        <span className="h-px flex-1 bg-[#ecd8e0]" />
        <div className="flex items-center gap-2 text-[#b08898]">
          <InstagramIcon className="h-4 w-4" />
          <span className="text-[10px] uppercase tracking-[0.42em]">Instagram</span>
        </div>
        <span className="h-px flex-1 bg-[#ecd8e0]" />
      </div>

      {/* Main layout */}
      <div className="grid items-end gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">
        {/* Left: editorial heading */}
        <div className="max-w-2xl">
          <p className="mb-4 text-[10px] uppercase tracking-[0.42em] text-[#b08898]">
            Kövess minket
          </p>
          <h3 className="font-[family:var(--font-display)] text-4xl font-normal leading-[1.1] text-[#2e1a28] sm:text-5xl">
            @chicksjewelry
            <br />
            <span className="text-[#c45a85]">az Instagramon</span>
          </h3>
          <p className="mt-6 max-w-[52ch] text-sm font-light leading-7 text-[#9a7080]">
            Párosítási ötletek karkötőkhöz, előzetes betekintés az új
            kollekciókba és exkluzív kampányok — elsőként értesülj mindenről.
          </p>

          <a
            href="https://instagram.com/chicksjewelry"
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-4 rounded-full bg-[#2e1a28] px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] text-white transition duration-300 hover:bg-[#c45a85] focus:outline-none focus:ring-2 focus:ring-[#c45a85] focus:ring-offset-2"
          >
            <InstagramIcon className="h-4 w-4" />
            Követés most
            <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Right: stats */}
        <div className="hidden lg:flex lg:flex-col lg:items-end lg:gap-8">
          <div className="text-right">
            <p className="font-[family:var(--font-display)] text-3xl text-[#2e1a28]">2.4K+</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[#b08898]">Követő</p>
          </div>
          <div className="h-px w-12 bg-[#ecd8e0]" />
          <div className="text-right">
            <p className="font-[family:var(--font-display)] text-3xl text-[#2e1a28]">180+</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[#b08898]">Poszt</p>
          </div>
          <div className="h-px w-12 bg-[#ecd8e0]" />
          <div className="text-right">
            <p className="font-[family:var(--font-display)] text-3xl text-[#2e1a28]">98%</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[#b08898]">Pozitív visszajelzés</p>
          </div>
        </div>
      </div>

      {/* Post grid */}
      <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {POSTS.map((post, i) => (
          <a
            key={i}
            href="https://instagram.com/chicksjewelry"
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative aspect-square overflow-hidden rounded-2xl ${post.bg} transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(196,90,133,0.18)]`}
          >
            {/* Jewelry motif */}
            <TileMotif variant={post.variant} />

            {/* Subtle inner border */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#2e1a28]/5" />

            {/* Hover overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#2e1a28]/0 transition-all duration-300 group-hover:bg-[#2e1a28]/30">
              <InstagramIcon className="h-6 w-6 text-white opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1" />
              <span className="text-[9px] uppercase tracking-[0.25em] text-white/90 opacity-0 transition-all duration-300 group-hover:opacity-100 delay-75">
                {post.label}
              </span>
            </div>

            {/* Bottom label (always visible) */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5">
              <span className="inline-block rounded-full bg-white/60 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[#6b3850] backdrop-blur-sm">
                {post.label}
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Bottom rule */}
      <div className="mt-10 flex items-center gap-6">
        <span className="h-px flex-1 bg-[#ecd8e0]" />
        <span className="text-[9px] uppercase tracking-[0.35em] text-[#c8a8b4]">
          chicksjewelry
        </span>
        <span className="h-px flex-1 bg-[#ecd8e0]" />
      </div>
    </section>
  );
}
