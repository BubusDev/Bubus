import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HomeHero() {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <div className="overflow-hidden rounded-[2.7rem] border border-white/75 bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,234,245,0.75))] p-8 shadow-[0_28px_65px_rgba(198,129,167,0.14)] backdrop-blur-xl sm:p-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#b06b8e]">
            <Sparkles className="h-3.5 w-3.5" />
            Editorial Boutique Jewelry
          </div>
          <div className="space-y-5">
            <h1 className="max-w-[11ch] font-[family:var(--font-display)] text-[3.8rem] leading-[0.88] tracking-[-0.06em] text-[#4d2741] sm:text-[5.4rem]">
              Jewelry for the softer side of statement dressing.
            </h1>
            <p className="max-w-[54ch] text-base leading-8 text-[#745b6b] sm:text-lg">
              Chicks Jewelry is built as a curated boutique: the homepage tells the brand story,
              while each category becomes its own refined shopping destination with elegant filtering.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/new-in"
              className="inline-flex items-center gap-2 rounded-full bg-[#f183bc] px-6 py-3.5 text-sm font-medium text-white shadow-[0_18px_38px_rgba(241,131,188,0.3)] transition hover:bg-[#ea6fb0]"
            >
              Shop New In
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/special-edition"
              className="inline-flex items-center rounded-full border border-[#edd1e1] bg-white/80 px-6 py-3.5 text-sm font-medium text-[#6b425a] transition hover:border-[#e9b6d0] hover:bg-white"
            >
              Explore Special Edition
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
        <article className="overflow-hidden rounded-[2.2rem] border border-white/75 bg-white/70 p-6 shadow-[0_20px_45px_rgba(198,129,167,0.11)] backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#b06b8e]">
            Brand Story
          </p>
          <h2 className="mt-4 font-[family:var(--font-display)] text-[2rem] leading-none text-[#4d2741]">
            Designed to feel intimate, polished, and giftable.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#745b6b]">
            Soft pinks, translucent layers, and image-led product storytelling create a premium
            shopping rhythm that feels boutique rather than catalog-heavy.
          </p>
        </article>

        <article className="overflow-hidden rounded-[2.2rem] border border-white/75 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(255,232,243,0.7)_58%,rgba(236,193,217,0.72))] p-6 shadow-[0_20px_45px_rgba(198,129,167,0.11)]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#b06b8e]">
            Collection Direction
          </p>
          <h2 className="mt-4 font-[family:var(--font-display)] text-[2rem] leading-none text-[#4d2741]">
            Category-led shopping for 2026 ecommerce structure.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#745b6b]">
            Necklaces, bracelets, anklets, earrings, Special Edition, and sale now live as separate routes
            with their own elegant filter rail and product grid.
          </p>
        </article>
      </div>
    </section>
  );
}
