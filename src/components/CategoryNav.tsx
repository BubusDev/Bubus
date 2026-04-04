import Link from "next/link";

import { getNavigationCategories } from "@/lib/products";

export async function CategoryNav() {
  const navigationCategories = await getNavigationCategories();

  return (
    <nav
      aria-label="Category navigation"
      className="border-b border-white/50 bg-white/20 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-center gap-8 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8">
        {navigationCategories.map((item) => {
          const isSpecialEdition = item.slug === "special-edition";

          return (
            <Link
              key={item.slug}
              href={item.href}
              className={
                isSpecialEdition
                  ? "relative whitespace-nowrap text-sm font-medium tracking-[0.02em] text-[#4f2348] transition duration-200 hover:opacity-80 active:opacity-90"
                  : "whitespace-nowrap text-sm tracking-[0.02em] text-[#121313] transition duration-200 hover:opacity-60 active:opacity-80"
              }
            >
              {isSpecialEdition ? (
                <span className="relative inline-block px-1">
                  <span className="relative z-10">{item.label}</span>
                  <span className="absolute inset-x-0 bottom-[0.12em] -z-0 h-[0.72em] rounded-full bg-[#f7ff7a]/70 blur-[1px]" />
                </span>
              ) : (
                item.label
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
