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

export async function saveUploadedProductImages(files: File[]) {
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
      alt: path.basename(file.name, path.extname(file.name)).replace(/[-_]+/g, " "),
    });
  }

  return uploadedImages;
}

export async function saveUploadedSpecialEditionImages(files: File[]) {
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
      alt: path.basename(file.name, path.extname(file.name)).replace(/[-_]+/g, " "),
    });
  }

  return uploadedImages;
}

export async function deleteProductImageFile(url: string) {
  if (!url.startsWith("/uploads/products/")) {
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
    return;
  }

  const filePath = path.join(process.cwd(), "public", url.replace(/^\/+/, ""));

  try {
    await unlink(filePath);
  } catch {
    // Ignore missing files so campaign cleanup stays idempotent.
  }
}
