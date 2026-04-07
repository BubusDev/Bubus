import Link from "next/link";

export function HomeHero() {
  return (
    <section
      className="relative w-full"
      style={{
        background: "linear-gradient(150deg, #fdf6f8 0%, #faf2f6 55%, #fdf6f0 100%)",
      }}
    >
      <div className="mx-auto max-w-[1200px] px-8 py-20 md:py-24 lg:px-16">
        <div className="grid items-end gap-12 md:grid-cols-2">
          {/* Left: heading */}
          <div>
            <p className="mb-5 text-[10px] uppercase tracking-[0.4em] text-[#b08898]">
              Chicks Jewelry
            </p>
            <h2
              className="font-[family:var(--font-display)] leading-[1.08] tracking-[-0.03em] text-[#2e1a28]"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}
            >
              Ékszerek,
              <br />
              amelyek
              <br />
              <span style={{ color: "#c45a85" }}>mesélnek.</span>
            </h2>
          </div>

          {/* Right: description + CTA */}
          <div className="space-y-7">
            <p className="max-w-[28ch] text-[14px] leading-[1.9] text-[#7d5b75]">
              Féldrágakövekből készült, egyedi kézműves ékszerek —
              minden darab szeretettel alkotva.
            </p>
            <Link
              href="/new-in"
              className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.26em] text-[#c45a85] transition-opacity hover:opacity-60"
            >
              <span>Kollekciók felfedezése</span>
              <span className="block h-px w-8 bg-current" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
