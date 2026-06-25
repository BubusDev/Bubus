import dotenv from "dotenv";

import { HomepageContentBlockKey, PrismaClient, type Prisma } from "@prisma/client";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

const prisma = new PrismaClient();

const translations = new Map<string, string>([
  ["Ne félj extra lenni! Viseld bátran a kiegészítőket!", "Don’t be afraid to stand out. Wear your details boldly."],
  [
    "Féldrágakő karkötők és nyakláncok kis szériában - outfitedhez, hangulatodhoz, évszakodhoz.",
    "Small-batch gemstone bracelets and necklaces for your outfit, mood and season.",
  ],
  [
    "Féldrágakő karkötők és nyakláncok kis szériában – outfitedhez, hangulatodhoz, évszakodhoz.",
    "Small-batch gemstone bracelets and necklaces for your outfit, mood and season.",
  ],
  ["Fedezd fel a válogatást", "Explore the selection"],
  ["Limitált butik válogatás", "Limited boutique edit"],
  ["Limitált Chicks Jewelry kampányékszer", "Limited Chicks Jewelry campaign jewelry"],
  ["Limitált darabok", "Limited pieces"],
  ["Kis széria", "Small batches"],
  [
    "Új darabok korlátozott mennyiségben, átgondolt ritmusban.",
    "New pieces in limited quantities, released with intention.",
  ],
  ["Válogatott anyagok", "Selected materials"],
  ["Kövek és tónusok, amelyek közelről is szépek.", "Stones and tones that look beautiful up close."],
  ["Finom részletek", "Delicate details"],
  ["Nem harsány kiegészítők, mégis emlékezetes karakterrel.", "Quiet pieces with a memorable character."],
  ["Kategóriák", "Categories"],
  ["Vonalak, amik együtt is működnek.", "Lines that work beautifully together."],
  [
    "Finom tónusok, rétegezhető formák és alkalmi darabok egy képi válogatásban.",
    "Soft tones, layerable shapes and occasion pieces in one visual edit.",
  ],
  ["Kurált fókusz", "Curated focus"],
  ["Kő szerint válogatva.", "Shop by stone."],
  [
    "Anyag, árnyalat és hangulat alapján szerkesztett darabok, hogy a választás személyesebb legyen egy egyszerű kategórialistánál.",
    "An edit by material, shade and mood, so choosing feels more personal than browsing a category list.",
  ],
  ["Új", "New"],
  ["Szerkesztett darabok.", "Edited pieces."],
  ["Fókuszban", "In focus"],
  [
    "Újdonságok, ajándéknak választott kedvencek és limitált darabok egy letisztult válogatásban.",
    "New arrivals, giftable favourites and limited pieces in a refined edit.",
  ],
  ["Kulisszák, új kövek és viselési ötletek azoknak, akik szeretik közelről látni a részleteket.", "Behind the scenes, new stones and styling ideas for those who love the details up close."],
  ["Zöld tónusú Instagram kampánykép", "Green-toned Instagram campaign image"],
  ["Kövess Instagramon", "Follow on Instagram"],
  ["Instagram", "Instagram"],
  ["Facebook", "Facebook"],
  ["Csapatunk", "Team"],
  ["Akik", "Made by"],
  ["készítik.", "our team."],
  ["Legyen részed a közösségben - újdonságok, visszajelzések és kulisszák egy helyen.", "Join the community for new pieces, feedback and behind-the-scenes notes."],
  ["Kövess Facebookon", "Follow on Facebook"],
  ["Alapító · Tervező", "Founder · Designer"],
  ["Kézműves", "Maker"],
  ["Ügyfélszolgálat", "Customer care"],
  ["Csapatag", "Team member"],
  ["Bubus", "Bubus"],
  ["Elsőként a limitált darabokról.", "Be first to see limited pieces."],
  ["Hírlevél", "Newsletter"],
  [
    "Elsőként értesítünk az új kollekciókról, friss színekről és különleges ajánlatokról. Rövid leveleket küldünk, csak akkor, amikor valóban van mit megmutatni.",
    "Get early notes on new collections, fresh colors and special offers. We send short emails only when there is something worth showing.",
  ],
  ["Feliratkozom", "Subscribe"],
  ["Új kollekciók előre", "Early new collections"],
  ["Különleges ajánlatok", "Special offers"],
  ["Email címed", "Your email"],
  ["Nincs spam. Bármikor leiratkozhatsz.", "No spam. Unsubscribe anytime."],
  ["Köszönjük, a feliratkozásod rögzítettük.", "Thank you, your subscription has been saved."],
  ["Adj meg egy érvényes email címet a feliratkozáshoz.", "Enter a valid email address to subscribe."],
  ["Limitált vonalak", "Limited lines"],
  ["Új darabok kis szériában", "New pieces in small batches"],
  ["Limitált Chicks Jewelry válogatás", "Limited Chicks Jewelry edit"],
  ["Rétegezhető darabok", "Layerable pieces"],
  ["Karkötők mindennapi viseléshez", "Bracelets for everyday wear"],
  ["Rétegezhető Chicks Jewelry karkötő", "Layerable Chicks Jewelry bracelet"],
  ["Újdonságok", "New arrivals"],
  ["Friss színek és finom részletek", "Fresh colors and delicate details"],
  ["Új Chicks Jewelry karkötő kék márvány tónusban", "New Chicks Jewelry bracelet in blue marble tones"],
  ["Kövek szerint", "Shop by stone"],
  ["Válogatás anyag és árnyalat alapján", "An edit by material and shade"],
  ["Chicks Jewelry anyagválogatás részletfotó", "Chicks Jewelry material edit detail"],
  ["Kedvezményes darabok", "Sale pieces"],
  ["Elérhető modellek limitált készletről", "Available styles in limited stock"],
  ["Chicks Jewelry kedvezményes karkötő válogatás", "Chicks Jewelry sale bracelet edit"],
  ["Limitált darabok, váratlan részletekkel", "Limited pieces with unexpected details"],
  ["Különleges válogatás", "Special edit"],
  ["Féldrágakövekből, kézzel készített ékszerek szerkesztett kampánya.", "An edited campaign of handmade gemstone jewelry."],
  ["Látogass meg minket és fedezd fel ötleteinket az Instagramon!", "Visit us on Instagram for styling ideas and new details."],
  ["Irány az Instagram!", "Go to Instagram"],
  ["Elegancia", "Elegance"],
  ["Ezüst ékszereink", "Silver pieces"],
  ["Ezüst ékszreink", "Silver pieces"],
  ["Merj különleges lenni!", "Dare to be special"],
  ["Tavaszi kollekciónk", "Spring collection"],
  ["Hímzett ékszertartóink!", "Embroidered jewelry cases"],
  ["Blúz, Blézer, irodai viselethez!", "For blouses, blazers and polished workwear."],
  ["Ezüst csillogással", "With a silver glow."],
  ["Bővítsd ki azt, amit gondoltál ékszerekről!", "Expand what jewelry can mean to you."],
  ["Laza és gyengéd!", "Soft, effortless and light."],
  ["Mindig hozunk valami újat!", "There is always something new to discover."],
  ["foto1", "Elegant Chicks Jewelry styling detail"],
  ["Képernyőfotó 2026 04 13   14.34.02", "Silver Chicks Jewelry detail"],
  ["Képernyőfotó 2026 04 13   14.45.48", "Statement Chicks Jewelry styling"],
  ["Képernyőfotó 2026 04 13   14.45.02", "Spring Chicks Jewelry edit"],
  ["Képernyőfotó 2026 04 13   14.45.34", "Embroidered jewelry case detail"],
  ["Képernyőfotó 2026 04 13   14.16.33", "Chicks Jewelry campaign detail"],
  ["Képernyőfotó 2026 04 13   14.34.58", "Chicks Jewelry social campaign detail"],
  ["@chicksjewelry", "@chicksjewelry"],
  ["Hero feature bar", "Hero feature bar"],
]);

