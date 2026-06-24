# Chicks Jewelry International + English Audit

## Rövid verdikt

- Külföldi vásárlásra a webshop csak részben áll készen. Külföldi bankkártyás fizetés technikailag működhet Stripe-on keresztül, de a checkout, order model, admin és szállítási logika belföldi/HUF alapokra van építve.
- Angol nyelvre a webshop alacsony szinten áll készen. Nincs locale routing, nincs dictionary/message layer, a root HTML `lang="hu"`, és a storefront/admin/email copy nagy része hardcoded magyar.
- A nagyobb munka összességében az i18n, mert sok komponens, route metadata, termékadat és email érintett. A launchot jobban blokkoló munka viszont a shipping/order adatmodell és jogi-szállítási döntések tisztázása.

## Külföldi vásárlás audit

### Jelenlegi állapot

- Checkout shipping UI két módot kínál: `Foxpost automata` és `Házhozszállítás` (`src/components/checkout/steps/ShippingStep.tsx`).
- Ország mező nincs a checkoutban, API payloadban, Prisma `Order` modellen vagy admin order detailen.
- A házhozszállítás címe egyetlen stringgé áll össze: `utca, irsz. város`. Ez magyar címformátumra optimalizált.
- Telefon mező csak `required`, nincs magyar-specifikus regex. Külföldi számot elvileg be lehet írni.
- Irányítószám mező csak `required`, nincs regex, de cím-UX magyar.
- `Order.shippingAddress` szabad szöveg, emiatt külföldi cím beírható, de nem strukturáltan.
- Stripe PaymentIntent `automatic_payment_methods.enabled = true`, `currency: STRIPE_CURRENCY`, ahol `STRIPE_CURRENCY = "huf"`.
- Order létrehozáskor `currency: "HUF"` fix, árformázás `hu-HU` + `Ft`.
- Kosár szállítási díj jelenleg `0`, nincs országonkénti delivery fee.
- `shippingMethod` default `foxpost`; Foxpost integráció demo/placeholder, mock `BUD001` ponttal.
- Order confirmation email magyar, de a szabad szöveges `shippingAddress`-t megjeleníti.
- Admin order detail mutatja a szállítási címet és módszert, de ország nincs külön.
- ÁSZF és privacy magyar piacra írt: HUF, ÁFA, magyar jog, 2-4 munkanapos belföldi szállítás, Magyar Posta/futár.

### Mi működhet már most külföldi bankkártyával

- Stripe külföldi kártyát elvileg tud kezelni HUF PaymentIntent mellett, ha a Stripe account, payment method és issuer oldalán nincs tiltás.
- A HUF összeg kártyás fizetésnél a vevő bankjánál konvertálódhat.
- A checkout nem validálja magyarra a telefonszámot vagy irányítószámot.
- Házhozszállításnál a címmezőkbe beírható külföldi címrészlet, de ország külön nem mentődik.
- Email visszaigazolásban a cím szövegként megjelenhet.

### Blokkoló pontok

- Nincs `shippingCountry` / ország mező a checkoutban és az `Order` modellen.
- Nincs strukturált cím: ország, postal code, city, address line 1/2 külön mezők hiányoznak.
- Nincs országonkénti shipping method és delivery fee.
- A checkout alapértelmezetten Foxpost, ami belföldi és jelenleg demo/placeholder.
- Foxpost mock ponttal tényleges fulfillment nem indítható.
- `cart.shipping = 0`, ezért külföldi szállítás díjazása nem kezelhető.
- Minden ár HUF/Ft formátumban jelenik meg, nincs több currency vagy locale szerinti árformázás.
- Adminban ország nem látszik, így fulfillment és ügyfélszolgálat oldalról nem kontrollálható.
- Státusz/email copy magyar, külföldi vevőnek nem használható.
- Legal pages nem fedik le nemzetközi/EU szállítást, fizetést, elállást, VAT/számlázást.

### MVP teendők

- Vezess be `shippingCountry` mezőt checkoutban, API payloadban, `Order` modellen és admin detailen.
- Minimum strukturált cím: `shippingAddressLine1`, `shippingAddressLine2`, `shippingPostalCode`, `shippingCity`, `shippingCountryCode`.
- Addig is, ha gyors MVP kell, maradhat `shippingAddress` display string, de ország legyen külön kötelező mező.
- Szállítási módokat válaszd szét: Hungary/Foxpost, Hungary home courier, EU/international courier.
- Foxpost csak HU country mellett legyen választható.
- Legyen országonkénti vagy régiónkénti szállítási díj konfiguráció: HU, EU Zone 1, EU Zone 2, non-EU disabled.
- A cart total számoljon shipping fee-vel fizetés előtt, és ugyanaz menjen Stripe-ba.
- Admin order detailen legyen ország, shipping method, tracking, és lehetőleg shipping fee.
- Confirmation és status emailben jelenjen meg a teljes külföldi cím országként is.
- Checkout oldalon legyen explicit országlista: MVP-re elég `Hungary + selected EU countries`.

