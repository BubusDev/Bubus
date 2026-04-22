import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal/LegalPage";

export function generateMetadata(): Metadata {
  return {
    title: "Adatkezelési tájékoztató (GDPR) — Chicks Jewelry",
    description:
      "GDPR és magyar adatvédelmi követelmények szerint kialakított adatkezelési tájékoztató a Chicks Jewelry weboldal használatáról, rendeléseiről, fiókkezeléséről és kapcsolódó adatfeldolgozókról.",
  };
}

const sections = [
  { id: "bevezetes", title: "1. Bevezetés" },
  { id: "adatkezelo-adatai", title: "2. Az adatkezelő adatai" },
  { id: "dpo", title: "3. Adatvédelmi tisztviselő" },
  { id: "kezelt-adatok", title: "4. Kezelt adatok köre" },
  { id: "cel-jogalap", title: "5. Adatkezelés célja és jogalapja" },
  { id: "automatikus-donteshozas", title: "6. Automatikus döntéshozatal" },
  { id: "adatfeldolgozok", title: "7. Adatfeldolgozók" },
  { id: "harmadik-orszag", title: "8. Harmadik országba továbbítás" },
  { id: "fizetesi-adatok", title: "9. Fizetési adatok kezelése" },
  { id: "erintetti-jogok", title: "10. Érintetti jogok" },
  { id: "hozzajarulas-visszavonasa", title: "11. Hozzájárulás visszavonása" },
  { id: "adatbiztonsag", title: "12. Adatbiztonság" },
  { id: "incidens", title: "13. Adatvédelmi incidens" },
  { id: "gyermekek-adatai", title: "14. Gyermekek adatai" },
  { id: "jogorvoslat", title: "15. Felügyeleti hatósághoz fordulás joga" },
  { id: "modositas", title: "16. A tájékoztató módosítása" },
  { id: "kapcsolat", title: "17. Kapcsolat" },
  { id: "verziotok", title: "Verziótörténet" },
  { id: "placeholder-summary", title: "PLACEHOLDERS TO FILL IN" },
];

