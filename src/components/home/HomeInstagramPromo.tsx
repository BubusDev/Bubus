import Image from "next/image";

import type { HomepageBlockView } from "@/lib/homepage-content";

type HomeInstagramPromoProps = {
  block: HomepageBlockView;
};

export function HomeInstagramPromo({ block }: HomeInstagramPromoProps) {
  if (!block.isVisible) {
    return null;
  }

  return (
    <section className="bg-[#eef3e9] py-10 sm:py-12">
      <a
        href={block.buttonHref}
        target={block.buttonHref.startsWith("http") ? "_blank" : undefined}
        rel={block.buttonHref.startsWith("http") ? "noopener noreferrer" : undefined}
        className="group relative mx-auto grid min-h-[440px] w-full max-w-[1500px] overflow-hidden bg-[#dfe8d8] transition sm:min-h-[520px] lg:grid-cols-[minmax(0,0.82fr)_minmax(420px,0.78fr)]"
      >
        <Image
          src={block.imageUrl}
          alt={block.imageAlt}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
          fill
          unoptimized
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,18,12,0.9)_0%,rgba(13,18,12,0.76)_36%,rgba(13,18,12,0.38)_64%,rgba(13,18,12,0.12)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(13,18,12,0.36),rgba(13,18,12,0.06)_45%,rgba(13,18,12,0.28))]" />

        <div className="relative z-10 flex min-h-[440px] max-w-[690px] flex-col justify-end px-6 py-12 text-white sm:min-h-[520px] sm:px-10 lg:px-16">
          <div className="border-l border-white/34 pl-5 sm:pl-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/82">
              {block.eyebrow}
            </p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-[2.35rem] leading-none tracking-[-0.03em] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.32)] sm:text-[3.35rem]">
              {block.title}
            </h2>
            <p className="mt-5 max-w-[46ch] text-sm leading-7 text-white/92 drop-shadow-[0_1px_14px_rgba(0,0,0,0.28)]">
              {block.body}
            </p>
            <div className="mt-7 w-fit border-t border-white/30 pt-4">
              <span className="inline-flex min-h-11 items-center rounded-md border border-white/50 bg-white px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#252a22] shadow-[0_16px_36px_rgba(0,0,0,0.18)] transition group-hover:bg-[#fff7fb]">
                {block.buttonText}
              </span>
            </div>
          </div>
        </div>
      </a>
    </section>
  );
}
