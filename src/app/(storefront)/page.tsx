import { HomeHero } from "@/components/home/HomeHero";
import { HomeInstagramPromo } from "@/components/home/HomeInstagramPromo";
import { HomeNewsletterBlock } from "@/components/home/HomeNewsletterBlock";
import { HomeProductShowcase } from "@/components/home/HomeProductShowcase";
import { HomePromoTileGrid } from "@/components/home/HomePromoTileGrid";
import { ValueStrip } from "@/components/home/ValueStrip";
import { getHomepageContent } from "@/lib/homepage-content";
import { getHomeShowcaseTabs } from "@/lib/homepage-showcase";

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

  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <HomeHero block={homepageContent.hero} />
      <ValueStrip />
      <section id="focusban" className="scroll-mt-24">
        <HomeProductShowcase tabs={showcaseTabs} />
      </section>
      <HomeInstagramPromo block={homepageContent.instagram} />
      <HomePromoTileGrid
        tiles={homepageContent.promoTiles}
        materialPicks={homepageContent.materialPicks}
      />
      <HomeNewsletterBlock status={newsletterStatus} />
    </main>
  );
}
