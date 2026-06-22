# Chicks Jewelry Order & Payment Flow Review

## Rovid verdikt

Overall production readiness: **72/100**.

Eles vasarlast csak kontrollalt, alacsony forgalmu indulassal engednek, folyamatos admin es Stripe Dashboard monitorozassal. A core flow ossze van rakva: DB-alapu kosar, vendeg checkout, Stripe PaymentIntent, webhookos veglegesites, OrderItem snapshot, admin workflow, confirmation/status polling es email lock mechanizmus is van.

A legnagyobb kockazat: **nincs payment elotti stock reservation**, ezert parhuzamos checkout eseten a vevo mar fizethet, majd a webhook `STOCK_UNAVAILABLE` rendelest hagy maga utan, amit manualisan/refunddal kell rendezni.

A legerosebb resz: a fizetes utani veglegesites idempotens iranyba van epitve (`FINALIZING` claim, `PAID` skip, amount check, promo ujraellenorzes, cart cleanup, email lock), es a vendeg order access nem sima order ID alapjan mukodik.

Kulso ellenorzes: a Stripe HUF amount modellnel az official Stripe currency docs alapjan a charge amount minor unitban megy, a 175 HUF minimum pedig `17500` minor unit; a kodbeli `HUF * 100` modell ezzel osszhangban van. Forras: https://docs.stripe.com/currencies

## End-to-end flow terkep

### A. Termekbol kosarba

1. A `/product/[slug]` oldal a `resolveProductBySlug`, `getRelatedProducts`, `getCategoryDefinition` helperbol dolgozik.
2. A PDP a `ProductDetailView` komponenst rendereli.
3. A termek csak akkor rendelheto, ha `isProductOutOfStock(product)` hamis. Ez vegul az inventory helperen keresztul azt nezi, hogy nincs archivalt allapot es van stock.
4. A UI fixen `1 db` mennyiseget mutat PDP-n; a kosarban lehet novelni/csokkenteni.
5. Az add-to-cart server action: `addToCartAction`.
6. Vendeg usernel `guest_cart_token` httpOnly cookie jon letre; loginolt usernel `Cart.userId` alapjan megy.
7. A kosar DB-ben el: `Cart`, `CartItem`, unique `cartId_productId`.
8. A szerver oldali `addProductToResolvedCart` ujraolvassa a termeket, `getProductAvailabilitySnapshot` alapjan tiltja az archived/draft/incomplete/sold out termeket, es a mennyiseget `availableToSell`-re clampeli.

### B. Kosar

1. A `/cart` oldal `getRequestCart()`-bol tolti a cart summaryt.
2. A price mindig az aktualis `Product.price`-bol jon, nem cart snapshotbol.
3. A cart summary ujraszamolja a product lifecycle/stock allapotot.
4. Archived/incomplete/out_of_stock itemek unavailable-kent jelennek meg, a checkout link tiltott, ha van unavailable vagy stockot meghalado item.
5. Quantity update: `updateCartItemQuantityAction`, ugyanahhoz a cart ownerhez kotve, availability checkkel es `availableToSell` clamp-pel.
6. Remove: `removeCartItemAction`, cartId scope-pal.
7. Total: `subtotal + shipping - discount`, shipping jelenleg fix `0`, vagyis ingyenes.
8. Promo a carton van (`Cart.promoCodeId`), carton es checkout payment stepben is megjelenik a `PromoCodeForm`.

### C. Checkout

1. A `/checkout` oldal ures kosarra EmptyState-et mutat, nem indit fizetest.
2. Ha van cart, `CheckoutClient` kezeli a 3 lepest: contact, shipping, payment.
3. Logged-in, email-verified usernel a contact step atugorhato; profilbol jon name/phone/defaultShippingAddress elotoltes.
4. Guest checkout van: `checkout_session` httpOnly cookie tarolja az emailt es `isGuest` flaget.
5. Contact validacio `zod`-dal server actionben: `submitContactStep`.
6. Shipping validacio reszben HTML required mezokkel, reszben PaymentIntent route-ban: email/name/phone/address kotelezo.
7. Foxpost jelenleg demo/placeholder: a UI mock `BUD001` pontot allit be, nincs valodi Foxpost widget/API.
8. Order a PaymentIntent inicializalasakor jon letre, payment elott, `PENDING` paymentStatusszal.
9. Stock payment elott ellenorzodik, de nem foglalodik.
10. Hibak: missing email, invalid shipping, empty cart, unavailable cart items, insufficient stock, promo hibak, Stripe config hiba, amount minimum alatti osszeg.

