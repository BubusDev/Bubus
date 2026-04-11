function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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

export function InstagramBanner() {
  const waveformBars = [18, 30, 22, 42, 26, 36, 20, 32];

  return (
    <section className="mx-auto my-10 max-w-[1450px] px-4 sm:px-6 lg:px-8">
      <div className="group relative overflow-hidden rounded-lg border border-white/20 bg-white/35 px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_24px_80px_rgba(160,91,119,0.16)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:bg-white/45 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.58),rgba(249,214,226,0.22)_48%,rgba(255,250,252,0.08))]" />
        <div className="pointer-events-none absolute -right-16 top-6 h-36 w-56 rotate-[-10deg] rounded-lg border border-white/20 bg-[#f6d3df]/20 shadow-[0_32px_80px_rgba(178,112,140,0.12)] backdrop-blur-xl" />
        <div className="pointer-events-none absolute -bottom-12 left-10 h-28 w-72 rotate-[4deg] rounded-lg border border-white/15 bg-white/20 backdrop-blur-md" />

        <div className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l border-t border-[#b88a9b]/40" />
        <div className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-b border-r border-[#b88a9b]/40" />
        <div className="pointer-events-none absolute right-24 top-8 hidden h-12 w-12 items-center justify-center rounded-full border border-[#b88a9b]/20 sm:flex">
          <span className="h-px w-8 bg-[#b88a9b]/25" />
          <span className="absolute h-8 w-px bg-[#b88a9b]/25" />
        </div>

        <InstagramIcon className="absolute right-6 top-6 h-8 w-8 text-[#b66b86]/60 sm:right-8 sm:top-8" />

        <div className="relative grid gap-8 pr-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
          <div className="max-w-3xl">
            <p className="mb-4 text-[10px] font-extralight uppercase tracking-[0.42em] text-[#9e7786]">
              KÖVESS MINKET
            </p>
            <h3 className="font-[family:var(--font-display)] text-3xl font-normal leading-tight text-[#2d2028] sm:text-4xl">
              @chicksjewelry az Instagramon
            </h3>
            <p className="mt-5 max-w-[62ch] text-sm font-extralight leading-7 text-[#6b5860] sm:text-base">
              Párosítási ötletek karkötőkhöz, előzetes betekintés az új kollekciókba és exkluzív kampányok – elsőként értesülj mindenről.
            </p>

            <div className="mt-6 flex h-12 w-fit items-end gap-1 rounded-lg border border-white/20 bg-white/20 px-3 pb-2 pt-3 backdrop-blur-md">
              {waveformBars.map((height, index) => (
                <span
                  key={height + index}
                  className="w-1 rounded-full bg-[#b66b86]/45 animate-pulse"
                  style={{ height, animationDelay: `${index * 120}ms` }}
                />
              ))}
            </div>
          </div>

          <div className="relative w-fit">
            <span className="pointer-events-none absolute -left-8 top-1/2 h-px w-6 -translate-y-1/2 bg-[#b88a9b]/35" />
            <span className="pointer-events-none absolute -right-3 -top-3 h-6 w-6 rounded-full border border-[#d89ab2]/40 animate-ping" />
            <span className="pointer-events-none absolute -bottom-5 left-5 text-[10px] font-thin uppercase tracking-[0.3em] text-[#a98996]">
              swipe
            </span>
            <a
              href="https://instagram.com/chicksjewelry"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-3 rounded-lg border border-white/30 bg-[#fff7fa]/55 px-5 py-3 text-sm font-extralight text-[#8f4563] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_14px_34px_rgba(143,69,99,0.14)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/50 hover:bg-white/70 hover:text-[#6f2f4b] focus:outline-none focus:ring-2 focus:ring-[#d89ab2]/45 focus:ring-offset-2 focus:ring-offset-[#fff7fa]"
            >
              Követés most
              <span className="relative flex h-5 w-5 items-center justify-center rounded-full border border-[#d89ab2]/45">
                <span className="absolute h-2 w-2 rounded-full bg-[#d89ab2]/50 animate-ping" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#b66b86]" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
