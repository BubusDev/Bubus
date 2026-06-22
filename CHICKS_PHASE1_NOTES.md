# Chicks Jewelry Phase 1 notes

Date: 2026-06-20

## What changed

- Fixed the blocking lint error in `src/components/shop/FilterSidebar.tsx` by replacing the `useEffect` + synchronous `setMounted(true)` render gate with a `useSyncExternalStore` client snapshot gate.
- Hardened `getAuthBaseUrl()` in `src/lib/env.ts`: production now throws if no public app URL is configured. Local development still falls back to `http://localhost:3000`.
- Added DB-backed auth rate limiting for:
  - `/auth/login`: 5 attempts / 10 minutes by IP, normalized email, and email+IP.
  - `/auth/register`: 3 attempts / 30 minutes by IP.
  - `/auth/resend-verification`: 3 attempts / 30 minutes by IP, normalized email, and email+IP.
- Added Prisma model and migration for `AuthRateLimitEvent`. Identifiers are HMAC-hashed before storage.
- Made product hard delete safer:
  - Normal product-list delete archives/unpublishes active or ordered products instead of hard deleting.
  - Hard delete is allowed only for draft products without order history.
  - Archived product permanent delete is blocked unless the product is draft and has no order history.
  - Product list confirmation copy now distinguishes hard delete from archive.
- Password reset was reviewed. A token model exists, but the production reset flow is not complete. No new half-flow was added in this phase.

## Required production env

- `APP_URL` or `AUTH_URL`: required public canonical URL, e.g. `https://www.chicksjewelry.com`.
- `Bubus_DATABASE_URL` or `DATABASE_URL`: required by runtime DB client.
- `Bubus_DATABASE_URL_UNPOOLED`: required by `prisma.config.ts` for migrations/deploy.
- `AUTH_SECRET` or `NEXTAUTH_SECRET`: required in production and used for auth/session and rate-limit identifier hashing.
- `RESEND_API_KEY` plus `AUTH_EMAIL_FROM` or `EMAIL_FROM`: required for transactional email delivery.
- `STRIPE_SECRET_KEY`: required for checkout/payment server calls.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: required for Stripe client setup.
- `STRIPE_WEBHOOK_SECRET`: required for Stripe webhook verification.
- `BLOB_READ_WRITE_TOKEN`: required for Vercel Blob image uploads.
- `CRON_SECRET`: required for internal cron routes.
- Optional: `STRIPE_RETURN_URL_BASE`, `CONTACT_EMAIL_TO`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `CONSENT_LOG_SALT`, `EARLY_ACCESS_MODE`.

## Checks run

- `npm run lint`: passed with 0 errors. Existing `@next/next/no-img-element` warnings remain.
- `npx tsc --noEmit`: passed.
- `npx prisma validate`: passed.
- `npm run build`: first failed in sandbox because Google Fonts could not be fetched. Re-run with network approval passed.
- `npx prisma generate`: passed after schema changes.

## Remaining for later

- Complete password reset properly: request page, reset page, token validation, password update, token invalidation, production email delivery, reset-specific rate limiting.
- Replace remaining `<img>` usages or document why they are intentional.
- Consider self-hosting fonts or otherwise making builds less dependent on Google Fonts network access.
- Add automated tests for rate-limit behavior, admin product delete/archive behavior, and auth edge cases.

## Breaking changes / deployment notes

- Production builds/runtime now require a public URL env. Missing `APP_URL`, `AUTH_URL`, `NEXTAUTH_URL`, and `VERCEL_URL` will throw instead of silently generating localhost links.
- A new DB migration must be deployed before the new auth rate-limit code handles traffic:
  - `prisma/migrations/20260620140000_auth_rate_limit_events/migration.sql`
- Product hard delete behavior is stricter by design. Active products and products with order history are archived rather than deleted.
