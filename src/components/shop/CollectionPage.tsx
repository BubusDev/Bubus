import { ActiveFilterChips } from "@/components/shop/ActiveFilterChips";
import { CollectionSort } from "@/components/shop/CollectionSort";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { AccountCouponPill } from "@/components/account/AccountCouponPill";
import {
  type CatalogFilters,
  type CategoryDefinition,
  type FilterGroup,
  type ParsedCollectionState,
  type Product,
} from "@/lib/catalog";
import type { HeaderCouponDropdownPreview } from "@/lib/account";

type CollectionPageProps = {
  category: CategoryDefinition;
  products: Product[];
  availableFilters: CatalogFilters;
  filterGroups: FilterGroup[];
  state: ParsedCollectionState;
  redirectTo?: string;
  couponPreview?: HeaderCouponDropdownPreview;
};

export function CollectionPage({
  products,
  availableFilters,
  filterGroups,
  state,
  redirectTo = "/",
  couponPreview,
}: CollectionPageProps) {
  return (
    <main className="mx-auto max-w-[1450px] pb-24">
      <div className="px-6 pt-6 sm:px-8">

        {/* ── MOBILE: filter + sort ── */}
        <section className="mb-6 border-b border-[#e8e5e0] pb-3 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <FilterSidebar
                availableFilters={availableFilters}
                filterGroups={filterGroups}
                state={state}
                mode="mobile-trigger"
              />
              <div className="min-w-0 flex-1">
                <ActiveFilterChips filterGroups={filterGroups} state={state} />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs text-[#888]">{products.length} termék</span>
              {couponPreview && <AccountCouponPill couponPreview={couponPreview} />}
              <CollectionSort currentSort={state.sort} />
            </div>
          </div>
        </section>

        {/* ── DESKTOP: filter drawer trigger + sort ── */}
        <div className="mb-6 hidden items-center justify-between gap-4 lg:flex">
          <div className="flex items-center gap-3">
            <FilterSidebar
              availableFilters={availableFilters}
              filterGroups={filterGroups}
              state={state}
              mode="drawer"
            />
            <ActiveFilterChips filterGroups={filterGroups} state={state} />
            <span className="text-[12px] text-[#888]">
              {products.length} termék
            </span>
          </div>
          <div className="flex items-center gap-3">
            {couponPreview && <AccountCouponPill couponPreview={couponPreview} />}
            <CollectionSort currentSort={state.sort} />
          </div>
        </div>

        {/* ── PRODUCT GRID (full-width) ── */}
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
    </main>
  );
}
