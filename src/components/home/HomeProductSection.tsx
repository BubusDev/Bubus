import Link from "next/link";

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
  compactPremiumRow?: boolean;
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
  compactPremiumRow = false,
}: HomeProductSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8">
      <div className="mx-auto max-w-[680px] text-center">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#747a64]">
            {eyebrow}
          </p>

          <h2 className="mt-3 font-[family:var(--font-display)] text-[2.6rem] leading-none tracking-[-0.03em] text-[#22231f] sm:text-[3.4rem]">
            {title}
          </h2>

          {description ? (
            <p className="mx-auto mt-4 max-w-[52ch] text-sm leading-7 text-[#6b675f]">
              {description}
            </p>
          ) : null}
        </div>

        {showLink && href ? (
          <Link
            href={href}
            className="mt-5 inline-flex min-h-10 items-center rounded-md border border-[#d8d5cc] bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#383a32] transition hover:border-[#9aa083]"
          >
            Kollekció
          </Link>
        ) : null}
      </div>

      <ProductGrid
        products={products}
        redirectTo={redirectTo}
        showAddToCart={!compactPremiumRow}
        wishlistPlacement={compactPremiumRow ? "image" : "inline"}
        className={
          compactPremiumRow
            ? "flex snap-x gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:w-[72vw] [&>*]:max-w-[320px] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-[44vw] lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:[&>*]:w-auto lg:[&>*]:max-w-none"
            : undefined
        }
      />
      <HomeSectionPager
        page={page}
        totalPages={totalPages}
        pageParam={pageParam}
        searchParams={searchParams}
      />
    </section>
  );
}
