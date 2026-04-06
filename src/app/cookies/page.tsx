import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Irányelv — Bubus",
  description: "Tájékoztató a Bubus webáruház által használt cookie-król.",
};

const sections = [
  { id: "mi-a-cookie", title: "Mi az a cookie?" },
  { id: "cookie-tipusok", title: "Cookie típusok" },
  { id: "harmadik-fel", title: "Harmadik feles cookie-k" },
  { id: "beallitasok", title: "Cookie beállítások" },
];

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Jogi dokumentum"
      title="Cookie Irányelv"
      lastUpdated="2025. január 1."
      sections={sections}
    >
      <p>
        A Bubus webáruház cookie-kat (sütiket) használ a felhasználói élmény javítása és a weboldal
        működésének biztosítása érdekében. Ez az irányelv tájékoztat a használt cookie-k típusairól
        és céljairól.
      </p>

      <h2 id="mi-a-cookie">Mi az a cookie?</h2>
      <p>
        A cookie egy kis szövegfájl, amelyet a böngészője tárol az eszközén, amikor meglátogatja
        weboldalunkat. A cookie-k segítenek megjegyezni a preferenciáit, és javítják a böngészési
        élményt.
      </p>

      <h2 id="cookie-tipusok">Cookie típusok</h2>
      <h3>Szükséges cookie-k</h3>
      <p>
        Ezek a cookie-k a weboldal alapvető működéséhez szükségesek, és nem tilthatók le. Ilyenek
        például a munkamenet-azonosítók, a kosár tartalma és a bejelentkezési állapot.
      </p>
      <ul>
        <li><strong>session:</strong> Munkamenet azonosítója — munkamenet végéig</li>
        <li><strong>cart:</strong> Kosár tartalma — 7 nap</li>
        <li><strong>csrf:</strong> Biztonsági token — munkamenet végéig</li>
      </ul>

      <h3>Funkcionális cookie-k</h3>
      <p>
        Ezek a cookie-k megjegyzik a preferenciáit (pl. pénznem, nyelv), hogy személyre szabottabb
        élményt nyújthassunk.
      </p>
      <ul>
        <li><strong>preferences:</strong> Felhasználói beállítások — 1 év</li>
      </ul>

      <h3>Analitikai cookie-k</h3>
      <p>
        Ezekkel a cookie-kkal megértjük, hogyan használják a látogatók az oldalunkat, és hogyan
        fejleszthetjük azt. Az adatokat anonimizált formában kezeljük.
      </p>
      <ul>
        <li><strong>_vercel_insights:</strong> Oldallátogatási statisztikák — 1 év</li>
      </ul>

      <h2 id="harmadik-fel">Harmadik feles cookie-k</h2>
      <p>
        A Stripe fizetési szolgáltató saját cookie-kat helyezhet el a fizetési folyamat során,
        kizárólag a biztonságos fizetés céljából. Ezekre a Stripe adatvédelmi irányelvei
        vonatkoznak.
      </p>

      <h2 id="beallitasok">Cookie beállítások</h2>
      <p>
        A nem szükséges cookie-kat bármikor letilthatja böngészője beállításaiban, vagy az oldal
        alján található <strong>Cookie beállítások</strong> linkre kattintva. Felhívjuk figyelmét,
        hogy egyes funkciók letiltás esetén nem működnek megfelelően.
      </p>
      <p>
        Kérdés esetén írjon nekünk: <strong>hello@bubus.hu</strong>
      </p>
    </LegalPage>
  );
}
