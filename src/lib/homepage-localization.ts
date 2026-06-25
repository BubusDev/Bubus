import type {
  HomepageBlockView,
  HomepageContentView,
  HomepageMaterialPickView,
  HomepagePromoTileView,
} from "@/lib/homepage-content";
import { validateSupportedLanguage, type SupportedLanguage } from "@/lib/international";
import { getLocalizedPath } from "@/lib/locale-routing";

function localizedText(huValue: string, enValue: string | null | undefined, language: SupportedLanguage) {
  if (language !== "en") return huValue;
  const trimmed = typeof enValue === "string" ? enValue.trim() : "";
  return trimmed || huValue;
}

function localizedMetadataValue(metadata: Record<string, unknown>, key: string, language: SupportedLanguage) {
  const value = metadata[key];
  if (language !== "en") return value;
  const enValue = metadata[`${key}En`];

  if (typeof value === "string") {
    return typeof enValue === "string" && enValue.trim() ? enValue.trim() : value;
  }

  if (Array.isArray(value)) {
    const enList = Array.isArray(enValue) ? enValue : null;
    return value.map((item, index) => {
      if (typeof item === "string") {
        const translated = enList?.[index];
        return typeof translated === "string" && translated.trim() ? translated.trim() : item;
      }

      if (!item || typeof item !== "object") return item;
      const objectItem = item as Record<string, unknown>;
      return Object.fromEntries(
        Object.entries(objectItem)
          .filter(([field]) => !field.endsWith("En"))
          .map(([field, fieldValue]) => {
            if (typeof fieldValue !== "string") return [field, fieldValue];
            const translated = objectItem[`${field}En`];
            return [field, typeof translated === "string" && translated.trim() ? translated.trim() : fieldValue];
          }),
      );
    });
  }

  return value;
}

function localizeHomepageMetadata(metadata: Record<string, unknown>, language: SupportedLanguage) {
  if (language !== "en") return metadata;

  return Object.fromEntries(
    Object.keys(metadata)
      .filter((key) => !key.endsWith("En"))
      .map((key) => {
        const value = localizedMetadataValue(metadata, key, language);
        if (typeof value === "string" && (key === "href" || key.endsWith("Href")) && value.startsWith("/")) {
          return [key, getLocalizedPath(value, language)];
        }
        return [key, value];
      }),
  );
}

function localizeHomepageBlock(block: HomepageBlockView, language: SupportedLanguage): HomepageBlockView {
  if (language !== "en") return block;

  return {
    ...block,
    title: localizedText(block.title, block.titleEn, language),
    eyebrow: localizedText(block.eyebrow, block.eyebrowEn, language),
    body: localizedText(block.body, block.bodyEn, language),
    imageAlt: localizedText(block.imageAlt, block.imageAltEn, language),
    buttonText: localizedText(block.buttonText, block.buttonTextEn, language),
    metadata: localizeHomepageMetadata(block.metadata, language),
  };
}

function localizeHomepagePromoTile(tile: HomepagePromoTileView, language: SupportedLanguage): HomepagePromoTileView {
  if (language !== "en") return tile;

  return {
    ...tile,
    title: localizedText(tile.title, tile.titleEn, language),
    subtitle: localizedText(tile.subtitle, tile.subtitleEn, language),
    imageAlt: localizedText(tile.imageAlt, tile.imageAltEn, language),
    href: tile.href.startsWith("/") ? getLocalizedPath(tile.href, language) : tile.href,
  };
}

function localizeHomepageMaterialPick(pick: HomepageMaterialPickView, language: SupportedLanguage): HomepageMaterialPickView {
  if (language !== "en") return pick;

  return {
    ...pick,
    title: localizedText(pick.title, pick.titleEn, language),
    subtitle: localizedText(pick.subtitle, pick.subtitleEn, language),
    imageAlt: localizedText(pick.imageAlt, pick.imageAltEn, language),
    href: pick.href.startsWith("/") ? getLocalizedPath(pick.href, language) : pick.href,
  };
}

export function getLocalizedHomepageContent(content: HomepageContentView, language: unknown): HomepageContentView {
  const normalizedLanguage = validateSupportedLanguage(language);
  if (normalizedLanguage !== "en") return content;

  return {
    ...content,
    hero: localizeHomepageBlock(content.hero, normalizedLanguage),
    heroFeatureBar: localizeHomepageBlock(content.heroFeatureBar, normalizedLanguage),
    categoryGrid: localizeHomepageBlock(content.categoryGrid, normalizedLanguage),
    featuredSlider: localizeHomepageBlock(content.featuredSlider, normalizedLanguage),
    instagram: localizeHomepageBlock(content.instagram, normalizedLanguage),
    newsletter: localizeHomepageBlock(content.newsletter, normalizedLanguage),
    promoTiles: content.promoTiles.map((tile) => localizeHomepagePromoTile(tile, normalizedLanguage)),
    materialPicks: content.materialPicks.map((pick) => localizeHomepageMaterialPick(pick, normalizedLanguage)),
  };
}
