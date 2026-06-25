import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { getAlternateLanguages, getLocalizedPath } from "@/lib/locale-routing";
import { getRequestLocale } from "@/lib/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getRequestLocale();
  const canonicalPath = getLocalizedPath("/terms", language);

  return {
    title: language === "en" ? "Terms and Conditions — Chicks Jewelry" : "ÁSZF — Chicks Jewelry",
    description: language === "en"
      ? "Terms and Conditions for ordering from the Chicks Jewelry online store."
      : "Általános Szerződési Feltételek a Chicks Jewelry ékszer webáruházhoz.",
    alternates: {
      canonical: canonicalPath,
      languages: getAlternateLanguages("/terms"),
    },
    openGraph: {
      title: language === "en" ? "Terms and Conditions — Chicks Jewelry" : "ÁSZF — Chicks Jewelry",
      description: language === "en"
        ? "Terms for purchases, payment, shipping, returns and custom orders."
        : "Általános Szerződési Feltételek a Chicks Jewelry ékszer webáruházhoz.",
      url: canonicalPath,
    },
  };
}

const sections = [
  { id: "altalanos", title: "Általános rendelkezések" },
  { id: "megrendeles", title: "Megrendelés folyamata" },
  { id: "arak", title: "Árak és fizetés" },
  { id: "szallitas", title: "Szállítás" },
  { id: "visszakuldes", title: "Visszaküldés és elállás" },
  { id: "garancia", title: "Garancia és szavatosság" },
  { id: "egyedi", title: "Egyedi rendelések" },
  { id: "jogvita", title: "Jogvita rendezése" },
];

const sectionsEn = [
  { id: "general", title: "General terms" },
  { id: "orders", title: "Ordering" },
  { id: "prices", title: "Prices and payment" },
  { id: "shipping", title: "Shipping" },
  { id: "returns", title: "Returns" },
  { id: "custom", title: "Custom orders" },
  { id: "contact", title: "Contact" },
];