### Kockázatok

- Ha ország nélkül enged külföldi rendelést, admin oldalon kézzel kell kitalálni, hova és mennyiért kell szállítani.
- Ingyenes szállítással külföldre veszteséges rendelések jöhetnek.
- Foxpost mock miatt a vevő azt hiheti, létező csomagpontot választott, miközben nincs valós integráció.
- HUF-only checkout működhet, de conversion fee és ár-kommunikáció miatt magasabb customer support kockázat.
- `Order.currency` ugyan létezik, de a termékár, formatPrice, JSON-LD és Stripe flow HUF-ra fixált, ezért több currency nem csak config change.

### Könyvelő/jogi tisztázandók

- EU-n belüli B2C értékesítés VAT/ÁFA kezelése, OSS szükségessége, számlázási beállítások.
- Bruttó árak kommunikációja külföldi vásárlóknak: HUF-only vagy EUR megjelenítés.
- EU és non-EU szállítás vállalható-e, vám/eljárási tájékoztatással.
- Elállás, visszaküldési költség, sérült/egyedi ékszer szabályok angol nyelven.
- Adatkezelési tájékoztató angol verziója, Stripe/courier adatfeldolgozók és harmadik országbeli adattovábbítás.
- Szállítási határidők és felelősségi pontok országonként.

## Angol nyelv audit

### Jelenlegi állapot

- Nincs i18n könyvtár, `messages`, `dictionary`, `locale` config vagy Next locale routing.
- Root layout `html lang="hu"`.
- `middleware.ts` nem kezel locale prefixet.
- `next.config.ts` nem tartalmaz i18n routingot.
- Storefront route-ok magyar és angol keveréket használnak: `/product/[slug]`, `/cart`, `/checkout`, de például `/kulonlegessegek`, `/limitalt-darabok`.
- SEO metadata magyar-only több helyen: `siteDescription`, terms/privacy/faq/contact/product metadata.
- Email template-ek magyar-only, `OrderConfirmationLocale = "hu"`.
- Stripe Elements locale fix `hu`.

### Hardcoded magyar copy-k

- Checkout: stepper, contact/shipping/payment, error message-ek, order summary.
- Cart drawer/page: kosár, szállítás, ingyenes, végösszeg copy.
- Header/footer/nav: Adatkezelés, ÁSZF, Rendeléseim, Kapcsolat, Szállítás, Drágakövek.
- Product detail/listing: termék CTA-k, availability, filter labels, structured data breadcrumb `Főoldal`.
- Account/order status pages: rendelési státusz, visszaküldés, fizetés, szállítás.
- Emails: order confirmation, order status update, refund confirmation/failure, guest recovery.
- Legal pages: terms, privacy, cookies teljesen magyar.
- Admin is also mostly Hungarian. Customer-facing English MVP-hez az admin fordítása nem P0, de angol terméktartalom szerkeszthetősége igen.

### Adatmodell gap-ek

- `Product` csak egy `name`, `shortDescription`, `description`, `badge`, `collectionLabel` mezőt tartalmaz.
- `ProductOption` csak egy `name`, `slug`, `navLabel` mezőt tartalmaz; kategória/kő/szín/stílus/alkalom nem többnyelvű.
- `Specialty` mezők csak egy nyelven vannak: `name`, `slug`, `shortDescription`, image altok.
- Homepage content model csak egy nyelvi mezőkészletet tárol: `title`, `eyebrow`, `body`, `buttonText`, `imageAlt`.
- Gemstone/stone tartalomnál nincs angol mezőpár.
- Product slug history egy slugot kezel; nincs locale-onkénti slug.

### Route/SEO/email/checkout gap-ek

- URL stratégia nincs. MVP-re a legjobb `/en` prefix minden customer-facing route-on.
- Cookie/session alapú nyelvváltó önmagában nem jó SEO-ra és megosztható URL-ekre.
- Product slug kérdés: MVP-ben maradhat magyar slug angol oldalon is, de teljesebb megoldásnál legyen külön `slugEn`.
- Canonical/hreflang nincs.
- JSON-LD `priceCurrency: "HUF"` fix, breadcrumb magyar.
- Email locale nincs eltárolva orderen, ezért fizetés után nem lehet biztosan angol emailt küldeni.
- Checkout hibák magyarok, Stripe Elements locale magyar.
- Legal pagesből nincs angol verzió; angol checkout előtt ez customer-facing compliance gap.

