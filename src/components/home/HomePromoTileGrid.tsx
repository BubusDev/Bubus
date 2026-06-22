import Link from "next/link";
import Image from "next/image";

import type {
  HomepageMaterialPickView,
  HomepagePromoTileView,
} from "@/lib/homepage-content";

type HomePromoTileGridProps = {
  tiles: HomepagePromoTileView[];
  materialPicks?: HomepageMaterialPickView[];
};

function Tile({
  emphasis = false,
  tile,
}: {
  emphasis?: boolean;
  tile: HomepagePromoTileView;
}) {
  const content = (
    <>
      <Image
        src={tile.imageUrl}
        alt={tile.imageAlt}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
        fill
        sizes={emphasis ? "(max-width: 1024px) 100vw, 690px" : "(max-width: 1024px) 50vw, 315px"}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,24,20,0.02),rgba(22,24,20,0.58))]" />
      <div className="relative flex h-full flex-col justify-end p-5 text-white sm:p-6 lg:p-7">
        <p
          className={
            emphasis
              ? "font-[family:var(--font-display)] text-[2rem] leading-none tracking-[-0.03em] sm:text-[2.5rem] xl:text-[2.8rem]"
              : "font-[family:var(--font-display)] text-[1.35rem] leading-none tracking-[-0.03em]"
          }
        >
          {tile.title}
        </p>
        {tile.subtitle ? (
          <p className="mt-2 text-[12px] leading-5 text-white/82">{tile.subtitle}</p>
        ) : null}
      </div>
    </>
  );

  const className =
    "group relative block h-full overflow-hidden bg-[#e5e2da] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7b8566]";

  if (!tile.href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={tile.href} className={className}>
      {content}
    </Link>
  );
}

function MaterialTile({ pick }: { pick: HomepageMaterialPickView }) {
  return (
    <Link
      href={pick.href}
      className="group relative block aspect-[4/5] overflow-hidden bg-[#e5e2da] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7b8566]"
    >
      {pick.imageUrl ? (
        <Image
          src={pick.imageUrl}
          alt={pick.imageAlt}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 315px"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: pick.colorHex
              ? `radial-gradient(circle at 35% 30%, #fff 0%, ${pick.colorHex}88 48%, ${pick.colorHex} 100%)`
              : "#e5e2da",
          }}
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,24,20,0.02),rgba(22,24,20,0.58))]" />
      <div className="relative flex h-full flex-col justify-end p-5 text-white sm:p-6 lg:p-7">
        <p className="font-[family:var(--font-display)] text-[1.55rem] leading-none tracking-[-0.03em] sm:text-[1.8rem]">
          {pick.title}
        </p>
        <p className="mt-2 text-[12px] leading-5 text-white/82">{pick.subtitle}</p>
      </div>
    </Link>
  );
}

export function HomePromoTileGrid({ tiles, materialPicks = [] }: HomePromoTileGridProps) {
  const visibleTiles = tiles.filter((tile) => tile.isVisible);
  const storefrontMaterialPicks = materialPicks.filter((pick) => !pick.isLegacySource);
  const [emphasisTile, ...smallTiles] = visibleTiles;

  if (visibleTiles.length === 0 && storefrontMaterialPicks.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#fbfaf7] px-4 pb-6 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      {storefrontMaterialPicks.length > 0 ? (
        <section className="mx-auto max-w-[1320px] py-12 sm:py-16">
          <div className="mb-8 grid gap-4 sm:mb-10 sm:grid-cols-[0.72fr_1fr] sm:items-end">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#747a64]">
                Kurált fókusz
              </p>
              <h2 className="mt-4 max-w-[11ch] font-[family:var(--font-display)] text-[2.5rem] leading-[0.95] tracking-[-0.035em] text-[#22231f] sm:text-[3.55rem]">
                Kő szerint válogatva.
              </h2>
            </div>
            <p className="max-w-[52ch] text-sm leading-7 text-[#69645b] sm:justify-self-end sm:text-right">
              Anyag, árnyalat és hangulat alapján szerkesztett darabok, hogy a választás
              személyesebb legyen egy egyszerű kategórialistánál.
            </p>
          </div>

          <div className="mx-auto grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {storefrontMaterialPicks.slice(0, 4).map((pick) => (
              <MaterialTile key={pick.id} pick={pick} />
            ))}
          </div>
        </section>
      ) : null}

      {visibleTiles.length > 0 ? (
        <section className="mx-auto max-w-[1320px] py-12 sm:py-16">
          <div className="mb-8 grid gap-4 sm:mb-10 sm:grid-cols-[0.72fr_1fr] sm:items-end">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#747a64]">
                Kategóriák
              </p>
              <h2 className="mt-4 max-w-[12ch] font-[family:var(--font-display)] text-[2.5rem] leading-[0.95] tracking-[-0.035em] text-[#22231f] sm:text-[3.55rem]">
                Vonalak, amik együtt is működnek.
              </h2>
            </div>
            <p className="max-w-[48ch] text-sm leading-7 text-[#69645b] sm:justify-self-end sm:text-right">
              Finom tónusok, rétegezhető formák és alkalmi darabok egy képi válogatásban.
            </p>
          </div>

          <div className="mx-auto grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch lg:gap-5">
            <div className="min-h-[390px] sm:min-h-[470px] lg:h-[620px] xl:h-[700px]">
              <Tile tile={emphasisTile} emphasis />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-2 lg:grid-rows-2 lg:gap-5">
              {smallTiles.slice(0, 4).map((tile) => (
                <div key={tile.slotIndex} className="aspect-square lg:h-full lg:min-h-0">
                  <Tile tile={tile} />
                </div>
              ))}
              {smallTiles.length < 4
                ? Array.from({ length: 4 - smallTiles.length }).map((_, index) => (
                    <div
                      key={`placeholder-${index}`}
                      className="hidden aspect-square bg-[#ece8df] lg:block lg:h-full lg:min-h-0"
                    />
                  ))
                : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
