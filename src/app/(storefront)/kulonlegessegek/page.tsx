import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ProductGrid } from "@/components/shop/ProductGrid";
import { SpecialtySectionNav } from "@/components/shop/SpecialtySectionNav";
import { getProductsForSpecialty } from "@/lib/products";
import {
  getSpecialtyHref,
  getVisibleSpecialties,
} from "@/lib/specialty-navigation";
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
    <>
      <SpecialtySectionNav specialties={specialties} />
      <main className="mx-auto max-w-[1450px] px-6 pb-24 pt-10 sm:px-8">
        <header className="border-b border-[#eadce4] pb-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_auto] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8b7d84]">
                Különlegességek
              </p>
              <h1 className="mt-3 font-[family:var(--font-display)] text-4xl leading-tight text-[#1a1a1a] sm:text-5xl">
                Kiemelt válogatások
              </h1>
              <p className="mt-4 max-w-[62ch] text-sm leading-7 text-[#6f666b]">
                Finoman szerkesztett darabok napfényhez, álomvilághoz és nyári
                bokalánc rétegezéshez.
              </p>
              {specialties.length > 0 ? (
                <p className="mt-3 max-w-[62ch] text-sm leading-7 text-[#6f666b]">
                  Válassz a fenti különlegességek közül, vagy indulj innen a
                  teljes szekció áttekintésével.
                </p>
              ) : null}
            </div>

            {specialties.length > 0 ? (
              <p className="text-sm leading-5 text-[#6f666b]">
                {specialties.length} válogatás
              </p>
            ) : null}
          </div>
        </header>

        {specialtySections.length > 0 ? (
          <section className="border-b border-[#eadce4] py-10" aria-label="Különlegességek áttekintése">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specialtySections.map(({ specialty, products }) => {
                const previewProduct = products.find((product) => product.imageUrl) ?? products[0];

                return (
                  <Link
                    key={specialty.id}
                    href={getSpecialtyHref(specialty)}
                    className="group relative min-h-[280px] overflow-hidden rounded-md bg-[#f5f3f0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
                  >
                    {previewProduct?.imageUrl ? (
                      <Image
                        src={previewProduct.imageUrl}
                        alt={specialty.name}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-[1.035]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: previewProduct
                            ? `linear-gradient(145deg, ${previewProduct.imagePalette[0]}, ${previewProduct.imagePalette[2]})`
                            : "linear-gradient(145deg, #f8edf3, #e7eee0)",
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(22,18,20,0.82)_0%,rgba(22,18,20,0.42)_48%,rgba(22,18,20,0.08)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/72">
                        {specialty.productCount} termék
                      </p>
                      <h2 className="mt-2 font-[family:var(--font-display)] text-3xl leading-none">
                        {specialty.name}
                      </h2>
                      {specialty.shortDescription ? (
                        <p className="mt-3 max-w-[42ch] text-sm leading-6 text-white/84">
                          {specialty.shortDescription}
                        </p>
                      ) : null}
                      <span className="mt-5 inline-flex border-t border-white/36 pt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                        Válogatás megnyitása
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

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
                  <ProductGrid
                    products={products}
                    redirectTo="/kulonlegessegek"
                  />
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
    </>
  );
}
