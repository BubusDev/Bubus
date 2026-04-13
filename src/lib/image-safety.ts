const BROWSER_SAFE_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const BROWSER_SAFE_IMAGE_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);
const UNSAFE_IMAGE_EXTENSIONS = new Set([".heic", ".heif"]);
const UNSAFE_IMAGE_CONTENT_TYPES = new Set(["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"]);

export const browserSafeProductImageAccept = Array.from(BROWSER_SAFE_IMAGE_CONTENT_TYPES).join(",");

export const productImageFormatHelpText = "PNG, JPG, WEBP vagy AVIF formatum. HEIC/HEIF nem toltheto fel.";

export function getPathExtension(value: string) {
  const pathname = (() => {
    try {
      return new URL(value).pathname;
    } catch {
      return value.split("?")[0] ?? value;
    }
  })();

  const fileName = pathname.split("/").pop() ?? "";
  const dotIndex = fileName.lastIndexOf(".");

  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

export function isUnsafeImageContentType(contentType: string | null | undefined) {
  return UNSAFE_IMAGE_CONTENT_TYPES.has((contentType ?? "").toLowerCase());
}

export function isUnsafeImagePath(value: string | null | undefined) {
  if (!value) return false;
  return UNSAFE_IMAGE_EXTENSIONS.has(getPathExtension(value));
}

export function isBrowserSafeImageContentType(contentType: string | null | undefined) {
  return BROWSER_SAFE_IMAGE_CONTENT_TYPES.has((contentType ?? "").toLowerCase());
}

export function isBrowserSafeImageUrl(url: string | null | undefined) {
  if (!url || isUnsafeImagePath(url)) return false;

  const extension = getPathExtension(url);
  if (!extension) return true;

  return BROWSER_SAFE_IMAGE_EXTENSIONS.has(extension);
}

export function isBrowserSafeImageFile(file: Pick<File, "name" | "type">) {
  if (isUnsafeImageContentType(file.type) || isUnsafeImagePath(file.name)) {
    return false;
  }

  if (file.type) {
    return isBrowserSafeImageContentType(file.type);
  }

  const extension = getPathExtension(file.name);
  return extension.length > 0 && BROWSER_SAFE_IMAGE_EXTENSIONS.has(extension);
}

export function getUnsafeProductImageMessage(fileName?: string) {
  const prefix = fileName ? `${fileName}: ` : "";
  return `${prefix}HEIC/HEIF kepek nem tolthetok fel. Exportald JPG, PNG, WEBP vagy AVIF formatumba, majd toltsd fel ujra.`;
}

export function assertBrowserSafeProductImageUrl(url: string) {
  if (!isBrowserSafeImageUrl(url)) {
    throw new Error(getUnsafeProductImageMessage(url));
  }
}