type ChangeLog = {
  target: string;
  from: string;
  to: string;
};

const changes: ChangeLog[] = [];
const skipped = new Set<string>();

function isBlank(value: unknown) {
  return typeof value !== "string" || value.trim().length === 0;
}

function translateText(value: unknown, target: string) {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const translated = translations.get(value.trim());
  if (!translated) {
    skipped.add(`${target}: ${value.trim()}`);
    return null;
  }
  return translated;
}

function fillScalar(data: Record<string, unknown>, sourceKey: string, targetKey: string, target: string) {
  if (!isBlank(data[targetKey])) return false;
  const translated = translateText(data[sourceKey], `${target}.${targetKey}`);
  if (!translated) return false;

  data[targetKey] = translated;
  changes.push({ target: `${target}.${targetKey}`, from: String(data[sourceKey]), to: translated });
  return true;
}

function readMetadata(metadata: Prisma.JsonValue | null): Record<string, unknown> {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? { ...(metadata as Record<string, unknown>) }
    : {};
}

function fillMetadata(metadata: Record<string, unknown>, owner: string) {
  let changed = false;

  for (const [key, value] of Object.entries(metadata)) {
    if (key.endsWith("En")) continue;
    if (key === "href" || key.endsWith("Href")) continue;
    const enKey = `${key}En`;

    if (typeof value === "string" && isBlank(metadata[enKey])) {
      const translated = translateText(value, `${owner}.metadata.${enKey}`);
      if (translated) {
        metadata[enKey] = translated;
        changes.push({ target: `${owner}.metadata.${enKey}`, from: value, to: translated });
        changed = true;
      }
    }

    if (Array.isArray(value)) {
      let objectListChanged = false;
      const nextList = value.map((item, index) => {
        if (typeof item === "string") return item;
        if (!item || typeof item !== "object" || Array.isArray(item)) return item;

        const nextItem = { ...(item as Record<string, unknown>) };
        for (const [field, fieldValue] of Object.entries(nextItem)) {
          if (field.endsWith("En") || typeof fieldValue !== "string" || !isBlank(nextItem[`${field}En`])) continue;
          const translated = translateText(fieldValue, `${owner}.metadata.${key}[${index}].${field}En`);
          if (translated) {
            nextItem[`${field}En`] = translated;
            changes.push({
              target: `${owner}.metadata.${key}[${index}].${field}En`,
              from: fieldValue,
              to: translated,
            });
            objectListChanged = true;
            changed = true;
          }
        }
        return nextItem;
      });

      const enList = Array.isArray(metadata[enKey]) ? [...(metadata[enKey] as unknown[])] : [];
      let listChanged = false;
      value.forEach((item, index) => {
        if (typeof item !== "string" || !isBlank(enList[index])) return;
        const translated = translateText(item, `${owner}.metadata.${enKey}[${index}]`);
        if (translated) {
          enList[index] = translated;
          changes.push({ target: `${owner}.metadata.${enKey}[${index}]`, from: item, to: translated });
          listChanged = true;
        }
      });

      if (listChanged) {
        metadata[enKey] = enList;
        changed = true;
      }

      if (objectListChanged) {
        metadata[key] = nextList;
        changed = true;
      }
    }
  }

  return changed;
}

