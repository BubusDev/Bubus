import type { Prisma } from "@prisma/client";
import type {
  AdminProductFormOptions,
  AdminProductFormValues,
  AdminProductImageValue,
  ProductOptionValue,
  SpecialtyOptionValue,
} from "@/lib/products-client";

export type {
  AdminProductFormOptions,
  AdminProductFormValues,
  AdminProductImageValue,
  ProductOptionValue,
  SpecialtyOptionValue,
};

export type AdminProductRecord = Prisma.ProductGetPayload<{
  include: {
    images: true;
    specialties: {
      select: {
        specialtyId: true;
      };
    };
    category: true;
    stoneType: true;
    color: true;
    style: true;
    occasion: true;
    availability: true;
    tone: true;
  };
}>;

function getMappedImages(product: Pick<AdminProductRecord, "images" | "imageUrl" | "name">) {
  if (product.images.length > 0) {
    return product.images;
  }

  if (product.imageUrl) {
    return [
      {
        id: `${product.name}-legacy-image`,
        url: product.imageUrl,
        alt: product.name,
        isCover: true,
        cardCropX: 50,
        cardCropY: 50,
        cardCropZoom: 1,
        cardCropAspectRatio: 0.75,
        cardCropAreaX: 0,
        cardCropAreaY: 0,
        cardCropAreaWidth: 100,
        cardCropAreaHeight: 100,
      },
    ];
  }

  return [];
}

export function toAdminProductFormValues(
  product: AdminProductRecord | null,
  options: AdminProductFormOptions,
): AdminProductFormValues {
  if (!product) {
    return {
      id: "",
      slug: "",
      status: "ACTIVE",
      name: "",
      category: options.categories[0]?.id ?? "",
      price: 0,
      stockQuantity: 0,
      compareAtPrice: "",
      shortDescription: "",
      description: "",
      badge: "",
      collectionLabel: "",
      stoneType: options.stoneTypes[0]?.id ?? "",
      color: options.colors[0]?.id ?? "",
      style: options.styles[0]?.id ?? "",
      occasion: options.occasions[0]?.id ?? "",
      availability: options.availability[0]?.id ?? "",
      isNew: false,
      isGiftable: false,
      isOnSale: false,
      specialtyKey: "",
      specialtyIds: [],
      tone: options.tones[0]?.id ?? "",
      homepagePlacement: "none",
      images: [],
    };
  }

  const images: AdminProductImageValue[] = getMappedImages(product).map((image) => ({
    id: image.id,
    url: image.url,
    alt: image.alt ?? product.name,
    isCover: image.isCover,
    cardCropX: image.cardCropX,
    cardCropY: image.cardCropY,
    cardCropZoom: image.cardCropZoom,
    cardCropAspectRatio: image.cardCropAspectRatio,
    cardCropAreaX: image.cardCropAreaX,
    cardCropAreaY: image.cardCropAreaY,
    cardCropAreaWidth: image.cardCropAreaWidth,
    cardCropAreaHeight: image.cardCropAreaHeight,
  }));

  return {
    id: product.id,
    slug: product.slug,
    status: product.status,
    name: product.name,
    category: product.categoryId,
    price: product.price,
    stockQuantity: product.stockQuantity,
    compareAtPrice:
      typeof product.compareAtPrice === "number" ? String(product.compareAtPrice) : "",
    shortDescription: product.shortDescription,
    description: product.description,
    badge: product.badge,
    collectionLabel: product.collectionLabel,
    stoneType: product.stoneTypeId,
    color: product.colorId,
    style: product.styleId,
    occasion: product.occasionId,
    availability: product.availabilityId,
    isNew: product.isNew,
    isGiftable: product.isGiftable,
    isOnSale: product.isOnSale,
    specialtyKey: product.specialtyKey ?? "",
    specialtyIds: product.specialties.map((entry) => entry.specialtyId),
    tone: product.toneId,
    homepagePlacement:
      product.homepagePlacement === "SPOTLIGHT"
        ? "spotlight"
        : product.homepagePlacement === "NEW_ARRIVALS"
          ? "new_arrivals"
          : "none",
    images,
  };
}
