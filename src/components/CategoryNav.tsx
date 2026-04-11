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
          <div className="group/specialty relative inline-flex">
            <Link
              href={SPECIALTIES_BASE_PATH}
              className={`${topLevelNavItemClassName} -my-1.5 inline-flex items-center gap-1 rounded-full border border-white/65 bg-white/40 px-3 py-1.5 shadow-[0_8px_20px_rgba(49,25,45,0.05)] backdrop-blur-md hover:bg-white/65 hover:opacity-100`}
              aria-haspopup="menu"
            >
              <span>Különlegességek</span>
              <span aria-hidden="true" className="text-[10px] leading-none text-[#8b6d7f] transition-transform duration-200 group-hover/specialty:translate-y-0.5 group-focus-within/specialty:translate-y-0.5">
                ⌄
              </span>
            </Link>
            <div className="invisible pointer-events-none absolute left-0 top-full z-40 w-[16rem] max-w-[calc(100vw-2rem)] origin-top -translate-y-2 pt-2 opacity-0 transition-[opacity,transform,visibility] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform] group-hover/specialty:pointer-events-auto group-hover/specialty:visible group-hover/specialty:translate-y-0 group-hover/specialty:opacity-100 group-focus-within/specialty:pointer-events-auto group-focus-within/specialty:visible group-focus-within/specialty:translate-y-0 group-focus-within/specialty:opacity-100 motion-reduce:duration-0">
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
