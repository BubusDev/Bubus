import { ImageResponse } from "next/og";

import { getProductBySlug } from "@/lib/products-server";
import { getAbsoluteUrl, siteName } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const basePalette = {
  paper: "#f7f2ee",
  ink: "#2f2327",
  muted: "rgba(47, 35, 39, 0.62)",
  subtle: "rgba(47, 35, 39, 0.38)",
  line: "rgba(47, 35, 39, 0.10)",
};

function truncate(value: string | undefined, maxLength: number) {
  if (!value) return "";

  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  return `${normalized.slice(0, maxLength - 1).trimEnd()}...`;
}

function safePalette(input?: string[]) {
  const fallback = ["#f1e6df", "#e9d8cd", "#e4cabb"];

  if (!input || input.length < 3) {
    return fallback as [string, string, string];
  }

  return [
    input[0] || fallback[0],
    input[1] || fallback[1],
    input[2] || fallback[2],
  ] as [string, string, string];
}

function cleanText(value?: string) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function getSecondaryLine(product: {
  shortDescription?: string;
  description?: string;
}) {
  const source = cleanText(product.shortDescription || product.description);

  if (!source) {
    return "Finom ragyogás, lágy jelenlét.";
  }

  return truncate(source, 72);
}

function getCategoryLine(category?: string) {
  switch (category) {
    case "earrings":
      return "Fülbevaló";
    case "necklaces":
      return "Nyaklánc";
    case "bracelets":
      return "Karkötő";
    case "rings":
      return "Gyűrű";
    case "special-edition":
      return "Limitált darab";
    case "new-in":
      return "Újdonság";
    case "sale":
      return "Akció";
    default:
      return "Ékszer";
  }
}

function getFallbackCopy() {
  return {
    title: siteName,
    secondary: "Finom ragyogás, lágy jelenlét.",
    category: "Ékszer",
  };
}

function getProductCopy(product: {
  name: string;
  category?: string;
  shortDescription?: string;
  description?: string;
}) {
  return {
    title: truncate(product.name, 34),
    secondary: getSecondaryLine(product),
    category: getCategoryLine(product.category),
  };
}

function Layout({
  title,
  secondary,
  category,
  imageUrl,
  tones,
}: {
  title: string;
  secondary: string;
  category: string;
  imageUrl: string | null;
  tones: [string, string, string];
}) {
  const [tone1, tone2, tone3] = tones;

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${basePalette.paper} 0%, #fbf7f4 46%, ${tone1} 100%)`,
        color: basePalette.ink,
        fontFamily: '"Times New Roman", Georgia, serif',
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.18) 42%, rgba(255,255,255,0) 100%)",
        }}
      />

      <div
        style={{
          display: "flex",
          position: "absolute",
          left: 74,
          top: 68,
          width: 510,
          height: 494,
          borderRadius: 32,
          background: `linear-gradient(160deg, rgba(255,255,255,0.72) 0%, ${tone2} 100%)`,
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.26)",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            inset: 22,
            borderRadius: 24,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0) 100%)",
          }}
        />

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: 430,
              height: 430,
              objectFit: "contain",
              objectPosition: "center center",
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              width: 300,
              height: 300,
              borderRadius: 9999,
              background: `radial-gradient(circle, ${tone3} 0%, ${tone2} 68%, transparent 100%)`,
              alignItems: "center",
              justifyContent: "center",
              color: basePalette.subtle,
              fontSize: 28,
              letterSpacing: 1.6,
            }}
          >
            {siteName}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          position: "absolute",
          right: 82,
          top: 76,
          width: 442,
          height: 478,
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: 4.8,
              color: basePalette.subtle,
              marginBottom: 26,
            }}
          >
            {siteName}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 82,
              lineHeight: 0.92,
              letterSpacing: "-0.06em",
              fontWeight: 600,
              maxWidth: "100%",
              marginBottom: 22,
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: "flex",
              width: 120,
              height: 1,
              background: basePalette.line,
              marginBottom: 22,
            }}
          />

          <div
            style={{
              display: "flex",
              fontSize: 24,
              lineHeight: 1.35,
              color: basePalette.muted,
              maxWidth: 360,
            }}
          >
            {secondary}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 16,
              textTransform: "uppercase",
              letterSpacing: 3.2,
              color: basePalette.subtle,
              marginBottom: 8,
            }}
          >
            {category}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: basePalette.muted,
            }}
          >
            Különleges ékszerek a mindennapokra
          </div>
        </div>
      </div>
    </div>
  );
}

function FallbackImage() {
  const copy = getFallbackCopy();

  return (
    <Layout
      title={copy.title}
      secondary={copy.secondary}
      category={copy.category}
      imageUrl={null}
      tones={safePalette()}
    />
  );
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return new ImageResponse(<FallbackImage />, { ...size });
  }

  const copy = getProductCopy(product);
  const imageUrl = product.imageUrl ? getAbsoluteUrl(product.imageUrl) : null;
  const tones = safePalette(product.imagePalette);

  return new ImageResponse(
    <Layout
      title={copy.title}
      secondary={copy.secondary}
      category={copy.category}
      imageUrl={imageUrl}
      tones={tones}
    />,
    { ...size },
  );
}
