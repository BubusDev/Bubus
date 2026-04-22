import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { CookieSettingsButton } from "@/components/cookies/CookieSettingsButton";

export const metadata: Metadata = {
  title: "Cookie Irányelv — Chicks Jewelry",
  description: "Tájékoztató a Chicks Jewelry webáruház által használt cookie-król.",
};

const sections = [
  { id: "adatkezelo", title: "Adatkezelő adatai" },
  { id: "mi-a-cookie", title: "Mi az a cookie?" },
  { id: "jogalap", title: "Jogalap és hozzájárulás" },
  { id: "cookie-kategoria", title: "Alkalmazott cookie-k" },
  { id: "harmadik-felek", title: "Harmadik felek és adattovábbítás" },
  { id: "hozzajarulas", title: "Hozzájárulás kezelése" },
  { id: "kapcsolat", title: "Kapcsolat" },
];

// TODO: Replace these temporary placeholders with the final legal company details before launch.
const DATA_CONTROLLER_NAME = "[KITÖLTENDŐ CÉGNÉV]";
// TODO: Replace this temporary placeholder with the final registered office address before launch.
const DATA_CONTROLLER_ADDRESS = "[KITÖLTENDŐ SZÉKHELY]";
// TODO: Replace this temporary placeholder with the final tax number if it must appear in the published policy.
const DATA_CONTROLLER_TAX_NUMBER = "[KITÖLTENDŐ ADÓSZÁM]";
// TODO: Replace this temporary placeholder with the final public privacy contact email before launch.
const DATA_CONTROLLER_EMAIL = "[KITÖLTENDŐ E-MAIL CÍM]";

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Jogi dokumentum"
      title="Cookie Irányelv"
      lastUpdated="2026. április 22."
      sections={sections}
    >
      <p>
        Jelen cookie tájékoztató ismerteti, hogy a Chicks Jewelry webáruház mely sütiket használja,
        milyen célból, milyen jogalapon, mennyi ideig, és hogyan módosíthatja a látogató a választását.
      </p>
      <div className="my-6 rounded-[1.5rem] border border-[#efd7e1] bg-[#fff7fa] p-5">
        <p className="mb-3">
          A nem szükséges sütik használatához minden esetben az Ön előzetes hozzájárulása szükséges.
          Hozzájárulását bármikor módosíthatja vagy visszavonhatja.
        </p>
        <CookieSettingsButton className="inline-flex min-h-11 items-center rounded-full border border-[#d95587] px-5 py-3 text-sm font-medium text-[#d95587] transition hover:bg-[#fff0f6]">
          Cookie beállítások módosítása
        </CookieSettingsButton>
      </div>

      <h2 id="adatkezelo">Adatkezelő adatai</h2>
      <p>
        <strong>Adatkezelő:</strong> {DATA_CONTROLLER_NAME}
      </p>
      <p>
        <strong>Székhely:</strong> {DATA_CONTROLLER_ADDRESS}
      </p>
      <p>
        <strong>Adószám:</strong> {DATA_CONTROLLER_TAX_NUMBER}
      </p>
      <p>
        <strong>E-mail:</strong> {DATA_CONTROLLER_EMAIL}
      </p>

      <h2 id="mi-a-cookie">Mi az a cookie?</h2>
      <p>
        A cookie egy olyan kis adatfájl, amelyet a böngésző tárol az Ön eszközén, amikor meglátogatja
        a weboldalt. Egy részük a webáruház alapvető működéséhez szükséges, más részük statisztikai
        vagy marketing célokat szolgál. A nem szükséges sütik csak előzetes hozzájárulás után aktiválódnak.
      </p>

      <h2 id="jogalap">Jogalap és hozzájárulás</h2>
      <p>
        A szükséges sütik alkalmazásának jogalapja a weboldal megfelelő és biztonságos működéséhez
        fűződő jogos érdek, valamint az elektronikus hírközlési szolgáltatás nyújtásához való szükségesség.
        A statisztikai és marketing sütik jogalapja az Ön önkéntes, előzetes és kifejezett hozzájárulása.
      </p>
      <p>
        A hozzájárulás hiánya nem akadályozza a webáruház alapvető funkcióinak használatát. A választás
        bármikor módosítható a weboldal láblécében elérhető <strong>Cookie beállítások</strong> gombbal.
      </p>

      <h2 id="cookie-kategoria">Alkalmazott cookie-k</h2>
      <h3>Szükséges cookie-k</h3>
      <p>
        Ezek a sütik a kosár, a fizetési folyamat, a bejelentkezés és az alapvető biztonsági funkciók
        fenntartásához szükségesek. Ezek nem kapcsolhatók ki a beállítópanelen.
      </p>
      <ul>
        <li><strong>guest_cart_token:</strong> vendég kosár azonosítója, megőrzési idő legfeljebb 30 nap</li>
        <li><strong>checkout_session:</strong> checkout állapot és vendég azonosítás, megőrzési idő legfeljebb 24 óra</li>
        <li><strong>guest_order_access:</strong> vendég rendelés-hozzáférés fenntartása, megőrzési idő legfeljebb 30 nap</li>
        <li><strong>Auth.js munkamenet- és biztonsági sütik:</strong> bejelentkezés, CSRF védelem és visszairányítás kezelése</li>
        <li><strong>chicks_cookie_consent:</strong> a sütibeállítások rögzítése, megőrzési idő legfeljebb 365 nap</li>
      </ul>

      <h3>Statisztikai cookie-k</h3>
      <p>
        A statisztikai sütik segítenek megérteni, hogy a látogatók hogyan használják a weboldalt. Ezek
        a sütik alapértelmezetten ki vannak kapcsolva, és csak hozzájárulás után töltődnek be.
      </p>
      <ul>
        <li><strong>Google Analytics:</strong> forgalmi és használati statisztikák mérése, IP anonimizálással</li>
      </ul>

      <h3>Marketing cookie-k</h3>
      <p>
        A marketing sütik a kampányok teljesítményének mérését, a hirdetések relevanciáját és az esetleges
        remarketing funkciókat támogatják. Ezek a sütik kizárólag hozzájárulás után aktiválódnak.
      </p>
      <ul>
        <li><strong>Google Ads:</strong> hirdetési teljesítmény és konverziómérés</li>
      </ul>

      <h2 id="harmadik-felek">Harmadik felek és adattovábbítás</h2>
      <p>
        A weboldal a fizetés lebonyolítása során a Stripe szolgáltatásait használja. A Stripe a fizetés
        biztonságának fenntartásához szükséges saját technikai sütiket alkalmazhat. A Google Analytics
        és Google Ads csak hozzájárulás után töltődik be. Ezen szolgáltatók saját adatkezelési
        szabályzata alapján önálló adatkezelőként vagy adatfeldolgozóként járhatnak el.
      </p>
      <p>
        Amennyiben Google-szolgáltatás töltődik be, az adatkezelés során előfordulhat Európai Unión kívüli
        adattovábbítás is a szolgáltató megfelelő garanciái mellett.
      </p>

      <h2 id="hozzajarulas">Hozzájárulás kezelése</h2>
      <p>
        A hozzájárulási döntést elsődleges sütiben rögzítjük a választott kategóriákkal, a hozzájárulás
        időpontjával és a tájékoztató verziószámával együtt. A hozzájárulás legfeljebb 12 hónapig érvényes,
        ezt követően a weboldal ismételten megkérdezi a választását.
      </p>
      <p>
        Hozzájárulását bármikor visszavonhatja vagy módosíthatja a weboldal láblécében található
        <strong> Cookie beállítások </strong>
        lehetőségen keresztül. A módosítás a következő oldalbetöltéskor érvényesülhet teljes körűen.
      </p>

      <h2 id="kapcsolat">Kapcsolat</h2>
      <p>
        A cookie-kkal vagy az adatkezeléssel kapcsolatos kérdés esetén az alábbi címen léphet velünk kapcsolatba:
        <strong> {DATA_CONTROLLER_EMAIL}</strong>.
      </p>
    </LegalPage>
  );
}
