import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/shop/ProductGrid";
import { SpecialtySectionNav } from "@/components/shop/SpecialtySectionNav";
import { getProductsForSpecialty, getSpecialtyBySlug } from "@/lib/products-server";
import { getVisibleSpecialties } from "@/lib/specialty-navigation";
import { siteName } from "@/lib/site";

type SpecialtyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: SpecialtyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const specialty = await getSpecialtyBySlug(slug);

  if (!specialty) {
    return {};
  }

  return {
    title: `${specialty.name} | Különlegességek | ${siteName}`,
    description:
      specialty.shortDescription ??
      `Fedezd fel a Chicks Jewelry ${specialty.name} különlegességeit.`,
    alternates: {
      canonical: `/kulonlegessegek/${specialty.slug}`,
    },
  };
}

export default async function SpecialtyPage({ params }: SpecialtyPageProps) {
  const { slug } = await params;
  const [specialty, products, specialties] = await Promise.all([
    getSpecialtyBySlug(slug),
    getProductsForSpecialty(slug),
    getVisibleSpecialties(),
  ]);

  if (!specialty) {
    notFound();
  }

  return (
    <>
      <SpecialtySectionNav
        specialties={specialties}
        activeSlug={specialty.slug}
      />
      <main className="mx-auto max-w-[1450px] px-6 pb-24 pt-8 sm:px-8">
        <header className="mb-10 border-b border-[#eadce4] pb-8">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8b7d84]">
            Különlegességek
          </span>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_auto] lg:items-end">
            <div>
              <h1 className="font-[family:var(--font-display)] text-4xl leading-tight text-[#1a1a1a] sm:text-5xl">
                {specialty.name}
              </h1>
              {specialty.shortDescription ? (
                <p className="mt-4 max-w-[62ch] text-sm leading-7 text-[#6f666b]">
                  {specialty.shortDescription}
                </p>
              ) : null}
            </div>
            <p className="text-sm leading-5 text-[#6f666b]">
              {products.length} termék
            </p>
          </div>
        </header>

        {products.length > 0 ? (
          <ProductGrid
            products={products}
            redirectTo={`/kulonlegessegek/${specialty.slug}`}
          />
        ) : (
          <div className="rounded-md border border-[#eadce4] bg-white px-5 py-10 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#888]">
              Nincs termék
            </p>
            <h2 className="mt-3 font-[family:var(--font-display)] text-[2rem] text-[#1a1a1a]">
              Ez a válogatás még üres
            </h2>
          </div>
        )}
      </main>
    </>
  );
}
