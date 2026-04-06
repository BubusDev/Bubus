import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "ÁSZF — Bubus",
  description: "Általános Szerződési Feltételek a Bubus ékszer webáruházhoz.",
};

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

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Jogi dokumentum"
      title="Általános Szerződési Feltételek"
      lastUpdated="2025. január 1."
      sections={sections}
    >
      <h2 id="altalanos">Általános rendelkezések</h2>
      <p>
        Jelen Általános Szerződési Feltételek (ÁSZF) a Bubus Ékszer (továbbiakban: Szolgáltató) és
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
        <li>Az eredeti Bubus doboz és csomagolás sértetlen</li>
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
