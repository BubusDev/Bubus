"use client";

import { useMemo, useState, type PointerEvent } from "react";
import Image from "next/image";

import { isBrowserSafeImageUrl } from "@/lib/image-safety";

type GalleryImage = {
  url: string;
  alt?: string | null;
};

type ProductImageGalleryProps = {
  images: GalleryImage[];
  productName: string;
  soldOut?: boolean;
};

export function ProductImageGallery({
  images,
  productName,
  soldOut,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [brokenImageUrls, setBrokenImageUrls] = useState<Set<string>>(new Set());
  const safeImages = useMemo(
    () =>
      images.filter(
        (image) => isBrowserSafeImageUrl(image.url) && !brokenImageUrls.has(image.url),
      ),
    [brokenImageUrls, images],
  );
  const safeActiveIndex = Math.min(activeIndex, Math.max(safeImages.length - 1, 0));
  const activeImage = safeImages[safeActiveIndex];

  function updateZoomOrigin(event: PointerEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setZoomOrigin(`${x}% ${y}%`);
  }

  function handleThumbnailClick(index: number) {
    setActiveIndex(index);
    setIsZoomed(false);
    setZoomOrigin("50% 50%");
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {/* Vertical thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-col sm:overflow-visible sm:pb-0">
          {safeImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleThumbnailClick(i)}
              className="relative h-14 w-14 flex-shrink-0 overflow-hidden transition sm:h-16 sm:w-16"
              style={{
                border: `1px solid ${i === safeActiveIndex ? "#1a1a1a" : "transparent"}`,
                outline: i === safeActiveIndex ? "none" : undefined,
              }}
              aria-label={`Kép ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? productName}
                fill
                className="object-cover"
                sizes="64px"
                onError={() => {
                  setBrokenImageUrls((current) => new Set(current).add(img.url));
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <button
        type="button"
        aria-label={
          isZoomed
            ? `${productName} kép kicsinyítése`
            : `${productName} kép nagyítása`
        }
        aria-pressed={isZoomed}
        disabled={!activeImage}
        onPointerEnter={updateZoomOrigin}
        onPointerMove={updateZoomOrigin}
        onPointerLeave={() => setIsZoomed(false)}
        onClick={() => setIsZoomed((zoomed) => !zoomed)}
        className={`group relative aspect-[4/3] w-full flex-1 overflow-hidden bg-[#f5f3f0] p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] sm:aspect-[4/5] ${
          activeImage ? (isZoomed ? "cursor-zoom-out" : "cursor-zoom-in") : ""
        }`}
      >
        {activeImage ? (
          <Image
            src={activeImage.url}
            alt={activeImage.alt ?? productName}
            fill
            className={`object-cover transition-transform duration-300 ease-out ${
              soldOut ? "saturate-[0.6] brightness-[0.9]" : ""
            } ${isZoomed ? "scale-[1.65]" : "md:group-hover:scale-[1.45]"}`}
            style={{ transformOrigin: zoomOrigin }}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            onError={() => {
              setBrokenImageUrls((current) => new Set(current).add(activeImage.url));
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="px-6 text-center">
              <div
                className="mx-auto h-32 w-32 rounded-full"
                style={{ background: "linear-gradient(135deg, #f5e6ef, #e8d5e4)" }}
              />
              <p className="mt-4 font-[family:var(--font-display)] text-xl text-[#6b5c64]/70">
                {productName}
              </p>
            </div>
          </div>
        )}
        {soldOut && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="bg-white/90 px-4 py-1.5 text-[11px] uppercase tracking-[.2em] text-[#555]">
              Elfogyott
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
