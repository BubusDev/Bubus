import Link from 'next/link'
import { Playfair_Display, Inter } from 'next/font/google'

import { getDictionary } from "@/lib/i18n";
import { getLocalizedPath } from "@/lib/locale-routing";
import type { SupportedLanguage } from "@/lib/international";

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

interface BrandPhilosophyProps {
  ctaHref?: string
  language?: SupportedLanguage
}

export default function BrandPhilosophy({
  ctaHref = '/stones',
  language = 'hu',
}: BrandPhilosophyProps) {
  const dictionary = getDictionary(language);
  const titleParts = dictionary["homepage.editorialTitle"].split(". ");
  const titleStart = titleParts[0] ? `${titleParts[0]}.` : dictionary["homepage.editorialTitle"];
  const titleEmphasis = titleParts[1] ?? "";

  return (
    <section className="relative w-full bg-[#F5F2ED] px-12 py-16">
      <div className="pointer-events-none absolute right-12 top-14 text-7xl text-[#E5DED5]">
        ✦
      </div>

      <div className="grid items-start gap-12 md:grid-cols-[42fr_58fr] md:gap-16">
        <div>
          <p
            className={`${inter.className} mb-7 text-[11px] font-normal uppercase tracking-[0.18em] text-[#8B8175]`}
          >
            {dictionary["homepage.editorialEyebrow"]}
          </p>

          <h2
            className={`${playfair.className} text-[40px] font-normal leading-[1.1] text-[#1C1917] sm:text-[52px]`}
          >
            {titleStart}{' '}
            {titleEmphasis ? (
              <em className="font-normal italic text-[#6B5D4F]">{titleEmphasis}</em>
            ) : null}
          </h2>

          <span
            className={`${inter.className} mt-9 inline-block rounded-full border-[0.5px] border-[#C4B8AC] px-3 py-1 text-[10.5px] font-normal uppercase tracking-[0.12em] text-[#8B8175]`}
          >
            Kézzel készített · Féldrágakövek
          </span>
        </div>

        <div>
          <p
            className={`${playfair.className} mb-8 text-[22px] font-normal leading-[1.5] text-[#1C1917]`}
          >
            {dictionary["homepage.editorialLead"]}
          </p>

          <hr className="mb-8 h-px w-10 border-none bg-[#C4B8AC]" />

          <div
            className={`${inter.className} mb-10 grid gap-6 text-[13.5px] font-normal leading-[1.75] text-[#5C534A] sm:grid-cols-2`}
          >
            <p>
              {dictionary["homepage.editorialFirstNote"]}
            </p>
            <p>
              {dictionary["homepage.editorialSecondNote"]}
            </p>
          </div>

          <Link
            href={getLocalizedPath(ctaHref, language)}
            className={`${inter.className} group inline-flex border-b border-[#1C1917] pb-1.5 text-[11px] font-normal uppercase tracking-[0.14em] text-[#1C1917] transition-colors hover:border-[#6B5D4F] hover:text-[#6B5D4F]`}
          >
            {dictionary["homepage.editorialCta"]}{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