### D. Stripe PaymentIntent

1. Route: `/api/checkout/payment-intent`.
2. Core helper: `initializeStripeCheckout` in `src/lib/checkout.ts`.
3. Amount: `cart.total` HUF stored integer -> `toStripeAmount(total, "huf")`, jelenleg `total * 100`.
4. Currency: `huf`.
5. Metadata: `orderId`, `orderNumber`, `correlationId`, `userId`, `guestToken`, `cartId`.
6. `receipt_email`: checkout email.
7. `client_secret` JSON-kent megy vissza a frontendnek.
8. Ha ugyanazt az `orderId`-t kuldi vissza a PaymentStep, a route megprobalja frissiteni/reuse-olni az elozo PaymentIntentet.
9. Ha nincs `orderId` a bodyban, uj pending order es uj PaymentIntent keszulhet. Frontend single tabon ezt az `isInitializing` es lokalis `orderId` csokkenti, de cross-tab/idempotency key nincs.
10. Stripe create/update hivasnal explicit idempotency key nincs.

### E. Stripe webhook

1. Route: `/api/stripe/webhook`, `runtime = "nodejs"`.
2. Signature verification van: `stripe.webhooks.constructEvent(payload, signature, webhookSecret)`.
3. Kezelt eventek:
   - `payment_intent.processing`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `payment_intent.succeeded`
   - `refund.created`
   - `refund.updated`
   - `refund.failed`
4. Succeeded eseten `finalizePaidOrder` fut.
5. Failed/canceled/processing eseten `markOrderPaymentState`, de `PAID` ordert nem ir felul.
6. Refund webhook a `ReturnRequest.stripeRefundId` alapjan reconcile-ol, ha local refund status pending.
7. Webhook finalization idempotens jellegu: `PAID` eseten skip, `FINALIZING` claim updateMany-nel, amount mismatch check, promo ujraellenorzes, inventory transaction.
8. Hibak es allapotok strukturalt JSON console logokkal mennek `logCheckoutEvent`-en keresztul.

### F. Order letrehozas / allapotok

1. Order payment elott jon letre `PENDING` statusban.
2. Payment status enum: `PENDING`, `PROCESSING`, `FINALIZING`, `PAID`, `FAILED`, `CANCELED`, `STOCK_UNAVAILABLE`.
3. Customer-facing `status` string kulon mezo, pl. "Fizetes folyamatban", "Fizetve", "Keszlethiany".
4. Admin workflow kulon `internalStatus`: `received`, `in_production`, `packed`, `label_ready`, `shipped`, `closed`, `issue`.
5. OrderItem snapshotol: `productId`, `productName`, `productSlug`, `imageUrl`, `unitPrice`, `quantity`.
6. A regi order nev/ar/kep szinten megmarad, de `OrderItem.productId` cascade relation a Producthoz kotott, igy product torles eseten az order item is torlodne. Archivalt product mellett megmarad.
7. Stale pending/processing/failed checkout order cleanup van 24 oras ablakkal, cron route-tal es inicializalas elotti scoped cleanup-pal.

### G. Inventory / stock

1. Stock a PaymentIntent elott csak ellenorzodik.
2. Reservation nincs: `reservedQuantity` szerepel a modelben, de checkout nem novel/csokkent reservationt.
3. Stock a webhook/finalization utan csokken `applyCompletedOrderInventory`-ban.
4. A csokkentes transactionben tortenik, `updateMany` ved `stockQuantity >= quantity` feltetellel.
5. Ha stock kozben elfogyott, order `STOCK_UNAVAILABLE`, status "Keszlethiany" vagy "Termek nem elerheto".
6. Failed payment nem allit vissza stockot, mert elotte nincs reservation.
7. Refund nem allit vissza stockot automatikusan.
8. Overselling ellen finalization-time vedelem van, de a vasarlo mar fizethet, mire kiderul a stock hiba.

### H. Confirmation / order status

1. Confirmation route: `/checkout/confirmation/[orderId]`.
2. Hozzaferes: `getAccessibleCheckoutOrder`.
3. Logged-in user sajat `userId` alapjan fer hozza.
4. Vendeg a `guest_order_access` httpOnly cookie tokenjevel fer hozza; a DB-ben hash-elt token van.
5. Confirmation card pending status eseten pollolja `/api/orders/[orderId]/status`.
6. A status API hozzaferes ellenorzes utan Stripe-bol is reconcile-ol pending ordernel.
7. `/order-status` vendeg listat mutat az adott bongeszo cookie tokenjei alapjan.
8. `/order-status/recover` orderNumber + email alapjan recovery emailt kuld, rate/cooldown logikaval.
9. Recovery token egyszer hasznalatos, 1 oraig ervenyes, majd 30 napos ACCESS tokent ad.

