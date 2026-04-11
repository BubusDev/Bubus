import Link from "next/link";

import { getNavigationCategories } from "@/lib/products";
import {
  SPECIALTIES_BASE_PATH,
  getSpecialtyHref,
  getVisibleSpecialties,
} from "@/lib/specialty-navigation";

const topLevelNavItemClassName =
  "whitespace-nowrap text-sm font-normal leading-5 tracking-[0.02em] text-[#121313] transition duration-200 hover:opacity-60 active:opacity-80";

export async function CategoryNav() {
  const [navigationCategories, specialtyItems] = await Promise.all([
    getNavigationCategories(),
    getVisibleSpecialties(),
  ]);

  return (
    <nav
      aria-label="Category navigation"
      className="relative z-40 border-b border-white/50 bg-white/20 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-2.5 sm:px-6 lg:px-8">
        {navigationCategories.map((item) => {
          const isSpecialEdition = item.slug === "special-edition";

          return (
            <Link
              key={item.slug}
              href={item.href}
              className={
                isSpecialEdition
                  ? "relative whitespace-nowrap text-sm font-medium leading-5 tracking-[0.02em] text-[#4f2348] transition duration-200 hover:opacity-80 active:opacity-90"
                  : topLevelNavItemClassName
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

        {specialtyItems.length > 0 ? (
          <div className="group relative flex items-center">
            <Link
              href={SPECIALTIES_BASE_PATH}
              className={topLevelNavItemClassName}
              aria-haspopup="menu"
            >
              Különlegességek
            </Link>
            <div className="invisible absolute left-1/2 top-full z-40 min-w-max -translate-x-1/2 border-t border-[#eadce4] bg-white/90 px-2 py-2 opacity-0 backdrop-blur-sm transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="flex items-center gap-5" role="menu" aria-label="Különlegességek">
                {specialtyItems.map((item) => (
                  <Link
                    key={item.id}
                    href={getSpecialtyHref(item)}
                    role="menuitem"
                    className="whitespace-nowrap text-sm font-normal leading-5 tracking-[0.02em] text-[#121313] transition duration-150 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