function PrintButton() {
  return (
    <a
      href="javascript:window.print()"
      className="inline-flex min-h-11 items-center rounded-full border border-[#d95587] px-5 py-3 text-sm font-medium text-[#d95587] transition hover:bg-[#fff0f6] print:hidden"
    >
      Nyomtatás
    </a>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="legal-table min-w-full border-collapse">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("|")}>
              {row.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <LegalPage
        eyebrow="Jogi dokumentum"
        title="Adatkezelési tájékoztató"
        lastUpdated="2026. április 22."
        sections={sections}
      >
        <div className="mb-6 flex flex-col gap-4 rounded-[1.5rem] border border-[#efd7e1] bg-[#fff7fa] p-5 print:border-[#e5d8de] print:bg-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-[0.28em] text-[#af7795]">Hatályos verzió</p>
            <p className="mb-0 text-sm text-[#5a3a4a]">
              <strong>Hatályos:</strong> 2026. április 22.
            </p>
            <p className="mb-0 text-sm text-[#5a3a4a]">
              <strong>Utolsó módosítás:</strong> 2026. április 22.
            </p>
          </div>
          <PrintButton />
        </div>

        <div className="mb-8 rounded-[1.5rem] border border-[#f0d9e3] bg-white/80 p-5">
          <h2 id="tartalomjegyzek">Tartalomjegyzék</h2>
          <ul>
            {sections
              .filter((section) => section.id !== "placeholder-summary")
              .map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
          </ul>
        </div>

        <h2 id="bevezetes">1. Bevezetés</h2>
        <p>
          Jelen adatkezelési tájékoztató az Európai Parlament és a Tanács (EU) 2016/679 rendelete
          (GDPR), valamint az információs önrendelkezési jogról és az információszabadságról szóló
          2011. évi CXII. törvény (Infotv.) alapján készült.
        </p>
        <p>
          A tájékoztató magyar nyelven készült, rendelkezéseit a magyar jog szerint kell értelmezni.
          A tájékoztató kiterjed minden olyan természetes személyre, aki a weboldalt használja,
          fiókot regisztrál, rendelést ad le, kapcsolatba lép az Adatkezelővel, vagy a hírlevélre
          feliratkozik.
        </p>

        <h2 id="adatkezelo-adatai">2. Az adatkezelő adatai</h2>
        {/* [PLACEHOLDER: Business name] */}
        {/* [PLACEHOLDER: Registered address] */}
        {/* [PLACEHOLDER: Registration number] */}
        {/* [PLACEHOLDER: Tax number] */}
        {/* [PLACEHOLDER: Representative name] */}
        {/* [PLACEHOLDER: Privacy email] */}
        {/* [PLACEHOLDER: Phone number] */}
        <p>
          <strong>Teljes név:</strong> [PLACEHOLDER: Business name]
          <br />
          <strong>Székhely:</strong> [PLACEHOLDER: Registered address]
          <br />
          <strong>Nyilvántartási szám / cégjegyzékszám:</strong> [PLACEHOLDER: Registration number]
          <br />
          <strong>Adószám:</strong> [PLACEHOLDER: Tax number]
          <br />
          <strong>Képviselő:</strong> [PLACEHOLDER: Representative name]
          <br />
          <strong>E-mail:</strong> [PLACEHOLDER: Privacy email]
          <br />
          <strong>Telefon:</strong> [PLACEHOLDER: Phone number]
          <br />
          <strong>Weboldal:</strong>{" "}
          <a href="https://chicksjewelry.com" target="_blank" rel="noreferrer">
            https://chicksjewelry.com
          </a>
        </p>

        <h2 id="dpo">3. Adatvédelmi tisztviselő (DPO)</h2>
        <p>
          Az Adatkezelő nem köteles adatvédelmi tisztviselő kijelölésére a GDPR 37. cikke alapján,
          mivel nem végez nagyszabású, rendszeres és szisztematikus megfigyelést vagy különleges
          kategóriájú adatok nagyszabású kezelését.
        </p>
        <p>
          Adatvédelmi kérdésekben közvetlenül az Adatkezelőhöz fordulhat a 2. pontban megadott
          elérhetőségeken.
        </p>

        <h2 id="kezelt-adatok">4. Kezelt adatok köre</h2>
        <p>Az Adatkezelő az alábbi személyes adatokat kezelheti az egyes adatkezelési célok szerint.</p>

        <h3 id="fiok-letrehozas">4.1 Fiók létrehozása és bejelentkezés</h3>
        <ul>
          <li>vezetéknév, keresztnév</li>
          <li>e-mail cím</li>
          <li>jelszó hash-elt formában, soha nem nyers szövegként</li>
          <li>regisztráció időpontja</li>
        </ul>

        <h3 id="rendeles-leadasa">4.2 Rendelés leadása</h3>
        <ul>
          <li>szállítási név, cím, telefonszám</li>
          <li>számlázási név, cím, ha eltér</li>
          <li>rendelt termékek, mennyiség, ár</li>
          <li>fizetési mód, de a bankkártyaadatokat az Adatkezelő nem tárolja</li>
          <li>rendelés dátuma, státusza</li>
        </ul>

        <h3 id="ugyfelszolgalat">4.3 Ügyfélszolgálati kapcsolat</h3>
        <ul>
          <li>az üzenet tartalma</li>
          <li>kapcsolattartási adatok, amelyeket az érintett megad</li>
          <li>visszaküldési indok, ha releváns</li>
        </ul>

        <h3 id="hirlevel">4.4 Hírlevél</h3>
        {/* [PLACEHOLDER: Newsletter service name] */}
        <ul>
          <li>e-mail cím</li>
          <li>feliratkozás időpontja</li>
          <li>hozzájárulás igazolása, például IP hash és user agent</li>
          <li>hírlevélküldő szolgáltató: [PLACEHOLDER: Newsletter service name]</li>
        </ul>

        <h3 id="technikai-adatok">4.5 Technikai adatok</h3>
        <ul>
          <li>IP cím hash-elt formában a cookie consent loghoz</li>
          <li>böngésző típusa, operációs rendszer</li>
          <li>látogatott oldalak és látogatás időpontja kizárólag statisztikai hozzájárulás esetén</li>
          <li>
            cookie beállítások, részletek: <Link href="/cookies">Cookie tájékoztató</Link>
          </li>
        </ul>

        <h2 id="cel-jogalap">5. Adatkezelés célja és jogalapja</h2>
        <DataTable
          headers={["Cél", "Jogalap (GDPR 6. cikk)", "Megőrzési idő"]}
          rows={[
            ["Rendelés teljesítése", "6. cikk (1) b) szerződés teljesítése", "5 év"],
            ["Számlázás", "6. cikk (1) c) jogi kötelezettség", "8 év"],
            ["Fiók fenntartása", "6. cikk (1) b) szerződés", "felhasználó törlési kéréséig"],
            ["Ügyfélszolgálat", "6. cikk (1) b) és/vagy f) jogos érdek", "2 év"],
            ["Hírlevél", "6. cikk (1) a) hozzájárulás", "visszavonásig"],
            ["Statisztikai cookie-k", "6. cikk (1) a) hozzájárulás", "12 hónap"],
            ["Marketing cookie-k", "6. cikk (1) a) hozzájárulás", "12 hónap"],
            ["Csalásmegelőzés (fizetés)", "6. cikk (1) f) jogos érdek", "1 év"],
          ]}
        />
        <p>
          A megőrzési idők lejártát követően az adatokat töröljük vagy anonimizáljuk, kivéve, ha
          jogszabály ennél hosszabb megőrzést ír elő, vagy jogvita, hatósági eljárás, illetve
          követelésérvényesítés indokolja a további korlátozott tárolást.
        </p>

        <h2 id="automatikus-donteshozas">6. Automatikus döntéshozatal és profilalkotás</h2>
        <p>
          Az Adatkezelő nem alkalmaz kizárólag automatikus adatkezelésen alapuló döntéshozatalt, és
          nem végez profilalkotást a GDPR 22. cikke értelmében.
        </p>

        <h2 id="adatfeldolgozok">7. Adatfeldolgozók</h2>
        <p>
          Az Adatkezelő az alábbi adatfeldolgozókat veszi igénybe a szolgáltatás működtetéséhez,
          fizetésfeldolgozáshoz, infrastruktúrához és e-mail kommunikációhoz.
        </p>
        <DataTable
          headers={["Adatfeldolgozó", "Feladat", "Székhely", "Továbbítás jogalapja"]}
          rows={[
            ["Stripe, Inc.", "fizetés feldolgozása", "USA (Delaware)", "EU-USA Data Privacy Framework"],
            ["Vercel Inc.", "weboldal hosting", "USA", "SCC + DPF"],
            ["Neon, Inc.", "adatbázis hosting", "USA / EU", "SCC"],
            [
              "Resend, Inc.",
              "Tranzakciós e-mailek küldése (rendelés-visszaigazolás, jelszóvisszaállítás, e-mail-megerősítés)",
              "USA (Delaware)",
              "Standard Contractual Clauses (SCC)",
            ],
          ]}
        />
        <p>
          Google Analytics, Meta Pixel, Meta Ads és Google Ads jelen tájékoztató kiadásakor nem
          kerültek feltüntetésre aktív adatfeldolgozóként, mivel használatuk nincs megerősítve, vagy
          a jelenlegi információk alapján nem aktívak.
        </p>
        <p>
          A jelen pontban nevesített szolgáltatók adatkezelési tájékoztatói:
          {" "}
          <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer">
            Stripe
          </a>
          ,{" "}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">
            Vercel
          </a>
          ,{" "}
          <a href="https://neon.com/privacy-policy" target="_blank" rel="noreferrer">
            Neon
          </a>
          .
        </p>
        <p>
          Az adatfeldolgozók részletes elérhetőségeiről és az esetleges további technikai
          alvállalkozókról az Adatkezelő kérésre további tájékoztatást ad a{" "}
          <strong>[PLACEHOLDER: Privacy email]</strong> címen.
        </p>

        <h2 id="harmadik-orszag">8. Harmadik országba történő adattovábbítás</h2>
        <p>
          Egyes adatfeldolgozók az Európai Gazdasági Térségen kívül, elsősorban az Amerikai Egyesült
          Államokban rendelkeznek székhellyel vagy ott végeznek adatkezelési műveleteket. Az ilyen
          adattovábbítások jogalapja különösen:
        </p>
        <ul>
          <li>
            az Európai Bizottság 2023. július 10-i megfelelőségi határozata az EU-USA Data Privacy
            Framework kapcsán azon szolgáltatók esetében, amelyek tanúsítottak
          </li>
          <li>Standard Contractual Clauses (SCC), ahol megfelelőségi határozat nem alkalmazható</li>
        </ul>
        <p>Az Adatkezelő az adattovábbítások jogszerűségét és arányosságát rendszeresen felülvizsgálja.</p>

        <h2 id="fizetesi-adatok">9. Fizetési adatok kezelése</h2>
        <p>
          Bankkártya- és fizetési adatokat az Adatkezelő nem kezel és nem tárol. A fizetési folyamatot
          a Stripe, Inc. végzi PCI-DSS Level 1 minősítésű fizetési szolgáltatóként.
        </p>
        <p>
          A Stripe saját adatkezelési tájékoztatója itt érhető el:{" "}
          <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer">
            stripe.com/privacy
          </a>
          .
        </p>

        <h2 id="erintetti-jogok">10. Érintetti jogok</h2>
        <p>Az Ön GDPR szerinti jogai különösen a következők:</p>
        <h3>10.1 Tájékoztatáshoz való jog</h3>
        <p>Ön jogosult tájékoztatást kapni az adatkezelés lényeges körülményeiről a GDPR 13-14. cikke alapján.</p>
        <h3>10.2 Hozzáféréshez való jog</h3>
        <p>Ön jogosult visszajelzést kapni arról, hogy személyes adatainak kezelése folyamatban van-e.</p>
        <h3>10.3 Helyesbítéshez való jog</h3>
        <p>Ön kérheti a pontatlan adatok helyesbítését és a hiányos adatok kiegészítését.</p>
        <h3>10.4 Törléshez való jog</h3>
        <p>Ön kérheti személyes adatainak törlését, ha az adatkezelés jogalapja megszűnt vagy az adatkezelés jogellenes.</p>
        <h3>10.5 Adatkezelés korlátozásához való jog</h3>
        <p>Ön bizonyos esetekben kérheti az adatkezelés ideiglenes korlátozását.</p>
        <h3>10.6 Adathordozhatósághoz való jog</h3>
        <p>Ön jogosult az Ön által rendelkezésre bocsátott adatokat strukturált, géppel olvasható formában megkapni.</p>
        <h3>10.7 Tiltakozáshoz való jog</h3>
        <p>Ön tiltakozhat a jogos érdek jogalapján végzett adatkezelés ellen.</p>
        <h3>10.8 Hozzájárulás visszavonásának joga</h3>
        <p>Ön bármikor visszavonhatja a hozzájáruláson alapuló adatkezelésekhez adott hozzájárulását.</p>
        <h3>10.9 Automatikus döntéshozatalhoz kapcsolódó jogok</h3>
        <p>Mivel az Adatkezelő nem alkalmaz ilyen döntéshozatalt, ilyen jog gyakorlása jelenleg nem releváns.</p>
        <p>
          Kérelmét a <strong>[PLACEHOLDER: Privacy email]</strong> e-mail címen nyújthatja be. Az
          Adatkezelő a kérelem beérkezésétől számított 30 napon belül válaszol, indokolt esetben ez
          további 60 nappal meghosszabbítható, amelyről az érintettet tájékoztatjuk.
        </p>
        <p>
          A jogok gyakorlása díjmentes, kivéve, ha a kérelem nyilvánvalóan megalapozatlan vagy túlzó.
        </p>

        <h2 id="hozzajarulas-visszavonasa">11. Hozzájárulás visszavonása</h2>
        <ul>
          <li>
            Hírlevél: minden e-mail alján található leiratkozási linken, illetve a{" "}
            <strong>[PLACEHOLDER: Privacy email]</strong> címen
          </li>
          <li>
            Cookie-k: a weboldal láblécében elérhető Cookie beállítások felületen, lásd{" "}
            <Link href="/cookies">Cookie tájékoztató</Link>
          </li>
          <li>Fiók: bejelentkezve a fiókkezelési felületen vagy e-mailben kérhető</li>
        </ul>
        <p>A visszavonás a visszavonást megelőző adatkezelés jogszerűségét nem érinti.</p>

        <h2 id="adatbiztonsag">12. Adatbiztonság</h2>
        <p>Az Adatkezelő az alábbi technikai és szervezési intézkedéseket alkalmazza:</p>
        <ul>
          <li>SSL/TLS titkosítás minden kommunikációhoz</li>
          <li>jelszavak hash-elt tárolása</li>
          <li>kártyaadatok nem tárolása, Stripe tokenizáció használata</li>
          <li>rendszeres biztonsági frissítések és függőség-auditálás</li>
          <li>hozzáférés-szabályozás kizárólag feljogosított személyek számára</li>
          <li>naplózás kritikus műveletekről</li>
          <li>rendszeres biztonsági mentések</li>
        </ul>

        <h2 id="incidens">13. Adatvédelmi incidens</h2>
        <p>
          Adatvédelmi incidens esetén az Adatkezelő a tudomásszerzést követően indokolatlan késedelem
          nélkül, szükség esetén legkésőbb 72 órán belül értesíti a Nemzeti Adatvédelmi és
          Információszabadság Hatóságot.
        </p>
        <p>
          Ha az incidens magas kockázatot jelent a természetes személyek jogaira és szabadságaira
          nézve, az érintetteket is közvetlenül tájékoztatjuk.
        </p>

        <h2 id="gyermekek-adatai">14. Gyermekek adatai</h2>
        <p>
          A weboldal szolgáltatásai 16. életévüket betöltött személyek számára érhetők el.
          Amennyiben az Adatkezelő tudomására jut, hogy 16 év alatti személytől gyűjtött személyes
          adatot, az adatokat indokolatlan késedelem nélkül törli.
        </p>

        <h2 id="jogorvoslat">15. Felügyeleti hatósághoz fordulás joga</h2>
        <p>Jogai megsértése esetén panasszal élhet az alábbi hatóságnál:</p>
        <p>
          <strong>Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH)</strong>
          <br />
          Cím: 1055 Budapest, Falk Miksa utca 9-11.
          <br />
          Postacím: 1363 Budapest, Pf. 9.
          <br />
          Telefon: +36 (1) 391-1400
          <br />
          E-mail: ugyfelszolgalat@naih.hu
          <br />
          Weboldal:{" "}
          <a href="https://www.naih.hu" target="_blank" rel="noreferrer">
            www.naih.hu
          </a>
        </p>
        <p>
          Ön bírósághoz is fordulhat jogai érvényesítése érdekében. A per elbírálása a törvényszék
          hatáskörébe tartozik, és az Ön lakóhelye vagy tartózkodási helye szerinti illetékes
          bíróság előtt is megindítható.
        </p>

        <h2 id="modositas">16. A tájékoztató módosítása</h2>
        <p>
          Az Adatkezelő fenntartja a jogot jelen tájékoztató módosítására. Lényeges változás esetén
          az érintetteket a weboldalon keresztül vagy e-mailben értesítjük a módosítás hatálybalépése
          előtt legalább 15 nappal.
        </p>
        <p>Korábbi verziók kérésre elérhetők.</p>

        <h2 id="kapcsolat">17. Kapcsolat</h2>
        <p>Adatkezelési kérdéseivel kérjük, forduljon hozzánk bizalommal:</p>
        <p>
          <strong>E-mail:</strong> [PLACEHOLDER: Privacy email]
          <br />
          <strong>Telefon:</strong> [PLACEHOLDER: Phone number]
          <br />
          <strong>Postai úton:</strong> [PLACEHOLDER: Registered address]
        </p>
        <p>Válaszidő: 30 nap a GDPR 12. cikk (3) bekezdése szerint.</p>

        <h2 id="verziotok">Verziótörténet</h2>
        <ul>
          <li>2026-04-22: teljes GDPR és magyar megfelelőségi szerkezetre átdolgozott verzió</li>
          <li>2025-01-01: korábbi rövidített adatkezelési tájékoztató</li>
          <li>2024-01-01: induló adatvédelmi oldal</li>
        </ul>

        <h2 id="placeholder-summary">PLACEHOLDERS TO FILL IN</h2>
        <ul>
          <li>Line 135: [PLACEHOLDER: Business name] — appears in section 2</li>
          <li>Line 137 and line 423: [PLACEHOLDER: Registered address] — appears in sections 2 and 17</li>
          <li>Line 139: [PLACEHOLDER: Registration number] — appears in section 2</li>
          <li>Line 141: [PLACEHOLDER: Tax number] — appears in section 2</li>
          <li>Line 143: [PLACEHOLDER: Representative name] — appears in section 2</li>
          <li>
            Line 145, line 280, line 332, line 344 and line 419: [PLACEHOLDER: Privacy email] —
            appears in sections 2, 7, 10, 11 and 17
          </li>
          <li>Line 147 and line 421: [PLACEHOLDER: Phone number] — appears in sections 2 and 17</li>
          <li>
            Line 199: [PLACEHOLDER: Newsletter service name] — appears in section 4.4
          </li>
        </ul>
      </LegalPage>

      <style>{`
        .legal-table th,
        .legal-table td {
          border: 1px solid #ead6df;
          padding: 0.8rem 0.9rem;
          text-align: left;
          vertical-align: top;
          font-size: 14px;
          line-height: 1.7;
          color: #5a3a4a;
          background: rgba(255, 255, 255, 0.88);
        }
        .legal-table th {
          color: #4d2741;
          background: #fff3f8;
          font-weight: 600;
        }
        @media print {
          main {
            max-width: none !important;
            padding: 0 !important;
          }
          .legal-content a {
            color: #5a3a4a !important;
            text-decoration: none !important;
          }
          .legal-table th,
          .legal-table td {
            background: white !important;
          }
        }
      `}</style>
    </>
  );
}
