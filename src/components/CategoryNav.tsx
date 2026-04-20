import Link from "next/link";

import {
  getSpecialtyHref,
  type SpecialtyView,
} from "@/lib/specialty-links";
import type { NavigationCategory } from "@/lib/catalog";
import { MegaMenu, type MegaMenuItem } from "@/components/MegaMenu";

const topLevelNavItemClassName =
  "relative whitespace-nowrap py-1 text-[13px] font-medium uppercase leading-5 tracking-[0.08em] text-[#4a343d] transition-colors duration-150 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[#7f485c] after:transition-[width] after:duration-150 hover:text-[#7f485c] hover:after:w-full focus-visible:text-[#7f485c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0aeba] focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbf8f5] focus-visible:after:w-full active:opacity-80";

type CategoryNavProps = {
  navigationCategories: NavigationCategory[];
  specialtyItems: SpecialtyView[];
};

export function CategoryNav({ navigationCategories, specialtyItems }: CategoryNavProps) {
  const megaItems: MegaMenuItem[] = specialtyItems.map((item) => ({
    id: item.id,
    name: item.name,
    href: getSpecialtyHref(item),
    shortDescription: item.shortDescription,
    previewImageSrc: item.previewImageUrl ?? item.imageUrl ?? undefined,
    previewImageAlt: item.previewImageAlt || item.imageAlt || item.name,
    cardImageSrc: item.cardImageUrl ?? item.previewImageUrl ?? item.imageUrl ?? undefined,
    cardImageAlt: item.cardImageAlt || item.previewImageAlt || item.imageAlt || item.name,
    cardTitle: item.cardTitle || item.name,
    cardDescription: item.cardDescription || item.shortDescription,
    ctaText: item.ctaLabel || "Kollekció megnyitása",
  }));

  return (
    <nav
      aria-label="Category navigation"
      className="group/category-nav relative z-40 hidden border-b border-[#e7d9d5] bg-[#fbf8f5] transition-[background-color,border-color,box-shadow] duration-300 ease-out hover:border-[#decbc5] hover:bg-[#fdfaf7] hover:shadow-[0_8px_24px_rgba(66,46,54,0.04)] focus-within:border-[#decbc5] focus-within:bg-[#fdfaf7] focus-within:shadow-[0_8px_24px_rgba(66,46,54,0.04)] lg:block"
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-2.5 sm:px-6 lg:px-8 xl:gap-x-10">
        {navigationCategories.map((item) => (
          <Link
            key={item.slug}
            href={item.href}
            className={topLevelNavItemClassName}
          >
            {item.label}
          </Link>
        ))}

        {megaItems.length > 0 && (
          <MegaMenu
            triggerLabel="Különlegességek"
            items={megaItems}
          />
        )}
      </div>
    </nav>
  );
}
