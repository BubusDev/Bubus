'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Playfair_Display, Inter } from 'next/font/google'

import type { HomepageBlockView } from '@/lib/homepage-content'
import { useCountryLanguage } from '@/components/international/CountryLanguageProvider'
import { formatPriceForCountry, getDisplayPriceForCountry } from '@/lib/international'
import { getBrowserDisplayImageUrl } from '@/lib/image-safety'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

type BadgeType = string | null

type ShowcaseProduct = {
  id: string
  slug: string
  name: string
  nameEn?: string | null
  category?: string
  price: number
  priceEur?: number | null
  imageUrl?: string | null
  images?: {
    url: string
    alt?: string | null
    isCover: boolean
  }[]
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
  priceEur?: number | null
  href: string
  imageUrl: string | null
  imageAlt: string
  badge?: BadgeType
}

interface FeaturedSliderProps {
  tabs: ShowcaseTab[]
  contentBlock?: HomepageBlockView
}

interface ProductCardProps {
  product: Product
  isWishlisted: boolean
  onWishlistToggle: (id: string) => void
}

const CARD_WIDTH = 274
const requestedTabs = [
  {
    key: 'karkotok',
    label: 'Karkötők',
    matches: ['karkoto', 'karkötő', 'bracelet', 'bracelets'],
  },
  {
    key: 'nyaklancok',
    label: 'Nyakláncok',
    matches: ['nyaklanc', 'nyaklánc', 'necklace', 'necklaces'],
  },
]

function getProductBadge(product: ShowcaseProduct, language: string): BadgeType {
  if (product.isNew) return language === 'en' ? 'New' : 'Új'
  if (product.isOnSale) return language === 'en' ? 'Limited' : 'Limitált'
  return null
}

function normalizeFilterValue(value: string | undefined) {
  return (value ?? '').toLocaleLowerCase('hu')
}

function getProductImage(product: ShowcaseProduct) {
  const coverImage = product.images?.find((image) => image.isCover) ?? product.images?.[0]
  const displayUrl = getBrowserDisplayImageUrl(coverImage?.url ?? product.imageUrl)

  return {
    alt: coverImage?.alt?.trim() || product.name,
    url: displayUrl,
  }
}

function mapProduct(product: ShowcaseProduct, language: string): Product {
  const image = getProductImage(product)
  const name = language === 'en' && product.nameEn?.trim() ? product.nameEn.trim() : product.name

  return {
    id: product.id,
    name,
    price: product.price,
    priceEur: product.priceEur,
    href: `/product/${product.slug}`,
    imageUrl: image.url,
    imageAlt: image.alt,
    badge: getProductBadge(product, language),
  }
}

function getDisplayTabs(tabs: ShowcaseTab[], language: string) {
  const inlineFeaturedTab = tabs.find((tab) => tab.key === 'inline-featured' || tab.key === 'inline-featured-preview')

  if (inlineFeaturedTab) {
    return [inlineFeaturedTab]
  }

  const allProductsById = new Map<string, ShowcaseProduct>()

  for (const tab of tabs) {
    for (const product of tab.products) {
      allProductsById.set(product.id, product)
    }
  }

  const allProducts = Array.from(allProductsById.values())
  const categoryTabs = requestedTabs
    .map((definition) => {
      const configuredTab = tabs.find((tab) => {
        const key = normalizeFilterValue(tab.key)
        const label = normalizeFilterValue(tab.label)

        return definition.matches.some((match) => key.includes(match) || label.includes(match))
      })
      const products =
        configuredTab?.products ??
        allProducts.filter((product) => {
          const category = normalizeFilterValue(product.category)

          return definition.matches.some((match) => category.includes(match))
        })

      return {
        key: configuredTab?.key ?? definition.key,
        label: language === 'en' ? (definition.key === 'karkotok' ? 'Bracelets' : 'Necklaces') : definition.label,
        products,
      }
    })
    .filter((tab) => tab.products.length > 0)

  return categoryTabs.length > 0 ? categoryTabs : tabs
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
  const { country } = useCountryLanguage()
  const displayPrice = useMemo(() => getDisplayPriceForCountry(product, country), [country, product])
  const priceLabel = useMemo(
    () => displayPrice == null ? 'Not available for EU delivery' : formatPriceForCountry(displayPrice, country),
    [country, displayPrice],
  )
  return (
    <article className="group w-full cursor-pointer md:w-[260px] md:flex-none">
      <div className="relative mb-[14px] h-[320px] overflow-hidden bg-[#E8D5CF]">
        <Link href={product.href} aria-label={product.name} className="block h-full">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 260px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(155deg,#f5f3f0,#ece8e3)] px-5 text-center">
              <span className={`${playfair.className} text-lg leading-tight text-[#5e5358]/70`}>
                {product.name}
              </span>
            </div>
          )}
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
          {priceLabel}
        </p>
      </Link>
    </article>
  )
}

