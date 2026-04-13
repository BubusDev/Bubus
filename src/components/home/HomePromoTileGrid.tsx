import Link from "next/link";
import Image from "next/image";

import type { HomepagePromoTileView } from "@/lib/homepage-content";

type HomePromoTileGridProps = {
  tiles: HomepagePromoTileView[];
};

function Tile({ tile }: { tile: HomepagePromoTileView }) {
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
      <div className="relative flex h-full flex-col justify-end p-5 text-white sm:p-6">
        <p className="font-[family:var(--font-display)] text-[1.7rem] leading-none tracking-[-0.03em]">
          {tile.title}
        </p>
        {tile.subtitle ? (
          <p className="mt-2 text-[12px] leading-5 text-white/82">{tile.subtitle}</p>
        ) : null}
      </div>
    </>
  );

  const className =
    "group relative block min-h-[260px] overflow-hidden rounded-md bg-[#e5e2da] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7b8566]";

  if (!tile.href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={tile.href} className={className}>
      {content}
    </Link>
  );
}

export function HomePromoTileGrid({ tiles }: HomePromoTileGridProps) {
  const visibleTiles = tiles.filter((tile) => tile.isVisible);

  if (visibleTiles.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#fbfaf7] px-4 pb-20 pt-8 sm:px-6 sm:pb-24 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#747a64]">
            Kollekciók
          </p>
          <h2 className="mt-4 font-[family:var(--font-display)] text-[2.4rem] leading-none tracking-[-0.03em] text-[#22231f] sm:text-[3.2rem]">
            Saját tervezésű kollekciók
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-6">
          {visibleTiles.map((tile) => (
            <div
              key={tile.slotIndex}
              className={
                tile.slotIndex <= 6
                  ? "md:col-span-2"
                  : "md:col-span-3 md:px-[8%] lg:px-[11%]"
              }
            >
              <Tile tile={tile} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
