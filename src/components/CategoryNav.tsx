import Link from "next/link";

import {
  getSpecialtyHref,
  type SpecialtyView,
} from "@/lib/specialty-links";
import type { NavigationCategory } from "@/lib/catalog";
import { MegaMenu, type MegaMenuItem } from "@/components/MegaMenu";

const topLevelNavItemClassName =
  "whitespace-nowrap text-sm font-normal leading-5 tracking-[0.02em] text-[#121313] transition-colors duration-300 active:opacity-80 hover:text-white group-hover/category-nav:text-white group-focus-within/category-nav:text-white";

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
    previewImageCrop: {
      x: item.previewImageCropX,
      y: item.previewImageCropY,
      zoom: item.previewImageZoom,
      aspectRatio: item.previewImageAspectRatio,
    },
    cardImageSrc: item.cardImageUrl ?? item.previewImageUrl ?? item.imageUrl ?? undefined,
    cardImageAlt: item.cardImageAlt || item.previewImageAlt || item.imageAlt || item.name,
    cardImageCrop: item.cardImageUrl
      ? {
          x: item.cardImageCropX,
          y: item.cardImageCropY,
          zoom: item.cardImageZoom,
          aspectRatio: item.cardImageAspectRatio,
        }
      : {
          x: item.previewImageCropX,
          y: item.previewImageCropY,
          zoom: item.previewImageZoom,
          aspectRatio: item.previewImageAspectRatio,
        },
    cardTitle: item.cardTitle || item.name,
    cardDescription: item.cardDescription || item.shortDescription,
    ctaText: item.ctaLabel || "Kollekció megnyitása",
  }));

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
