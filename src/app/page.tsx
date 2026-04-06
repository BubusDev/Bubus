
import { Gem, Heart, Leaf, Shield, Sparkles, Star } from "lucide-react";

import { HomeHero } from "@/components/home/HomeHero";
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

const VALUES = [
  { Icon: Sparkles, label: "KÉZZEL ALKOTVA" },
  { Icon: Heart, label: "SZERETETTEL KÉSZÍTVE" },
  { Icon: Gem, label: "FÉLDRÁGAKÖVEK" },
  { Icon: Leaf, label: "ETIKUS BESZERZÉS" },
  { Icon: Star, label: "LIMITÁLT DARABOK" },
  { Icon: Shield, label: "MINŐSÉG GARANTÁLT" },
];

function ValuesStrip() {
  return (
    <div className="w-full bg-[#2b1220] py-4 px-6">
      <div className="flex overflow-x-auto lg:justify-center gap-8 lg:gap-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VALUES.map(({ Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 flex-shrink-0">
            <Icon className="w-5 h-5 text-rose-300" />
            <span className="text-[10px] font-semibold tracking-[0.28em] text-white/80 whitespace-nowrap">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
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
      <HomeHero />

      <ValuesStrip />

      <section className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
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
      </section>
    </main>
  );
}