### I. User orders

1. `/orders` csak loginolt account usernek erheto el.
2. `getOrdersForUser(user.id)` csak sajat `userId` szerinti ordereket ad.
3. `/orders/[orderId]` `getOrderForUser(user.id, orderId)` alapjan vedett.
4. User order detail mutat statuszt, fizetest, shipping adatokat, item snapshotokat, return request formot es reorder actiont.
5. Mas user orderje `notFound`.

### J. Email

1. Order confirmation email van: `sendOrderConfirmationEmailIfNeeded`.
2. Payment sikeres finalization utan megy, nem order letrehozaskor.
3. Email lock mezok vannak: `confirmationEmailSendingAt`, `confirmationEmailSentAt`.
4. Guestnek es authenticated usernek is megy, ha van recipient email.
5. Guest confirmation email nem tartalmaz egyedi access tokent; a `/order-status` oldalt linkeli, amely ugyanazon bongeszo cookie-jara epul. Mas eszkozon recovery flow kell.
6. Productionben Resend kuld, ha `RESEND_API_KEY` es `AUTH_EMAIL_FROM` vagy `EMAIL_FROM` be van allitva.
7. Developmentben az email kuldes skip/log.
8. Production missing email env eseten `EmailDeliveryError` dobodik, de a paid order finalization mar megtortent; az email sikertelen marad es ujraprobalhato lock nelkul.
9. Admin status update es refund confirmation/failure email is van.

### K. Admin order handling

1. Admin orders route: `/admin/orders`.
2. Lista csak `paymentStatus: PAID` orderket mutat, exceptions filterben `STOCK_UNAVAILABLE` is megjelenhet.
3. Detail: `/admin/orders/[id]` vevoadat, itemek, return requestek, workflow history, assignment, internal note, status email preview/resend.
4. Status update: single es bulk action, `requireAdminUser` vedessel.
5. Bulk transition csak `PAID` orderre enged status lepest, kiveve issue transition validacioja is `paymentStatus === PAID`.
6. Return/refund admin flow van: request status, assignment, Stripe refund trigger, reconcile, refund webhook.
7. Refund nem modosit Order.paymentStatus-t `REFUNDED` statusra, mert ilyen enum nincs; refund allapot ReturnRequest szinten el.

## Fajl- es route terkep

### Storefront route-ok

- `src/app/(storefront)/product/[slug]/page.tsx`
- `src/components/shop/ProductDetailView.tsx`
- `src/app/(storefront)/cart/page.tsx`
- `src/app/(storefront)/checkout/page.tsx`
- `src/app/(storefront)/checkout/confirmation/[orderId]/page.tsx`
- `src/app/(storefront)/orders/page.tsx`
- `src/app/(storefront)/orders/[orderId]/page.tsx`
- `src/app/(storefront)/order-status/page.tsx`
- `src/app/(storefront)/order-status/[orderId]/page.tsx`
- `src/app/(storefront)/order-status/recover/page.tsx`

### API route-ok

- `src/app/api/cart/route.ts`
- `src/app/api/checkout/payment-intent/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/orders/[orderId]/status/route.ts`
- `src/app/api/internal/checkout/cleanup/route.ts`
- `src/app/api/internal/returns/refund-reconciliation/route.ts`

### Checkout/cart komponensek

- `src/components/checkout/CheckoutClient.tsx`
- `src/components/checkout/StepIndicator.tsx`
- `src/components/checkout/steps/ContactStep.tsx`
- `src/components/checkout/steps/ShippingStep.tsx`
- `src/components/checkout/steps/PaymentStep.tsx`
- `src/components/checkout/StripeCheckoutForm.tsx`
- `src/components/checkout/ConfirmationStatusCard.tsx`
- `src/components/cart/PromoCodeForm.tsx`
- `src/components/cart/CartDrawer.tsx`

### Core libek

