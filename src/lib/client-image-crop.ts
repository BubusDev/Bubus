"use client";

import type { Area } from "react-easy-crop";

const CROP_OUTPUT_MAX_EDGE = 2200;
const CROP_OUTPUT_QUALITY = 0.9;

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("A kép feldolgozása nem sikerült."));
      },
      type,
      quality,
    );
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("A kép előnézete nem tölthető be."));
    image.src = src;
  });
}

function outputFileName(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  return `${baseName || "image"}-cropped.jpg`;
}

export async function createCroppedImageFile(
  sourceUrl: string,
  cropPixels: Area,
  originalFile: File,
) {
  const image = await loadImage(sourceUrl);
  const scale = Math.min(
    1,
    CROP_OUTPUT_MAX_EDGE / Math.max(cropPixels.width, cropPixels.height),
  );
  const targetWidth = Math.max(1, Math.round(cropPixels.width * scale));
  const targetHeight = Math.max(1, Math.round(cropPixels.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    throw new Error("A böngésző nem tudta előkészíteni a képet.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  const blob = await canvasToBlob(canvas, "image/jpeg", CROP_OUTPUT_QUALITY);
  return new File([blob], outputFileName(originalFile.name), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
