"use client";

import { useState, type PointerEvent } from "react";
import Image from "next/image";

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
  const activeImage = images[activeIndex];

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
    <div className="flex gap-3">
      {/* Vertical thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleThumbnailClick(i)}
              className="relative h-16 w-16 flex-shrink-0 overflow-hidden transition"
              style={{
                border: `1px solid ${i === activeIndex ? "#1a1a1a" : "transparent"}`,
                outline: i === activeIndex ? "none" : undefined,
              }}
              aria-label={`Kép ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? productName}
                fill
                className="object-cover"
                sizes="64px"
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
        className={`group relative flex-1 overflow-hidden bg-[#f5f3f0] p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] ${
          activeImage ? (isZoomed ? "cursor-zoom-out" : "cursor-zoom-in") : ""
        }`}
        style={{ aspectRatio: "4/5" }}
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
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div
              className="h-32 w-32 rounded-full"
              style={{ background: "linear-gradient(135deg, #f5e6ef, #e8d5e4)" }}
            />
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
