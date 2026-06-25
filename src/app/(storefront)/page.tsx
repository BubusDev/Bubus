import type { Metadata } from "next";

import FeaturedSlider from "@/components/home/FeaturedSlider";
import HeroBanner from "@/components/home/HeroBanner";
import { HomeEditorialSection, HomeFinalCta } from "@/components/home/HomeEditorialSection";
import { HomeInstagramPromo } from "@/components/home/HomeInstagramPromo";
import { HomeNewsletterBlock } from "@/components/home/HomeNewsletterBlock";
import { HomePromoTileGrid } from "@/components/home/HomePromoTileGrid";
import { HomepageInlineEditor } from "@/components/admin/homepage-inline/HomepageInlineEditor";
import { getCurrentUser } from "@/lib/auth";
import { getHomepageContent } from "@/lib/homepage-content";
import { getLocalizedHomepageContent } from "@/lib/homepage-localization";
import { getAlternateLanguages } from "@/lib/locale-routing";
import { getRequestLocale } from "@/lib/request-locale";
import {
  getAdminShowcaseProducts,
  getHomeShowcaseTabs,
  getInlineFeaturedProductIds,
} from "@/lib/homepage-showcase";
import { getAbsoluteUrl, siteDescription, siteName } from "@/lib/site";

const homepageTitle = `${siteName} | Limitált ékszerek kis szériában`;
const homepageDescription =
  "Limitált ékszerek, gondosan válogatott anyagokból. Finom részletek, kis szériás újdonságok és kurált Chicks Jewelry válogatások.";
const homepageOgImage = "/uploads/special-edition/jellyfish-e2a5b467-e672-495e-9248-6a94d4f7d6ad.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getRequestLocale();
  const canonical = language === "en" ? "/en" : "/";
  const title = language === "en" ? `${siteName} | Small-batch gemstone jewelry` : homepageTitle;
  const description = language === "en"
    ? "Small-batch gemstone jewelry, curated materials and limited Chicks Jewelry edits."
    : homepageDescription;

  return {
    title,
    description,
    alternates: { canonical, languages: getAlternateLanguages("/") },
    openGraph: {
      title,
      description,
    type: "website",
      url: canonical,
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
      title,
      description,
    images: [homepageOgImage],
    },
  };
}

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const language = await getRequestLocale();
  const [homepageContent, showcaseTabs, currentUser] = await Promise.all([
    getHomepageContent(),
    getHomeShowcaseTabs(),
    getCurrentUser(),
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
  const isAdmin = currentUser?.emailVerifiedAt && currentUser.role === "ADMIN";
  const localizedHomepageContent = getLocalizedHomepageContent(homepageContent, language);

  if (isAdmin) {
    const [productOptions, inlineFeaturedProductIds] = await Promise.all([
      getAdminShowcaseProducts(),
      getInlineFeaturedProductIds(),
    ]);
    const materialProductIds = homepageContent.materialPicks
      .filter((pick) => pick.type === "PRODUCT" && !pick.id.startsWith("fallback-product-"))
      .map((pick) => pick.storedFeaturedProductId ?? pick.featuredProductId)
      .filter((id): id is string => Boolean(id));

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <HomepageInlineEditor
          initialContent={homepageContent}
          showcaseTabs={showcaseTabs}
          productOptions={productOptions}
          initialFeaturedProductIds={inlineFeaturedProductIds}
          initialMaterialProductIds={materialProductIds}
          newsletterStatus={newsletterStatus}
        />
      </>
    );
  }

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
      <HeroBanner block={localizedHomepageContent.hero} featureBlock={localizedHomepageContent.heroFeatureBar} />
      <HomePromoTileGrid
        tiles={localizedHomepageContent.promoTiles}
        materialPicks={localizedHomepageContent.materialPicks}
        categoryBlock={localizedHomepageContent.categoryGrid}
      />
      {showcaseTabs.length > 0 ? (
        <FeaturedSlider tabs={showcaseTabs} contentBlock={localizedHomepageContent.featuredSlider} />
      ) : null}
      <HomeEditorialSection />
      <HomeInstagramPromo block={localizedHomepageContent.instagram} />
      <HomeNewsletterBlock contentBlock={localizedHomepageContent.newsletter} status={newsletterStatus} />
      <HomeFinalCta />
    </main>
  );
}
