'use client'

import { useEffect, useMemo, useState } from 'react'
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

type BadgeType = 'Új' | 'Limitált' | null

type ShowcaseProduct = {
  id: string
  slug: string
  name: string
  price: number
  imageUrl?: string | null
  isNew?: boolean
  isOnSale?: boolean
}

type ShowcaseTab = {
  key: string
  label: string
  products: ShowcaseProduct[]
}

type Product = {
  id: string
  name: string
  price: number
  href: string
  imageUrl: string
  imageAlt: string
  badge?: BadgeType
}

interface FeaturedSliderProps {
  tabs: ShowcaseTab[]
}

interface ProductCardProps {
  product: Product
  isWishlisted: boolean
  onWishlistToggle: (id: string) => void
}

const CARD_WIDTH = 274
const fallbackProductImage =
  '/uploads/special-edition/jellyfish-e2a5b467-e672-495e-9248-6a94d4f7d6ad.jpg'

function getProductBadge(product: ShowcaseProduct): BadgeType {
  if (product.isNew) return 'Új'
  if (product.isOnSale) return 'Limitált'
  return null
}

function mapProduct(product: ShowcaseProduct): Product {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    href: `/product/${product.slug}`,
    imageUrl: product.imageUrl || fallbackProductImage,
    imageAlt: product.name,
    badge: getProductBadge(product),
  }
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[15px] w-[15px]"
      fill={filled ? '#C4857A' : 'none'}
      stroke="#C4857A"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 0 1 12 6a5 5 0 0 1 7.5 6.6Z" />
    </svg>
  )
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="#2D1A16"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {direction === 'left' ? (
        <>
          <path d="M5 12h14" />
          <path d="m11 6-6 6 6 6" />
        </>
      ) : (
        <>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </>
      )}
    </svg>
  )
}

function useVisibleCards() {
  const [visible, setVisible] = useState(3)

  useEffect(() => {
    const updateVisible = () => {
      setVisible(window.innerWidth >= 1024 ? 3 : 2)
    }

    updateVisible()
    window.addEventListener('resize', updateVisible)

    return () => {
      window.removeEventListener('resize', updateVisible)
    }
  }, [])

  return visible
}

