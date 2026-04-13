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
    <section className="bg-[#fbfaf7] px-4 py-10 sm:px-6 lg:px-8">
      <a
        href={block.buttonHref}
        target={block.buttonHref.startsWith("http") ? "_blank" : undefined}
        rel={block.buttonHref.startsWith("http") ? "noopener noreferrer" : undefined}
        className="group mx-auto grid max-w-[1320px] overflow-hidden rounded-md border border-[#dfe5d8] bg-[#eef3e9] transition hover:border-[#c9d4bf] md:grid-cols-[0.95fr_1.05fr]"
      >
        <div className="relative min-h-[320px] overflow-hidden bg-[#dfe8d8]">
          <Image
            src={block.imageUrl}
            alt={block.imageAlt}
            className="h-full w-full object-cover mix-blend-multiply opacity-80 transition duration-700 group-hover:scale-[1.025]"
            fill
            unoptimized
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(58,76,49,0.42),rgba(238,243,233,0.16))]" />
        </div>

        <div className="flex min-h-[320px] flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
          <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#68765d]">
            {block.eyebrow}
          </p>
          <h2 className="mt-4 font-[family:var(--font-display)] text-[2.3rem] leading-none tracking-[-0.03em] text-[#22251f] sm:text-[3.1rem]">
            {block.title}
          </h2>
          <p className="mt-5 max-w-[48ch] text-sm leading-7 text-[#5d6656]">{block.body}</p>
          <span className="mt-7 inline-flex min-h-11 w-fit items-center rounded-md bg-[#252a22] px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition group-hover:bg-[#3f4c35]">
            {block.buttonText}
          </span>
        </div>
      </a>
    </section>
  );
}
