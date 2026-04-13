import { HomeHero } from "@/components/home/HomeHero";
import { HomeInstagramPromo } from "@/components/home/HomeInstagramPromo";
import { HomeNewsletterBlock } from "@/components/home/HomeNewsletterBlock";
import { HomeProductSection } from "@/components/home/HomeProductSection";
import { HomePromoTileGrid } from "@/components/home/HomePromoTileGrid";
import { ValueStrip } from "@/components/home/ValueStrip";
import { getHomepageContent } from "@/lib/homepage-content";
import { getHomepageProducts } from "@/lib/products";

function toQueryString(searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readPageParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const raw = searchParams[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  const page = Number(value);

  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const spotlightPage = readPageParam(resolvedSearchParams, "spotlightPage");
  const [homepageContent, spotlightData] = await Promise.all([
    getHomepageContent(),
    getHomepageProducts("spotlight", spotlightPage),
  ]);
  const normalizedSearchParams = {
    spotlightPage: spotlightPage > 1 ? String(spotlightPage) : undefined,
  };
  const homeRedirectTo = toQueryString(normalizedSearchParams);

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
          redirectTo={homeRedirectTo}
          page={spotlightData.page}
          totalPages={spotlightData.totalPages}
          pageParam="spotlightPage"
          searchParams={normalizedSearchParams}
          compactPremiumRow
        />
      </section>
      <HomeInstagramPromo block={homepageContent.instagram} />
      <HomeNewsletterBlock />
      <HomePromoTileGrid tiles={homepageContent.promoTiles} />
    </main>
  );
}
