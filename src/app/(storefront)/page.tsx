import { HomeHero } from "@/components/home/HomeHero";
import { HomeInstagramPromo } from "@/components/home/HomeInstagramPromo";
import { HomeNewsletterBlock } from "@/components/home/HomeNewsletterBlock";
import { HomeProductSection } from "@/components/home/HomeProductSection";
import { HomePromoTileGrid } from "@/components/home/HomePromoTileGrid";
import { ValueStrip } from "@/components/home/ValueStrip";
import { getHomepageContent } from "@/lib/homepage-content";
import { getHomepageProducts } from "@/lib/products";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const [homepageContent, spotlightData] = await Promise.all([
    getHomepageContent(),
    getHomepageProducts("spotlight", 1, 20),
  ]);
  const newsletterStatusValue = resolvedSearchParams.newsletter;
  const newsletterStatus = Array.isArray(newsletterStatusValue)
    ? newsletterStatusValue[0]
    : newsletterStatusValue;

  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <HomeHero block={homepageContent.hero} />
      <ValueStrip />
      <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <HomeProductSection
          eyebrow="Fókuszban"
          title="Újdonságok"
          href="/new-in"
          products={spotlightData.products}
          redirectTo="/"
          compactPremiumRow
        />
      </section>
      <HomeInstagramPromo block={homepageContent.instagram} />
      <HomePromoTileGrid tiles={homepageContent.promoTiles} />
      <HomeNewsletterBlock status={newsletterStatus} />
    </main>
  );
}
