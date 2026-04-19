# Chicks Jewelry Webshop Handoff

Utolsó frissítés: 2026-04-19

Ez a dokumentum fejlesztői átvételhez készült. A projekt egy Next.js alapú, admin felülettel és Stripe checkouttal rendelkező ékszer webshop.

## Rövid státusz

- Production domain: `https://www.chicksjewelry.com`
- Vercel project: `bubuswebshop`
- Framework: Next.js App Router, React 19, TypeScript
- Database: PostgreSQL/Neon Prisma ORM-mel
- Auth: Auth.js / NextAuth v5 beta
- Payments: Stripe PaymentIntent + webhook alapú order finalization
- File storage: Vercel Blob + helyi fallback néhány admin upload flow-ban
- Admin route root: `/admin`
- Storefront route root: `/`

Jelenleg a webshop core részei működnek: terméklista, kategóriaoldalak, termékoldal, kosár, checkout, rendelés státusz, admin termékkezelés, tartalomkezelés, rendelés workflow, kuponok, visszaküldések, specialty/különlegességek és kezdőlap modulok.

## Fontos parancsok

```bash
npm run dev
npm run lint
npm run build
npm run db:migrate:deploy
npm run db:seed
npm run db:seed:local-auth
```

Production build Vercelen:

```bash
npm run vercel-build
```

Ez futtatja:

```bash
npm run db:migrate:deploy && npm run build
```

## Környezeti változók

Lásd még: `README.md` és `.env.example`.

Kritikus env kulcsok:

- `Bubus_DATABASE_URL`
- `Bubus_DATABASE_URL_UNPOOLED`
- `AUTH_URL`
- `AUTH_SECRET`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- `RESEND_API_KEY`
- `AUTH_EMAIL_FROM`

Fontos: a Prisma kliens a custom `Bubus_DATABASE_URL` változót használja, nem a standard `DATABASE_URL`-t. A runtime DB kliens itt van:

- `src/lib/db.ts`

## Fő use case-ek

### Storefront

- Kezdőlap böngészése
- Kategóriaoldalak böngészése, szűrés, keresés a filter panelen
- Termékoldal megnyitása
- Kosár kezelés
- Stripe checkout
- Rendelés visszaigazolás és order status
- Felhasználói regisztráció, belépés, profil, rendeléseim
- Kedvencek
- Kuponok
- Kövek információs oldal
- Specialty/különlegességek oldalak

Fontos storefront route-ok:

- `/`
- `/[category]`, például `/bracelets`
- `/product/[slug]`
- `/cart`
- `/checkout`
- `/checkout/confirmation/[orderId]`
- `/order-status`
- `/orders`
- `/favourites`
- `/stones`
- `/special-edition`
- `/kulonlegessegek`
- `/kulonlegessegek/[slug]`

### Admin

Admin belépés:

- `/admin/sign-in`

Admin fő route-ok:

