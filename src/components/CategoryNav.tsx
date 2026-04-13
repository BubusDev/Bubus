import Link from "next/link";

import {
  getSpecialtyHref,
  type SpecialtyView,
} from "@/lib/specialty-navigation";
import type { NavigationCategory } from "@/lib/catalog";

const topLevelNavItemClassName =
  "whitespace-nowrap text-sm font-normal leading-5 tracking-[0.02em] text-[#121313] transition-colors duration-300 active:opacity-80 hover:text-white group-hover/category-nav:text-white group-focus-within/category-nav:text-white";

type CategoryNavProps = {
  navigationCategories: NavigationCategory[];
  specialtyItems: SpecialtyView[];
};

export function CategoryNav({ navigationCategories, specialtyItems }: CategoryNavProps) {
  return (
    <nav
      aria-label="Category navigation"
      className="group/category-nav relative z-40 hidden border-b border-white/50 bg-white/20 backdrop-blur-sm transition-[background-color,border-color,box-shadow,backdrop-filter,-webkit-backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/70 hover:bg-[#a8346a]/88 hover:shadow-[0_18px_46px_rgba(120,35,75,0.22)] hover:backdrop-blur-2xl focus-within:border-white/70 focus-within:bg-[#a8346a]/88 focus-within:shadow-[0_18px_46px_rgba(120,35,75,0.22)] focus-within:backdrop-blur-2xl lg:block"
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-2.5 sm:px-6 lg:px-8">
        {navigationCategories.map((item) => (
          <Link
            key={item.slug}
            href={item.href}
            className={topLevelNavItemClassName}
          >
            {item.label}
          </Link>
        ))}

        {specialtyItems.length > 0 ? (
          <div className="group/specialty relative inline-flex">
            <Link
              href={getSpecialtyHref(specialtyItems[0])}
              className={`${topLevelNavItemClassName} inline-flex items-center gap-1`}
              aria-haspopup="menu"
            >
              <span>Különlegességek</span>
              <span aria-hidden="true" className="text-[10px] leading-none text-[#8b6d7f] transition duration-300 group-hover/category-nav:text-white group-focus-within/category-nav:text-white group-hover/specialty:translate-y-0.5 group-focus-within/specialty:translate-y-0.5">
                ⌄
              </span>
            </Link>
            <div className="invisible pointer-events-none absolute left-1/2 top-full z-40 w-[16rem] max-w-[calc(100vw-2rem)] origin-top -translate-x-1/2 -translate-y-2 pt-2 opacity-0 transition-[opacity,transform,visibility] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform] group-hover/specialty:pointer-events-auto group-hover/specialty:visible group-hover/specialty:translate-y-0 group-hover/specialty:opacity-100 group-focus-within/specialty:pointer-events-auto group-focus-within/specialty:visible group-focus-within/specialty:translate-y-0 group-focus-within/specialty:opacity-100 motion-reduce:duration-0">
              <div
                className="flex flex-col items-stretch gap-1 rounded-[1.25rem] border border-white/70 bg-[#fffafd]/95 p-2.5 shadow-[0_18px_42px_rgba(76,43,65,0.12)] backdrop-blur-xl"
                role="menu"
                aria-label="Különlegességek"
              >
                {specialtyItems.map((item) => (
                  <Link
                    key={item.id}
                    href={getSpecialtyHref(item)}
                    role="menuitem"
                    className="block w-full rounded-[0.85rem] px-3.5 py-2.5 text-sm font-normal leading-5 tracking-[0.02em] text-[#3f2f39] transition duration-150 hover:bg-[#f8edf3] hover:text-[#241b21] focus-visible:bg-[#f8edf3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1] active:bg-[#f2dfe9]"
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
