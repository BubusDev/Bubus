# Chicks Admin Authenticated Smoke

## Futtatás

Authenticated admin smoke:

```bash
E2E_ADMIN_EMAIL="..." E2E_ADMIN_PASSWORD="..." npm run smoke:admin
```

Preview vagy production URL ellen:

```bash
E2E_BASE_URL="https://preview.example.com" E2E_ADMIN_EMAIL="..." E2E_ADMIN_PASSWORD="..." npm run smoke:admin
```

Ha nincs `E2E_BASE_URL`, a Playwright defaultja `http://localhost:3000`, és a meglévő `next start` webservert használja.

## Env-ek

Kötelező authenticated smoke-hoz:

- `E2E_ADMIN_EMAIL`
- `E2E_ADMIN_PASSWORD`

Opcionális:

- `E2E_BASE_URL`
- `E2E_CUSTOMER_ID`
- `E2E_PRODUCT_ID` - jelenleg nincs használva
- `E2E_ORDER_ID` - jelenleg nincs használva

Ha az admin email vagy jelszó hiányzik, a spec skipel ezzel az üzenettel:

`E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD are required for authenticated admin smoke.`

## Lefedett admin oldalak

- `/admin`
- `/admin/products`
- `/admin/media`
- `/admin/customers`
- `/admin/content/homepage`
- `/admin/orders`
- `/admin/customers/${E2E_CUSTOMER_ID}`, ha meg van adva
- első `/admin/customers` listából talált `Részletek` link, ha nincs `E2E_CUSTOMER_ID`

## Ellenőrzések

- sign-in oldal betölt és admin credentiallel submitolható
- sikeres belépés után nem marad `/admin/sign-in` URL-en
- auth error szöveg nem jelenik meg
- admin oldalak nem adnak HTTP 5xx választ
- nincs browser console error vagy page error
- nem redirectel vissza sign-inre
- admin shell jel látszik: `Admin felület`, `Chicks Jewelry`
- stabil fő heading látszik
- média oldalon summary, filter és inventory UI látszik
- customers oldalon summary/filter/lista vagy empty-state jel látszik

## Nem teszteli még

- admin létrehozást vagy credential seedinget
- production DB módosítást
- product, media, customer vagy order actionöket
- konkrét production rekordok meglétét
- `E2E_PRODUCT_ID` és `E2E_ORDER_ID` detail smoke-ot

## Check eredmény

- Implementálva: `tests/e2e/admin-authenticated-smoke.spec.ts`
- Script: `npm run smoke:admin`
- `npm run lint`: pass, 3 meglévő `@next/next/no-img-element` warning
- `npx tsc --noEmit`: pass
- `npm run build`: pass; sandboxban Google Fonts hálózati tiltás miatt elsőre megállt, hálózati engedéllyel lefutott
- Credential nélküli smoke: pass, 7 Playwright teszt skipelt a hiányzó `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` miatt
