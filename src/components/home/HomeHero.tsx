import Link from "next/link";
import Image from "next/image";

import type { HomepageBlockView } from "@/lib/homepage-content";

type HomeHeroProps = {
  block: HomepageBlockView;
};

export function HomeHero({ block }: HomeHeroProps) {
  if (!block.isVisible) {
    return null;
  }

  return (
    <section className="bg-[#fbfaf7] px-4 pt-5 sm:px-6 lg:px-8">
      <Link
        href={block.buttonHref}
        className="group relative mx-auto block min-h-[520px] max-w-[1500px] overflow-hidden rounded-md bg-[#e7e5df] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7b8566] focus-visible:ring-offset-4"
      >
        <Image
          src={block.imageUrl}
          alt={block.imageAlt}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
          fill
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,22,17,0.62),rgba(20,22,17,0.22)_48%,rgba(20,22,17,0.02))]" />

        <div className="relative flex min-h-[520px] items-end px-6 py-8 sm:px-10 sm:py-10 lg:px-16 lg:py-14">
          <div className="max-w-[560px] text-white">
            {block.eyebrow ? (
              <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.34em] text-white/78">
                {block.eyebrow}
              </p>
            ) : null}
            {block.title ? (
              <h1 className="font-[family:var(--font-display)] text-[2.4rem] leading-[0.98] tracking-[-0.03em] sm:text-[3.4rem] lg:text-[4.6rem]">
                {block.title}
              </h1>
            ) : null}
            {block.body ? (
              <p className="mt-5 max-w-[42ch] text-sm leading-7 text-white/82 sm:text-[15px]">
                {block.body}
              </p>
            ) : null}
            <span className="mt-7 inline-flex min-h-11 items-center justify-center rounded-md bg-white px-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#23251f] transition group-hover:bg-[#eef1e8]">
              {block.buttonText}
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
