# Chicks Jewelry Stock Reservation Notes

## Mikor foglalodik a stock

Stock reservation a `/api/checkout/payment-intent` hivas kozben tortenik, a draft order es OrderItem snapshot letrehozasa utan, de a Stripe PaymentIntent sikeres visszaadasa elott.

A reservation nem csokkenti a `stockQuantity` mezot. Csak a `Product.reservedQuantity` no a rendelt mennyiseggel.

Out-of-stock kosarral a vevo nem tud fizetest inditani: a cart es checkout is a `stockQuantity - reservedQuantity` alapu elerheto keszletet nezi, a PaymentIntent inicializalas pedig szerveroldalon is ujra ellenoriz.

Gyorsan forgo, limitált keszletnel ez core ecommerce vedelem: a cel nem egy exception flow epitese, hanem hogy a race condition mar fizetes elott megalljon.

## Atomic vedelem

A foglalas termekenkent atomikus SQL update-tel tortenik:

- product legyen `ACTIVE`
- `archivedAt` legyen `null`
- `stockQuantity - reservedQuantity >= requestedQuantity`

Ha ket checkout ugyanarra az utolso darabra fut ra, csak az egyik reservation update sikerul. A masik `INSUFFICIENT_STOCK` hibat kap, es nem kap sikeres PaymentIntentet.

## TTL

Reservation TTL: **30 perc**.

Uj Order mezok:

- `guestCartToken`
- `stockReservedAt`
- `stockReservationExpiresAt`
- `stockReservationReleasedAt`
- `stockReservationCompletedAt`

Prisma migration:

- `prisma/migrations/20260621120000_stock_reservations/migration.sql`

## Mikor release-el

Reservation release tortenik:

- `payment_intent.payment_failed` webhook eseten
- `payment_intent.canceled` webhook eseten
- stale checkout cleanup eseten, ha a reservation TTL lejart
- draft order ujrafelhasznalasakor, mielott az aktualis cart alapjan uj reservation keszul
- finalization stop eseten, ha az order nem lesz `PAID` (amount mismatch, promo failure, stock unavailable)

Release idempotens: csak olyan ordert enged el, amelynek van aktiv reservationje, nincs completed/released timestampje, es nem `PAID`.

## Mikor decrementel

Sikeres `payment_intent.succeeded` finalization soran:

- `reservedQuantity` csokken
- `stockQuantity` csokken
- `stockReservationCompletedAt` beirodik
- Order `PAID` lesz
- `InventoryEvent` tovabbra is `ORDER_COMPLETED` tipusban rogzul

Webhook retry nem decrementel duplan, mert `PAID` ordert a finalization skipeli, a reservation complete pedig csak egyszer claimelheto.

## Cart available stock

A global available stock tovabbra is `stockQuantity - reservedQuantity`.

Sajat aktiv checkout reservationnel a cart summary visszaadja a sajat reservation mennyiseget az availability szamolashoz:

- logged-in usernel `userId`
- guest usernel `guestCartToken`

Ez megakadalyozza, hogy checkout refresh utan a vevo sajat foglalasa miatt tunjon unavailable-nek a kosara.

## Kesobbre maradt

- Automatikus refund stock/payment exception esetekre.
- Promo reservation.
- Foxpost eles integracio.
- Kulon admin payment exception dashboard.

## STOCK_UNAVAILABLE szerepe

`STOCK_UNAVAILABLE` most mar csak fallback/exception allapot. Normal flow-ban reservation miatt a masodik vevo mar PaymentIntent elott blokkolodik, ezert sikeres fizetes utan nem varhato keszlethiany.

Nincs automatic refund, es ebben a korben nem is cel. Ha ilyen fallback allapot megis elofordul, az admin manualisan kezeli.
