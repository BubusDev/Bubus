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
    <main className="collection-root mx-auto max-w-[1450px] px-4 pb-24 pt-6 sm:px-6 sm:pt-10 lg:px-8">

      {/* ── AMBIENT BLOBS ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="blob blob-rose" />
        <div className="blob blob-peach" />
        <div className="blob blob-lilac" />
      </div>

      {/* ── PAGE HEADER ── */}
      <header className="mb-10">
        <Breadcrumbs
          items={[
            { label: "Főoldal", href: "/" },
            { label: category.title },
          ]}
          className="mb-5 text-[#b08898]"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/* eyebrow pill */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-white/60 px-4 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-rose-500">
                Kollekció
              </span>
            </div>

            <h1 className="collection-heading">{category.title}</h1>
          </div>

          {/* product count */}
          <div className="self-start sm:self-auto">
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#c0517a]">
              Találat
            </p>
            <p className="text-sm font-semibold text-[#3a1f2d]">
              {products.length} termék
            </p>
          </div>
        </div>
      </header>

      {/* ── MOBILE: filter + sort bar ── */}
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

        {/* sidebar */}
        <FilterSidebar
          availableFilters={availableFilters}
          filterGroups={filterGroups}
          state={state}
          mode="desktop-sidebar"
        />

        {/* content */}
        <div className="min-w-0 flex-1 space-y-5">

          {/* desktop sort row */}
          <div className="hidden items-center justify-between gap-4 lg:flex">
            <ActiveFilterChips filterGroups={filterGroups} state={state} />
            <CollectionSort currentSort={state.sort} />
          </div>

          {/* product grid or empty state */}
          {products.length > 0 ? (
            <ProductGrid products={products} redirectTo={redirectTo} />
          ) : (
            <div className="collection-empty">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
                <svg className="h-6 w-6 text-rose-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <div className="mt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c0517a]">
                  Nincs találat
                </p>
                <h2 className="mt-2 font-[family:var(--font-display)] text-[2rem] leading-tight text-[#4d2741]">
                  Finomíts a szűrésen
                </h2>
                <p className="mx-auto mt-3 max-w-[38ch] text-sm leading-7 text-[#8a6272]">
                  A jelenlegi beállításokkal nem találtunk megfelelő darabot.
                  Törölj néhány szűrőt, és a kollekció azonnal frissül.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .blob { position:absolute;border-radius:50%;filter:blur(80px);opacity:.4;
          animation:drift 20s ease-in-out infinite alternate; }
        .blob-rose  { width:540px;height:540px;background:#fbc7d8;top:-120px;left:-80px;animation-duration:22s; }
        .blob-peach { width:360px;height:360px;background:#fddcb0;top:100px;right:6%;animation-duration:17s;animation-delay:-6s; }
        .blob-lilac { width:280px;height:280px;background:#d8c8f5;bottom:80px;left:36%;animation-duration:24s;animation-delay:-11s; }
        @keyframes drift {
          0%   { transform:translate(0,0) scale(1); }
          50%  { transform:translate(26px,-18px) scale(1.05); }
          100% { transform:translate(-18px,26px) scale(.97); }
        }
        .collection-heading {
          font-family: var(--font-display, 'Georgia', serif);
          font-size: clamp(2.2rem, 4vw, 3.4rem);
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: -.035em;
          color: #2b1220;
        }
        .collection-empty {
          border-radius: 2rem;
          border: 1px solid rgba(255,255,255,.8);
          background: rgba(255,255,255,.55);
          backdrop-filter: blur(16px);
          padding: 64px 32px;
          text-align: center;
        }
      `}</style>
    </main>
  );
}
