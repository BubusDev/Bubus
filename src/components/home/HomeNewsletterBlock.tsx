import { subscribeNewsletterAction } from "@/app/(storefront)/newsletter/actions";

type HomeNewsletterBlockProps = {
  status?: string;
};

export function HomeNewsletterBlock({ status }: HomeNewsletterBlockProps) {
  const statusMessage =
    status === "subscribed"
      ? "Köszönjük, a feliratkozásod rögzítettük."
      : status === "invalid"
        ? "Adj meg egy érvényes email címet a feliratkozáshoz."
        : "";

  return (
    <section id="newsletter" className="bg-[#fbfaf7] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto grid max-w-[1320px] gap-8 border-t border-[#dedbd2] py-12 sm:py-14 lg:grid-cols-[0.85fr_1fr] lg:items-center">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#747a64]">
            Hírlevél
          </p>
          <h2 className="mt-4 max-w-[12ch] font-[family:var(--font-display)] text-[2.5rem] leading-[0.96] tracking-[-0.035em] text-[#22231f] sm:text-[3.7rem]">
            Elsőként a limitált darabokról.
          </h2>
        </div>
        <div>
          <p className="max-w-[62ch] text-sm leading-8 text-[#615f58]">
            Elsőként értesítünk az új kollekciókról, friss színekről és különleges
            ajánlatokról. Rövid leveleket küldünk, csak akkor, amikor valóban van mit
            megmutatni.
          </p>
          <form
            action={subscribeNewsletterAction}
            className="mt-8 flex max-w-[620px] flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="Email címed"
              className="min-h-12 flex-1 border border-[#d8d5cc] bg-white px-4 text-sm text-[#22231f] outline-none transition placeholder:text-[#9a958b] focus:border-[#22231f] focus:ring-2 focus:ring-[#22231f]/10"
            />
            <button
              type="submit"
              className="min-h-12 bg-[#22231f] px-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#42463c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22231f] focus-visible:ring-offset-2"
            >
              Feliratkozom
            </button>
          </form>
          {statusMessage ? (
            <p className="mt-4 text-sm leading-6 text-[#615f58]">{statusMessage}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