async function backfillBlocks() {
  const blocks = await prisma.homepageContentBlock.findMany({ orderBy: { key: "asc" } });
  let updatedBlocks = 0;

  for (const block of blocks) {
    const data: Record<string, unknown> = {
      title: block.title,
      titleEn: block.titleEn,
      eyebrow: block.eyebrow,
      eyebrowEn: block.eyebrowEn,
      body: block.body,
      bodyEn: block.bodyEn,
      imageAlt: block.imageAlt,
      imageAltEn: block.imageAltEn,
      buttonText: block.buttonText,
      buttonTextEn: block.buttonTextEn,
    };
    const target = `HomepageContentBlock.${block.key}`;
    let changed = false;

    changed = fillScalar(data, "title", "titleEn", target) || changed;
    changed = fillScalar(data, "eyebrow", "eyebrowEn", target) || changed;
    changed = fillScalar(data, "body", "bodyEn", target) || changed;
    changed = fillScalar(data, "imageAlt", "imageAltEn", target) || changed;
    changed = fillScalar(data, "buttonText", "buttonTextEn", target) || changed;

    const metadata = readMetadata(block.metadata);
    const metadataChanged = fillMetadata(metadata, target);

    if (!changed && !metadataChanged) continue;

    await prisma.homepageContentBlock.update({
      where: { key: block.key },
      data: {
        titleEn: data.titleEn as string | null,
        eyebrowEn: data.eyebrowEn as string | null,
        bodyEn: data.bodyEn as string | null,
        imageAltEn: data.imageAltEn as string | null,
        buttonTextEn: data.buttonTextEn as string | null,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });
    updatedBlocks += 1;
  }

  return updatedBlocks;
}

async function backfillPromoTiles() {
  const tiles = await prisma.homepagePromoTile.findMany({ orderBy: { slotIndex: "asc" } });
  let updatedTiles = 0;

  for (const tile of tiles) {
    const data: Record<string, unknown> = {
      title: tile.title,
      titleEn: tile.titleEn,
      subtitle: tile.subtitle,
      subtitleEn: tile.subtitleEn,
      imageAlt: tile.imageAlt,
      imageAltEn: tile.imageAltEn,
    };
    const target = `HomepagePromoTile.${tile.slotIndex}`;
    let changed = false;

    changed = fillScalar(data, "title", "titleEn", target) || changed;
    changed = fillScalar(data, "subtitle", "subtitleEn", target) || changed;
    changed = fillScalar(data, "imageAlt", "imageAltEn", target) || changed;

    if (!changed) continue;

    await prisma.homepagePromoTile.update({
      where: { slotIndex: tile.slotIndex },
      data: {
        titleEn: data.titleEn as string | null,
        subtitleEn: data.subtitleEn as string | null,
        imageAltEn: data.imageAltEn as string | null,
      },
    });
    updatedTiles += 1;
  }

  return updatedTiles;
}

async function main() {
  console.info("[homepage-en-backfill] Starting homepage English content backfill.");
  console.info(`[homepage-en-backfill] Known homepage block keys: ${Object.values(HomepageContentBlockKey).join(", ")}`);

  const [updatedBlocks, updatedTiles] = await Promise.all([backfillBlocks(), backfillPromoTiles()]);

  for (const change of changes) {
    console.info(`[filled] ${change.target}: "${change.from}" -> "${change.to}"`);
  }

  if (skipped.size > 0) {
    console.info("[homepage-en-backfill] Skipped untranslated Hungarian source values:");
    for (const item of skipped) console.info(`  - ${item}`);
  }

  console.info(
    `[homepage-en-backfill] Done. Updated ${changes.length} EN fields across ${updatedBlocks} HomepageContentBlock rows and ${updatedTiles} HomepagePromoTile rows.`,
  );
  console.info("[homepage-en-backfill] Existing non-empty EN fields were left unchanged.");
}

main()
  .catch((error) => {
    console.error("[homepage-en-backfill] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
