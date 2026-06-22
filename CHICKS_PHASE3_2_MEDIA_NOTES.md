# Chicks Jewelry Phase 3.2A Media Notes

Date: 2026-06-20

Scope: read-only `/admin/media` MVP. No Blob delete, cleanup retry, DB update, auth/rate-limit, checkout/payment or homepage redesign changes.

## Implemented Route

- `/admin/media`
- Protected by the existing admin layout guard.
- Added to the admin sidebar as a small standalone "Média" group.
- Dashboard "Media cleanup" card now links to `/admin/media`.

## Listed Image Sources

The page lists image references, not deduplicated files. If the same URL is used in multiple places, each usage can appear as its own row.

Implemented sources:

- Product image records from `ProductImage.url`
- Product legacy/cover fallback from `Product.imageUrl` when not already represented by a `ProductImage`
- Homepage hero and Instagram block images from `getHomepageContent()`
- Homepage promo tile images from `getHomepageContent()`
- Homepage material/product pick images from `getHomepageContent()` derived storefront references
- Special Edition campaign banner from `SpecialEditionCampaign.bannerImageUrl`
- Special Edition entry images from `SpecialEditionEntry.promoImageUrl` and `SpecialEditionEntry.productImageUrl`
- Specialty/Különlegességek images from `Specialty.imageUrl`, `previewImageUrl` and `cardImageUrl`
- Gemstone/stone images from `Stone.imageUrl`
- Recent order item image snapshots from `OrderItem.imageUrl`
- User profile image references from `User.profileImageUrl`
- Blob cleanup queue URLs from `BlobCleanupQueueItem.url`

Bounded MVP lists:

- Order item snapshots are limited to the 100 most recent order items with image URLs.
- User profile image rows are limited to the 100 most recently updated users with profile images.
- Cleanup queue rows are limited to the 200 most recently updated queue items grouped by status.

## Not Listed Yet

- Raw Blob bucket contents are not listed because there is no safe inventory API in this pass and the goal is DB-referenced media first.
- Unreferenced Blob files that never entered `BlobCleanupQueueItem` are not visible yet.
- Historical product image URLs that were deleted from DB and not queued for cleanup are not visible.
- Per-folder storage size is not shown because stored byte size is not present in the schema.
- Cleanup attempt count is not shown because `BlobCleanupQueueItem` has no attempts field.

## Table Fields

The media inventory shows:

- thumbnail preview when the URL is browser-displayable
- shortened image URL
- source/type
- usage label
- status
- created/updated date when available
- admin link where safe and useful

Admin links implemented:

- product rows: `/admin/products?edit=...`
- homepage rows: `/admin/content/homepage`
- Special Edition rows: `/admin/special-edition`
- specialty rows: `/admin/content/specialties`
- gemstone rows: `/admin/gemstones`
- order snapshots: `/admin/orders/[id]`
- cleanup queue and user avatar rows: no direct action link in this MVP

## Cleanup Queue Statuses

Schema statuses:

- `PENDING`: queued for future cleanup processing.
- `FAILED`: cleanup processor attempted work and stored a failure message.
- `KEPT`: cleanup checked the URL and kept it, usually because it is still referenced or should not be deleted.
- `DELETED`: cleanup processor marked the Blob as deleted.

Visible cleanup queue fields:

- status
- URL
- reason
- failure message
- scheduled date
- updated date

No delete or retry actions are exposed.

## Why Read-Only First

Media cleanup is risky because the same URL can be referenced by products, homepage content, specialties, Special Edition entries, order snapshots and users. The first MVP makes references and queue state visible before adding destructive actions.

## Deferred Actions

Later phases can add:

- manual cleanup recheck
- retry failed cleanup
- safe delete flow with reference confirmation
- folder/storage-size summaries
- duplicate URL grouping
- per-image alt text editing for product images
- raw Blob bucket inventory comparison

## Check Results

- `npm run lint`: passed with 0 errors. Existing storefront `<img>` warnings remain in `src/app/(storefront)/orders/[orderId]/page.tsx`, `src/app/(storefront)/orders/page.tsx` and `src/components/shop/ProductImageFrame.tsx`.
- `npx tsc --noEmit`: passed.
- `npx prisma validate`: passed.
- `npm run build`: first sandboxed run failed because Google Fonts could not be fetched; rerun with network access passed and included `/admin/media` in the route output.
- Playwright smoke against `next start`: passed for `/admin/sign-in`, unauthenticated `/admin/media` and unauthenticated `/admin`; no page or console errors.
- Playwright smoke against `next dev` was not used as the final result because this environment served 404 for all routes during that dev-server attempt. Production build/start worked correctly.
- Authenticated `/admin/media` smoke was not run because this pass does not add an admin login fixture or session mock.

## Next Step

- Phase 3.2B: read-only `/admin/customers` MVP with users, email verification state, early access state, order count and role visibility.
