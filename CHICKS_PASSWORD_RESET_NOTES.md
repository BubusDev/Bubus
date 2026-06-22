# Chicks Password Reset Notes

## Kanonikus route-ok

- Forgot password oldal: `/forgot-password`
- Forgot password POST: `/auth/forgot-password`
- Reset password oldal: `/reset-password?token=...`
- Reset password POST: `/auth/reset-password`

## Email/env

Production emailhez szükséges:

- `RESEND_API_KEY`
- `AUTH_EMAIL_FROM` vagy `EMAIL_FROM`
- `APP_URL` vagy `AUTH_URL` vagy `NEXTAUTH_URL`

Productionben az auth base URL nem lehet `localhost` vagy `127.0.0.1`.

## Rate limit

- Forgot password email+IP: 3 kérés / 30 perc
- Forgot password IP: 5 kérés / 1 óra

## Kézi ellenőrzés

1. Nyisd meg: `/forgot-password`.
2. Adj meg érvénytelen emailt: validációs hibát kell kapni.
3. Adj meg nem létező emailt: generic sikerüzenet jelenjen meg.
4. Adj meg létező emailt: ugyanaz a generic sikerüzenet jelenjen meg, és menjen ki reset email.
5. Nyisd meg az emailben lévő `/reset-password?token=...` linket.
6. Próbálj túl rövid jelszót és eltérő megerősítést: UI hibát kell kapni.
7. Adj meg érvényes új jelszót: redirect `/sign-in?reset=success`.
8. Próbáld újra ugyanazt a reset linket: használt/érvénytelen token hiba jelenjen meg.

## Check eredmény

- `npm run lint`: pass, 3 meglévő `@next/next/no-img-element` warning
- `npx tsc --noEmit`: pass
- `npx prisma validate`: pass
- `npm run build`: pass; sandboxban Google Fonts hálózati tiltás miatt elsőre megállt, hálózati engedéllyel lefutott
