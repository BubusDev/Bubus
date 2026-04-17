"use client";

import { useMemo, useState, type PointerEvent } from "react";
import Image from "next/image";

import { getBrowserDisplayImageUrl } from "@/lib/image-safety";

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
      images
        .map((image) => ({ ...image, displayUrl: getBrowserDisplayImageUrl(image.url) }))
        .filter(
          (image): image is typeof image & { displayUrl: string } => {
            const displayUrl = image.displayUrl;
            return displayUrl !== null && !brokenImageUrls.has(displayUrl);
          },
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
                src={img.displayUrl}
                alt={img.alt ?? productName}
                fill
                className="object-cover"
                sizes="64px"
                onError={() => {
                  setBrokenImageUrls((current) => new Set(current).add(img.displayUrl));
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
            src={activeImage.displayUrl}
            alt={activeImage.alt ?? productName}
            fill
            className={`object-cover transition-transform duration-300 ease-out ${
              soldOut ? "saturate-[0.6] brightness-[0.9]" : ""
            } ${isZoomed ? "scale-[1.65]" : "md:group-hover:scale-[1.45]"}`}
            style={{ transformOrigin: zoomOrigin }}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            onError={() => {
              setBrokenImageUrls((current) => new Set(current).add(activeImage.displayUrl));
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
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-start bg-gradient-to-t from-white/55 via-white/18 to-transparent p-3 sm:p-4">
            <span className="rounded-md border border-white/70 bg-white/72 px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] text-[#6f666b] shadow-[0_8px_18px_rgba(82,73,79,0.08)] backdrop-blur-sm sm:text-[11px]">
              Elfogyott
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
