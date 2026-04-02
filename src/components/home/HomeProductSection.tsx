import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HomeSectionPager } from "@/components/home/HomeSectionPager";
import { ProductGrid } from "@/components/shop/ProductGrid";
import type { Product } from "@/lib/catalog";

type HomeProductSectionProps = {
  eyebrow: string;
  title: string;
  href?: string;
  products: Product[];
  redirectTo?: string;
  description?: string;
  showLink?: boolean;
  page?: number;
  totalPages?: number;
  pageParam?: string;
  searchParams?: Record<string, string | undefined>;
};

export function HomeProductSection({
  eyebrow,
  title,
  description,
  href,
  products,
  redirectTo = "/",
  showLink = false,
  page = 1,
  totalPages = 1,
  pageParam = "page",
  searchParams,
}: HomeProductSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#b06b8e]">
            {eyebrow}
          </p>

          <h2 className="mt-2 font-serif text-[1.8rem] leading-none tracking-[0.04em] text-[#4d2741] sm:text-[2.1rem]">
            {title}
          </h2>

          {description ? (
            <p className="mt-2 max-w-[52ch] text-sm leading-7 text-[#745b6b]">
              {description}
            </p>
          ) : null}
        </div>

        {showLink && href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-2 self-start rounded-full border border-[#edd1e1] bg-white/80 px-4 py-2.5 text-sm font-medium text-[#6b425a] shadow-[0_12px_26px_rgba(184,122,160,0.08)] transition hover:border-[#e9b6d0] hover:bg-white"
          >
            View Collection
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      <ProductGrid products={products} redirectTo={redirectTo} />
      <HomeSectionPager
        page={page}
        totalPages={totalPages}
        pageParam={pageParam}
        searchParams={searchParams}
      />
    </section>
  );
}