- `/admin`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/[id]/edit`
- `/admin/products/archive`
- `/admin/merchandising`
- `/admin/orders`
- `/admin/returns`
- `/admin/promo-codes`
- `/admin/content`
- `/admin/content/homepage`
- `/admin/content/homepage-showcase`
- `/admin/content/stones`
- `/admin/content/specialties`
- `/admin/content/announcement`
- `/admin/settings`

Admin layout/auth:

- `src/app/(admin)/admin/layout.tsx`
- `src/components/admin/AdminResponsiveShell.tsx`
- `src/components/admin/AdminSidebar.tsx`
- `src/lib/auth.ts`

## Fontos megvalósítások

### Termék lifecycle

A storefront nem minden terméket mutat. A láthatóság/publish readiness több mezőtől függ:

- `status: ACTIVE`
- `archivedAt: null`
- név, slug, ár, rövid leírás, leírás, badge, collectionLabel kitöltve
- legalább egy kép

Fő fájl:

- `src/lib/product-lifecycle.ts`

Kiemelt export:

- `storefrontProductWhere`
- `isProductPublishReady`
- `getProductAvailabilitySnapshot`

Termék lekérdezések és mapping:

- `src/lib/products.ts`

### Inventory / stock

Stock és rendelhető státusz:

- `src/lib/inventory.ts`

A checkout csak elérhető terméket enged tovább. A Stripe webhook siker után csökkenti a készletet.

### Checkout / Stripe

Fő checkout logika:

- `src/lib/checkout.ts`
- `src/app/api/checkout/payment-intent/route.ts`
- `src/app/api/stripe/webhook/route.ts`

Fontos viselkedés:

- HUF árak a DB-ben egész forintként vannak tárolva.
- Stripe HUF amount speciális kezelésű, a kód `Ft * 100` összeggel dolgozik Stripe felé.
- Rendelés véglegesítés webhook alapján történik, nem csak kliens redirect alapján.

### Auth

Auth.js / NextAuth v5 beta.

Fő fájlok:

- `auth.ts`
- `src/lib/auth.ts`
- `src/lib/auth/credentials.ts`
- `src/app/api/auth/[...nextauth]/route.ts`

Lokális teszt user seed:

```bash
npm run db:seed:local-auth
```

Fejlesztői fiókok:

- `local-admin@bubus.test` / `LocalAdmin123!`
- `local-user@bubus.test` / `LocalUser123!`

## Kezdőlap modulok

Kezdőlap entry:

- `src/app/(storefront)/page.tsx`

Fő komponensek:

- `src/components/home/HomeHero.tsx`
- `src/components/home/ValueStrip.tsx`
- `src/components/home/HomeProductShowcase.tsx`
- `src/components/home/HomeInstagramPromo.tsx`
- `src/components/home/HomePromoTileGrid.tsx`
- `src/components/home/HomeNewsletterBlock.tsx`

Adatút:

- `src/lib/homepage-content.ts`
- `src/lib/homepage-showcase.ts`

Admin:

- `/admin/content/homepage`
- `/admin/content/homepage-showcase`
- `src/components/admin/AdminHomepageContentForm.tsx`
- `src/components/admin/HomepageShowcaseEditor.tsx`

### Homepage showcase

Ez a kezdőlapi termék tabos/csúszkás blokk.

Model:

- `HomeShowcaseTab`

Schema:

- `prisma/schema.prisma`

Migráció:

- `prisma/migrations/20260419100000_home_showcase_tabs/migration.sql`

Storefront query:

- `src/lib/homepage-showcase.ts`
- `getHomeShowcaseTabs()`

Render guard:

- `HomeProductShowcase` nem renderel, ha `tabs.length === 0`.
- `getHomeShowcaseTabs()` csak aktív tabokat kér le, majd kiszűri azokat, amelyeknek nincs terméke.

Admin:

- `/admin/content/homepage-showcase`
- Új showcase forrás létrehozása most a lap tetején van.
- Meglévő showcase tabok becsukhatók/kinyithatók.
- Tab forrás típusok:
  - `new_arrivals`
  - `category`
  - `on_sale`
  - `giftable`
  - `manual`

Fontos production tanulság: ha a production DB-ben nincs `HomeShowcaseTab`, akkor a blokk nem jelenik meg. Ez data issue, nem render/design issue.

### Homepage material picks

Friss kezdőlapi válogató modul a „Vásároljon karkötőket Féldrágakő, Kristály, Ásványok szerint!” részhez.

Model:

- `HomepageMaterialPick`

Migráció:

- `prisma/migrations/20260419183000_homepage_material_picks/migration.sql`

Admin:

- `/admin/content/homepage`
- Max. 4 elem választható.
- Választható típus:
  - kő (`Stone`)
  - konkrét storefront-ready termék (`Product`)
- Egyszerű UX: 4 darab select mező, sorrend a mezők sorrendje.
- Üres slot nem mentődik.
- Duplikált választást a server action kiszűri.

Fő fájlok:

- `src/lib/homepage-content.ts`
- `src/app/(admin)/admin/content/homepage/actions.ts`
- `src/components/admin/AdminHomepageContentForm.tsx`
- `src/components/home/HomePromoTileGrid.tsx`

Fallback: ha nincs material pick, a régi promo tile grid továbbra is megjelenik.

## Tartalom és admin modulok

### Homepage content

Modellek:

- `HomepageContentBlock`
- `HomepagePromoTile`
- `HomepageMaterialPick`

Admin:

- `/admin/content/homepage`

Kezelt részek:

- Hero blokk
- Instagram blokk
- Kezdőlapi kő/termék válogatás
- Promo grid csempék

### Kövek

Model:

- `Stone`

Storefront:

- `/stones`

Admin:

- `/admin/content/stones`

Fájlok:

- `src/app/(storefront)/stones/page.tsx`
- `src/components/stones/StoneBook.tsx`
- `src/app/(admin)/admin/content/stones/page.tsx`
- `src/app/(admin)/admin/content/stones/StoneForm.tsx`

### Specialty / Különlegességek

Storefront:

- `/kulonlegessegek`
- `/kulonlegessegek/[slug]`

Admin:

- `/admin/content/specialties`

Fő fájlok:

- `src/lib/specialty-navigation.ts`
- `src/lib/specialty-links.ts`
- `src/app/(admin)/admin/content/specialties/page.tsx`
- `src/components/admin/SpecialtyEditorAccordion.tsx`

### Special Edition

Storefront:

- `/special-edition`

Admin:

- `/admin/special-edition`

Fő fájl:

- `src/components/admin/AdminSpecialEditionManager.tsx`

### Announcement bar

Admin:

- `/admin/content/announcement`
- legacy route is van: `/admin/announcement`

Fő fájlok:

- `src/lib/announcement-bar.ts`
- `src/components/admin/AdminAnnouncementBarForm.tsx`

### Merchandising

Admin:

- `/admin/merchandising`

Cél: termékek kézi sorrendezése különböző listing kontextusokban.

Fő fájlok:

- `src/components/admin/AdminMerchandisingBoard.tsx`
- `src/app/(admin)/admin/merchandising/actions.ts`
- `src/lib/products.ts`

### Kuponok

Admin:

- `/admin/promo-codes`

Fő fájlok:

- `src/lib/promo-codes.ts`
- `src/app/(admin)/admin/promo-codes/page.tsx`
- `src/app/(admin)/admin/promo-codes/actions.ts`

### Rendelések és visszaküldések

Admin:

- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/returns`
- `/admin/returns/[id]`

