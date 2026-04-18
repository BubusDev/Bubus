"use client";

import { normalizeFocalPoint, type ImageFocalPoint } from "@/lib/image-crop";

const focalPresets = [
  { label: "Bal felső", x: 15, y: 15 },
  { label: "Fent", x: 50, y: 15 },
  { label: "Jobb felső", x: 85, y: 15 },
  { label: "Bal", x: 15, y: 50 },
  { label: "Közép", x: 50, y: 50 },
  { label: "Jobb", x: 85, y: 50 },
  { label: "Bal alsó", x: 15, y: 85 },
  { label: "Lent", x: 50, y: 85 },
  { label: "Jobb alsó", x: 85, y: 85 },
];

type AdminImageFocalPointPickerProps = {
  disabled?: boolean;
  label?: string;
  onChange: (value: ImageFocalPoint) => void;
  value: Partial<ImageFocalPoint>;
};

export function AdminImageFocalPointPicker({
  disabled = false,
  label = "Fókuszpont",
  onChange,
  value,
}: AdminImageFocalPointPickerProps) {
  const focalPoint = normalizeFocalPoint(value);

  return (
    <div className="rounded-sm border border-[var(--admin-line-100)] bg-white px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-ink-500)]">
          {label}
        </p>
        <p className="text-[10px] text-[var(--admin-ink-500)]">
          {Math.round(focalPoint.x)}% / {Math.round(focalPoint.y)}%
        </p>
      </div>
      <div className="mt-2 grid w-24 grid-cols-3 gap-1">
        {focalPresets.map((preset) => {
          const isActive =
            Math.abs(focalPoint.x - preset.x) < 1 &&
            Math.abs(focalPoint.y - preset.y) < 1;

          return (
            <button
              key={preset.label}
              type="button"
              disabled={disabled}
              aria-label={preset.label}
              title={preset.label}
              onClick={() => onChange({ x: preset.x, y: preset.y })}
              className={`h-7 rounded-sm border transition ${
                isActive
                  ? "border-[#295da8] bg-[#2a63b5] text-white"
                  : "border-[var(--admin-line-200)] bg-[var(--admin-surface-050)] text-[var(--admin-ink-600)] hover:border-[#8aa8d4] hover:bg-white"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span className="mx-auto block h-1.5 w-1.5 rounded-full bg-current" />
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] leading-4 text-[var(--admin-ink-500)]">
        A kép automatikusan kitölti a cél arányt; ez csak azt mondja meg, melyik rész maradjon fókuszban.
      </p>
    </div>
  );
}
