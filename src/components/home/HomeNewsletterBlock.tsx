import { subscribeNewsletterAction } from "@/app/(storefront)/newsletter/actions";
import type { HomepageBlockView } from "@/lib/homepage-content";

type HomeNewsletterBlockProps = {
  contentBlock?: HomepageBlockView;
  status?: string;
};

function readPerks(contentBlock?: HomepageBlockView) {
  if (!Array.isArray(contentBlock?.metadata.perks)) {
    return ["Új kollekciók előre", "Limitált darabok", "Különleges ajánlatok"];
  }

  const perks = contentBlock.metadata.perks.filter(
    (perk): perk is string => typeof perk === "string" && perk.trim().length > 0,
  );

  return perks.length > 0 ? perks : ["Új kollekciók előre", "Limitált darabok", "Különleges ajánlatok"];
}

export function HomeNewsletterBlock({ contentBlock, status }: HomeNewsletterBlockProps) {
  const statusMessage =
    status === "subscribed"
      ? typeof contentBlock?.metadata.subscribedMessage === "string"
        ? contentBlock.metadata.subscribedMessage
        : "Köszönjük, a feliratkozásod rögzítettük."
      : status === "invalid"
        ? typeof contentBlock?.metadata.invalidMessage === "string"
          ? contentBlock.metadata.invalidMessage
          : "Adj meg egy érvényes email címet a feliratkozáshoz."
        : "";

  return (
    <section
      id="newsletter"
      className="relative overflow-hidden bg-[#FDF6F3] px-6 py-[72px] sm:px-12"
    >
      <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#FDF0F6]" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-[#F7DED8]" />
      <div className="relative mx-auto max-w-[840px] text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#9C6B63]">
          {contentBlock?.eyebrow || "Hírlevél"}
        </p>
        <h2 className="mx-auto mt-4 max-w-[11ch] font-[family:var(--font-display)] text-[3rem] leading-[0.96] text-[#2D1A16] sm:text-[4.4rem]">
          {contentBlock?.title || "Elsőként a limitált darabokról."}
        </h2>
        <p className="mx-auto mt-6 max-w-[68ch] text-sm leading-8 text-[#9C6B63]">
          {contentBlock?.body ||
            "Elsőként értesítünk az új kollekciókról, friss színekről és különleges ajánlatokról. Rövid leveleket küldünk, csak akkor, amikor valóban van mit megmutatni."}
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          {readPerks(contentBlock).map((perk) => (
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
            placeholder={typeof contentBlock?.metadata.placeholder === "string" ? contentBlock.metadata.placeholder : "Email címed"}
            className="min-h-12 flex-1 border border-[#E8C9C0] bg-white px-4 text-sm text-[#2D1A16] outline-none transition placeholder:text-[#9C6B63]/72 focus:border-[#E0157A] focus:ring-2 focus:ring-[#E0157A]/10"
          />
          <button
            type="submit"
            className="min-h-12 bg-[#E0157A] px-6 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition hover:bg-[#C0006A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0157A] focus-visible:ring-offset-2"
          >
            {contentBlock?.buttonText || "Feliratkozom"}
          </button>
        </form>
        {statusMessage ? (
          <p className="mt-4 text-sm leading-6 text-[#9C6B63]">{statusMessage}</p>
        ) : null}
        <p className="mt-4 text-xs leading-6 text-[#9C6B63]">
          {typeof contentBlock?.metadata.note === "string"
            ? contentBlock.metadata.note
            : "Nincs spam. Bármikor leiratkozhatsz."}
        </p>
      </div>
    </section>
  );
}