Fő fájlok:

- `src/lib/admin-order-workflow.ts`
- `src/lib/admin-workflow-history.ts`
- `src/lib/order-status.ts`
- `src/lib/order-status-email.ts`
- `src/lib/return-refund-reconciliation.ts`

## Jelenlegi fontos UX/copy állapot

- Storefront filter panelen a fejléce most csak: `SZŰRŐK`
- A korábbi `Finomítás` felirat ki lett véve.
- Kezdőlapi material/promo blokk címe:
  - `Vásároljon karkötőket Féldrágakő, Kristály, Ásványok szerint!`
- Footer category discovery címe is ugyanez.
- Homepage showcase admin route elérhető és sidebarból discoverable:
  - `/admin/content/homepage-showcase`

## Aktív gomb / láthatóság mezők

Fontos: volt egy próbálkozás közös `AdminToggleField` komponenssel, de vissza lett állítva.

Jelenlegi állapot:

- Homepage showcase aktív mező: korábbi zöld `Aktív/Inaktív` kapcsolós gomb.
- Homepage content láthatóság: korábbi checkbox pill.
- Announcement active: korábbi checkbox pill.
- Special Edition active: korábbi checkbox pill.
- Specialty visible: korábbi checkbox pill.

Nincs közös `AdminToggleField` komponens használatban.

## Adatmodell áttekintés

Kiemelt Prisma modellek:

