import type { CSSProperties, ReactNode } from "react";

import {
  getCroppedBackgroundStyle,
  getFocalBackgroundStyle,
  type ImageCropArea,
  type ImageFocalPoint,
} from "@/lib/image-crop";
import { getBrowserDisplayImageUrl } from "@/lib/image-safety";

type ProductImageFrameProps = {
  alt: string;
  imageUrl?: string | null;
  imageClassName?: string;
  overlayLabel?: string;
  palette?: readonly [string, string, string];
  soldOut?: boolean;
  className?: string;
  fallback?: ReactNode;
  style?: CSSProperties;
  cropArea?: ImageCropArea | null;
  focalPoint?: ImageFocalPoint | null;
};

function buildBackground(palette?: readonly [string, string, string]) {
  if (!palette) {
    return undefined;
  }

  const [from, via, to] = palette;
  return {
    background: `linear-gradient(160deg, ${from}, ${via} 58%, ${to})`,
  } satisfies CSSProperties;
}

export function ProductImageFrame({
  alt,
  imageUrl,
  imageClassName = "h-full w-full object-cover",
  overlayLabel = "Elfogyott",
  palette,
  soldOut = false,
  className,
  fallback,
  style,
  cropArea,
  focalPoint,
}: ProductImageFrameProps) {
  const displayImageUrl = getBrowserDisplayImageUrl(imageUrl);

  return (
    <div
      className={className}
      style={{
        ...buildBackground(palette),
        ...style,
      }}
    >
      {displayImageUrl && (focalPoint || cropArea) ? (
        <div
          role="img"
          aria-label={alt}
          className={`${imageClassName} transition duration-700 ${
            soldOut
              ? "scale-[1.008] saturate-[0.76] brightness-[0.96]"
              : ""
          }`}
          style={
            focalPoint
              ? getFocalBackgroundStyle(displayImageUrl, focalPoint)
              : getCroppedBackgroundStyle(displayImageUrl, cropArea)
          }
        />
      ) : displayImageUrl ? (
        <img
          src={displayImageUrl}
          alt={alt}
          className={`${imageClassName} transition duration-700 ${
            soldOut
              ? "scale-[1.008] saturate-[0.76] brightness-[0.96]"
              : ""
          }`}
        />
      ) : (
        fallback ?? (
          <div className="flex h-full w-full items-center justify-center px-4 text-center font-[family:var(--font-display)] text-lg text-[#6b5c64]/70">
            {alt}
          </div>
        )
      )}

      {soldOut ? (
        <>
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/58 via-white/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-start p-3">
            <span className="inline-flex items-center rounded-md border border-white/70 bg-white/72 px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] text-[#6f666b] shadow-[0_8px_18px_rgba(82,73,79,0.08)] backdrop-blur-sm">
              {overlayLabel}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
