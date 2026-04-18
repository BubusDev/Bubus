"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { X } from "lucide-react";

import type { ImageCropMetadata } from "@/lib/image-crop";

type AdminImageCropModalProps = {
  aspectRatio: number;
  guidance: string;
  imageUrl: string;
  initialCrop?: ImageCropMetadata;
  isProcessing?: boolean;
  onCancel: () => void;
  onConfirm: (crop: ImageCropMetadata, croppedAreaPixels: Area) => void;
  onConfirmArea?: (crop: ImageCropMetadata, croppedAreaPercentages: Area, croppedAreaPixels: Area) => void;
  title: string;
};

export function AdminImageCropModal({
  aspectRatio,
  guidance,
  imageUrl,
  initialCrop,
  isProcessing = false,
  onCancel,
  onConfirm,
  onConfirmArea,
  title,
}: AdminImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: initialCrop?.x ?? 0, y: initialCrop?.y ?? 0 });
  const [zoom, setZoom] = useState(initialCrop?.zoom ?? 1);
  const [croppedAreaPercentages, setCroppedAreaPercentages] = useState<Area | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleCropComplete = useCallback((area: Area, areaPixels: Area) => {
    setCroppedAreaPercentages(area);
    setCroppedAreaPixels(areaPixels);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(15,23,42,0.58)] px-4 py-6">
      <div className="grid max-h-[calc(100vh-3rem)] w-full max-w-3xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-md border border-[var(--admin-line-100)] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--admin-line-100)] px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--admin-ink-900)]">{title}</h2>
            <p className="mt-1 max-w-[62ch] text-xs leading-5 text-[var(--admin-ink-600)]">
              {guidance}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="admin-button-secondary h-9 w-9 shrink-0"
            aria-label="Vágás megszakítása"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-[360px] overflow-hidden bg-[#111827] p-4">
          <div className="relative h-full min-h-[330px] overflow-hidden rounded-sm bg-[#0f172a]">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              minZoom={1}
              maxZoom={4}
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[64%] w-[64%] -translate-x-1/2 -translate-y-1/2 border border-white/35"
            />
          </div>
        </div>

        <div className="border-t border-[var(--admin-line-100)] px-4 py-3">
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-[var(--admin-ink-700)]">
              Nagyítás
            </span>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              disabled={isProcessing}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full accent-[#2a63b5]"
            />
          </label>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="admin-button-secondary min-h-10 px-4 text-sm"
            >
              Mégsem
            </button>
            <button
              type="button"
              disabled={isProcessing || !croppedAreaPixels}
              onClick={() => {
                if (!croppedAreaPixels || !croppedAreaPercentages) return;
                const nextCrop = { x: crop.x, y: crop.y, zoom, aspectRatio };
                if (onConfirmArea) {
                  onConfirmArea(nextCrop, croppedAreaPercentages, croppedAreaPixels);
                  return;
                }
                onConfirm(nextCrop, croppedAreaPixels);
              }}
              className="admin-button-primary min-h-10 px-4 text-sm"
            >
              {isProcessing ? "Feldolgozás..." : "Vágás mentése"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
