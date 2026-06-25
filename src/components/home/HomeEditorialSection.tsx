import Link from "next/link";

import { getDictionary } from "@/lib/i18n";
import { getLocalizedPath } from "@/lib/locale-routing";
import type { SupportedLanguage } from "@/lib/international";

type LocalizedHomepageSectionProps = {
  language: SupportedLanguage;
};

export function HomeEditorialSection({ language }: LocalizedHomepageSectionProps) {
  const dictionary = getDictionary(language);

  return (
    <section className="bg-[#fbfaf7] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-[1320px] gap-10 border-t border-[#e7e1d7] pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:pt-16">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#6f775d]">
            {dictionary["homepage.editorialEyebrow"]}
          </p>
          <h2 className="mt-5 max-w-[10ch] font-[family:var(--font-display)] text-[2.8rem] leading-[0.94] tracking-[-0.035em] text-[#22231f] sm:text-[4.1rem]">
            {dictionary["homepage.editorialTitle"]}
          </h2>
        </div>

        <div className="max-w-[760px] lg:pt-10">
          <p className="text-[1.35rem] leading-9 text-[#2f302b] sm:text-[1.7rem] sm:leading-10">
            {dictionary["homepage.editorialLead"]}
          </p>
          <div className="mt-8 grid gap-6 text-sm leading-7 text-[#69645b] sm:grid-cols-2">
            <p>
              {dictionary["homepage.editorialFirstNote"]}
            </p>
            <p>
              {dictionary["homepage.editorialSecondNote"]}
            </p>
          </div>
          <Link
            href={getLocalizedPath("/stones", language)}
            className="mt-8 inline-flex min-h-11 items-center border-b border-[#22231f] text-[11px] font-semibold uppercase tracking-[0.24em] text-[#22231f] transition hover:border-[#6f775d] hover:text-[#6f775d]"
          >
            {dictionary["homepage.editorialCta"]}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeFinalCta({ language }: LocalizedHomepageSectionProps) {
  const dictionary = getDictionary(language);

  return (
    <section className="bg-[#22231f] px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-white/58">
            {dictionary["homepage.finalCtaEyebrow"]}
          </p>
          <h2 className="mt-4 max-w-[13ch] font-[family:var(--font-display)] text-[2.5rem] leading-[0.96] tracking-[-0.035em] sm:text-[3.7rem]">
            {dictionary["homepage.finalCtaTitle"]}
          </h2>
        </div>
        <Link
          href={getLocalizedPath("/new-in", language)}
          className="inline-flex min-h-12 w-fit items-center justify-center bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#22231f] transition hover:bg-[#f3f0e8]"
        >
          {dictionary["homepage.finalCtaButton"]}
        </Link>
      </div>
    </section>
  );
}