export default async function TermsPage() {
  const language = await getRequestLocale();

  if (language === "en") {
    return (
      <LegalPage
        eyebrow="Legal"
        title="Terms and Conditions"
        lastUpdated="January 1, 2025"
        sections={sectionsEn}
      >
        <p>
          This English version summarizes the customer-facing terms for the Chicks Jewelry online store.
          The full legal text will be finalized before launch; until then, the Hungarian version remains
          the detailed legal reference.
        </p>
        <h2 id="general">General terms</h2>
        <p>
          By placing an order through the webshop, the customer accepts the terms that apply to the
          selected products, shipping destination, payment method and return policy.
        </p>
        <h2 id="orders">Ordering</h2>
        <ul>
          <li>Select the product and add it to cart.</li>
          <li>Enter contact, shipping and billing details.</li>
          <li>Choose a payment method and confirm the order.</li>
          <li>Order confirmation is sent by e-mail.</li>
        </ul>
        <h2 id="prices">Prices and payment</h2>
        <p>
          HU storefront prices are shown in HUF. EU English storefront prices are shown in EUR where
          available. Card payments are processed securely by Stripe.
        </p>
        <h2 id="shipping">Shipping</h2>
        <p>
          In-stock items are usually dispatched within a few business days. Supported countries, delivery
          estimates and shipping prices are shown during checkout before payment.
        </p>
        <h2 id="returns">Returns</h2>
        <p>
          Unworn, non-custom pieces can generally be returned within 14 days of delivery if the original
          packaging is intact. Custom-made pieces are excluded unless they are faulty.
        </p>
        <h2 id="custom">Custom orders</h2>
        <p>
          Custom orders start with a personal consultation. Final price, lead time and deposit conditions
          are confirmed before production starts.
        </p>
        <h2 id="contact">Contact</h2>
        <p>
          For questions about an order, shipping or returns, contact us at <strong>hello@bubus.hu</strong>.
        </p>
      </LegalPage>
    );
  }

  return (
    <LegalPage
      eyebrow="Jogi dokumentum"
      title="Általános Szerződési Feltételek"
      lastUpdated="2025. január 1."
      sections={sections}
    >
      <h2 id="altalanos">Általános rendelkezések</h2>
      <p>
        Jelen Általános Szerződési Feltételek (ÁSZF) a Chicks Jewelry (továbbiakban: Szolgáltató) és
        a webáruházon keresztül vásárló természetes személyek (továbbiakban: Vásárló) között
        létrejövő adásvételi szerződés feltételeit rögzítik.
      </p>
      <p>
        A webáruház használatával és a megrendelés leadásával a Vásárló elfogadja jelen ÁSZF
        rendelkezéseit.
      </p>

      <h2 id="megrendeles">Megrendelés folyamata</h2>
      <p>
        A megrendelés az alábbi lépésekből áll:
      </p>
      <ul>
        <li>Termék(ek) kiválasztása és kosárba helyezése</li>
        <li>Szállítási és számlázási adatok megadása</li>
        <li>Fizetési mód kiválasztása</li>
        <li>Megrendelés visszaigazolása e-mailben</li>
      </ul>
      <p>
        A megrendelés leadása ajánlatnak minősül. A szerződés a Szolgáltató visszaigazoló e-mailjének
        elküldésével jön létre.
      </p>

      <h2 id="arak">Árak és fizetés</h2>
      <p>
        Az árak magyar forintban (HUF) értendők, és tartalmazzák az általános forgalmi adót (ÁFA).
        A Szolgáltató fenntartja az árváltoztatás jogát, az aktuális ár mindig a rendelés
        visszaigazolásában szereplő összeg.
      </p>
      <p>Elfogadott fizetési módok:</p>
      <ul>
        <li><strong>Bankkártya</strong> — Stripe fizetési felületen keresztül, biztonságosan</li>
        <li><strong>Banki átutalás</strong> — előre utalás, szállítás az összeg beérkezése után</li>
        <li><strong>Utánvét</strong> — kézbesítéskor készpénzben a futárnak</li>
      </ul>

      <h2 id="szallitas">Szállítás</h2>
      <p>
        Szállítási idő raktáron lévő termékek esetén <strong>2–4 munkanap</strong>. A szállítás
        Magyar Posta vagy futárszolgálat útján történik. A szállítási díjat a pénztár oldalon
        tüntetjük fel.
      </p>
      <p>
        Személyes átvétel Budapesten egyeztethető — írjon a hello@bubus.hu e-mail-címre.
      </p>

      <h2 id="visszakuldes">Visszaküldés és elállás</h2>
      <p>
        A Vásárló a termék kézhezvételétől számított <strong>14 napon belül</strong> indoklás nélkül
        elállhat a vásárlástól, és visszaküldheti a terméket, amennyiben:
      </p>
      <ul>
        <li>A termék viseletlenállapotban van</li>
        <li>Az eredeti Chicks Jewelry doboz és csomagolás sértetlen</li>
        <li>A terméket nem egyedi megrendelésre készítettük</li>
      </ul>
      <p>
        A visszaküldés feltételeiről és a visszatérítés folyamatáról a hello@bubus.hu-n kérhet
        tájékoztatást.
      </p>

      <h2 id="garancia">Garancia és szavatosság</h2>
      <p>
        A Szolgáltató a vonatkozó jogszabályok alapján <strong>kellékszavatosságot</strong> vállal.
        Gyártói hibák, zárók meghibásodása esetén kérjük, vegye fel velünk a kapcsolatot. A
        természetes kopás, ütés- vagy víznyomok nem tartoznak a szavatosság körébe.
      </p>

      <h2 id="egyedi">Egyedi rendelések</h2>
      <p>
        Az egyedi rendelések személyes egyeztetéssel indulnak. Egyedi darabokra az elállási jog nem
        vonatkozik, kivéve, ha a termék hibás. Az egyedi megrendelés megerősítésekor az ár 50%-a
        foglalóként fizetendő.
      </p>

      <h2 id="jogvita">Jogvita rendezése</h2>
      <p>
        A felek törekednek a vitákat békés úton rendezni. Amennyiben ez nem sikerül, a fogyasztó
        panaszával fordulhat a területileg illetékes <strong>békéltető testülethez</strong>, vagy
        igénybe veheti az EU online vitarendezési platformját.
      </p>
      <p>
        Jelen ÁSZF-re a magyar jog az irányadó.
      </p>
    </LegalPage>
  );
}
