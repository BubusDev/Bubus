import { ActiveFilterChips } from "@/components/shop/ActiveFilterChips";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
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
    <main className="mx-auto max-w-[1450px] px-4 pb-20 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <section className="border-b border-[#eee4ea] pb-4">
        <Breadcrumbs
          items={[
            { label: "Főoldal", href: "/" },
            { label: category.title },
          ]}
          className="mb-4"
        />
        <h1 className="font-[family:var(--font-display)] text-[1.8rem] text-[#4d2741] sm:text-[2.2rem]">
          {category.title}
        </h1>
      </section>

      <section className="mt-8 flex flex-col gap-5 lg:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterSidebar
            availableFilters={availableFilters}
            filterGroups={filterGroups}
            state={state}
          />
          <CollectionSort currentSort={state.sort} />
        </div>

        <ActiveFilterChips filterGroups={filterGroups} state={state} />
      </section>

      <section className="mt-8 flex gap-8 xl:gap-10">
        <FilterSidebar
          availableFilters={availableFilters}
          filterGroups={filterGroups}
          state={state}
        />

        <div className="min-w-0 flex-1 space-y-5">
          <div className="hidden items-end justify-between gap-4 lg:flex">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#af7795]">
                {products.length} termék
              </p>
              
            </div>

            <CollectionSort currentSort={state.sort} />
          </div>

          <ActiveFilterChips filterGroups={filterGroups} state={state} />

          {products.length > 0 ? (
            <ProductGrid products={products} redirectTo={redirectTo} />
          ) : (
            <div className="border-t border-[#eee4ea] py-12 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#af7795]">
                Nincs találat
              </p>
              <h2 className="mt-3 font-[family:var(--font-display)] text-[2rem] text-[#4d2741]">
                Finomíts a szűrésen
              </h2>
              <p className="mx-auto mt-3 max-w-[40ch] text-sm leading-6 text-[#765f6d]">
                A jelenlegi beállításokkal nem találtunk megfelelő darabot.
                Törölj néhány szűrőt, és a kollekció azonnal frissül.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
