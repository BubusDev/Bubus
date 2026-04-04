"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ProductOptionType } from "@prisma/client";

import { requireAdminUser } from "@/lib/auth";
import { getImageAltTextFromUrl } from "@/lib/blob-upload";
import { db } from "@/lib/db";
import { deleteProductImageFile } from "@/lib/product-images";
import { parseProductFormData, slugifyOptionName } from "@/lib/products";

function revalidateCatalogPaths() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/new-in");
  revalidatePath("/special-edition");
  revalidatePath("/sale");
  revalidatePath("/", "layout");
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

function buildProductImageRecords(
  formData: FormData,
  productName: string,
  existingImageIds: string[] = [],
) {
  const uploadedImageUrls = getUploadedImageUrls(formData);
  const uploadedImageKeys = getUploadedImageKeys(formData);
  const uploadedImages = uploadedImageUrls.map((url, index) => ({
    url,
    alt: getImageAltTextFromUrl(url) || productName,
    key: uploadedImageKeys[index] ?? `upload:${index}`,
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

  const product = await (async () => {
    try {
      return await db.product.create({
        data: {
          ...data,
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

  const productId = formData.get("productId");

  if (typeof productId !== "string" || !productId) {
    throw new Error("Missing product id.");
  }

  const existingProduct = await db.product.findUnique({
    where: { id: productId },
    include: {
      images: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!existingProduct) {
    throw new Error("Product not found.");
  }

  const retainedImageIds = formData
    .getAll("retainedImageIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);

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
    await db.product.update({
      where: { id: productId },
      data: {
        ...data,
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

  const productId = formData.get("productId");

  if (typeof productId !== "string" || !productId) {
    throw new Error("Missing product id.");
  }

  const existingProduct = await db.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });

  if (!existingProduct) {
    throw new Error("Product not found.");
  }

  await db.product.delete({
    where: { id: productId },
  });

  await Promise.all(existingProduct.images.map((image) => deleteProductImageFile(image.url)));

  revalidateCatalogPaths();
  revalidatePath(`/product/${existingProduct.slug}`);
  redirect("/admin/products");
}

export async function createProductOptionAction(formData: FormData) {
  await requireAdminUser("/admin/products");

  const type = formData.get("type");
  const name = typeof formData.get("name") === "string" ? String(formData.get("name")).trim() : "";
  const slugInput =
    typeof formData.get("slug") === "string" ? String(formData.get("slug")).trim() : "";

  if (!type || typeof type !== "string") {
    throw new Error("Missing option type.");
  }

  if (!name) {
    throw new Error("Option name is required.");
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
    throw new Error("Option id and name are required.");
  }

  const sortOrder = Number(sortOrderRaw);
  const existingOption = await db.productOption.findUnique({
    where: { id: optionId },
    select: { id: true },
  });

  if (!existingOption) {
    throw new Error("Option no longer exists. Refresh the page and try again.");
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
    throw new Error("Missing option type.");
  }

  if (orderedOptionIds.length === 0) {
    throw new Error("Missing option order.");
  }

  const existingOptions = await db.productOption.findMany({
    where: { type: type as ProductOptionType },
    select: { id: true },
  });

  if (new Set(orderedOptionIds).size !== orderedOptionIds.length) {
    throw new Error("Option reorder payload is invalid.");
  }

  const existingIds = new Set(existingOptions.map((option) => option.id));
  if (orderedOptionIds.some((id) => !existingIds.has(id))) {
    throw new Error("Option reorder payload is invalid.");
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
    throw new Error("Missing option id.");
  }

  const existingOption = await db.productOption.findUnique({
    where: { id: optionId },
    select: { id: true },
  });

  if (!existingOption) {
    throw new Error("Option no longer exists. Refresh the page and try again.");
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
