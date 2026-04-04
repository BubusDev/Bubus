import type { CSSProperties, ReactNode } from "react";

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
}: ProductImageFrameProps) {
  return (
    <div
      className={className}
      style={{
        ...buildBackground(palette),
        ...style,
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className={`${imageClassName} transition duration-700 ${
            soldOut
              ? "scale-[1.015] blur-[3px] saturate-[0.5] brightness-[0.9]"
              : ""
          }`}
        />
      ) : (
        fallback
      )}

      {soldOut ? (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,244,245,0.18),rgba(233,228,231,0.58))]" />
          <div className="absolute inset-0 bg-[rgba(123,112,120,0.12)]" />
          <div className="absolute inset-0 flex items-center justify-center p-5">
            <span className="inline-flex items-center rounded-full border border-white/70 bg-[rgba(237,233,235,0.88)] px-5 py-2 text-[11px] font-medium uppercase tracking-[0.34em] text-[#5e565b] shadow-[0_14px_30px_rgba(82,73,79,0.16)] backdrop-blur-md">
              {overlayLabel}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
