import Link from "next/link";
import Image from "next/image";

import type { HomepageBlockView } from "@/lib/homepage-content";

type HomeHeroProps = {
  block: HomepageBlockView;
};

function getHeroDisplayCopy(block: HomepageBlockView) {
  const normalizedButton = block.buttonText.toLocaleLowerCase("hu");
  const normalizedTitle = block.title.toLocaleLowerCase("hu");
  const normalizedEyebrow = block.eyebrow.toLocaleLowerCase("hu");
  const normalizedBody = block.body.toLocaleLowerCase("hu");

  return {
    eyebrow: normalizedEyebrow.includes("különleges válogatás")
      ? "Limitált butik válogatás"
      : block.eyebrow,
    title: normalizedTitle.includes("váratlan részletekkel")
      ? "Ékszerek, amelyek csendben válnak személyessé"
      : block.title,
    body: normalizedBody.includes("szerkesztett kampánya")
      ? "Limitált ékszerek gondosan válogatott anyagokból, finom részletekkel és kis szériás ritmusban."
      : block.body,
    buttonText: normalizedButton.includes("lepődj")
      ? "Fedezd fel a válogatást"
      : block.buttonText,
  };
}

export function HomeHero({ block }: HomeHeroProps) {
  if (!block.isVisible) {
    return null;
  }

  const copy = getHeroDisplayCopy(block);

  return (
    <section className="bg-[#fbfaf7] px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <Link
          href={block.buttonHref}
          className="group relative block min-h-[590px] overflow-hidden bg-[#e5e1d8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6f775d] focus-visible:ring-offset-4 sm:min-h-[640px] lg:min-h-[720px]"
        >
          <Image
            src={block.imageUrl}
            alt={block.imageAlt}
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.018]"
            fill
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,24,20,0.18),rgba(24,24,20,0.08)_34%,rgba(24,24,20,0.72))] sm:bg-[linear-gradient(90deg,rgba(22,23,19,0.72),rgba(22,23,19,0.34)_45%,rgba(22,23,19,0.04))]" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgba(12,13,10,0.48),rgba(12,13,10,0))] sm:hidden" />

          <div className="relative flex min-h-[590px] items-end px-5 py-7 sm:min-h-[640px] sm:px-10 sm:py-12 lg:min-h-[720px] lg:px-16 lg:py-16">
            <div className="max-w-[670px] text-white">
              {copy.eyebrow ? (
                <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.36em] text-white/76 sm:mb-5">
                  {copy.eyebrow}
                </p>
              ) : null}
              {copy.title ? (
                <h1 className="font-[family:var(--font-display)] text-[3rem] leading-[0.92] tracking-[-0.035em] sm:text-[4.6rem] lg:text-[5.7rem] xl:text-[6.35rem]">
                  {copy.title}
                </h1>
              ) : null}
              {copy.body ? (
                <p className="mt-5 max-w-[46ch] text-[15px] leading-7 text-white/86 sm:mt-7 sm:text-base sm:leading-8">
                  {copy.body}
                </p>
              ) : null}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="inline-flex min-h-12 items-center justify-center bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#22231f] transition group-hover:bg-[#f3f0e8]">
                  {copy.buttonText}
                </span>
                <span className="inline-flex min-h-12 items-center justify-center border border-white/42 px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition group-hover:border-white/72">
                  Limitált darabok
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
