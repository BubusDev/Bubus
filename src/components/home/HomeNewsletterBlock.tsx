import { subscribeNewsletterAction } from "@/app/(storefront)/newsletter/actions";
import type { HomepageBlockView } from "@/lib/homepage-content";
import type { SupportedLanguage } from "@/lib/international";

type HomeNewsletterBlockProps = {
  contentBlock?: HomepageBlockView;
  status?: string;
  language: SupportedLanguage;
};

function localizedText(huValue: string, enValue: string | null | undefined, language: SupportedLanguage) {
  if (language !== "en") return huValue;
  return enValue?.trim() || huValue;
}

function localizedMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
  language: SupportedLanguage,
  fallback: string,
) {
  const value = metadata?.[key];
  const enValue = metadata?.[`${key}En`];
  const baseValue = typeof value === "string" ? value : fallback;
  return localizedText(baseValue, typeof enValue === "string" ? enValue : null, language);
}

function readPerks(contentBlock: HomepageBlockView | undefined, language: SupportedLanguage) {
  const fallback = language === "en"
    ? ["Early new collections", "Limited pieces", "Special offers"]
    : ["Új kollekciók előre", "Limitált darabok", "Különleges ajánlatok"];
  const perksValue = language === "en" && Array.isArray(contentBlock?.metadata.perksEn)
    ? contentBlock.metadata.perksEn
    : contentBlock?.metadata.perks;

  if (!Array.isArray(perksValue)) {
    return fallback;
  }

  const perks = perksValue.filter(
    (perk): perk is string => typeof perk === "string" && perk.trim().length > 0,
  );

  return perks.length > 0 ? perks : fallback;
}

export function HomeNewsletterBlock({ contentBlock, status, language }: HomeNewsletterBlockProps) {
  const eyebrow = contentBlock ? localizedText(contentBlock.eyebrow, contentBlock.eyebrowEn, language) : "";
  const title = contentBlock ? localizedText(contentBlock.title, contentBlock.titleEn, language) : "";
  const body = contentBlock ? localizedText(contentBlock.body, contentBlock.bodyEn, language) : "";
  const buttonText = contentBlock ? localizedText(contentBlock.buttonText, contentBlock.buttonTextEn, language) : "";
  const statusMessage =
    status === "subscribed"
      ? localizedMetadataString(
          contentBlock?.metadata,
          "subscribedMessage",
          language,
          language === "en" ? "Thank you, your subscription has been saved." : "Köszönjük, a feliratkozásod rögzítettük.",
        )
      : status === "invalid"
        ? localizedMetadataString(
            contentBlock?.metadata,
            "invalidMessage",
            language,
            language === "en" ? "Enter a valid email address to subscribe." : "Adj meg egy érvényes email címet a feliratkozáshoz.",
          )
        : "";
  const placeholder = localizedMetadataString(contentBlock?.metadata, "placeholder", language, language === "en" ? "Your email" : "Email címed");
  const note = localizedMetadataString(contentBlock?.metadata, "note", language, language === "en" ? "No spam. Unsubscribe anytime." : "Nincs spam. Bármikor leiratkozhatsz.");

  return (
    <section
      id="newsletter"
      className="relative overflow-hidden bg-[#FDF6F3] px-6 py-[72px] sm:px-12"
    >
      <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#FDF0F6]" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-[#F7DED8]" />
      <div className="relative mx-auto max-w-[840px] text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#9C6B63]">
          {eyebrow || (language === "en" ? "Newsletter" : "Hírlevél")}
        </p>
        <h2 className="mx-auto mt-4 max-w-[11ch] font-[family:var(--font-display)] text-[3rem] leading-[0.96] text-[#2D1A16] sm:text-[4.4rem]">
          {title || (language === "en" ? "Be first to see limited pieces." : "Elsőként a limitált darabokról.")}
        </h2>
        <p className="mx-auto mt-6 max-w-[68ch] text-sm leading-8 text-[#9C6B63]">
          {body ||
            (language === "en"
              ? "Get early notes on new collections, fresh colors and special offers. We send short emails only when there is something worth showing."
              : "Elsőként értesítünk az új kollekciókról, friss színekről és különleges ajánlatokról. Rövid leveleket küldünk, csak akkor, amikor valóban van mit megmutatni.")}
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          {readPerks(contentBlock, language).map((perk) => (
            <span
              key={perk}
              className="border border-[#E8C9C0] bg-white/55 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#9C6B63]"
            >
              {perk}
            </span>
          ))}
        </div>

        <form
          action={subscribeNewsletterAction}
          className="mx-auto mt-9 flex max-w-[640px] flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            name="email"
            required
            placeholder={placeholder}
            className="min-h-12 flex-1 border border-[#E8C9C0] bg-white px-4 text-sm text-[#2D1A16] outline-none transition placeholder:text-[#9C6B63]/72 focus:border-[#E0157A] focus:ring-2 focus:ring-[#E0157A]/10"
          />
          <button
            type="submit"
            className="min-h-12 bg-[#E0157A] px-6 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition hover:bg-[#C0006A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0157A] focus-visible:ring-offset-2"
          >
            {buttonText || (language === "en" ? "Subscribe" : "Feliratkozom")}
          </button>
        </form>
        {statusMessage ? (
          <p className="mt-4 text-sm leading-6 text-[#9C6B63]">{statusMessage}</p>
        ) : null}
        <p className="mt-4 text-xs leading-6 text-[#9C6B63]">
          {note}
        </p>
      </div>
    </section>
  );
}