- `User`
- `Product`
- `ProductImage`
- `ProductOption`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `PromoCode`
- `ReturnRequest`
- `AnnouncementBar`
- `HomepageContentBlock`
- `HomepagePromoTile`
- `HomepageMaterialPick`
- `HomeShowcaseTab`
- `Stone`
- `Specialty`
- `SpecialEditionCampaign`

Schema:

- `prisma/schema.prisma`

Migrációk:

- `prisma/migrations`

Seed:

- `prisma/seed.ts`
- `prisma/seed-local-auth.ts`

## Deployment

Production deploy Vercel CLI-vel:

```bash
vercel deploy --prod
```

Production deploy automatikusan futtatja:

```bash
npm run vercel-build
```

Fontos: új Prisma model/migration után productionben a Vercel build során `prisma migrate deploy` lefut. Lokálisan build előtt érdemes futtatni:

```bash
npm run db:migrate:deploy
npm run build
```

## Verifikációs állapot

Legutóbb sikeresen futott:

```bash
npm run lint
npm run build
```

Lint jelenleg 0 errorral fut, de vannak meglévő warningok:

- több helyen `<img>` használat Next `<Image />` helyett
- custom Google font warning `src/app/layout.tsx` körül

Ezek nem blokkolják a buildet.

## Ismert kockázatok / teendők

1. Homepage showcase data
   - Ha nincs aktív `HomeShowcaseTab` vagy a tab nem ad vissza storefront-ready terméket, a blokk nem renderel.
   - Ellenőrizni adminban: `/admin/content/homepage-showcase`.

2. Homepage material picks
   - Új feature. Az admin 4 select mezővel kezeli.
   - Ha nincs kiválasztva elem, fallbackként a régi promo csempék mennek.
   - A kiválasztott termékek csak akkor renderelnek, ha megfelelnek `storefrontProductWhere` feltételeinek.

3. Production DB vs local DB
   - Mindig ellenőrizni kell, hogy az admin ugyanarra a DB-re ment-e, amelyet a production storefront olvas.
   - Runtime DB env: `Bubus_DATABASE_URL`.

4. `.env` a repóban
   - A build log figyelmeztet: `.env` file detected, Vercel env handling recommended.
   - Érdemes auditálni, hogy nincs-e érzékeny adat commitolva vagy átadva rossz helyre.

5. Stripe webhook
   - Checkout finalization webhook-függő.
   - Ha rendelés nem zárul, első ellenőrzés: Stripe webhook delivery és `STRIPE_WEBHOOK_SECRET`.

6. Product publish readiness
   - Sok admin által létrehozott termék nem jelenik meg, ha nincs minden kötelező mező/kép kitöltve.
   - Lásd `src/lib/product-lifecycle.ts`.

7. Image handling
   - Vercel Blob és helyi upload fallback vegyesen jelen van.
   - HEIC convert/upload route-ok vannak admin alatt.

8. UI consistency
   - Admin design vegyes, több különálló patternnel.
   - Legutóbbi kérés alapján az aktív gombot nem szabad közös új toggle-re átállítani.

## Átvételi checklist új fejlesztőnek

1. Klónozd a repót.
2. Kérd el a production és development env változókat.
3. Futtasd:

```bash
npm install
npm run db:migrate:deploy
npm run build
```

4. Lokális admin userhez:

```bash
npm run db:seed:local-auth
```

5. Indítás:

```bash
npm run dev
```

6. Nyisd meg:

- `http://localhost:3000`
- `http://localhost:3000/admin/sign-in`

7. Ellenőrizd adminban:

- terméklista
- homepage content
- homepage showcase
- rendeléslista
- checkout teszt Stripe test kulcsokkal

## Utolsó releváns production deployok

Legutóbbi éles deploy az aktív gomb UI rollback után:

- `dpl_Gqp1LsuQ4sjLmUCfvus9dex9D9yu`

Korábbi friss deployok tartalmazták:

- admin nav link `/admin/content/homepage-showcase`
- homepage showcase admin UX módosítások
- homepage material pick feature
- filter panel copy change
- footer/homepage title copy change

