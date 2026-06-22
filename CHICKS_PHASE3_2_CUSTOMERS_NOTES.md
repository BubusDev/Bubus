# Chicks Jewelry Phase 3.2B/3.2C - Customers MVP + Detail

## What changed

- Added a read-only `/admin/customers` admin page.
- Added a read-only `/admin/customers/[id]` customer detail page.
- Added `Vásárlók` to the admin sidebar.
- Kept the scope intentionally read-only: no role edit, no user delete, no early access toggle, no email verification changes, no impersonation.
- Replaced the list `Részletek később` placeholder with working `/admin/customers/[id]` links in desktop and mobile views.

## Data shown

The page reads only explicit, non-token account fields from `User`:

- name
- email
- role
- email verification state
- early access state
- created and updated dates
- favourite count
- promo grant/redemption activity count

It also aggregates paid `Order` records linked to the user:

- paid order count
- total spend from `paymentStatus = PAID`
- last paid order date

The detail page shows:

- account summary: name, email, role, email verification state, early access state, profile image if present, created/updated dates
- order summary: all orders, paid order count, cancelled/refunded count, paid revenue, average paid order value, last paid order date
- order history: latest 25 user orders, with item counts and `/admin/orders/[id]` links
- favourite products: favourite count and latest 10 favourites, with product status and `/admin/products/[id]/edit` links
- promo activity: promo grant/redemption counts and latest activity using promo code, date and status/detail
- returns: return request count, open returns, failed refund count and latest return links when present

The detail page deliberately does not select or display password hashes, auth/session data, verification tokens, reset tokens, guest access token hashes or internal secrets.

## Summary cards and filters

Summary cards:

- total registered users
- verified users
- unverified users
- early access users
- users with at least one paid order
- total paid customer revenue

Filters:

- search by email or name
- role
- email verification state
- early access state
- has paid orders

## Intentionally not included

- No sensitive auth/session/token data is selected or displayed.
- No mutations are available from this page.
- No customer edit actions are available from the detail page.
- No role management, user delete, early access toggle, email verification change or impersonation was added.
- No dashboard customer card was added in this pass to keep Phase 3.2B focused.

## Checks

- `npm run lint`: passed with the existing 3 storefront `<img>` warnings.
- `npx tsc --noEmit`: passed.
- `npx prisma validate`: passed.
- `npm run build`: passed after rerun with network access for Google Fonts.
- Playwright smoke on production server:
  - `/admin/sign-in`: loaded.
  - unauthenticated `/admin/customers`: redirected to admin sign-in.
  - unauthenticated `/admin/customers/test-id`: redirected to admin sign-in.
  - console/page errors: none.

No authenticated admin fixture/session mock was available in this pass.

## Suggested next step

- Add an authenticated admin fixture/session smoke test for customer detail.
