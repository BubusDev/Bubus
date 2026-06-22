import type { CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Playfair_Display, Inter } from 'next/font/google'

import type { HomepageBlockView } from '@/lib/homepage-content'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

interface FeatureItem {
  label: string
  text: string
}

interface HeroBannerProps {
  block: HomepageBlockView
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  features?: FeatureItem[]
}

const defaultFeatures: FeatureItem[] = [
  {
    label: 'Kis széria',
    text: 'Új darabok korlátozott mennyiségben, átgondolt ritmusban.',
  },
  {
    label: 'Válogatott anyagok',
    text: 'Kövek és tónusok, amelyek közelről is szépek.',
  },
  {
    label: 'Finom részletek',
    text: 'Nem harsány kiegészítők, mégis emlékezetes karakterrel.',
  },
]

const sparklePositions = [
  { top: '15%', left: '68%', delay: '0s' },
  { top: '30%', left: '80%', delay: '0.7s' },
  { top: '55%', left: '72%', delay: '1.4s' },
  { top: '70%', left: '85%', delay: '0.3s' },
  { top: '20%', left: '90%', delay: '1.8s' },
  { top: '45%', left: '92%', delay: '1s' },
]

export default function HeroBanner({
  block,
  primaryCta,
  secondaryCta = { label: 'Kollekciók', href: '/special-edition' },
  features = defaultFeatures,
}: HeroBannerProps) {
  if (!block.isVisible) {
    return null
  }

  const resolvedPrimaryCta = primaryCta ?? {
    label: block.buttonText || 'Vásárlás most',
    href: block.buttonHref || '/special-edition',
  }
  const imageUrl =
    block.imageUrl ||
    '/uploads/special-edition/jellyfish-e2a5b467-e672-495e-9248-6a94d4f7d6ad.jpg'

  return (
    <section className="w-full">
      <div className="relative h-[360px] overflow-hidden bg-[#E0157A] md:h-[500px]">
        <Image
          src={imageUrl}
          alt={block.imageAlt || block.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(150,5,80,0.55)_0%,rgba(150,5,80,0.15)_55%,transparent_100%)]" />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {sparklePositions.map((sparkle) => (
            <span
              key={`${sparkle.top}-${sparkle.left}`}
              className="hero-banner-sparkle absolute h-1 w-1 rounded-full bg-white"
              style={
                {
                  top: sparkle.top,
                  left: sparkle.left,
                  animationDelay: sparkle.delay,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="absolute inset-0 flex flex-col justify-center px-6 py-10 md:px-[56px] md:py-[52px]">
          <div className="max-w-[640px]">
            <p
              className={`${inter.className} mb-[18px] text-[10px] font-normal uppercase tracking-[0.22em] text-[rgba(255,220,240,0.8)]`}
            >
              {block.eyebrow || 'Limitált butik válogatás'}
            </p>

            <h1
              className={`${playfair.className} mb-[18px] text-[34px] font-normal leading-[1.08] text-white md:text-[52px]`}
            >
              {block.title || 'Ne félj extra lenni!'}
            </h1>

            <p
              className={`${inter.className} mb-9 max-w-[380px] text-[14px] font-light leading-[1.75] text-[rgba(255,255,255,0.85)]`}
            >
              {block.body ||
                'Féldrágakő karkötők és nyakláncok kis szériában, outfitedhez, hangulatodhoz, évszakodhoz.'}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={resolvedPrimaryCta.href}
                className={`${inter.className} inline-flex bg-[#FFD6EE] px-[26px] py-[13px] text-[11px] font-medium uppercase tracking-[0.14em] text-[#A8005C] transition-colors hover:bg-white`}
              >
                {resolvedPrimaryCta.label}
              </Link>
              <Link
                href={secondaryCta.href}
                className={`${inter.className} inline-flex border border-[rgba(255,255,255,0.65)] bg-transparent px-[26px] py-[13px] text-[11px] font-medium uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-[rgba(255,255,255,0.15)]`}
              >
                {secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 border-t border-[#F0C0D8] bg-[#FDF0F6] md:grid-cols-3">
        {features.map((feature, index) => {
          const isLast = index === features.length - 1

          return (
            <div
              key={`${feature.label}-${index}`}
              className={`px-9 py-7 ${
                isLast
                  ? ''
                  : 'border-b border-[#F0C0D8] md:border-b-0 md:border-r'
              } md:border-[#F0C0D8]`}
            >
              <p
                className={`${inter.className} mb-[10px] text-[10px] font-normal uppercase tracking-[0.18em] text-[#C0006A]`}
              >
                {feature.label}
              </p>
              <p
                className={`${inter.className} text-[13.5px] font-normal leading-[1.7] text-[#6B3D52]`}
              >
                {feature.text}
              </p>
            </div>
          )
        })}
      </div>

      <style>
        {`
          @keyframes twinkle {
            0% {
              opacity: 0;
              transform: scale(0.5);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.4);
            }
            100% {
              opacity: 0;
              transform: scale(0.5);
            }
          }

          .hero-banner-sparkle {
            animation: twinkle 3s infinite;
          }
        `}
      </style>
    </section>
  )
}