### MVP i18n javaslat

- Válassz URL stratégiát: `/en` prefix az angol storefrontre, magyar marad prefix nélkül vagy legyen `/hu`.
- Root layout `lang` legyen route alapján állítható. Ha App Routerben tisztán akarjátok, érdemes `[locale]` route group vagy middleware-es prefix kezelés.
- Legyen `src/i18n/dictionaries/hu.ts` és `en.ts` vagy hasonló dictionary a customer-facing UI copyra.
- Első dictionary kör: header/nav/footer, cart, checkout, product detail, order confirmation/status, auth/account alap copy, errors.
- Email template-ek kapjanak `locale: "hu" | "en"` támogatást.
- Orderen tárold a `locale` mezőt, hogy confirmation/status/refund email ugyanazon a nyelven menjen.
- Product MVP-hez adj angol mezőket: `nameEn`, `shortDescriptionEn`, `descriptionEn`, opcionálisan `badgeEn`, `collectionLabelEn`.
- ProductOption MVP-hez: `nameEn`, `navLabelEn`, opcionálisan `slugEn`.
- Homepage content MVP-hez: vagy locale mező a content blockokon, vagy párhuzamos `titleEn/bodyEn/...` mezők. Skálázhatóbb a locale-os translation table.
- English MVP-n maradhat HUF price, de árformázás legyen locale-aware: English oldalon például `HUF 12,900` vagy `12,900 Ft`.

## Prioritási roadmap

### P0 — Launch előtt kötelező, ha külföldiek vásárolhatnak

- Ország mező bevezetése checkout + order + admin + email szinten.
- Foxpost tiltása nem-HU országoknál.
- EU/international courier shipping method és díj bevezetése.
- Shipping fee beleszámítása cart totalba és Stripe PaymentIntent amountba.
- Legal/szállítási feltételek frissítése a támogatott országokra.
- Admin order detail ország + teljes cím megjelenítés.
- Checkout copy egyértelműsítése: mely országokba szállítotok.

### P1 — Angol MVP

- `/en` route stratégia és locale resolving.
- Customer-facing dictionary a header/footer/cart/checkout/product/order-status oldalakra.
- Product és ProductOption angol mezők az admin szerkesztésben.
- Email template-ek angol verziója, order locale mentéssel.
- SEO metadata angol verziók és `lang` beállítás.
- English terms/privacy/shipping pages jogásszal/könyvelővel egyeztetve.

### P2 — Kényelmi / skálázható többnyelvűség

- Translation table alapú adatmodell minden fordítható entityre.
- Locale-onkénti slug és slug history.
- Hreflang + canonical teljes sitemap támogatással.
- EUR display price vagy valódi multi-currency pricing.
- Országonkénti shipping rate admin UI.
- Futár/Foxpost/label integrációk valós API-val.
- Admin UI teljes fordítása csak akkor, ha nem magyar operátorok is használják.

## Konkrét következő 10 teendő

1. Döntsétek el, pontosan mely országokba szállít az MVP: javaslat `HU + EU selected countries`, non-EU kikapcsolva.
2. Könyvelővel/jogásszal tisztázzátok VAT/OSS, számlázás, elállás, visszaküldés és EU shipping feltételeit.
3. Definiáljatok shipping zone táblát: országkód, engedélyezett-e, szállítási díj, becsült napok, courier név.
4. Adjatok `shippingCountryCode` mezőt az orderhez, és jelenítsétek meg adminban.
5. Checkout shipping lépésben legyen országválasztó; Foxpost csak `HU` esetén legyen elérhető.
6. Cart/checkout total számoljon shipping fee-vel, és ez menjen Stripe amountba.
7. Order confirmation/status emailbe kerüljön ország és angol nyelvi ág.
8. Válasszatok i18n routingot: javaslat `/en`, customer-facing route-okra prefixszel.
9. Hozzatok létre dictionary-t a checkout/cart/header/footer/product/order-status copykra.
10. Adjátok hozzá az angol termékmezőket és admin szerkesztést legalább product name/shortDescription/description szinten.

## Nem javasolt most

- Ne építsetek teljes multi-currency rendszert az első EU shipping MVP előtt.
- Ne fordítsátok le az admin teljes felületét, ha magyar csapat kezeli.
- Ne vezessetek be locale-onkénti slug rendszert az első angol MVP előtt, ha gyors launch a cél.
- Ne integráljatok egyszerre több futár API-t; előbb legyen stabil ország + díj + kézi fulfillment flow.
- Ne hagyatkozzatok cookie-only nyelvváltásra SEO-s angol oldalhoz.
- Ne engedjetek non-EU rendelést vám/adó/jogi szöveg és operációs folyamat nélkül.
