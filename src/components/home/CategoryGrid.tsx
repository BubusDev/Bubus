import Image from 'next/image'
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

interface Category {
  id: string
  title: string
  description: string
  href: string
  imageUrl: string
  imageAlt: string
  isNew?: boolean
}

interface CategoryGridProps {
  categories: Category[]
}

interface CategoryCardProps {
  category: Category
  isHero?: boolean
}

function CategoryCard({ category, isHero = false }: CategoryCardProps) {
  return (
    <a
      href={category.href}
      className={`group relative block h-[220px] cursor-pointer overflow-hidden bg-[#D4C9BE] md:h-full ${
        isHero ? 'md:row-span-2' : ''
      }`}
    >
      <Image
        src={category.imageUrl}
        alt={category.imageAlt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {category.isNew ? (
        <span
          className={`${inter.className} absolute left-4 top-4 rounded-full bg-[#F5F2ED]/90 px-3 py-1 text-[10px] font-normal uppercase tracking-[0.12em] text-[#5C534A]`}
        >
          Új
        </span>
      ) : null}

      <div
        className="absolute bottom-0 left-0 right-0 p-5"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.52) 0%, transparent 100%)',
        }}
      >
        <h3
          className={`${playfair.className} mb-1 font-normal text-white ${
            isHero ? 'text-[30px]' : 'text-[20px]'
          }`}
        >
          {category.title}
        </h3>
        <p
          className={`${inter.className} text-[12px] font-normal tracking-[0.04em] text-white/75`}
        >
          {category.description}
        </p>
      </div>
    </a>
  )
}

// TODO: wire categories prop to CMS query in page.tsx
export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="bg-[#F5F2ED] px-12 py-14">
      <div className="mb-10 grid items-end gap-8 md:grid-cols-2">
        <div>
          <p
            className={`${inter.className} mb-4 text-[11px] font-normal uppercase tracking-[0.18em] text-[#8B8175]`}
          >
            Kategóriák
          </p>

          <h2
            className={`${playfair.className} text-[36px] font-normal leading-[1.1] text-[#1C1917] sm:text-[44px]`}
          >
            Vonalak, amik együtt is{' '}
            <em className="font-normal italic text-[#6B5D4F]">működnek.</em>
          </h2>
        </div>

        <p
          className={`${inter.className} self-end text-left text-[14px] font-normal leading-[1.7] text-[#5C534A] md:text-right`}
        >
          Finom tónusok, rétegezhető formák és alkalmi darabok egy képi
          válogatásban.
        </p>
      </div>

      <div className="grid gap-[10px] md:grid-cols-2 md:grid-rows-[repeat(2,240px)] lg:grid-rows-[repeat(2,300px)]">
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            isHero={index === 0}
          />
        ))}
      </div>
    </section>
  )
}
