type StoneTypeCandidate = {
  id?: string | null;
  slug?: string | null;
};

type ProductStoneCandidate = {
  stoneTypeId?: string | null;
  stoneSlug?: string | null;
  stoneType?: {
    id?: string | null;
    slug?: string | null;
  } | null;
  stones?: StoneTypeCandidate[] | null;
};

export function productHasStone(product: ProductStoneCandidate, stoneType: StoneTypeCandidate) {
  const stoneTypeIds = [stoneType.id, stoneType.slug].filter(
    (value): value is string => Boolean(value),
  );
  if (stoneTypeIds.length === 0) return false;

  const productStoneTypeIds = [
    product.stoneTypeId,
    product.stoneSlug,
    product.stoneType?.id,
    product.stoneType?.slug,
    ...(product.stones?.flatMap((productStone) => [productStone.id, productStone.slug]) ?? []),
  ].filter((value): value is string => Boolean(value));

  return stoneTypeIds.some((stoneTypeId) => productStoneTypeIds.includes(stoneTypeId));
}
