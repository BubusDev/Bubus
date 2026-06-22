import type { Metadata } from "next";

import BrandPhilosophy from "@/components/home/BrandPhilosophy";
import FeaturedSlider from "@/components/home/FeaturedSlider";
import HeroBanner from "@/components/home/HeroBanner";
import { HomeEditorialSection, HomeFinalCta } from "@/components/home/HomeEditorialSection";
import { HomeInstagramPromo } from "@/components/home/HomeInstagramPromo";
import { HomeNewsletterBlock } from "@/components/home/HomeNewsletterBlock";
import { HomePromoTileGrid } from "@/components/home/HomePromoTileGrid";
import StoneFocus from "@/components/home/StoneFocus";
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
      <HeroBanner block={homepageContent.hero} />
      <BrandPhilosophy />
      <HomePromoTileGrid
        tiles={homepageContent.promoTiles}
        materialPicks={homepageContent.materialPicks}
      />
      <StoneFocus />
      {showcaseTabs.length > 0 ? <FeaturedSlider tabs={showcaseTabs} /> : null}
      <HomeEditorialSection />
      <HomeInstagramPromo block={homepageContent.instagram} />
      <HomeNewsletterBlock status={newsletterStatus} />
      <HomeFinalCta />
    </main>
  );
}