- `src/lib/account.ts`
- `src/app/(storefront)/account/actions.ts`
- `src/app/actions/checkout.ts`
- `src/lib/cartToken.ts`
- `src/lib/checkoutSession.ts`
- `src/lib/checkout.ts`
- `src/lib/checkout-cleanup.ts`
- `src/lib/checkout-observability.ts`
- `src/lib/stripe.ts`
- `src/lib/inventory.ts`
- `src/lib/product-lifecycle.ts`
- `src/lib/catalog.ts`
- `src/lib/promo-codes.ts`
- `src/lib/order-access.ts`
- `src/lib/orderAccessToken.ts`
- `src/lib/order-status.ts`
- `src/lib/order-recovery.ts`
- `src/lib/order-recovery-observability.ts`
- `src/lib/order-status-email.ts`
- `src/lib/return-refund-reconciliation.ts`

### Email

- `src/lib/auth/email.ts`
- `src/lib/email/order-confirmation.ts`
- `src/lib/email/order-status-update.ts`
- `src/lib/email/guest-order-recovery.ts`
- `src/lib/email/refund-confirmation.ts`
- `src/lib/email/refund-failure.ts`

### Admin

- `src/app/(admin)/admin/orders/page.tsx`
- `src/app/(admin)/admin/orders/[id]/page.tsx`
- `src/app/(admin)/admin/orders/actions.ts`
- `src/components/admin/AdminOrdersTableClient.tsx`
- `src/app/(admin)/admin/returns/page.tsx`
- `src/app/(admin)/admin/returns/[id]/page.tsx`
- `src/app/(admin)/admin/returns/actions.ts`
- `src/components/admin/AdminReturnsTableClient.tsx`
- `src/lib/admin-order-workflow.ts`
- `src/lib/admin-workflow-history.ts`

### Prisma modellek

- `User`
- `Product`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `InventoryEvent`
- `PromoCode`
- `PromoCodeRedemption`
- `PromoCodeGrant`
- `GuestOrderAccessToken`
- `GuestOrderRecoveryRequest`
- `ReturnRequest`
- `OrderWorkflowHistory`
- `ReturnRequestHistory`

## Pontszamok 0-100

| Terulet | Pont | Indoklas |
| --- | ---: | --- |
| Product -> Cart flow | 82 | DB-alapu, guest/login mukodik, szerveroldali availability check van. PDP quantity fix 1 db, UX egyszeru, de eleg biztonsagos. |
| Cart robustness | 78 | Ujraszamolja arat/stockot, tiltja unavailable checkoutot, promo validacio van. Shipping fix 0 es nincs cart snapshot, de ez elfogadhato. |
| Checkout UX | 68 | Haromlepeses flow mukodik, guest checkout van. Foxpost csak demo placeholder, shipping validacio reszben kliensoldali, error recovery alap. |
| PaymentIntent / Stripe integration | 74 | Metadata, amount, client_secret, reuse by orderId rendben. Explicit idempotency key nincs, cross-tab duplikacio lehet. |
| Webhook handling | 84 | Signature verification, succeeded/failed/processing/canceled, idempotens finalization, amount check, structured log. Jo alap. |
| Order status model | 76 | Payment status es internal workflow kulon van. Nincs `REFUNDED/PARTIALLY_REFUNDED` order payment status, refund kulon ReturnRequest szinten el. |
| Inventory safety | 58 | Transactional decrement ved oversell ellen finalizationkor, de reservation nincs, fizetes utani stock failure lehet. |
| Guest order access | 82 | Cookie + hash token + recovery flow, cooldown/throttle. Email confirmation nem ad direkt egyedi linket, mas eszkozre recovery kell. |
| User orders | 86 | Sajatgepelt `userId` vedes, sajat list/detail, return request, reorder. |
| Email confirmation | 72 | Payment utan megy, lock van, guest/auth mukodik. Missing production email env fizetett order utan email failuret okoz, nincs UI/admin retry confirmation emailre. |
| Admin order handling | 78 | Lista/detail/status/bulk/history/assignment/status email/refund kapcsolodas eros. Csak PAID lista alap miatt pending/failed lathatosag korlatozott. |
| Overall order-payment production readiness | 72 | A flow mukodo es sok vedelem van, de stock reservation, idempotency, valodi shipping/Foxpost es refund/order status lezartabb modell kell production magabiztossaghoz. |

## P0/P1/P2 problemak

### P0 - Kritikus

#### P0.1 Fizetes utani stock failure lehet reservation hianya miatt

