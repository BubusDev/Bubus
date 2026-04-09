# Guest Order-Status And Recovery Smoke Test

## Pre-flight

1. Készíts elő egy friss guest rendelést egy ismert guest email címmel.
   Expected result: van rendelési azonosító, guest confirmation email, és a rendelés megjelenik az eredeti böngészőben.
2. Legyen hozzáférésed a guest email postafiókhoz.
   Expected result: a confirmation, status-update és recovery emailek megnyithatók.
3. Készíts elő egy második böngészőt vagy privát ablakot.
   Expected result: cookie nélküli környezetből is tesztelhető a recovery flow.

## 1. Original Browser Guest Order-Status Access

1. Nyisd meg a footerből a `Rendelési állapot` linket az eredeti checkout böngészőben.
   Expected result: a link `/order-status` oldalra visz, nem törött `/account/orders` útvonalra.
2. Ellenőrizd, hogy a guest rendelés megjelenik a listában.
   Expected result: látszik a rendelésazonosító, customer-facing státusz, és ha van, tracking / shipping meta.
3. Nyisd meg a rendelés részletoldalát.
   Expected result: a `/order-status/[orderId]` oldalon látszik az order ID, státusz, tracking szám, szállítási mód és utolsó frissítés ideje, ha rendelkezésre áll.

## 2. Confirmation Email CTA

1. Nyisd meg a guest order confirmation emailt.
   Expected result: a CTA guest flowra mutat, nem auth-only oldalra.
2. Kattints a CTA-ra az eredeti böngészőben.
   Expected result: a CTA `/order-status`-ra érkezik, és a rendelés elérhető.

## 3. Status-Update Email CTA

1. Admin oldalon állíts be egy fulfillment státuszváltozást, ami customer emailt triggerel.
   Expected result: status-update email érkezik a guest email címre.
2. Nyisd meg a status-update emailt, és kattints a CTA-ra az eredeti böngészőben.
   Expected result: a CTA `/order-status`-ra visz, és a guest rendelés elérhető marad.

## 4. Cross-Browser / Device Recovery Happy Path

1. Nyisd meg a `/order-status` oldalt egy másik böngészőben vagy privát ablakban.
   Expected result: a guest rendelés nem látszik automatikusan, és van recovery belépőpont.
2. Menj a `/order-status/recover` oldalra.
   Expected result: megjelenik a rendelésszám + email űrlap.
3. Add meg a helyes guest rendelésszámot és email címet.
   Expected result: generikus sikerüzenet jelenik meg, nem szivárog ki a rendelés létezése.
4. Nyisd meg a recovery emailt, és kattints a linkre ugyanebben az új böngészőben.
   Expected result: a link validálódik, browser access grant jön létre, és a rendszer a `/order-status/[orderId]` oldalra irányít.
5. Menj vissza a `/order-status` oldalra ugyanebben az új böngészőben.
   Expected result: a recovered order most már listázódik.

## 5. Cooldown Behavior

1. Küldj recovery kérelmet egy érvényes guest orderre.
   Expected result: generikus sikerüzenet jelenik meg.
2. Ugyanazzal a rendelésszámmal és emaillel kérj új recovery linket 10 percen belül.
   Expected result: a UI továbbra is generikus választ ad; nem érkezik új recovery email.
3. Ellenőrizd az email fiókot.
   Expected result: csak a korábbi, még érvényes recovery link van használatban.

## 6. Throttle Behavior

1. Ugyanabból a böngészőből/IP-ről küldj több recovery kérelmet rövid időn belül különböző vagy ugyanazon adatokkal.
   Expected result: az első néhány kérés elfogadott, a limit után a UI továbbra is ugyanazt a generikus választ adja.
2. Ellenőrizd az email fiókot.
   Expected result: a throttle után nem jelennek meg új recovery emailek.
3. Ha van log-hozzáférés, ellenőrizd az eventeket.
   Expected result: látszanak `guest_order_recovery_throttle_hit` események.

## 7. Recovery Token Validation Cases

### Valid

1. Kérj új recovery linket, majd nyisd meg azonnal.
   Expected result: sikeres redirect `/order-status/[orderId]?recovered=1` útvonalra.

### Expired

1. Használj egy már lejárt recovery linket.
   Expected result: a rendszer `/order-status/recover?status=expired` oldalra visz, és új link kérhető.

### Already Used

1. Nyiss meg egy recovery linket, majd ugyanazt a linket használd újra.
   Expected result: a rendszer `/order-status/recover?status=already-used` oldalra visz.

### Invalid

1. Nyiss meg egy manipulált vagy kitalált recovery tokent.
   Expected result: a rendszer `/order-status/recover?status=invalid` oldalra visz.

## 8. Observability Checks

1. Ellenőrizd a strukturált recovery eventeket a log sinkben vagy runtime logokban.
   Expected result: megjelennek legalább ezek az események:
   - `guest_order_recovery_request_received`
   - `guest_order_recovery_email_sent`
   - `guest_order_recovery_cooldown_hit`
   - `guest_order_recovery_throttle_hit`
   - `guest_order_recovery_token_validation`
   - `guest_order_recovery_email_failed` hiba esetén
2. Ellenőrizd, hogy az eventek tartalmazzák a szükséges mezőket.
   Expected result: van `event`, `correlationId`, `status`, `result`, valamint a releváns flag mezők (`throttleApplied`, `cooldownApplied`, `tokenValidationSucceeded`).
3. Ellenőrizd, hogy nincs érzékeny adat a logokban.
   Expected result: nincs nyers recovery token, nincs nyers IP cím, nincs teljes email payload dump.

## What To Inspect If A Step Fails

- UI / routing hiba esetén: [page.tsx](/Users/toptop/Projects/Bubus/src/app/order-status/page.tsx), [page.tsx](/Users/toptop/Projects/Bubus/src/app/order-status/[orderId]/page.tsx), [page.tsx](/Users/toptop/Projects/Bubus/src/app/order-status/recover/page.tsx)
- Recovery request / token validáció hiba esetén: [actions.ts](/Users/toptop/Projects/Bubus/src/app/order-status/actions.ts), [order-recovery.ts](/Users/toptop/Projects/Bubus/src/lib/order-recovery.ts)
- Guest access grant / cookie probléma esetén: [order-access.ts](/Users/toptop/Projects/Bubus/src/lib/order-access.ts), [orderAccessToken.ts](/Users/toptop/Projects/Bubus/src/lib/orderAccessToken.ts)
- Email CTA vagy email delivery hiba esetén: [order-confirmation.ts](/Users/toptop/Projects/Bubus/src/lib/email/order-confirmation.ts), [order-status-update.ts](/Users/toptop/Projects/Bubus/src/lib/email/order-status-update.ts), [guest-order-recovery.ts](/Users/toptop/Projects/Bubus/src/lib/email/guest-order-recovery.ts), [email.ts](/Users/toptop/Projects/Bubus/src/lib/auth/email.ts)
- Observability hiány esetén: [order-recovery-observability.ts](/Users/toptop/Projects/Bubus/src/lib/order-recovery-observability.ts)
