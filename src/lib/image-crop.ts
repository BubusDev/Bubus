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

export const DEFAULT_IMAGE_CROP: ImageCropMetadata = {
  x: 0,
  y: 0,
  zoom: 1,
  aspectRatio: 1,
};

export const DEFAULT_IMAGE_CROP_AREA: ImageCropArea = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
};

export function getImageCropStyle(crop?: Partial<ImageCropMetadata> | null) {
  return {
    objectFit: "cover",
    objectPosition: "50% 50%",
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

export function getCroppedBackgroundStyle(
  imageUrl: string,
  area?: Partial<ImageCropArea> | null,
) {
  const crop = normalizeCropArea(area);
  const xPosition =
    crop.width >= 100 ? 50 : clamp((crop.x / (100 - crop.width)) * 100, 0, 100);
  const yPosition =
    crop.height >= 100 ? 50 : clamp((crop.y / (100 - crop.height)) * 100, 0, 100);

  return {
    backgroundImage: `url("${escapeCssUrl(imageUrl)}")`,
    backgroundPosition: `${xPosition}% ${yPosition}%`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${10000 / crop.width}% auto`,
  } satisfies CSSProperties;
}
import type { CSSProperties } from "react";