- Erintett fajlok: `src/lib/checkout.ts`, `src/lib/inventory.ts`, `prisma/schema.prisma`
- Problema: PaymentIntent letrehozaskor csak ellenorzes van, stock reservation nincs. A keszlet csak `payment_intent.succeeded` utan csokken.
- Miert baj: ket vevo egyszerre fizethet ugyanarra az utolso darabra; a masodik order `STOCK_UNAVAILABLE` lesz, mikozben a payment mar sikeres lehet.
- Javasolt javitas: pending order letrehozaskor transactional reservation `reservedQuantity` novelese, TTL cleanup/release, failed/canceled release, paid finalizationkor reserved -> sold conversion.
- Effort: L

#### P0.2 Nincs explicit Stripe idempotency key checkout inicializalasnal

- Erintett fajlok: `src/app/api/checkout/payment-intent/route.ts`, `src/lib/checkout.ts`, `src/components/checkout/steps/PaymentStep.tsx`
- Problema: ugyanarra a cart/checkout szandekra cross-tab vagy retry esetben uj order + uj PaymentIntent keszulhet, ha a frontend meg nem kapott/mentett `orderId`-t.
- Miert baj: dupla pending order, dupla fizetesi probalkozas, ugyfelszolgalati zavart es keszletversenyt okozhat.
- Javasolt javitas: checkout-session vagy cart alapu idempotency kulcs, reusable active draft order keresese `orderId` nelkul is cart/owner/email scope-ban, Stripe idempotencyKey hasznalata create-nel.
- Effort: M

#### P0.3 Stock unavailable paid payment automatikus refund/kompenzacio nelkul marad

- Erintett fajlok: `src/lib/checkout.ts`, `src/app/(admin)/admin/orders/page.tsx`, `src/app/(admin)/admin/returns/actions.ts`
- Problema: `STOCK_UNAVAILABLE` order manualis ellenorzesre kerul, de nincs automatikus refund vagy dedikalt payment exception workflow.
- Miert baj: penz bejohet, rendeles nem teljesitheto, a rendezest adminnak kell eszrevennie es manualisan inteznie.
- Javasolt javitas: kulon payment exception queue, admin alert, egykattintasos refund stock-unavailable orderre, es audit trail.
- Effort: M

### P1 - Fontos

#### P1.1 Foxpost integracio demo placeholder

- Erintett fajlok: `src/components/checkout/steps/ShippingStep.tsx`, `src/app/(storefront)/checkout/page.tsx`
- Problema: a csomagpont valasztas mock `BUD001` erteket allit be.
- Miert baj: eles szallitashoz nem hasznalhato, rossz cimke/fulfillment adatot okoz.
- Javasolt javitas: valodi Foxpost widget/API, pont nev/cim snapshot, adminban label/tracking workflow.
- Effort: L

#### P1.2 Admin order lista alapbol csak PAID ordereket mutat

- Erintett fajlok: `src/app/(admin)/admin/orders/page.tsx`, `src/components/admin/AdminOrdersTableClient.tsx`
- Problema: `PENDING`, `FAILED`, `CANCELED`, `PROCESSING` order nincs normal listaban, csak `STOCK_UNAVAILABLE` jelenik meg exceptions alatt.
- Miert baj: fizetesi problema vagy pending beragadas admin oldalon kevesbe lathato.
- Javasolt javitas: payment status filterek es payment exception dashboard.
- Effort: M

#### P1.3 Confirmation email guest linkje nem hordoz recovery/access tokent

- Erintett fajlok: `src/lib/email/order-confirmation.ts`, `src/lib/order-recovery.ts`, `src/lib/orderAccessToken.ts`
- Problema: guest email `/order-status` linket ad, ami csak ugyanabban a bongeszoben mukodik cookie-val.
- Miert baj: mas eszkozrol/email kliensbol nyitva a vevo nem latja az ordert, recovery flow kell.
- Javasolt javitas: confirmation emailbe rovid eletu signed/recovery link vagy "masik eszkozon" CTA kozvetlen tokennel.
- Effort: M

#### P1.4 Production email env hiba fizetett order utan derul ki

- Erintett fajlok: `src/lib/auth/email.ts`, `src/lib/checkout.ts`
- Problema: missing Resend/from config eseten confirmation email failure logolodik, de nincs admin retry UI a confirmation emailhez.
- Miert baj: vevo visszaigazolas nelkul maradhat sikeres fizetes utan.
- Javasolt javitas: startup/admin health check, confirmation email resend action, failed email queue jelzes.
- Effort: M

#### P1.5 Refund nem jelenik meg order payment statusban

