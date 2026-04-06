import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Adatkezelési tájékoztató — Bubus",
  description: "Tájékoztató arról, hogyan kezeljük személyes adataidat a Bubus webáruházban.",
};

const sections = [
  { id: "adatkezelo", title: "Az adatkezelő" },
  { id: "adatok-kore", title: "Kezelt adatok köre" },
  { id: "cel", title: "Adatkezelés célja" },
  { id: "jogalap", title: "Adatkezelés jogalapja" },
  { id: "megorzesi-ido", title: "Adatmegőrzési idő" },
  { id: "jogok", title: "Érintetti jogok" },
  { id: "adatbiztonsag", title: "Adatbiztonság" },
  { id: "kapcsolat", title: "Kapcsolat" },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Jogi dokumentum"
      title="Adatkezelési tájékoztató"
      lastUpdated="2025. január 1."
      sections={sections}
    >
      <h2 id="adatkezelo">Az adatkezelő</h2>
      <p>
        <strong>Cégnév:</strong> Bubus Ékszer (egyéni vállalkozó)<br />
        <strong>Székhely:</strong> Budapest, Magyarország<br />
        <strong>E-mail:</strong> hello@bubus.hu
      </p>
      <p>
        Jelen tájékoztató a természetes személyek személyes adatainak védelméről szóló EU 2016/679
        rendelet (GDPR) és az információs önrendelkezési jogról szóló 2011. évi CXII. törvény
        alapján készült.
      </p>

      <h2 id="adatok-kore">Kezelt adatok köre</h2>
      <p>Az alábbi személyes adatokat kezeljük:</p>
      <ul>
        <li>Név (kereszt- és vezetéknév)</li>
        <li>E-mail cím</li>
        <li>Szállítási és számlázási cím</li>
        <li>Telefonszám (opcionális)</li>
        <li>Rendelési adatok (tételek, összeg, dátum)</li>
        <li>Böngészési adatok (cookie-k útján — részletesen lásd a Cookie Irányelvben)</li>
      </ul>

      <h2 id="cel">Adatkezelés célja</h2>
      <p>Személyes adatait az alábbi célokból kezeljük:</p>
      <ul>
        <li>Rendelések feldolgozása és teljesítése</li>
        <li>Számlázás és könyvelési kötelezettségek</li>
        <li>Ügyfélszolgálati kapcsolattartás</li>
        <li>Visszaküldési és garanciális kérelmek kezelése</li>
        <li>Hírlevél küldése (kizárólag előzetes, kifejezett hozzájárulás alapján)</li>
      </ul>

      <h2 id="jogalap">Adatkezelés jogalapja</h2>
      <p>
        Az adatkezelés jogalapja elsősorban a <strong>szerződés teljesítése</strong> (GDPR 6. cikk
        (1) b) pont), számlázás esetén a <strong>jogi kötelezettség teljesítése</strong> (6. cikk
        (1) c) pont), hírlevél esetén az Ön <strong>hozzájárulása</strong> (6. cikk (1) a) pont).
      </p>

      <h2 id="megorzesi-ido">Adatmegőrzési idő</h2>
      <ul>
        <li>Rendelési adatok: 5 év (számviteli törvény alapján)</li>
        <li>Ügyfélszolgálati üzenetek: 2 év</li>
        <li>Hírlevél-feliratkozás: visszavonásig</li>
        <li>Cookie adatok: a sütikben meghatározott idő szerint (lásd Cookie Irányelv)</li>
      </ul>

      <h2 id="jogok">Érintetti jogok</h2>
      <p>Ön jogosult:</p>
      <ul>
        <li>Tájékoztatást kérni az általunk kezelt adatairól</li>
        <li>Az adatok helyesbítését kérni</li>
        <li>Az adatok törlését kérni („az elfeledtetéshez való jog")</li>
        <li>Az adatkezelés korlátozását kérni</li>
        <li>Adathordozhatósághoz való jogát gyakorolni</li>
        <li>Tiltakozni az adatkezelés ellen</li>
      </ul>
      <p>
        Kérelmét a <strong>hello@bubus.hu</strong> e-mail-címen nyújthatja be. Panasz esetén a
        Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH) fordulhat.
      </p>

      <h2 id="adatbiztonsag">Adatbiztonság</h2>
      <p>
        Minden adatot SSL/TLS titkosítással védett kapcsolaton kezelünk. A fizetési adatokat
        kizárólag a Stripe fizetési szolgáltató kezeli — mi kártyaadatokat nem tárolunk.
        Rendszereinket rendszeresen frissítjük és auditáljuk.
      </p>

      <h2 id="kapcsolat">Kapcsolat</h2>
      <p>
        Adatkezelési kérdéseivel forduljon hozzánk bizalommal:
        <br />
        <strong>E-mail:</strong> hello@bubus.hu
      </p>
    </LegalPage>
  );
}
