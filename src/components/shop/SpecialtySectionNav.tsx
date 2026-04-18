import Link from "next/link";

import {
  type SpecialtyView,
  getSpecialtyHref,
} from "@/lib/specialty-links";

type SpecialtySectionNavProps = {
  specialties: SpecialtyView[];
  activeSlug?: string;
};

export function SpecialtySectionNav({
  specialties,
  activeSlug,
}: SpecialtySectionNavProps) {
  if (specialties.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Különlegességek szekció navigáció"
      className="border-b border-[#eadce4] bg-[#fffafd]/94 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-[1450px] px-6 pb-4 pt-4 sm:px-8">
        <div className="mb-3 flex items-center gap-3">
          <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8b7d84]">
            Különlegességek
          </p>
          <span className="h-px flex-1 bg-[#eadce4]" aria-hidden="true" />
        </div>
        <div className="flex items-center gap-3 overflow-x-auto">
          {specialties.map((specialty) => {
            const isActive = specialty.slug === activeSlug;

            return (
              <Link
                key={specialty.id}
                href={getSpecialtyHref(specialty)}
                aria-current={isActive ? "page" : undefined}
                className={`relative max-w-[18rem] shrink-0 rounded-full px-4 py-2 text-sm leading-5 tracking-[0.02em] transition ${
                  isActive
                    ? "bg-[#f6e8ef] text-[#2b2228]"
                    : "text-[#6f5664] hover:bg-white hover:text-[#2b2228]"
                }`}
              >
                <span className="line-clamp-1 break-all">{specialty.name}</span>
                {isActive ? (
                  <span className="absolute inset-x-4 -bottom-1 h-px bg-[#8a4867]" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
