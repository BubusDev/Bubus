type StoneCandidate = {
  slug?: string | null;
};

type ProductStoneCandidate = {
  stoneSlug?: string | null;
  stoneType?: {
    slug?: string | null;
  } | null;
  stones?: StoneCandidate[] | null;
};

export function productHasStone(product: ProductStoneCandidate, stone: StoneCandidate) {
  if (!stone.slug) return false;

  const productStoneSlugs = [
    product.stoneSlug,
    product.stoneType?.slug,
    ...(product.stones?.map((productStone) => productStone.slug) ?? []),
  ].filter((slug): slug is string => Boolean(slug));

  return productStoneSlugs.includes(stone.slug);
}
