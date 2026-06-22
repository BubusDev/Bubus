import type { Metadata } from "next";

import { HomeHero } from "@/components/home/HomeHero";
import { HomeEditorialSection, HomeFinalCta } from "@/components/home/HomeEditorialSection";
import { HomeInstagramPromo } from "@/components/home/HomeInstagramPromo";
import { HomeNewsletterBlock } from "@/components/home/HomeNewsletterBlock";
import { HomeProductShowcase } from "@/components/home/HomeProductShowcase";
import { HomePromoTileGrid } from "@/components/home/HomePromoTileGrid";
import { ValueStrip } from "@/components/home/ValueStrip";
import { getHomepageContent } from "@/lib/homepage-content";
import { getHomeShowcaseTabs } from "@/lib/homepage-showcase";
import { getAbsoluteUrl, siteDescription, siteName } from "@/lib/site";

const homepageTitle = `${siteName} | Limitált ékszerek kis szériában`;
const homepageDescription =
  "Limitált ékszerek, gondosan válogatott anyagokból. Finom részletek, kis szériás újdonságok és kurált Chicks Jewelry válogatások.";
const homepageOgImage = "/uploads/special-edition/jellyfish-e2a5b467-e672-495e-9248-6a94d4f7d6ad.jpg";

export const metadata: Metadata = {
  title: homepageTitle,
  description: homepageDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: homepageTitle,
    description: homepageDescription,
    type: "website",
    url: "/",
    siteName,
    images: [
      {
        url: homepageOgImage,
        width: 1200,
        height: 900,
        alt: "Chicks Jewelry limitált ékszer válogatás",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: homepageTitle,
    description: homepageDescription,
    images: [homepageOgImage],
  },
};

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const [homepageContent, showcaseTabs] = await Promise.all([
    getHomepageContent(),
    getHomeShowcaseTabs(),
  ]);
  const newsletterStatusValue = resolvedSearchParams.newsletter;
  const newsletterStatus = Array.isArray(newsletterStatusValue)
    ? newsletterStatusValue[0]
    : newsletterStatusValue;
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: getAbsoluteUrl("/"),
    description: siteDescription,
    sameAs: ["https://instagram.com/chicksjewelry"],
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: getAbsoluteUrl("/"),
    description: homepageDescription,
  };

  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <HomeHero block={homepageContent.hero} />
      <ValueStrip />
      {showcaseTabs.length > 0 ? (
        <section id="focusban" className="scroll-mt-24 bg-[#fbfaf7] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#6f775d]">
                  Fókuszban
                </p>
                <h2 className="mt-4 max-w-[11ch] font-[family:var(--font-display)] text-[2.7rem] leading-[0.94] tracking-[-0.035em] text-[#22231f] sm:text-[4rem]">
                  Szerkesztett darabok.
                </h2>
              </div>
              <p className="max-w-[42ch] text-sm leading-7 text-[#69645b] sm:text-right">
                Újdonságok, ajándéknak választott kedvencek és limitált darabok egy
                letisztult válogatásban.
              </p>
            </div>
            <HomeProductShowcase tabs={showcaseTabs} />
          </div>
        </section>
      ) : null}
      <HomePromoTileGrid
        tiles={homepageContent.promoTiles}
        materialPicks={homepageContent.materialPicks}
      />
      <HomeEditorialSection />
      <HomeInstagramPromo block={homepageContent.instagram} />
      <HomeNewsletterBlock status={newsletterStatus} />
      <HomeFinalCta />
    </main>
  );
}
