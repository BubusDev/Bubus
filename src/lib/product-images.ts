import { del, put } from "@vercel/blob";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
const specialEditionUploadsDir = path.join(
  process.cwd(),
  "public",
  "uploads",
  "special-edition",
);

function sanitizeFileName(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  const baseName = path
    .basename(fileName, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${baseName || "product-image"}-${randomUUID()}${extension || ".bin"}`;
}

function getImageAltText(fileName: string) {
  return path.basename(fileName, path.extname(fileName)).replace(/[-_]+/g, " ");
}

function requiresRemoteStorage() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function assertBlobConfigured() {
  if (!isBlobConfigured()) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN must be set for production image uploads on Vercel.",
    );
  }
}

async function uploadImageToBlob(folder: "products" | "special-edition", file: File) {
  assertBlobConfigured();

  const fileName = sanitizeFileName(file.name);
  const blob = await put(`uploads/${folder}/${fileName}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return {
    url: blob.url,
    alt: getImageAltText(file.name),
  };
}

function isVercelBlobUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.endsWith("vercel-storage.com");
  } catch {
    return false;
  }
}

export async function saveUploadedProductImages(files: File[]) {
  if (requiresRemoteStorage()) {
    const uploadedImages: { url: string; alt: string }[] = [];

    for (const file of files) {
      if (!file || file.size === 0) {
        continue;
      }

      uploadedImages.push(await uploadImageToBlob("products", file));
    }

    return uploadedImages;
  }

  await mkdir(uploadsDir, { recursive: true });

  const uploadedImages: { url: string; alt: string }[] = [];

  for (const file of files) {
    if (!file || file.size === 0) {
      continue;
    }

    const fileName = sanitizeFileName(file.name);
    const filePath = path.join(uploadsDir, fileName);
    const arrayBuffer = await file.arrayBuffer();

    await writeFile(filePath, Buffer.from(arrayBuffer));

    uploadedImages.push({
      url: `/uploads/products/${fileName}`,
      alt: getImageAltText(file.name),
    });
  }

  return uploadedImages;
}

export async function saveUploadedSpecialEditionImages(files: File[]) {
  if (requiresRemoteStorage()) {
    const uploadedImages: { url: string; alt: string }[] = [];

    for (const file of files) {
      if (!file || file.size === 0) {
        continue;
      }

      uploadedImages.push(await uploadImageToBlob("special-edition", file));
    }

    return uploadedImages;
  }

  await mkdir(specialEditionUploadsDir, { recursive: true });

  const uploadedImages: { url: string; alt: string }[] = [];

  for (const file of files) {
    if (!file || file.size === 0) {
      continue;
    }

    const fileName = sanitizeFileName(file.name);
    const filePath = path.join(specialEditionUploadsDir, fileName);
    const arrayBuffer = await file.arrayBuffer();

    await writeFile(filePath, Buffer.from(arrayBuffer));

    uploadedImages.push({
      url: `/uploads/special-edition/${fileName}`,
      alt: getImageAltText(file.name),
    });
  }

  return uploadedImages;
}

export async function deleteProductImageFile(url: string) {
  if (!url.startsWith("/uploads/products/")) {
    if (isBlobConfigured() && isVercelBlobUrl(url)) {
      await del(url);
    }
    return;
  }

  const filePath = path.join(process.cwd(), "public", url.replace(/^\/+/, ""));

  try {
    await unlink(filePath);
  } catch {
    // Ignore missing files so product cleanup stays idempotent.
  }
}

export async function deleteSpecialEditionImageFile(url: string) {
  if (!url.startsWith("/uploads/special-edition/")) {
    if (isBlobConfigured() && isVercelBlobUrl(url)) {
      await del(url);
    }
    return;
  }

  const filePath = path.join(process.cwd(), "public", url.replace(/^\/+/, ""));

  try {
    await unlink(filePath);
  } catch {
    // Ignore missing files so campaign cleanup stays idempotent.
  }
}