export default function FeaturedSlider({ tabs, contentBlock }: FeaturedSliderProps) {
  const { language } = useCountryLanguage()
  const displayTabs = useMemo(() => getDisplayTabs(tabs, language), [tabs, language])
  const [pos, setPos] = useState(0)
  const [activeTab, setActiveTab] = useState('')
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set())
  const visible = useVisibleCards()
  const resolvedActiveTab = displayTabs.some((tab) => tab.key === activeTab)
    ? activeTab
    : displayTabs[0]?.key

  const activeProducts = useMemo(() => {
    const activeProductsFromTabs =
      displayTabs.find((tab) => tab.key === resolvedActiveTab)?.products ?? displayTabs[0]?.products ?? []

    return activeProductsFromTabs.map((product) => mapProduct(product, language))
  }, [displayTabs, language, resolvedActiveTab])

  const maxPos = Math.max(activeProducts.length - visible, 0)
  const effectivePos = Math.min(pos, maxPos)
  const progressWidth = maxPos === 0 ? 100 : (effectivePos / maxPos) * 66 + 33

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

  if (displayTabs.length === 0) {
    return null
  }

  return (
    <section className="bg-[#F5F2ED] px-4 py-[52px] sm:px-6 lg:pl-12 lg:pr-0">
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:pr-12">
        <div>
          <p
            className={`${inter.className} mb-3 text-[10px] font-normal uppercase tracking-[0.2em] text-[#C4857A]`}
          >
            {contentBlock?.eyebrow || 'Fókuszban'}
          </p>

          <h2
            className={`${playfair.className} text-[40px] font-normal leading-[1.1] text-[#2D1A16]`}
          >
            {contentBlock?.title || 'Szerkesztett darabok.'}
          </h2>
        </div>

        <p
          className={`${inter.className} max-w-[280px] text-left text-[13px] font-normal leading-[1.7] text-[#9C6B63] md:text-right`}
        >
          {contentBlock?.body ||
            'Újdonságok, ajándéknak választott kedvencek és limitált darabok egy letisztult válogatásban.'}
        </p>
      </div>

      <div className="mb-7 hidden border-b border-[#E8C9C0] md:flex lg:pr-12">
        {displayTabs.map((tab) => {
          const isActive = tab.key === resolvedActiveTab

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

      <div className="grid gap-[22px] sm:grid-cols-2 md:hidden">
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
            transform: `translateX(-${effectivePos * CARD_WIDTH}px)`,
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

      <div className="mt-7 hidden items-center justify-end gap-[10px] md:flex lg:pr-12">
        <div className="h-px max-w-[200px] flex-1 overflow-hidden rounded bg-[#E8C9C0]">
          <div
            className="h-full rounded bg-[#C4857A] transition-all duration-[450ms]"
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        <button
          type="button"
          aria-label="Előző termékek"
          disabled={effectivePos === 0}
          onClick={() => setPos((currentPos) => Math.max(currentPos - 1, 0))}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#E8C9C0] bg-[#FDF6F3] transition hover:border-[#C4857A] hover:bg-[#F0D5CE] disabled:pointer-events-none disabled:cursor-default disabled:opacity-35"
        >
          <ArrowIcon direction="left" />
        </button>

        <button
          type="button"
          aria-label="Következő termékek"
          disabled={effectivePos === maxPos}
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