- Erintett fajlok: `prisma/schema.prisma`, `src/lib/return-refund-reconciliation.ts`, `src/app/(storefront)/orders/[orderId]/page.tsx`
- Problema: refund status ReturnRequest szinten el, OrderPaymentStatusban nincs `REFUNDED` vagy `PARTIALLY_REFUNDED`.
- Miert baj: user/admin order osszkepben nem egyertelmu, hogy a fizetett order mar vissza lett-e teritve.
- Javasolt javitas: order-level refund summary mezok vagy payment status bovites, admin/user badge.
- Effort: M

#### P1.6 Promo redemption es stock finalization payment utan tortenik

- Erintett fajlok: `src/lib/checkout.ts`, `src/lib/promo-codes.ts`
- Problema: promo ujraellenorzes a webhookban is megtortenik; ha kozben limit betelik, paid payment utan `promo_redemption_failed` lehet.
- Miert baj: vevo fizetett, de order failed/promo failed statusba eshet.
- Javasolt javitas: promo reservation/claim PaymentIntent letrehozaskor, release stale/failed eseten.
- Effort: M

### P2 - Polish

#### P2.1 Shipping fee jelenleg mindig ingyenes

- Erintett fajlok: `src/lib/account.ts`, `src/lib/checkout.ts`, `src/app/(storefront)/checkout/page.tsx`
- Problema: shipping 0, copy szerint checkoutban veglegesul, de nincs valodi szallitasi dij logika.
- Javasolt javitas: shipping method alapjan dij, Order snapshotban shipping fee.
- Effort: M

#### P2.2 PDP mennyiseg fixen 1 db

- Erintett fajlok: `src/components/shop/ProductDetailView.tsx`
- Problema: termekoldalon nincs quantity selector.
- Javasolt javitas: optional quantity selector `availableToSell` maxszal.
- Effort: S

#### P2.3 Confirmation polling 2.5 sec fix interval

- Erintett fajlok: `src/components/checkout/ConfirmationStatusCard.tsx`
- Problema: nincs backoff/timeout allapot.
- Javasolt javitas: exponential backoff vagy max retry utan customer support CTA.
- Effort: S

#### P2.4 Invoice "hamarosan"

- Erintett fajlok: `src/app/(storefront)/orders/[orderId]/page.tsx`
- Problema: szamla gomb csak placeholder.
- Javasolt javitas: szamla link/integracio vagy gomb eltavolitasa, amig nincs kesz.
- Effort: S/M

#### P2.5 Order number random 4 jegyu suffix

- Erintett fajlok: `src/lib/checkout.ts`
- Problema: napi 9000 kombinacio, unique constraint ved, de retry nincs explicit collisionre.
- Javasolt javitas: collision retry vagy sequence.
- Effort: S

## Mit nem tudtam biztosan megallapitani

- Stripe Dashboard webhook endpoint productionben valoban be van-e kotve.
- Stripe live/test kulcsok, payment method konfiguracio, Apple Pay/Google Pay domain verification.
- Resend production domain/from verifikacio es deliverability.
- Valodi Foxpost szerzodes/API/widget elerhetoseg.
- CRON_SECRET-tel vedett checkout cleanup route production schedulerbol fut-e.
- Production database izolacios szint es Prisma transaction timeout/lock viselkedes nagy terheles alatt.
- Van-e monitoring/alerting a structured checkout logokra.
- Vannak-e valodi inventory operation folyamatok manualis stock korrekciora.

## Kovetkezo 10 konkret teendo

1. Bevezetni stock reservationt `reservedQuantity` hasznalataval PaymentIntent/order draft letrehozaskor.
2. Checkout idempotency: cart/session/order alapu single active draft es Stripe idempotency key.
3. Stock-unavailable paid payment admin exception queue + refund action + alert.
4. Valodi Foxpost widget/API es shipping point snapshot.
5. Admin payment status filterek: pending/processing/failed/canceled/stock issue.
6. Confirmation email resend/admin retry es email delivery health check.
7. Guest confirmation emailbe recovery/access link, nem csak cookie-alapu `/order-status`.
8. Promo reservation vagy finalization elotti claim, hogy paid-after-promo-fail ne legyen.
9. Order-level refund summary/status megjelenites usernek es adminnak.
10. Checkout cleanup cron production bekotes es monitoring ellenorzese.

## Check lista ehhez a reviewhoz

Kert checkek:

- `npm run lint`
- `npx tsc --noEmit`
- `npx prisma validate`
- `npm run build`

Playwright teszt nem keszul es nem fut.
