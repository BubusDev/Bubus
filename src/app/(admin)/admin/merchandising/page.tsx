import { AdminMerchandisingBoard, type MerchandisingBoardProduct } from "@/components/admin/AdminMerchandisingBoard";
import { AdminShell } from "@/components/admin/AdminShell";
import { focalPointFromCropArea, focalPointFromLegacyCrop } from "@/lib/image-crop";
import { getAdminMerchandisingBoard } from "@/lib/products";

type AdminMerchandisingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminMerchandisingPage({
  searchParams,
}: AdminMerchandisingPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedContext = Array.isArray(resolvedSearchParams.context)
    ? resolvedSearchParams.context[0]
    : resolvedSearchParams.context;
  const board = await getAdminMerchandisingBoard(selectedContext);
  const products: MerchandisingBoardProduct[] = board.products.map((product) => {
    const cardImage = product.images.find((image) => image.isCover) ?? product.images[0] ?? null;

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      badge: product.badge,
      collectionLabel: product.collectionLabel,
      categoryLabel: product.labels.category,
      imageUrl: cardImage?.url ?? product.imageUrl ?? null,
      cardFocalPoint: cardImage
        ? (() => {
            const cropArea = {
              x: cardImage.cardCropAreaX,
              y: cardImage.cardCropAreaY,
              width: cardImage.cardCropAreaWidth,
              height: cardImage.cardCropAreaHeight,
            };
            const hasLegacyCropArea =
              cropArea.x !== 0 ||
              cropArea.y !== 0 ||
              cropArea.width !== 100 ||
              cropArea.height !== 100;

            return hasLegacyCropArea
              ? focalPointFromCropArea(cropArea)
              : focalPointFromLegacyCrop({
                  x: cardImage.cardCropX,
                  y: cardImage.cardCropY,
                  zoom: cardImage.cardCropZoom,
                  aspectRatio: cardImage.cardCropAspectRatio,
                });
          })()
        : null,
      statusLabel: product.status,
      availableToSell: product.availableToSell,
      isNew: product.isNew,
      isOnSale: product.isOnSale,
      isGiftable: product.isGiftable,
    };
  });

  return (
    <AdminShell
      title="Merchandising"
      description="Listing-specifikus terméksorrend vizuális storefront előnézettel."
    >
      <AdminMerchandisingBoard
        contexts={board.contexts}
        selectedContext={board.selectedContext}
        products={products}
        hasManualOrder={board.hasManualOrder}
      />
    </AdminShell>
  );
}
