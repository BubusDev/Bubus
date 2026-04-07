
import { AmbientBlobs } from "@/components/AmbientBlobs";
import { EditorialBrandBlock } from "@/components/home/EditorialBrandBlock";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeProductSection } from "@/components/home/HomeProductSection";
import { ValueStrip } from "@/components/home/ValueStrip";
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
  const newArrivalsPage = readPageParam(resolvedSearchParams, "newArrivalsPage");
  const [spotlightData, newArrivalData] = await Promise.all([
    getHomepageProducts("spotlight", spotlightPage),
    getHomepageProducts("new_arrivals", newArrivalsPage),
  ]);
  const normalizedSearchParams = {
    spotlightPage: spotlightPage > 1 ? String(spotlightPage) : undefined,
    newArrivalsPage: newArrivalsPage > 1 ? String(newArrivalsPage) : undefined,
  };
  const homeRedirectTo = toQueryString(normalizedSearchParams);

  return (
    <main className="min-h-screen">
      {/* Products at top — ambient blobs only here */}
      <div className="relative overflow-hidden">
        <AmbientBlobs />
        <section className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10 xl:gap-16">
            {/* Left: Editorial brand block */}
            <div className="hidden lg:block">
              <div className="sticky top-8 pt-4">
                <EditorialBrandBlock />
              </div>
            </div>

            {/* Right: Products */}
            <div className="space-y-6 sm:space-y-8">
              <HomeProductSection
                eyebrow="Válogatott kedvencek"
                title="FÓKUSZBAN"
                href="/new-in"
                products={spotlightData.products}
                redirectTo={homeRedirectTo}
                page={spotlightData.page}
                totalPages={spotlightData.totalPages}
                pageParam="spotlightPage"
                searchParams={normalizedSearchParams}
              />

              <HomeProductSection
                eyebrow="Friss kincsek"
                title="ÚJDONSÁGOK"
                href="/new-in"
                products={newArrivalData.products}
                redirectTo={homeRedirectTo}
                page={newArrivalData.page}
                totalPages={newArrivalData.totalPages}
                pageParam="newArrivalsPage"
                searchParams={normalizedSearchParams}
              />
            </div>
          </div>
        </section>
      </div>

      <ValueStrip />

      <HomeHero />
    </main>
  );
}
