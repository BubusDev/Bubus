import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const BOTTOM_VALUES = [
  "Kézzel alkotva",
  "Válogatott kövek",
  "Nőies, modern design",
  "Limitált darabok",
  "Igényes csomagolás",
];

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f8f1f4]">
      {/* background */}
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,181,218,0.28),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(255,214,230,0.4),transparent_24%),linear-gradient(to_bottom,#fcf7f9_0%,#f8eff3_45%,#f5ecef_100%)]" />
        <div className="absolute left-[-8rem] top-[6rem] h-[20rem] w-[20rem] rounded-full bg-[#f3d6e3]/40 blur-3xl" />
        <div className="absolute right-[-6rem] top-[3rem] h-[18rem] w-[18rem] rounded-full bg-[#f8ddea]/45 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/2 h-[16rem] w-[32rem] -translate-x-1/2 rounded-full bg-[#efd0df]/30 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[88vh] max-w-[1320px] items-center gap-14 px-6 py-16 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-20">
        {/* left */}
        <div className="max-w-[640px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e8cad8] bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-[#b57695] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.7} />
            Chicks Jewelry
          </div>

          <p className="mt-8 text-[11px] uppercase tracking-[0.34em] text-[#b8879f]">
            Butik ékszer webáruház
          </p>

          <h1 className="mt-4 font-[family:var(--font-display)] text-[#4f2740] tracking-[-0.05em] leading-[0.9] text-[clamp(3.2rem,7vw,6.8rem)]">
            Ékszerek,
            <br />
            amik illenek
            <br />
            <span className="text-[#db74aa]">hozzád.</span>
          </h1>

          <p className="mt-7 max-w-[34rem] text-[15px] leading-[1.9] text-[#755b68] sm:text-[16px]">
            Finoman nőies, modern darabok válogatott kövekből.
            A Chicks Jewelry kollekciói nem harsányak — hanem szépek,
            puhák, kifinomultak és viselhetőek minden nap.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/new-in"
              className="inline-flex items-center gap-2 rounded-full bg-[#4f2740] px-7 py-3.5 text-sm font-medium text-white transition hover:translate-y-[-1px] hover:bg-[#432036]"
            >
              Kollekciók böngészése
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center rounded-full border border-[#d9b9c8] bg-white/70 px-7 py-3.5 text-sm font-medium text-[#6d4457] transition hover:bg-white"
            >
              A márkáról
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {["Rózsakvarc", "Holdkő", "Gyöngy", "Ametiszt"].map((item, i) => (
              <span
                key={item}
                className="rounded-full border border-[#ead4de] bg-white/80 px-4 py-2 text-[12px] text-[#8a6475]"
                style={{ transform: `rotate(${i % 2 === 0 ? "-2deg" : "2deg"})` }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* right */}
        <div className="relative mx-auto w-full max-w-[560px]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-white p-3 shadow-[0_30px_80px_rgba(105,55,81,0.12)]">
            <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,#f6e9ef_0%,#f2d7e2_100%)]">
              <img
                src="/images/hero-jewelry.jpg"
                alt="Chicks Jewelry hero"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3b1f2f]/50 via-[#3b1f2f]/10 to-transparent p-6">
                <div className="max-w-[18rem] rounded-[1.25rem] bg-white/78 p-4 backdrop-blur-md">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#b37d96]">
                    Válogatott kedvencek
                  </p>
                  <p className="mt-2 font-[family:var(--font-display)] text-[1.6rem] leading-none text-[#4f2740]">
                    Finom ragyogás
                  </p>
                  <p className="mt-2 text-[13px] leading-[1.7] text-[#775f6c]">
                    Letisztult darabok, puha tónusokkal és modern nőies karakterrel.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -left-8 top-10 hidden rounded-full border border-[#ead2dd] bg-white/85 px-5 py-3 shadow-[0_10px_30px_rgba(93,44,70,0.08)] md:block">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#b37d96]">
              Új kollekció
            </p>
            <p className="mt-1 text-sm text-[#5c384a]">Nőies, könnyű, hordható</p>
          </div>

          <div className="absolute -right-6 bottom-10 hidden rounded-full border border-[#ead2dd] bg-white/85 px-5 py-3 shadow-[0_10px_30px_rgba(93,44,70,0.08)] md:block">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#b37d96]">
              Chicks Jewelry
            </p>
            <p className="mt-1 text-sm text-[#5c384a]">Modern butik hangulat</p>
          </div>
        </div>
      </div>

      <div className="relative border-t border-[#ecd9e2] bg-white/50 px-6 py-5 backdrop-blur-sm md:px-10">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {BOTTOM_VALUES.map((label) => (
            <div key={label} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d98ab0]" />
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#8f7080]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}