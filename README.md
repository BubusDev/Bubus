# Bubus

## Required Environment Variables

Copy `.env.example` and set these values before running checkout locally or in production:

- `Bubus_DATABASE_URL`
- `Bubus_DATABASE_URL_UNPOOLED`
- `APP_URL`
- `AUTH_SECRET`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

For local browser auth testing, keep `AUTH_URL=http://127.0.0.1:3000` so Auth.js uses the local origin instead of the deployed site.

## Local Auth Test Accounts

Create or refresh the local-only development accounts with:

```bash
npm run db:seed:local-auth
```

The script is non-destructive. It only upserts these verified users for development:

- `local-admin@bubus.test` / `LocalAdmin123!`
- `local-user@bubus.test` / `LocalUser123!`

## Stripe Dashboard / Webhook

Register a real public webhook endpoint in the Stripe Dashboard for your deployed environment:

```text
https://your-domain.example/api/stripe/webhook
```

Use these environment variables in the deployed app:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

The webhook route is `POST /api/stripe/webhook`. It verifies the `stripe-signature` header with `STRIPE_WEBHOOK_SECRET`, parses the raw request body via `await request.text()`, and finalizes orders only after `stripe.webhooks.constructEvent(...)` succeeds.

The checkout flow relies on webhook-driven order finalization. `payment_intent.succeeded` marks the order as paid, decrements stock atomically, and clears the cart only after verified success.

## HUF Handling

The storefront now treats stored prices as Hungarian Forint and renders them in Hungarian formatting such as `12 990 Ft`.

Stripe supports HUF as a presentment currency, but HUF is a special case for Stripe amounts:

- the application stores prices as whole Hungarian Forint values such as `12990`
- Stripe `PaymentIntent` amounts for `huf` are sent as `stored Ft * 100`, so a stored price of `175` becomes `17500`
- incoming Stripe webhook amounts are converted back to whole Ft before local order totals are finalized
- Stripe rejects `huf` charges below `175.00 Ft`, so checkout validates that threshold before creating or updating a PaymentIntent

## Database Migration

Apply the new Prisma migration before using Stripe checkout:

```bash
npm run db:migrate:deploy
```
