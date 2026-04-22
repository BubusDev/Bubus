type AtmosphereVisualProps = {
  className?: string;
};

export function AtmosphereVisual({ className }: AtmosphereVisualProps) {
  return (
    <div
      className={[
        "relative flex h-full min-h-[400px] w-full items-center justify-center lg:min-h-[560px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-rose-300/20 blur-[90px]" />
      <div className="absolute bottom-8 left-8 h-64 w-64 rounded-full bg-pink-200/30 blur-[80px]" />
      <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-rose-300/40" />
      <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-rose-200/30" />
      <svg
        viewBox="0 0 520 520"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="coming-soon-glow-1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e9a7be" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#e9a7be" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="coming-soon-glow-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f7ccd8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f7ccd8" stopOpacity="0" />
          </radialGradient>
          <filter id="coming-soon-blur">
            <feGaussianBlur stdDeviation="36" />
          </filter>
        </defs>
        <g filter="url(#coming-soon-blur)">
          <circle cx="390" cy="130" r="110" fill="url(#coming-soon-glow-1)" />
          <circle cx="170" cy="360" r="90" fill="url(#coming-soon-glow-2)" />
        </g>
        <circle cx="280" cy="250" r="118" fill="none" stroke="rgba(184, 117, 145, 0.25)" />
        <circle cx="280" cy="250" r="82" fill="none" stroke="rgba(227, 178, 196, 0.24)" />
      </svg>
      <span className="pointer-events-none select-none font-serif text-[140px] font-thin leading-none text-rose-300/15 sm:text-[180px] lg:text-[220px]">
        C
      </span>
    </div>
  );
}
