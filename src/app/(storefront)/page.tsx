import type { Metadata } from "next";
import { cookies } from "next/headers";

import FeaturedSlider from "@/components/home/FeaturedSlider";
import HeroBanner from "@/components/home/HeroBanner";
import { HomeEditorialSection, HomeFinalCta } from "@/components/home/HomeEditorialSection";
import { HomeInstagramPromo } from "@/components/home/HomeInstagramPromo";
import { HomeNewsletterBlock } from "@/components/home/HomeNewsletterBlock";
import { HomePromoTileGrid } from "@/components/home/HomePromoTileGrid";
import { HomepageInlineEditor } from "@/components/admin/homepage-inline/HomepageInlineEditor";
import { getCurrentUser } from "@/lib/auth";
import { getHomepageContent } from "@/lib/homepage-content";
import { getDictionary } from "@/lib/i18n";
import { LANGUAGE_COOKIE_NAME, validateSupportedLanguage } from "@/lib/international";
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
  const cookieStore = await cookies();
  const language = validateSupportedLanguage(cookieStore.get(LANGUAGE_COOKIE_NAME)?.value);
  const dictionary = getDictionary(language);
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
  const localizedHomepageContent =
    language === "en"
      ? {
          ...homepageContent,
          hero: {
            ...homepageContent.hero,
            title: dictionary["homepage.heroTitle"],
            body: dictionary["homepage.heroBody"],
            buttonText: dictionary["homepage.heroCta"],
            metadata: {
              ...homepageContent.hero.metadata,
              secondaryButtonText: dictionary["nav.limitedPieces"],
            },
          },
          categoryGrid: {
            ...homepageContent.categoryGrid,
            eyebrow: "Categories",
            title: "Pieces that work beautifully together.",
            body: "Soft tones, layerable shapes and occasion pieces in a curated visual edit.",
            metadata: {
              ...homepageContent.categoryGrid.metadata,
              materialEyebrow: "Curated focus",
              materialTitle: dictionary["homepage.materialTitle"],
              materialBody: "Shop by material, shade and mood to make choosing more personal.",
            },
          },
          featuredSlider: {
            ...homepageContent.featuredSlider,
            eyebrow: "Featured",
            title: dictionary["homepage.featuredTitle"],
            body: "New arrivals, giftable favourites and limited pieces in a clean edit.",
          },
          instagram: {
            ...homepageContent.instagram,
            body: dictionary["homepage.socialBody"],
            buttonText: "Follow on Instagram",
            metadata: {
              ...homepageContent.instagram.metadata,
              facebookBody: "Join the community for new pieces, feedback and behind-the-scenes notes.",
            },
          },
          newsletter: {
            ...homepageContent.newsletter,
            eyebrow: "Newsletter",
            title: dictionary["homepage.newsletterTitle"],
            body: dictionary["homepage.newsletterBody"],
            buttonText: "Subscribe",
            metadata: {
              ...homepageContent.newsletter.metadata,
              perks: ["Early new collections", "Limited pieces", "Special offers"],
              note: "No spam. Unsubscribe anytime.",
            },
          },
          promoTiles: homepageContent.promoTiles.map((tile) => ({
            ...tile,
            title:
              tile.slotIndex === 4
                ? "Limited lines"
                : tile.slotIndex === 5
                  ? "Layerable pieces"
                  : tile.slotIndex === 6
                    ? "New arrivals"
                    : tile.slotIndex === 7
                      ? "Shop by stone"
                      : tile.slotIndex === 8
                        ? "Sale pieces"
                        : tile.title,
            subtitle:
              tile.slotIndex === 4
                ? "New pieces in small runs"
                : tile.slotIndex === 5
                  ? "Bracelets for everyday wear"
                  : tile.slotIndex === 6
                    ? "Fresh colors and fine details"
                    : tile.slotIndex === 7
                      ? "A material and shade edit"
                      : tile.slotIndex === 8
                        ? "Available models in limited stock"
                        : tile.subtitle,
          })),
        }
      : homepageContent;

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
