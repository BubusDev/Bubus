import Link from "next/link";

import {
  getSpecialtyHref,
  type SpecialtyView,
} from "@/lib/specialty-links";
import type { NavigationCategory } from "@/lib/catalog";
import { MegaMenu, type MegaMenuItem } from "@/components/MegaMenu";

const topLevelNavItemClassName =
  "relative whitespace-nowrap py-1 text-[13px] font-medium uppercase leading-5 tracking-[0.08em] text-[#4a343d] transition-[color,font-weight] duration-150 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[#9b3d6e] after:transition-[width] after:duration-150 hover:font-semibold hover:text-[#9b3d6e] hover:after:w-full focus-visible:font-semibold focus-visible:text-[#9b3d6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b5c4] focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbf8f5] focus-visible:after:w-full active:opacity-80";

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
      className="relative z-40 hidden border-b border-[#eaded9] bg-[#fbf8f5] transition-[background-color,border-color,box-shadow] duration-300 ease-out hover:border-[#dfcdc7] hover:bg-[#fcf9f6] hover:shadow-[0_8px_22px_rgba(66,46,54,0.035)] focus-within:border-[#dfcdc7] focus-within:bg-[#fcf9f6] focus-within:shadow-[0_8px_22px_rgba(66,46,54,0.035)] lg:block"
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
