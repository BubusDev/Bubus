# Chicks Jewelry Phase 3.1 Notes

Date: 2026-06-20

Scope: dashboard health cards, duplicate route cleanup and options route clarification. No auth/rate-limit, checkout/payment, homepage redesign or large admin route migration changes.

## Implemented Dashboard Health Cards

### Low Stock

Route: `/admin`

Data source:

- `Product.status === ACTIVE`
- `Product.archivedAt === null`
- `Product.stockQuantity <= 3`
- out-of-stock uses `Product.stockQuantity <= 0`

Link: `/admin/products`

Purpose: quickly shows active product inventory that needs attention.

### Returns Needing Action

Data source:

- open return requests: `ReturnRequest.status in ["new", "in_review", "approved"]`
- failed refunds: `ReturnRequest.refundStatus === "failed"`

Link: `/admin/returns`

Purpose: separates daily return/refund work from the general activity feed.

### Homepage Health

Data source:

- `getHomepageContent()`
- `HomepageContentBlock` normalized hero and Instagram block state
- `HomepagePromoTile` normalized visible promo tiles
- `HomepageMaterialPick` unavailable featured product warnings exposed by `getHomepageContent()`
- active `HomeShowcaseTab` rows checked with `getShowcaseTabProducts()`

Checks implemented:

- missing hero image
- hidden hero
- hidden Instagram block
- empty active showcase tab
- material pick pointing to unavailable/inactive/archived product
- visible promo tile missing image or href

Links:

- `/admin/content/homepage`
- `/admin/content/homepage-showcase` when showcase warnings are present

### Media Cleanup Health

Data source:

- `BlobCleanupQueueItem.status === PENDING`
- `BlobCleanupQueueItem.status === FAILED`
- `BlobCleanupQueueItem.status === KEPT`

Link: no active route yet. The card intentionally shows a Phase 3.2 placeholder because `/admin/media` does not exist.

Purpose: makes Blob cleanup queue risk visible before building a full Media admin.

### Promo Health

Data source:

- expiring soon: active `PromoCode` where `validFrom <= now` and `validUntil` is within the next 7 days
- usage near limit: active `PromoCode` with `totalUsageLimit` where `redeemedCount / totalUsageLimit >= 0.8`

Link: `/admin/promo-codes`

Purpose: highlights promo codes that are about to expire or near their total usage cap.

## Cards Not Implemented

- A dedicated "admin action needed" return status does not exist in the current schema, so the card uses open return statuses and failed refunds.
- A full media inventory card by image folder/usage location is not implemented because `/admin/media` does not exist yet.
- Authenticated dashboard Playwright smoke is not implemented because there is no reliable admin login fixture/session mock in this pass.

## Route Cleanup

### `/admin/products/special`

Changed from duplicate Special Edition page rendering to a redirect:

- canonical route: `/admin/special-edition`
- old route: `/admin/products/special` redirects to `/admin/special-edition`

Internal links were checked; no source links still point to `/admin/products/special`.

### `/admin/options`

Changed from automatic redirect to `/admin/products/new` into a clear informational admin page.

Current behavior:

- explains that product options are managed inside product create/edit forms
- links to `/admin/products/new`
- links to `/admin/products`

No full product options management system was added.

## Check Results

- `npm run lint`: passed with 0 errors. Existing storefront `<img>` warnings remain in `src/app/(storefront)/orders/[orderId]/page.tsx`, `src/app/(storefront)/orders/page.tsx` and `src/components/shop/ProductImageFrame.tsx`.
- `npx tsc --noEmit`: passed.
- `npx prisma validate`: passed.
- `npm run build`: first sandboxed run failed because Google Fonts could not be fetched; rerun with network access passed.
- Playwright smoke with local Chrome: passed for `/admin/sign-in`, unauthenticated `/admin`, `/admin/products`, `/admin/content/homepage`, `/admin/options` and `/admin/products/special`; no page or console errors.
- Authenticated `/admin` dashboard smoke was not run because this pass does not add an admin login fixture or session mock.

## Phase 3.2 Recommendations

- Build read-only `/admin/media` first: uploaded images, product images, homepage images, Special Edition images and cleanup queue.
- Build read-only `/admin/customers`: users, email verification state, early access, order count and role visibility.
- Add authenticated admin dashboard smoke using a stable fixture or session mock.
- Consider a real `/admin/products/options` route if product option management remains important enough to be outside product forms.
