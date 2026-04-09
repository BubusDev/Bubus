"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ProductOptionType } from "@prisma/client";

import { requireAdminUser } from "@/lib/auth";
import { getImageAltTextFromUrl } from "@/lib/blob-upload";
import { db } from "@/lib/db";
import { getSoldOutTimestamp } from "@/lib/inventory";
import { deleteProductImageFile } from "@/lib/product-images";
import { parseProductFormData, slugifyOptionName } from "@/lib/products";

function revalidateCatalogPaths() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/archive");
  revalidatePath("/new-in");
  revalidatePath("/special-edition");
  revalidatePath("/sale");
  revalidatePath("/", "layout");
}

function readProductId(formData: FormData) {
  const productId = formData.get("productId");

  if (typeof productId !== "string" || !productId) {
    throw new Error("Hiányzik a termék azonosítója.");
  }

  return productId;
}

async function getExistingProductForAdminAction(productId: string) {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      slug: true,
      isNew: true,
      isGiftable: true,
      isOnSale: true,
      archivedAt: true,
      archiveReason: true,
    },
  });

  if (!product) {
    throw new Error("A termék nem található.");
  }

  return product;
}

function getUploadedImageUrls(formData: FormData) {
  return formData
    .getAll("imageUrls")
    .filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
}

function getUploadedImageKeys(formData: FormData) {
  return formData
    .getAll("imageKeys")
    .filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
}

