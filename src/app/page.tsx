
import { HomeProductSection } from "@/components/home/HomeProductSection";
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

function EditorialBrandBlock() {
  return (
    <aside className="px-2 py-2 lg:sticky lg:top-28">
      <div className="max-w-[420px] space-y-8">
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.34em] text-[#b760aa]">
            Butik ékszer webáruház
          </p>

          <div className="space-y-2">
            <h1 className="max-w-[10ch] font-sans text-[2.9rem] font-semibold leading-[0.9] tracking-[-0.06em] text-[#4f2348] sm:text-[3.5rem]">
              Ékszerek,
              <br />
              amik a te
              <br />
              történetedhez
              <br />
              készülnek.
            </h1>

            <p className="max-w-[14ch] font-serif text-[2rem] leading-[0.95] tracking-[-0.03em] text-[#4f2348] sm:text-[2.4rem]">
              <span className="relative inline-block text-[#f77ff0]">
                egyedi design
                <span className="absolute inset-x-0 bottom-[0.08em] -z-10 h-[0.28em] rounded-full bg-[#f7ff7a]/70 blur-[1px]" />
              </span>
              <span className="text-[#4f2348]"> minden személyiséghez.</span>
            </p>
          </div>
        </div>

        <div className="h-px w-16 bg-gradient-to-r from-[#f77ff0] to-transparent" />

        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.34em] text-[#b760aa]">
            From the heart by Borbolya
          </p>

          <p className="max-w-[24ch] text-sm leading-7 text-[#7d5b75] sm:text-[15px]">
            Megbízható, eredeti féldrágakövekből készített kollekciók,
            finoman nőies, modern megjelenéssel.
          </p>
        </div>
      </div>
    </aside>
  );
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
      

      <section className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] xl:gap-8">
          <EditorialBrandBlock />

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
    </main>
  );
}
