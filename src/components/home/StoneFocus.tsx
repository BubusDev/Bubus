import Image from 'next/image'
import Link from 'next/link'
import { Playfair_Display, Inter } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

interface StoneItem {
  id: string
  index: number
  title: string
  description: string
  href: string
  imageUrl: string
  imageAlt: string
}

interface StoneFocusProps {
  items?: StoneItem[]
}

interface StoneCardProps {
  item: StoneItem
}

function StoneCard({ item }: StoneCardProps) {
  return (
    <Link
      href={item.href}
      className="group relative block aspect-[3/4] cursor-pointer overflow-hidden bg-[#F0D5CE] after:pointer-events-none after:absolute after:inset-0 after:border after:border-transparent after:transition-colors after:duration-300 hover:after:border-[#C4857A]"
    >
      <Image
        src={item.imageUrl}
        alt={item.imageAlt}
        fill
        sizes="(max-width: 768px) 100vw, 20vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />

      <span className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-[#C4857A] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div
        className="absolute bottom-0 left-0 right-0 translate-y-[5px] px-[14px] pb-[17px] pt-3 transition-transform duration-300 group-hover:translate-y-0"
        style={{
          background:
            'linear-gradient(to top, rgba(45,26,22,0.72) 0%, transparent 100%)',
        }}
      >
        <p className={`${playfair.className} text-[10px] text-[#E8C9C0]`}>
          {String(item.index).padStart(2, '0')}
        </p>
        <h3
          className={`${playfair.className} mt-1 text-[16px] font-normal text-[#FDF6F3]`}
        >
          {item.title}
        </h3>
        <p
          className={`${inter.className} mt-1 text-[11px] font-normal text-[rgba(253,246,243,0.6)]`}
        >
          {item.description}
        </p>
      </div>
    </Link>
  )
}

const defaultStoneItems: StoneItem[] = [
  {
    id: 'moonstone',
    index: 1,
    title: 'Holdkő',
    description: 'Lágy fény, rétegezhető tónus.',
    href: '/gemstones',
    imageUrl: '/seed/moonstone-anklet.svg',
    imageAlt: 'Holdkő ékszer illusztráció',
  },
  {
    id: 'pearl',
    index: 2,
    title: 'Gyöngy',
    description: 'Finom, klasszikus részlet.',
    href: '/gemstones',
    imageUrl: '/seed/pearl-bracelet.svg',
    imageAlt: 'Gyöngy karkötő illusztráció',
  },
  {
    id: 'opal',
    index: 3,
    title: 'Opál',
    description: 'Visszafogott, mégis játékos fény.',
    href: '/gemstones',
    imageUrl: '/seed/opal-necklace.svg',
    imageAlt: 'Opál nyaklánc illusztráció',
  },
  {
    id: 'rose',
    index: 4,
    title: 'Rózsás tónusok',
    description: 'Meleg árnyalatok mindennapokra.',
    href: '/gemstones',
    imageUrl: '/seed/rose-necklace.svg',
    imageAlt: 'Rózsás tónusú nyaklánc illusztráció',
  },
  {
    id: 'gold',
    index: 5,
    title: 'Arany részletek',
    description: 'Könnyen hordható fényesség.',
    href: '/gemstones',
    imageUrl: '/seed/gold-earrings.svg',
    imageAlt: 'Arany fülbevaló illusztráció',
  },
]

export default function StoneFocus({ items = defaultStoneItems }: StoneFocusProps) {
  return (
    <section className="bg-[#FDF6F3] px-12 py-[52px]">
      <div className="mb-8 flex flex-col gap-6 border-b border-[#E8C9C0] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p
            className={`${inter.className} mb-3 text-[10px] font-normal uppercase tracking-[0.2em] text-[#C4857A]`}
          >
            Kurált fókusz
          </p>

          <h2
            className={`${playfair.className} text-[36px] font-normal leading-[1.1] text-[#2D1A16]`}
          >
            Kő szerint{' '}
            <em className="font-normal italic text-[#C4857A]">válogatva.</em>
          </h2>
        </div>

        <p
          className={`${inter.className} max-w-[300px] text-left text-[13px] font-normal leading-[1.7] text-[#9C6B63] md:text-right`}
        >
          Anyag, árnyalat és hangulat alapján — hogy a választás személyesebb
          legyen.
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <StoneCard key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-[26px] text-center">
        <Link
          href="/gemstones"
          className={`${inter.className} inline-block border-b border-[#C4857A] pb-1 text-[11px] font-normal uppercase tracking-[0.15em] text-[#C4857A] transition-all duration-[250ms] hover:tracking-[0.22em]`}
        >
          Összes kő megtekintése →
        </Link>
      </div>
    </section>
  )
}
