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
  const hasImage = Boolean(block.imageUrl);
  const sparkleDots = [
    "left-[12%] top-[18%] h-2 w-2 [animation-delay:0ms]",
    "left-[78%] top-[14%] h-1.5 w-1.5 [animation-delay:260ms]",
    "left-[54%] top-[28%] h-2.5 w-2.5 [animation-delay:520ms]",
    "left-[18%] top-[66%] h-1.5 w-1.5 [animation-delay:780ms]",
    "left-[84%] top-[58%] h-2 w-2 [animation-delay:1040ms]",
    "left-[66%] top-[78%] h-1.5 w-1.5 [animation-delay:1300ms]",
  ];

  return (
    <section className="bg-[#fbfaf7] px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <Link
          href={block.buttonHref}
          className="group relative block min-h-[590px] overflow-hidden bg-[#E0157A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8005C] focus-visible:ring-offset-4 sm:min-h-[640px] lg:min-h-[720px]"
        >
          {hasImage ? (
            <Image
              src={block.imageUrl}
              alt={block.imageAlt}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.018]"
              fill
              priority
              sizes="100vw"
            />
          ) : null}
          <div
            className={
              hasImage
                ? "absolute inset-0 bg-[linear-gradient(180deg,rgba(24,24,20,0.18),rgba(24,24,20,0.08)_34%,rgba(24,24,20,0.72))] sm:bg-[linear-gradient(90deg,rgba(22,23,19,0.72),rgba(22,23,19,0.34)_45%,rgba(22,23,19,0.04))]"
                : "absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(255,214,238,0.42),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.18),transparent_38%)]"
            }
          />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            {sparkleDots.map((className, index) => (
              <span
                key={index}
                className={`hero-sparkle-dot absolute rounded-full bg-[#FFD6EE] shadow-[0_0_22px_rgba(255,214,238,0.86)] ${className}`}
              />
            ))}
          </div>
          {hasImage ? (
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgba(12,13,10,0.48),rgba(12,13,10,0))] sm:hidden" />
          ) : null}

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
                <span className="inline-flex min-h-12 items-center justify-center bg-[#FFD6EE] px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#A8005C] transition group-hover:bg-white">
                  {copy.buttonText}
                </span>
                <span className="inline-flex min-h-12 items-center justify-center border border-white/42 px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition group-hover:border-white/72">
                  Limitált darabok
                </span>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes hero-twinkle {
              0%, 100% {
                opacity: .26;
                transform: scale(.72);
              }
              50% {
                opacity: 1;
                transform: scale(1.28);
              }
            }
            .hero-sparkle-dot {
              animation: hero-twinkle 2.1s ease-in-out infinite;
            }
            @media (prefers-reduced-motion: reduce) {
              .hero-sparkle-dot {
                animation: none;
              }
            }
          `}</style>
        </Link>
      </div>
    </section>
  );
}