function getRetainedImageIds(formData: FormData) {
  const compactValue = formData.get("retainedImageIdsCsv");

  if (typeof compactValue === "string" && compactValue.trim().length > 0) {
    return compactValue
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }

  return formData
    .getAll("retainedImageIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);
}

function getUploadedImages(formData: FormData) {
  const compactValue = formData.get("uploadedImagesJson");

  if (typeof compactValue === "string" && compactValue.trim().length > 0) {
    let parsed: unknown;

    try {
      parsed = JSON.parse(compactValue);
    } catch {
      throw new Error("Érvénytelen feltöltött kép csomag.");
    }

    if (!Array.isArray(parsed)) {
      throw new Error("Érvénytelen feltöltött kép csomag.");
    }

    return parsed
      .filter(
        (entry): entry is { key: string; url: string } =>
          typeof entry === "object" &&
          entry !== null &&
          typeof entry.key === "string" &&
          entry.key.length > 0 &&
          typeof entry.url === "string" &&
          entry.url.length > 0,
      )
      .map((entry) => ({
        key: entry.key,
        url: entry.url,
      }));
  }

  const uploadedImageUrls = getUploadedImageUrls(formData);
  const uploadedImageKeys = getUploadedImageKeys(formData);

  return uploadedImageUrls.map((url, index) => ({
    url,
    key: uploadedImageKeys[index] ?? `upload:${index}`,
  }));
}

function buildProductImageRecords(
  formData: FormData,
  productName: string,
  existingImageIds: string[] = [],
) {
  const uploadedImages = getUploadedImages(formData).map((image, index) => ({
    url: image.url,
    alt: getImageAltTextFromUrl(image.url) || productName,
    key: image.key,
    sortOrder: existingImageIds.length + index,
  }));
  const coverImageKey =
    typeof formData.get("coverImageKey") === "string" ? String(formData.get("coverImageKey")) : "";

  return {
    uploadedImages,
    coverImageKey,
  };
}

export async function createProductAction(formData: FormData) {
  await requireAdminUser("/admin/products/new");
  const data = await parseProductFormData(formData);
  const { uploadedImages, coverImageKey } = buildProductImageRecords(formData, data.name);

  const coverUrl =
    uploadedImages.find((image) => image.key === coverImageKey)?.url ?? uploadedImages[0]?.url ?? null;
  const nextStockQuantity = data.stockQuantity ?? 0;

  const product = await (async () => {
    try {
      const createdProduct = await db.product.create({
        data: {
          ...data,
          reservedQuantity: 0,
          soldOutAt: getSoldOutTimestamp(null, nextStockQuantity),
          lowStockAlertSentAt: null,
          imageUrl: coverUrl,
          images: {
            create: uploadedImages.map((image, index) => ({
              url: image.url,
              alt: image.alt,
              sortOrder: index,
              isCover:
                coverImageKey.length > 0
                  ? coverImageKey === image.key
                  : index === 0,
            })),
          },
        },
      });

      if (createdProduct.stockQuantity > 0) {
        await db.inventoryEvent.create({
          data: {
            productId: createdProduct.id,
            type: "INITIAL_STOCK",
            quantityDelta: createdProduct.stockQuantity,
            stockAfter: createdProduct.stockQuantity,
            note: "Initial stock set during product creation.",
          },
        });
      }

      return createdProduct;
    } catch (error) {
      await Promise.all(uploadedImages.map((image) => deleteProductImageFile(image.url)));
      throw error;
    }
  })();

  revalidateCatalogPaths();
  revalidatePath(`/product/${product.slug}`);
  redirect("/admin/products");
}

export async function updateProductAction(formData: FormData) {
  await requireAdminUser("/admin/products");

  const productId = readProductId(formData);

  const existingProduct = await db.product.findUnique({
    where: { id: productId },
    include: {
      images: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!existingProduct) {
    throw new Error("A termék nem található.");
  }

  const retainedImageIds = getRetainedImageIds(formData);

  const removedImages = existingProduct.images.filter(
    (image) => !retainedImageIds.includes(image.id),
  );

  const data = await parseProductFormData(formData);
  const { uploadedImages, coverImageKey } = buildProductImageRecords(
    formData,
    data.name,
    retainedImageIds,
  );

  const retainedImages = existingProduct.images.filter((image) =>
    retainedImageIds.includes(image.id),
  );

  const nextImageUrl =
    retainedImages.find((image) => image.id === coverImageKey)?.url ??
    uploadedImages.find((image) => image.key === coverImageKey)?.url ??
    retainedImages[0]?.url ??
    uploadedImages[0]?.url ??
    null;

  try {
    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: {
        ...data,
        soldOutAt: getSoldOutTimestamp(existingProduct.soldOutAt, data.stockQuantity ?? 0),
        lowStockAlertSentAt:
          (data.stockQuantity ?? 0) >= 3
            ? null
            : existingProduct.lowStockAlertSentAt,
        imageUrl: nextImageUrl,
        images: {
          deleteMany: {
            id: {
              notIn: retainedImageIds.length > 0 ? retainedImageIds : ["__none__"],
            },
          },
          updateMany: retainedImages.map((image, index) => ({
            where: { id: image.id },
            data: {
              sortOrder: index,
              isCover: image.id === coverImageKey,
            },
          })),
          create: uploadedImages.map((image, index) => ({
            url: image.url,
            alt: image.alt,
            sortOrder: retainedImages.length + index,
            isCover: coverImageKey === image.key,
          })),
        },
      },
    });

    const stockDelta = updatedProduct.stockQuantity - existingProduct.stockQuantity;

    if (stockDelta !== 0) {
      await db.inventoryEvent.create({
        data: {
          productId: updatedProduct.id,
          type: "MANUAL_ADJUSTMENT",
          quantityDelta: stockDelta,
          stockAfter: updatedProduct.stockQuantity,
          note: "Manual stock update from admin.",
          metadata: {
            previousStockQuantity: existingProduct.stockQuantity,
            nextStockQuantity: updatedProduct.stockQuantity,
          },
        },
      });
    }
  } catch (error) {
    await Promise.all(uploadedImages.map((image) => deleteProductImageFile(image.url)));
    throw error;
  }

  await Promise.all(removedImages.map((image) => deleteProductImageFile(image.url)));

  revalidateCatalogPaths();
  revalidatePath(`/product/${existingProduct.slug}`);
  revalidatePath(`/product/${data.slug}`);
  revalidatePath(`/admin/products/${productId}/edit`);
  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdminUser("/admin/products");

  const productId = readProductId(formData);

  const existingProduct = await db.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });

  if (!existingProduct) {
    throw new Error("A termék nem található.");
  }

  await db.product.delete({
    where: { id: productId },
  });

  await Promise.all(existingProduct.images.map((image) => deleteProductImageFile(image.url)));

  revalidateCatalogPaths();
  revalidatePath(`/product/${existingProduct.slug}`);
  redirect("/admin/products");
}

export async function toggleProductFlagAction(formData: FormData) {
  await requireAdminUser("/admin/products");

  const productId = readProductId(formData);
  const flag = formData.get("flag");
  const nextValue = formData.get("nextValue") === "true";
  const product = await getExistingProductForAdminAction(productId);

  if (typeof flag !== "string" || !["isNew", "isGiftable", "isOnSale"].includes(flag)) {
    throw new Error("Érvénytelen jelölés.");
  }

  await db.product.update({
    where: { id: productId },
    data: { [flag]: nextValue },
  });

  revalidateCatalogPaths();
  revalidatePath(`/product/${product.slug}`);
}

export async function toggleProductArchiveAction(formData: FormData) {
  await requireAdminUser("/admin/products");

  const productId = readProductId(formData);
  const nextArchived = formData.get("nextArchived") === "true";
  const archiveReasonInput = formData.get("archiveReason");
  const product = await getExistingProductForAdminAction(productId);
  const archiveReason =
    typeof archiveReasonInput === "string" && archiveReasonInput.trim().length > 0
      ? archiveReasonInput.trim()
      : "DISCONTINUED";

  await db.product.update({
    where: { id: productId },
    data: nextArchived
      ? {
          archivedAt: new Date(),
          archiveReason,
          homepagePlacement: "NONE",
        }
      : {
          archivedAt: null,
          archiveReason: null,
        },
  });

  revalidateCatalogPaths();
  revalidatePath(`/product/${product.slug}`);
}

