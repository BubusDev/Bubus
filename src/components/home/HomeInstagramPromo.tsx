import Image from "next/image";

import type { HomepageBlockView } from "@/lib/homepage-content";

type HomeInstagramPromoProps = {
  block: HomepageBlockView;
};

function getInstagramDisplayCopy(block: HomepageBlockView) {
  const normalizedBody = block.body.toLocaleLowerCase("hu");
  const normalizedButton = block.buttonText.toLocaleLowerCase("hu");

  return {
    body: normalizedBody.includes("ötleteinket az instagramon")
      ? "Kulisszák, új kövek és viselési ötletek azoknak, akik szeretik közelről látni a részleteket."
      : block.body,
    buttonText: normalizedButton.includes("irány az instagram")
      ? "Kövess Instagramon"
      : block.buttonText,
  };
}

export function HomeInstagramPromo({ block }: HomeInstagramPromoProps) {
  if (!block.isVisible) {
    return null;
  }

  const copy = getInstagramDisplayCopy(block);

  return (
    <section className="bg-[#fbfaf7] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <a
        href={block.buttonHref}
        target={block.buttonHref.startsWith("http") ? "_blank" : undefined}
        rel={block.buttonHref.startsWith("http") ? "noopener noreferrer" : undefined}
        className="group relative mx-auto grid min-h-[440px] w-full max-w-[1320px] overflow-hidden bg-[#dfe8d8] transition sm:min-h-[540px] lg:grid-cols-[minmax(0,0.82fr)_minmax(420px,0.78fr)]"
      >
        <Image
          src={block.imageUrl}
          alt={block.imageAlt}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
          fill
          sizes="(max-width: 1024px) 100vw, 1320px"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,18,12,0.12),rgba(13,18,12,0.76))] sm:bg-[linear-gradient(90deg,rgba(13,18,12,0.84)_0%,rgba(13,18,12,0.62)_40%,rgba(13,18,12,0.16)_100%)]" />

        <div className="relative z-10 flex min-h-[440px] max-w-[690px] flex-col justify-end px-6 py-10 text-white sm:min-h-[540px] sm:px-10 sm:py-12 lg:px-14">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/82">
              {block.eyebrow}
            </p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-[2.7rem] leading-[0.95] tracking-[-0.035em] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.32)] sm:text-[4.1rem]">
              {block.title}
            </h2>
            <p className="mt-5 max-w-[46ch] text-sm leading-7 text-white/92 drop-shadow-[0_1px_14px_rgba(0,0,0,0.28)]">
              {copy.body}
            </p>
            <div className="mt-7 w-fit">
              <span className="inline-flex min-h-11 items-center bg-white px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#252a22] transition group-hover:bg-[#f3f0e8]">
                {copy.buttonText}
              </span>
            </div>
          </div>
        </div>
      </a>
    </section>
  );
}
