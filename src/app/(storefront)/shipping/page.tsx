import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import { getAlternateLanguages, getLocalizedPath } from "@/lib/locale-routing";
import { getRequestLocale } from "@/lib/request-locale";

const sectionsHu = [
  { id: "orszagok", title: "Elérhető országok" },
  { id: "dijak", title: "Szállítási díjak" },
  { id: "ido", title: "Szállítási idő" },
  { id: "visszakuldes", title: "Visszaküldés" },
  { id: "kapcsolat", title: "Kapcsolat" },
];

const sectionsEn = [
  { id: "countries", title: "Supported countries" },
  { id: "fees", title: "Shipping fees" },
  { id: "estimates", title: "Delivery estimates" },
  { id: "returns", title: "Returns" },
  { id: "contact", title: "Contact" },
];

export async function generateMetadata(): Promise<Metadata> {
  const language = await getRequestLocale();
  const canonicalPath = getLocalizedPath("/shipping", language);

  return {
    title: language === "en" ? "Shipping — Chicks Jewelry" : "Szállítás — Chicks Jewelry",
    description: language === "en"
      ? "Supported countries, shipping fees, delivery estimates and returns for Chicks Jewelry orders."
      : "Elérhető országok, szállítási díjak, várható kézbesítés és visszaküldési tudnivalók a Chicks Jewelry rendeléseknél.",
    alternates: {
      canonical: canonicalPath,
      languages: getAlternateLanguages("/shipping"),
    },
    openGraph: {
      title: language === "en" ? "Shipping — Chicks Jewelry" : "Szállítás — Chicks Jewelry",
      description: language === "en"
        ? "Shipping information for Chicks Jewelry orders."
        : "Szállítási tudnivalók Chicks Jewelry rendelésekhez.",
      url: canonicalPath,
    },
  };
}

export default async function ShippingPage() {
  const language = await getRequestLocale();

  if (language === "en") {
    return (
      <LegalPage eyebrow="Customer care" title="Shipping" lastUpdated="June 25, 2026" sections={sectionsEn}>
        <h2 id="countries">Supported countries</h2>
        <p>
          Chicks Jewelry currently supports orders for Hungary and selected EU countries through the
          country selector. The checkout shows the available shipping options for the selected country.
        </p>
        <h2 id="fees">Shipping fees</h2>
        <p>
          Shipping fees are calculated and shown during checkout before payment. Free shipping may apply
          for selected campaigns or order thresholds when displayed in the cart.
        </p>
        <h2 id="estimates">Delivery estimates</h2>
        <p>
          In-stock pieces are usually prepared within a few business days. Delivery estimates depend on
          the destination country and carrier availability.
        </p>
        <h2 id="returns">Returns</h2>
        <p>
          Unworn, non-custom items can generally be returned within 14 days of delivery if the original
          packaging is intact. Custom-made items are excluded unless faulty.
        </p>
        <h2 id="contact">Contact</h2>
        <p>
          For shipping questions, contact us at <strong>hello@bubus.hu</strong>.
        </p>
      </LegalPage>
    );
  }

  return (
    <LegalPage eyebrow="Ügyfélszolgálat" title="Szállítás" lastUpdated="2026. június 25." sections={sectionsHu}>
      <h2 id="orszagok">Elérhető országok</h2>
      <p>
        A Chicks Jewelry jelenleg Magyarországra és a nyelv/ország választóban elérhető kiválasztott
        EU országokba támogat rendelést. A checkout mindig a választott országhoz tartozó szállítási
        lehetőségeket mutatja.
      </p>
      <h2 id="dijak">Szállítási díjak</h2>
      <p>
        A szállítási díj a pénztár oldalon, fizetés előtt jelenik meg. Kampány vagy kosárérték alapján
        ingyenes szállítás is elérhető lehet, ha ezt a kosár mutatja.
      </p>
      <h2 id="ido">Szállítási idő</h2>
      <p>
        Raktáron lévő darabokat általában néhány munkanapon belül készítünk elő. A kézbesítési idő a
        célországtól és a futárszolgálat elérhetőségétől függ.
      </p>
      <h2 id="visszakuldes">Visszaküldés</h2>
      <p>
        Viseletlen, nem egyedi rendelésre készült termékek általában a kézbesítéstől számított 14 napon
        belül küldhetők vissza, sértetlen eredeti csomagolással.
      </p>
      <h2 id="kapcsolat">Kapcsolat</h2>
      <p>
        Szállítási kérdés esetén írj nekünk: <strong>hello@bubus.hu</strong>.
      </p>
    </LegalPage>
  );
}
