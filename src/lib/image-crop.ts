import type { CSSProperties } from "react";

export type ImageCropMetadata = {
  x: number;
  y: number;
  zoom: number;
  aspectRatio: number;
};

export type ImageCropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ImageFocalPoint = {
  x: number;
  y: number;
};

export const DEFAULT_IMAGE_FOCAL_POINT: ImageFocalPoint = {
  x: 50,
  y: 50,
};

export const DEFAULT_IMAGE_CROP: ImageCropMetadata = {
  x: DEFAULT_IMAGE_FOCAL_POINT.x,
  y: DEFAULT_IMAGE_FOCAL_POINT.y,
  zoom: 1,
  aspectRatio: 1,
};

export const DEFAULT_IMAGE_CROP_AREA: ImageCropArea = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
};

// Compatibility helpers for legacy crop/focal metadata. New storefront/admin
// image surfaces use fixed frames with centered cover rendering.
export function getImageCropStyle(crop?: Partial<ImageCropMetadata> | null) {
  return getImageFocalPointStyle(focalPointFromLegacyCrop(crop));
}

export function getImageFocalPointStyle(focalPoint?: Partial<ImageFocalPoint> | null) {
  const focal = normalizeFocalPoint(focalPoint);

  return {
    objectFit: "cover",
    objectPosition: `${focal.x}% ${focal.y}%`,
  } satisfies CSSProperties;
}

export function getCenteredImageFillStyle() {
  return {
    objectFit: "cover",
    objectPosition: "center",
  } satisfies CSSProperties;
}

export function normalizeCropNumber(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function escapeCssUrl(url: string) {
  return url.replace(/"/g, "%22");
}

export function normalizeCropArea(area?: Partial<ImageCropArea> | null): ImageCropArea {
  const width = clamp(normalizeCropNumber(area?.width, 100), 1, 100);
  const height = clamp(normalizeCropNumber(area?.height, 100), 1, 100);
  const x = clamp(normalizeCropNumber(area?.x, 0), 0, 100 - width);
  const y = clamp(normalizeCropNumber(area?.y, 0), 0, 100 - height);

  return { x, y, width, height };
}

export function normalizeFocalPoint(
  focalPoint?: Partial<ImageFocalPoint> | null,
): ImageFocalPoint {
  return {
    x: clamp(normalizeCropNumber(focalPoint?.x, DEFAULT_IMAGE_FOCAL_POINT.x), 0, 100),
    y: clamp(normalizeCropNumber(focalPoint?.y, DEFAULT_IMAGE_FOCAL_POINT.y), 0, 100),
  };
}

export function focalPointFromLegacyCrop(
  crop?: Partial<ImageCropMetadata> | null,
): ImageFocalPoint {
  if (!crop) return DEFAULT_IMAGE_FOCAL_POINT;

  const x = normalizeCropNumber(crop.x, DEFAULT_IMAGE_FOCAL_POINT.x);
  const y = normalizeCropNumber(crop.y, DEFAULT_IMAGE_FOCAL_POINT.y);

  if (x === 0 && y === 0) {
    return DEFAULT_IMAGE_FOCAL_POINT;
  }

  return normalizeFocalPoint({ x, y });
}

export function focalPointFromCropArea(
  area?: Partial<ImageCropArea> | null,
): ImageFocalPoint {
  const crop = normalizeCropArea(area);

  if (crop.x === 0 && crop.y === 0 && crop.width === 100 && crop.height === 100) {
    return DEFAULT_IMAGE_FOCAL_POINT;
  }

  return normalizeFocalPoint({
    x: crop.x + crop.width / 2,
    y: crop.y + crop.height / 2,
  });
}

export function getCroppedBackgroundStyle(
  imageUrl: string,
  area?: Partial<ImageCropArea> | null,
) {
  return getFocalBackgroundStyle(imageUrl, focalPointFromCropArea(area));
}

export function getFocalBackgroundStyle(
  imageUrl: string,
  focalPoint?: Partial<ImageFocalPoint> | null,
) {
  const focal = normalizeFocalPoint(focalPoint);

  return {
    backgroundImage: `url("${escapeCssUrl(imageUrl)}")`,
    backgroundPosition: `${focal.x}% ${focal.y}%`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  } satisfies CSSProperties;
}

export function getCenteredBackgroundFillStyle(imageUrl: string) {
  return {
    backgroundImage: `url("${escapeCssUrl(imageUrl)}")`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  } satisfies CSSProperties;
}
