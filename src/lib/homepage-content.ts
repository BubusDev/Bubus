import type { HomepageContentBlockKey } from "@prisma/client";

import { db } from "@/lib/db";

export type HomepageBlockView = {
  id: string;
  key: HomepageContentBlockKey;
  title: string;
  eyebrow: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  buttonText: string;
  buttonHref: string;
  isVisible: boolean;
};

export type HomepagePromoTileView = {
  id: string;
  slotIndex: number;
  title: string;
  subtitle: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
  isVisible: boolean;
};

export type HomepageContentView = {
  hero: HomepageBlockView;
  instagram: HomepageBlockView;
  promoTiles: HomepagePromoTileView[];
};

const defaultBlocks: Record<HomepageContentBlockKey, Omit<HomepageBlockView, "id" | "key">> = {
  HERO: {
    title: "Limitált darabok, váratlan részletekkel",
    eyebrow: "Különleges válogatás",
    body: "Féldrágakövekből, kézzel készített ékszerek szerkesztett kampánya.",
    imageUrl: "/uploads/special-edition/jellyfish-e2a5b467-e672-495e-9248-6a94d4f7d6ad.jpg",
    imageAlt: "Különleges kampányékszer",
    buttonText: "Lepődj meg!",
    buttonHref: "/special-edition",
    isVisible: true,
  },
  INSTAGRAM: {
    title: "@chicksjewelry",
    eyebrow: "Instagram",
    body: "Látogass meg minket és fedezd fel ötleteinket az Instagramon!",
    imageUrl: "/images/book-hands.png",
    imageAlt: "Zöld tónusú Instagram kampánykép",
    buttonText: "Irány az Instagram!",
    buttonHref: "https://instagram.com/chicksjewelry",
    isVisible: true,
  },
};

const defaultPromoTiles = [
  {
    slotIndex: 4,
    title: "Holdfény",
    subtitle: "Finom fényű kövek",
    href: "/special-edition",
    imageUrl: "/seed/opal-necklace.svg",
    imageAlt: "Holdfény kollekció",
    isVisible: true,
  },
  {
    slotIndex: 5,
    title: "Partvonal",
    subtitle: "Karkötők rétegezéshez",
    href: "/bracelets",
    imageUrl: "/uploads/products/bracez-ld-b324c17b-303b-4d3c-9dd6-1edc016ec994.jpg",
    imageAlt: "Partvonal kollekció",
    isVisible: true,
  },
  {
    slotIndex: 6,
    title: "Gyöngy",
    subtitle: "Visszafogott ragyogás",
    href: "/new-in",
    imageUrl: "/seed/pearl-bracelet.svg",
    imageAlt: "Gyöngy kollekció",
    isVisible: true,
  },
  {
    slotIndex: 7,
    title: "Szirom",
    subtitle: "Lágy formák",
    href: "/new-in",
    imageUrl: "/seed/petal-hoops.svg",
    imageAlt: "Szirom kollekció",
    isVisible: true,
  },
  {
    slotIndex: 8,
    title: "Aranyóra",
    subtitle: "Meleg tónusok",
    href: "/sale",
    imageUrl: "/seed/gold-earrings.svg",
    imageAlt: "Aranyóra kollekció",
    isVisible: true,
  },
] satisfies Omit<HomepagePromoTileView, "id">[];

type NullableHomepageBlockInput = {
  id?: string;
  title?: string | null;
  eyebrow?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  buttonText?: string | null;
  buttonHref?: string | null;
  isVisible?: boolean;
};

type NullableHomepageTileInput = {
  id?: string;
  slotIndex: number;
  title?: string | null;
  subtitle?: string | null;
  href?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  isVisible?: boolean;
};

function normalizeBlock(
  key: HomepageContentBlockKey,
  block?: NullableHomepageBlockInput | null,
): HomepageBlockView {
  const fallback = defaultBlocks[key];

  return {
    id: block?.id ?? key,
    key,
    title: block?.title?.trim() || fallback.title,
    eyebrow: block?.eyebrow?.trim() || fallback.eyebrow,
    body: block?.body?.trim() || fallback.body,
    imageUrl: block?.imageUrl?.trim() || fallback.imageUrl,
    imageAlt: block?.imageAlt?.trim() || fallback.imageAlt,
    buttonText: block?.buttonText?.trim() || fallback.buttonText,
    buttonHref: block?.buttonHref?.trim() || fallback.buttonHref,
    isVisible: block?.isVisible ?? fallback.isVisible,
  };
}

function normalizePromoTile(tile: NullableHomepageTileInput) {
  const fallback =
    defaultPromoTiles.find((defaultTile) => defaultTile.slotIndex === tile.slotIndex) ??
    defaultPromoTiles[0];

  return {
    id: tile.id ?? `slot-${tile.slotIndex}`,
    slotIndex: tile.slotIndex,
    title: tile.title?.trim() || fallback.title,
    subtitle: tile.subtitle?.trim() || fallback.subtitle,
    href: tile.href?.trim() || fallback.href,
    imageUrl: tile.imageUrl?.trim() || fallback.imageUrl,
    imageAlt: tile.imageAlt?.trim() || fallback.imageAlt,
    isVisible: tile.isVisible ?? fallback.isVisible,
  };
}

export async function getHomepageContent(): Promise<HomepageContentView> {
  const [blocks, tiles] = await Promise.all([
    db.homepageContentBlock.findMany(),
    db.homepagePromoTile.findMany({
      orderBy: [{ slotIndex: "asc" }, { createdAt: "asc" }],
    }),
  ]);
  const blockByKey = new Map(blocks.map((block) => [block.key, block]));
  const tileBySlot = new Map(tiles.map((tile) => [tile.slotIndex, tile]));

  return {
    hero: normalizeBlock("HERO", blockByKey.get("HERO")),
    instagram: normalizeBlock("INSTAGRAM", blockByKey.get("INSTAGRAM")),
    promoTiles: defaultPromoTiles.map((defaultTile) =>
      normalizePromoTile(tileBySlot.get(defaultTile.slotIndex) ?? defaultTile),
    ),
  };
}

export async function upsertHomepageBlock(
  key: HomepageContentBlockKey,
  values: Omit<HomepageBlockView, "id" | "key">,
) {
  return db.homepageContentBlock.upsert({
    where: { key },
    create: { key, ...values },
    update: values,
  });
}

export async function upsertHomepagePromoTile(
  slotIndex: number,
  values: Omit<HomepagePromoTileView, "id" | "slotIndex">,
) {
  return db.homepagePromoTile.upsert({
    where: { slotIndex },
    create: { slotIndex, ...values },
    update: values,
  });
}
