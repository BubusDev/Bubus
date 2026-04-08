export function InstagramBanner() {
  return (
    <section className="my-10 mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-8">
      <div
        className="flex items-center justify-between gap-6 px-8 py-6 sm:px-12"
        style={{ background: "#d4789a" }}
      >
        {/* Left: text */}
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[.3em] text-white/70 mb-1">
            Kövess minket
          </p>
          <h3 className="font-[family:var(--font-display)] text-xl text-white leading-tight mb-2">
            @chicksjewelry az Instagramon
          </h3>
          <p className="text-sm text-white/80 leading-[1.7] max-w-[46ch]">
            Párosítási ötletek karkötőkhöz, előzetes betekintés az új kollekciókba
            és exkluzív kampányok — elsőként értesülj mindenről.
          </p>
          <a
            href="https://instagram.com/chicksjewelry"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 bg-white text-[#d4789a] text-sm font-medium px-5 py-2.5 hover:bg-white/90 transition"
          >
            Követés most
          </a>
        </div>

        {/* Right: chicken icon */}
        <div className="hidden sm:flex flex-col items-center gap-2 opacity-80">
          <svg
            viewBox="0 0 120 120"
            className="w-24 h-24 text-white"
            fill="currentColor"
            aria-hidden="true"
          >
            <ellipse cx="60" cy="75" rx="30" ry="28" />
            <circle cx="60" cy="38" r="18" />
            <ellipse cx="78" cy="32" rx="6" ry="4" transform="rotate(20 78 32)" />
            <ellipse cx="72" cy="44" rx="5" ry="3" />
            <ellipse cx="45" cy="90" rx="8" ry="14" transform="rotate(-10 45 90)" />
            <ellipse cx="75" cy="90" rx="8" ry="14" transform="rotate(10 75 90)" />
          </svg>
          <p className="text-[11px] text-white/70 tracking-wider text-center">
            Chicks
            <br />
            Jewelry
          </p>
        </div>
      </div>
    </section>
  );
}