function ProductCard({
  product,
  isWishlisted,
  onWishlistToggle,
}: ProductCardProps) {
  return (
    <article className="group w-full cursor-pointer md:w-[260px] md:flex-none">
      <div className="relative mb-[14px] h-[320px] overflow-hidden bg-[#E8D5CF]">
        <Link href={product.href} aria-label={product.name}>
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 260px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </Link>

        {product.badge ? (
          <span
            className={`${inter.className} absolute left-3 top-3 rounded-full bg-[#C4857A] px-[10px] py-1 text-[9.5px] font-normal uppercase tracking-[0.1em] text-[#FDF6F3]`}
          >
            {product.badge}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={
            isWishlisted
              ? `${product.name} eltávolítása a kívánságlistáról`
              : `${product.name} hozzáadása a kívánságlistához`
          }
          aria-pressed={isWishlisted}
          onClick={() => onWishlistToggle(product.id)}
          className="absolute right-2.5 top-2.5 flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border-none bg-[rgba(253,246,243,0.85)] opacity-100 transition-opacity duration-[250ms] md:opacity-0 md:group-hover:opacity-100"
        >
          <HeartIcon filled={isWishlisted} />
        </button>
      </div>

      <Link href={product.href} className="block">
        <h3
          className={`${playfair.className} mb-1 text-[15px] font-normal text-[#2D1A16]`}
        >
          {product.name}
        </h3>
        <p
          className={`${inter.className} text-[13px] font-normal text-[#9C6B63]`}
        >
          {product.price.toLocaleString('hu-HU')} Ft
        </p>
      </Link>
    </article>
  )
}

export default function FeaturedSlider({ tabs }: FeaturedSliderProps) {
  const [pos, setPos] = useState(0)
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? '')
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set())
  const visible = useVisibleCards()

  const activeProducts = useMemo(() => {
    const activeProductsFromTabs =
      tabs.find((tab) => tab.key === activeTab)?.products ?? tabs[0]?.products ?? []

    return activeProductsFromTabs.map(mapProduct)
  }, [activeTab, tabs])

  const maxPos = Math.max(activeProducts.length - visible, 0)
  const progressWidth = maxPos === 0 ? 100 : (pos / maxPos) * 66 + 33

  useEffect(() => {
    if (!activeTab && tabs[0]?.key) {
      setActiveTab(tabs[0].key)
    }
  }, [activeTab, tabs])

  useEffect(() => {
    setPos((currentPos) => Math.min(currentPos, maxPos))
  }, [maxPos])

  const handleTabClick = (key: string) => {
    setActiveTab(key)
    setPos(0)
  }

  const handleWishlistToggle = (id: string) => {
    setWishlistedIds((currentIds) => {
      const nextIds = new Set(currentIds)

      if (nextIds.has(id)) {
        nextIds.delete(id)
      } else {
        nextIds.add(id)
      }

      return nextIds
    })
  }

  if (tabs.length === 0) {
    return null
  }

  return (
    <section className="bg-[#F5F2ED] pb-[52px] pl-12 pr-0 pt-[52px]">
      <div className="mb-8 flex flex-col gap-6 pr-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p
            className={`${inter.className} mb-3 text-[10px] font-normal uppercase tracking-[0.2em] text-[#C4857A]`}
          >
            Fókuszban
          </p>

          <h2
            className={`${playfair.className} text-[40px] font-normal leading-[1.1] text-[#2D1A16]`}
          >
            Szerkesztett{' '}
            <em className="font-normal italic text-[#C4857A]">darabok.</em>
          </h2>
        </div>

        <p
          className={`${inter.className} max-w-[280px] text-left text-[13px] font-normal leading-[1.7] text-[#9C6B63] md:text-right`}
        >
          Újdonságok, ajándéknak választott kedvencek és limitált darabok egy
          letisztult válogatásban.
        </p>
      </div>

      <div className="mb-7 hidden border-b border-[#E8C9C0] pr-12 md:flex">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className={`${inter.className} mr-7 cursor-pointer border-b-[1.5px] pb-3 text-[11px] font-normal uppercase tracking-[0.14em] transition-colors ${
                isActive
                  ? 'border-[#C4857A] text-[#2D1A16]'
                  : 'border-transparent text-[#9C6B63]'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="grid gap-[22px] pr-12 md:hidden">
        {activeProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isWishlisted={wishlistedIds.has(product.id)}
            onWishlistToggle={handleWishlistToggle}
          />
        ))}
      </div>

      <div className="hidden overflow-hidden md:block">
        <div
          className="flex gap-[14px]"
          style={{
            transform: `translateX(-${pos * CARD_WIDTH}px)`,
            transition: 'transform 450ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {activeProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistedIds.has(product.id)}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      </div>

      <div className="mt-7 hidden items-center justify-end gap-[10px] pr-12 md:flex">
        <div className="h-px max-w-[200px] flex-1 overflow-hidden rounded bg-[#E8C9C0]">
          <div
            className="h-full rounded bg-[#C4857A] transition-all duration-[450ms]"
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        <button
          type="button"
          aria-label="Előző termékek"
          disabled={pos === 0}
          onClick={() => setPos((currentPos) => Math.max(currentPos - 1, 0))}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#E8C9C0] bg-[#FDF6F3] transition hover:border-[#C4857A] hover:bg-[#F0D5CE] disabled:pointer-events-none disabled:cursor-default disabled:opacity-35"
        >
          <ArrowIcon direction="left" />
        </button>

        <button
          type="button"
          aria-label="Következő termékek"
          disabled={pos === maxPos}
          onClick={() =>
            setPos((currentPos) => Math.min(currentPos + 1, maxPos))
          }
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#E8C9C0] bg-[#FDF6F3] transition hover:border-[#C4857A] hover:bg-[#F0D5CE] disabled:pointer-events-none disabled:cursor-default disabled:opacity-35"
        >
          <ArrowIcon direction="right" />
        </button>
      </div>
    </section>
  )
}
