import type { Metadata } from "next";
import Link from "next/link";

import { ProductGrid } from "@/components/shop/ProductGrid";
import { getProductsForSpecialty } from "@/lib/products";
import { getSpecialtyHref, getVisibleSpecialties } from "@/lib/specialty-navigation";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: `Különlegességek | ${siteName}`,
  description:
    "Fedezd fel a Chicks Jewelry különleges válogatásait: napfogók, álomfogók, bokaláncok és további kézzel kezelt kollekciók.",
  alternates: {
    canonical: "/kulonlegessegek",
  },
};

export default async function SpecialtiesLandingPage() {
  const specialties = await getVisibleSpecialties();
  const specialtySections = await Promise.all(
    specialties.map(async (specialty) => ({
      specialty,
      products: (await getProductsForSpecialty(specialty.slug)).slice(0, 4),
    })),
  );

  return (
    <main className="mx-auto max-w-[1450px] px-6 pb-24 pt-10 sm:px-8">
      <header className="border-b border-[#eadce4] pb-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.55fr)] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8b7d84]">
              Különlegességek
            </p>
            <h1 className="mt-3 font-[family:var(--font-display)] text-4xl leading-tight text-[#1a1a1a] sm:text-5xl">
              Kiemelt válogatások
            </h1>
            <p className="mt-4 max-w-[62ch] text-sm leading-7 text-[#6f666b]">
              Finoman szerkesztett darabok napfényhez, álomvilághoz és nyári bokalánc rétegezéshez.
            </p>
          </div>

          {specialties.length > 0 ? (
            <nav className="flex flex-wrap gap-x-5 gap-y-3 lg:justify-end" aria-label="Különlegességek csoportok">
              {specialties.map((specialty) => (
                <Link
                  key={specialty.id}
                  href={getSpecialtyHref(specialty)}
                  className="text-sm font-normal leading-5 tracking-[0.02em] text-[#121313] transition hover:opacity-60"
                >
                  {specialty.name}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </header>

      {specialtySections.length > 0 ? (
        <div className="divide-y divide-[#eadce4]">
          {specialtySections.map(({ specialty, products }) => (
            <section key={specialty.id} className="py-12">
              <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8b7d84]">
                    {specialty.productCount} termék
                  </p>
                  <h2 className="mt-2 font-[family:var(--font-display)] text-3xl leading-tight text-[#1a1a1a]">
                    {specialty.name}
                  </h2>
                  {specialty.shortDescription ? (
                    <p className="mt-3 max-w-[58ch] text-sm leading-7 text-[#6f666b]">
                      {specialty.shortDescription}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={getSpecialtyHref(specialty)}
                  className="text-sm font-normal leading-5 tracking-[0.02em] text-[#121313] transition hover:opacity-60"
                >
                  Válogatás megnyitása
                </Link>
              </div>

              {products.length > 0 ? (
                <ProductGrid products={products} redirectTo="/kulonlegessegek" />
              ) : (
                <p className="text-sm leading-7 text-[#6f666b]">
                  Ez a válogatás hamarosan termékekkel bővül.
                </p>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-10 border-y border-[#eadce4] py-8 text-sm text-[#6f666b]">
          Jelenleg nincs látható különlegesség.
        </div>
      )}
    </main>
  );
}
