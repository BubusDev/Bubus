const FALLBACK_IMAGE_EXTENSION = ".bin";

function splitFileName(fileName: string) {
  const trimmed = fileName.trim();
  const lastDotIndex = trimmed.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return {
      baseName: trimmed || "image",
      extension: FALLBACK_IMAGE_EXTENSION,
    };
  }

  return {
    baseName: trimmed.slice(0, lastDotIndex),
    extension: trimmed.slice(lastDotIndex).toLowerCase() || FALLBACK_IMAGE_EXTENSION,
  };
}

function sanitizeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createProductImageUploadPathname(fileName: string) {
  const { baseName, extension } = splitFileName(fileName);
  const sanitizedBaseName = sanitizeSegment(baseName) || "product-image";
  const uniqueSuffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}`;

  return `products/${sanitizedBaseName}-${uniqueSuffix}${extension}`;
}

function humanizeFileStem(value: string) {
  return value.replace(/[-_]+/g, " ").trim();
}

export function getImageAltTextFromFileName(fileName: string) {
  const { baseName } = splitFileName(fileName);
  return humanizeFileStem(baseName);
}

export function getImageAltTextFromUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const fileName = parsedUrl.pathname.split("/").pop();

    if (!fileName) {
      return "";
    }

    return getImageAltTextFromFileName(fileName);
  } catch {
    return "";
  }
}

export function isBlobReadWriteTokenConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