export async function createProductOptionAction(formData: FormData) {
  await requireAdminUser("/admin/products");

  const type = formData.get("type");
  const name = typeof formData.get("name") === "string" ? String(formData.get("name")).trim() : "";
  const slugInput =
    typeof formData.get("slug") === "string" ? String(formData.get("slug")).trim() : "";

  if (!type || typeof type !== "string") {
    throw new Error("Hiányzik az opció típusa.");
  }

  if (!name) {
    throw new Error("Az opció neve kötelező.");
  }

  const slug = slugifyOptionName(slugInput || name);

  const lastOption = await db.productOption.findFirst({
    where: { type: type as ProductOptionType },
    orderBy: [{ sortOrder: "desc" }],
    select: { sortOrder: true },
  });

  const option = await db.productOption.create({
    data: {
      type: type as ProductOptionType,
      name,
      slug,
      sortOrder: (lastOption?.sortOrder ?? -1) + 1,
      isActive: true,
    },
  });

  revalidateCatalogPaths();

  return {
    id: option.id,
    type: option.type,
    name: option.name,
    slug: option.slug,
    isActive: option.isActive,
    sortOrder: option.sortOrder,
  };
}

export async function createProductOptionFormAction(formData: FormData) {
  await createProductOptionAction(formData);
}

export async function updateProductOptionAction(formData: FormData) {
  await requireAdminUser("/admin/products");

  const optionId = typeof formData.get("optionId") === "string" ? String(formData.get("optionId")) : "";
  const name = typeof formData.get("name") === "string" ? String(formData.get("name")).trim() : "";
  const slugInput =
    typeof formData.get("slug") === "string" ? String(formData.get("slug")).trim() : "";
  const sortOrderRaw =
    typeof formData.get("sortOrder") === "string" ? String(formData.get("sortOrder")).trim() : "";

  if (!optionId || !name) {
    throw new Error("Az opció azonosítója és neve kötelező.");
  }

  const sortOrder = Number(sortOrderRaw);
  const existingOption = await db.productOption.findUnique({
    where: { id: optionId },
    select: { id: true },
  });

  if (!existingOption) {
    throw new Error("Az opció már nem létezik. Frissítsd az oldalt, és próbáld újra.");
  }

  await db.productOption.update({
    where: { id: optionId },
    data: {
      name,
      slug: slugifyOptionName(slugInput || name),
      isActive: formData.get("isActive") === "on",
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });

  revalidateCatalogPaths();
}

export async function reorderProductOptionsAction(formData: FormData) {
  await requireAdminUser("/admin/products");

  const type = typeof formData.get("type") === "string" ? String(formData.get("type")) : "";
  const orderedOptionIds = formData
    .getAll("orderedOptionIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  if (!type) {
    throw new Error("Hiányzik az opció típusa.");
  }

  if (orderedOptionIds.length === 0) {
    throw new Error("Hiányzik az opciók sorrendje.");
  }

  const existingOptions = await db.productOption.findMany({
    where: { type: type as ProductOptionType },
    select: { id: true },
  });

  if (new Set(orderedOptionIds).size !== orderedOptionIds.length) {
    throw new Error("Érvénytelen opciósorrend érkezett.");
  }

  const existingIds = new Set(existingOptions.map((option) => option.id));
  if (orderedOptionIds.some((id) => !existingIds.has(id))) {
    throw new Error("Érvénytelen opciósorrend érkezett.");
  }

  await db.$transaction(
    orderedOptionIds.map((optionId, index) =>
      db.productOption.update({
        where: { id: optionId },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidateCatalogPaths();
}

export async function deleteProductOptionAction(formData: FormData) {
  await requireAdminUser("/admin/products");

  const optionId = typeof formData.get("optionId") === "string" ? String(formData.get("optionId")) : "";

  if (!optionId) {
    throw new Error("Hiányzik az opció azonosítója.");
  }

  const existingOption = await db.productOption.findUnique({
    where: { id: optionId },
    select: { id: true },
  });

  if (!existingOption) {
    throw new Error("Az opció már nem létezik. Frissítsd az oldalt, és próbáld újra.");
  }

  const inUse = await db.product.count({
    where: {
      OR: [
        { categoryId: optionId },
        { stoneTypeId: optionId },
        { colorId: optionId },
        { styleId: optionId },
        { occasionId: optionId },
        { availabilityId: optionId },
        { toneId: optionId },
      ],
    },
  });

  if (inUse > 0) {
    await db.productOption.update({
      where: { id: optionId },
      data: { isActive: false },
    });
  } else {
    await db.productOption.delete({
      where: { id: optionId },
    });
  }

  revalidateCatalogPaths();
}
