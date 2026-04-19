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
        unoptimized
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
    "group relative block h-full overflow-hidden rounded-md bg-[#e5e2da] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7b8566]";

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
      className="group relative block aspect-square overflow-hidden rounded-md bg-[#e5e2da] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7b8566]"
    >
      {pick.imageUrl ? (
        <Image
          src={pick.imageUrl}
          alt={pick.imageAlt}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
          fill
          unoptimized
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
  const [emphasisTile, ...smallTiles] = visibleTiles;

  if (visibleTiles.length === 0 && materialPicks.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#fbfaf7] px-4 pb-20 pt-8 sm:px-6 sm:pb-24 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#747a64]">
            Kövek és ásványok
          </p>
          <h2 className="mt-4 font-[family:var(--font-display)] text-[2.2rem] leading-none tracking-[-0.03em] text-[#22231f] sm:text-[2.75rem] xl:text-[3.2rem]">
            Vásároljon karkötőket Féldrágakő, Kristály, Ásványok szerint!
          </h2>
        </div>

        {materialPicks.length > 0 ? (
          <div className="mx-auto grid max-w-[1224px] gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {materialPicks.slice(0, 4).map((pick) => (
              <MaterialTile key={pick.id} pick={pick} />
            ))}
          </div>
        ) : (
        <div className="mx-auto grid max-w-[1224px] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-6">
          <div className="min-h-[360px] sm:min-h-[420px] lg:h-[560px] xl:h-[650px]">
            <Tile tile={emphasisTile} emphasis />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-2 lg:grid-rows-2 lg:gap-6">
            {smallTiles.slice(0, 4).map((tile) => (
              <div key={tile.slotIndex} className="aspect-square lg:h-full lg:min-h-0">
                <Tile tile={tile} />
              </div>
            ))}
            {smallTiles.length < 4
              ? Array.from({ length: 4 - smallTiles.length }).map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className="hidden aspect-square rounded-md bg-[#ece8df] lg:block lg:h-full lg:min-h-0"
                  />
                ))
              : null}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
