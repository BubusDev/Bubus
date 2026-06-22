import Link from 'next/link'
import { Playfair_Display, Inter } from 'next/font/google'

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
}

export default function BrandPhilosophy({
  ctaHref = '/kovek',
}: BrandPhilosophyProps) {
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
            A Chicks szemlélet
          </p>

          <h2
            className={`${playfair.className} text-[40px] font-normal leading-[1.1] text-[#1C1917] sm:text-[52px]`}
          >
            Nem tömeg, hanem{' '}
            <em className="font-normal italic text-[#6B5D4F]">karakter.</em>
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
            A kollekciók nem szezonális zajból indulnak, hanem kövekből,
            tónusokból és viselhető részletekből.
          </p>

          <hr className="mb-8 h-px w-10 border-none bg-[#C4B8AC]" />

          <div
            className={`${inter.className} mb-10 grid gap-6 text-[13.5px] font-normal leading-[1.75] text-[#5C534A] sm:grid-cols-2`}
          >
            <p>
              A darabok kis mennyiségben készülnek — a kedvenc kombinációk
              sokszor csak rövid ideig érhetők el.
            </p>
            <p>
              A cél egy finom, személyes ékszertár: rétegezhető, könnyen
              hordható, nem harsány, mégis emlékezetes részletekkel.
            </p>
          </div>

          {/* TODO: replace ctaHref with real route */}
          <Link
            href={ctaHref}
            className={`${inter.className} group inline-flex border-b border-[#1C1917] pb-1.5 text-[11px] font-normal uppercase tracking-[0.14em] text-[#1C1917] transition-colors hover:border-[#6B5D4F] hover:text-[#6B5D4F]`}
          >
            Ismerd meg a köveket{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
