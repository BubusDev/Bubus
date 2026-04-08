import { ActiveFilterChips } from "@/components/shop/ActiveFilterChips";
import { CollectionSort } from "@/components/shop/CollectionSort";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import {
  type CatalogFilters,
  type CategoryDefinition,
  type FilterGroup,
  type ParsedCollectionState,
  type Product,
} from "@/lib/catalog";

type CollectionPageProps = {
  category: CategoryDefinition;
  products: Product[];
  availableFilters: CatalogFilters;
  filterGroups: FilterGroup[];
  state: ParsedCollectionState;
  redirectTo?: string;
};

export function CollectionPage({
  category,
  products,
  availableFilters,
  filterGroups,
  state,
  redirectTo = "/",
}: CollectionPageProps) {
  return (
    <main className="mx-auto max-w-[1450px] pb-24">

      {/* ── EDITORIAL HEADER ── */}
      <header className="border-b border-[#e8e5e0] px-6 py-12 sm:px-8">
        <p className="mb-2 text-[10px] uppercase tracking-[.3em] text-[#888]">
          Kollekció
        </p>
        <h1 className="font-[family:var(--font-display)] text-[2.8rem] leading-none tracking-[-0.03em] text-[#1a1a1a] sm:text-[3.2rem]">
          {category.title}
        </h1>
        {category.seoDescription && (
          <p className="mt-3 max-w-[52ch] text-sm leading-[1.9] text-[#666]">
            {category.seoDescription}
          </p>
        )}
      </header>

      <div className="px-6 pt-6 sm:px-8">

        {/* ── MOBILE: filter + sort ── */}
        <section className="mb-6 flex flex-col gap-4 lg:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterSidebar
              availableFilters={availableFilters}
              filterGroups={filterGroups}
              state={state}
              mode="mobile-trigger"
            />
            <CollectionSort currentSort={state.sort} />
          </div>
          <ActiveFilterChips filterGroups={filterGroups} state={state} />
        </section>

        {/* ── MAIN LAYOUT ── */}
        <section className="flex gap-8 xl:gap-10">

          {/* Sidebar */}
          <FilterSidebar
            availableFilters={availableFilters}
            filterGroups={filterGroups}
            state={state}
            mode="desktop-sidebar"
          />

          {/* Content */}
          <div className="min-w-0 flex-1">

            {/* Desktop: sort + active filters */}
            <div className="mb-6 hidden items-center justify-between gap-4 lg:flex">
              <div className="flex items-center gap-3">
                <ActiveFilterChips filterGroups={filterGroups} state={state} />
                <span className="text-[12px] text-[#888]">
                  {products.length} termék
                </span>
              </div>
              <CollectionSort currentSort={state.sort} />
            </div>

            {/* Product grid or empty state */}
            {products.length > 0 ? (
              <ProductGrid products={products} redirectTo={redirectTo} />
            ) : (
              <div className="py-20 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[.3em] text-[#888]">
                  Nincs találat
                </p>
                <h2 className="mt-3 font-[family:var(--font-display)] text-[2rem] text-[#1a1a1a]">
                  Finomíts a szűrésen
                </h2>
                <p className="mx-auto mt-3 max-w-[38ch] text-sm leading-7 text-[#888]">
                  A jelenlegi beállításokkal nem találtunk megfelelő darabot.
                  Törölj néhány szűrőt, és a kollekció azonnal frissül.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
