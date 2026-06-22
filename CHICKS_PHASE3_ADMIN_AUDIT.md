# Chicks Jewelry Phase 3 Admin Audit

Date: 2026-06-20

Scope: admin information architecture, content management and media workflow audit. Homepage redesign, auth/rate-limit logic and checkout rebuild are intentionally out of scope.

## Current Admin Route Map

### Overview

- `/admin` - dashboard with active product count, today's paid orders, weekly revenue, pending paid orders, recent paid orders and recent admin activity.
- `/admin/activity` - operational activity feed with customer/order filters.

### Products and Merchandising

- `/admin/products` - product list and inline product management surface.
- `/admin/products/new` - new product form.
- `/admin/products/[id]/edit` - edit product form.
- `/admin/products/archive` - archived products, restore and permanent delete where allowed.
- `/admin/products/special` - duplicate Special Edition management page.
- `/admin/options` - redirects to `/admin/products/new`; not a real options management page.
- `/admin/merchandising` - visual product ordering by listing context: category, specialty, editorial and homepage spotlight.
- `/admin/special-edition` - Special Edition campaign state, banner image and campaign entries.

### Orders, Returns and Promotions

- `/admin/orders` - order list with status filters and bulk status actions.
- `/admin/orders/[id]` - order detail, assigned admin, internal status, email status and return context.
- `/admin/returns` - return requests list and bulk workflow actions.
- `/admin/returns/[id]` - return request detail and refund workflow.
- `/admin/promo-codes` - promo code creation, status and applicability.

### Content

- `/admin/content` - content landing page.
- `/admin/content/homepage` - homepage hero, Instagram block, material/product picks and promo tiles.
- `/admin/content/homepage-showcase` - homepage product showcase tabs and filters.
- `/admin/content/announcement` - announcement bar content.
- `/admin/announcement` - legacy/parallel announcement route.
- `/admin/content/specialties` - Különlegességek navigation/editorial menu items with preview/card images.
- `/admin/content/stones` - legacy stone editor.
- `/admin/content/stones/new` - legacy stone create page.
- `/admin/gemstones` - current public gemstone lexicon/editorial card manager.

### Customers and Settings

- `/admin/settings` - admin profile, notifications and static settings/integrations panels.
- `/admin/settings/early-access` - early access user approval list.

## IA Problems Found

- Special Edition is duplicated: `/admin/special-edition` and `/admin/products/special` render the same manager, and the sidebar previously listed the same route both under Products and Content as different concepts.
- "Kampány bannerek" was misleading: the route manages campaign state, banner and campaign entries, not only banners.
- "Merchandising" was too vague for daily use. The page actually manages manual product ordering for storefront listing contexts.
- Promo codes were isolated in a separate "Promóciók" sidebar group, although operationally they belong closer to Orders.
- "Drágakövek", `/admin/gemstones` and `/admin/content/stones` overlap conceptually. `/admin/gemstones` appears to be the current gemstone lexicon manager; `/admin/content/stones` is a legacy stone editor.
- `/admin/options` exists but only redirects to new product creation. A real product option/variant admin exists inside `AdminProductForm`, not as a dedicated route.
- There is no Media top-level route even though images are now a shared workflow across products, homepage, specialties, Special Edition and gemstones.
- There is no Customers top-level route. Early access exists, but registered users, verification state, order history and roles are not centrally visible.
- Settings includes some static/future-looking panels: store settings, security sessions, 2FA and integrations are partly presentation-only and should not be treated as production controls yet.

## Recommended Admin Structure

### Dashboard

- Today summary
- Work queue
- Content/media warnings
- Recent activity

### Products

- All products - existing `/admin/products`
- New product - existing `/admin/products/new`
- Archived products - existing `/admin/products/archive`
- Options / variants - should become a real route; currently embedded in product form
- Product ordering - existing `/admin/merchandising`
- Special Edition campaign - existing `/admin/special-edition`

### Orders

- Orders - existing `/admin/orders`
- Returns - existing `/admin/returns`
- Promo codes - existing `/admin/promo-codes`

### Content

- Homepage - existing `/admin/content/homepage`
- Homepage showcase - existing `/admin/content/homepage-showcase`
- Announcement bar - existing `/admin/content/announcement`
- Story / editorial blocks - partly covered by specialties and homepage blocks
- Gemstones / materials - existing `/admin/gemstones`
- Különlegességek menu - existing `/admin/content/specialties`

### Media

Not implemented as a route yet. Recommended:

- Uploaded images
- Product images
- Homepage images
- Special Edition images
- Specialty/menu images
- Unused images / cleanup queue

### Customers

Not implemented as a route yet. Recommended:

- Users
- Early access
- Email verification state
- Order history
- Coupon grants/redemptions
- Role management with self-lockout protection

### Settings

- Store settings
- Admin profile
- Notification preferences
- Integrations/env checklist

## Dashboard QA

Current dashboard cards:

- Active products
- Today's paid orders
- Weekly revenue
- Pending paid orders
- Recent paid orders
- Recent activity

Useful gaps:

- Low stock queue is not visible even though low stock notification preferences exist.
- Return requests are not summarized.
- Promo code warnings are not visible: expired, inactive, nearing usage limit.
- Content warnings are not visible: missing homepage images, hidden hero, empty showcase tabs, material picks pointing to inactive/archived products.
- Media cleanup state is not visible: pending, failed or kept cleanup queue items.
- The dashboard is order-heavy and not yet a daily admin command center for content/media health.

Recommended dashboard cards:

- Orders to process: paid orders in received/in production/packed/label ready states.
- Returns needing action: open return requests and failed refunds.
- Low stock: active products with stock <= 3 and out-of-stock active products.
- Homepage health: missing hero/Instagram images, hidden required blocks, empty showcase tabs, invalid material picks.
- Media cleanup: pending and failed cleanup queue count.
- Promo health: active promo codes expiring soon or over usage threshold.

## Product Admin Workflow QA

Strengths:

- Draft/active/archived statuses are present.
- Active products require core readiness fields and at least one image.
- Product image upload has progress, HEIC conversion, client resizing and format safety checks.
- Cover image selection exists.
- Product archive and hard delete protection are present; non-draft or ordered products archive instead of deleting.
- Price, compare price, sale and stock validation exist.
- Product option creation/edit/delete is embedded in the product form.
- Homepage placement and specialty linking are present.

Risks and gaps:

- Image order is effectively retained/upload order; no obvious drag reorder workflow in the product form.
- Alt text is generated from filename/product name and is not clearly editable per product image.
- Product options are discoverable only inside the product form; `/admin/options` is misleading.
- Special Edition campaign images are separate from product gallery images, which is correct, but the relationship needs clearer IA.
- Mobile/tablet forms are usable but dense; sticky save and section hierarchy help, but option management inside the form can feel heavy.

Recommended next steps:

- Add a dedicated product options page, or remove `/admin/options` until it exists.
- Add per-image alt text and explicit drag reorder in product image management.
- Keep hard delete restricted to safe drafts; continue favoring archive for anything that touched carts/orders.
- Add low-stock and incomplete-active warning cards to dashboard.

## Content / Homepage Admin QA

Current editable homepage areas:

- Hero block: title, eyebrow, body, CTA, image, alt, visibility.
- Instagram promo block: title, eyebrow, body, CTA, image, alt, visibility.
- Material/product picks: stones and products with storefront availability warnings.
- Promo tiles: title, subtitle, href, image, alt, visibility.
- Homepage showcase tabs: filters and preview of visible product output.

Strengths:

- Homepage content is not hardcoded only in storefront files.
- Preview/overview cards exist.
- Material picks and showcase editors already warn about unavailable/incomplete products.
- Image replacement queues old homepage images for cleanup.

Gaps:

- No full-page preview from the homepage editor.
- "Campaign", "Social" and "Promo grid" labels mixed English with Hungarian admin UI.
- Homepage health warnings are local to editors, not elevated to dashboard.
- Field grouping could be more explicit: "Hero", "Instagram", "Material/product picks", "Promó csempék", "Showcase tabs".

## Media Workflow Audit

Upload paths:

- Product images: `products/...`
- Special Edition images: `special-edition/...`
- Homepage images: `homepage/...`
- Specialty images: `specialties/...`
- Stone/gemstone uploads use stone image helpers.

Storage and cleanup:

- Vercel Blob upload is used through `/api/admin/product-images/upload`.
- The endpoint allows product, special-edition, homepage and specialties prefixes.
- Blob cleanup queue exists and checks references across products, product images, specialties, homepage blocks, homepage promo tiles, Special Edition campaign/entries, stones, order items and users.
- Product image delete/replacement and homepage/specialty/Special Edition replacement enqueue or delete old Blob URLs.
- Internal cleanup route exists at `/api/internal/blob-cleanup`.

Gaps:

- No admin Media route to view uploaded images, failed cleanup items or unused images.
- No production-facing image inventory by usage location.
- Product image alt text is not clearly editable per image.
- Generic upload endpoint name still says product images although it serves all admin image folders.
- The admin now has no remaining `<img>` usage under `src/app/(admin)` or `src/components/admin`; replaced low-risk preview usages with `next/image`.

Recommended Media route:

- `/admin/media` with tabs for uploaded images, product images, homepage images, Special Edition images and cleanup queue.
- Show usage references and last-used data before deletion.
- Manual "recheck cleanup" action for failed/kept queue items.
- Per-image alt text and cover/usage badges.

## Customers / Users Audit

Current state:

- Users exist in Prisma with `role`, `earlyAccess`, `emailVerifiedAt`, profile fields and relations to orders, coupons and favourites.
- `/admin/settings/early-access` lists users for early access approval and protects admin users from early access toggling.
- No central Customers admin exists.
- No admin view for email verification state.
- No customer order history view except order/return pages.
- No role management UI exists, so admin self-lockout through UI role changes is not currently exposed.

Recommended Customers route:

- `/admin/customers` list with name, email, role, email verification state, early access, created date, order count and total spend.
- Customer detail with order history, coupons and account state.
- Role changes only behind explicit confirmation, with self-demotion/self-lockout blocked.
- Early access can remain linked from Customers and Settings until the IA is fully migrated.

## Implemented In This Round

- Sidebar IA cleanup:
  - Removed duplicate `/admin/special-edition` entry from Content.
  - Renamed "Merchandising" to "Terméksorrend".
  - Renamed "Special Edition" to "Special Edition kampány".
  - Moved "Kuponkódok" into the Orders group.
  - Renamed "Drágakövek" to "Drágakő lexikon".
- Admin subnav cleanup:
  - Replaced misleading `/admin/products/special` subnav with `/admin/special-edition`.
  - Added product ordering and gemstone lexicon subnav links.
- Content landing copy:
  - Clarified that `/admin/special-edition` manages campaign state, banner image and entries.
- Homepage admin copy:
  - Replaced "Campaign", "Social", "Promo grid" and "Edit" with clearer Hungarian admin copy.
- Special Edition admin copy:
  - Translated key labels, help text and buttons from English to Hungarian.
- Admin sign-in copy:
  - Simplified the admin-only sign-in explanation and placeholder.
- Settings notification copy:
  - Fixed "Visszaállítási kérés" to "Visszaküldési kérelem".
- Admin image preview cleanup:
  - Replaced low-risk admin `<img>` previews with `next/image` in shared Blob input, Special Edition previews, specialty previews and order item thumbnails.

## Not Implemented Yet

- No route migrations. Existing URLs remain in place to avoid breaking bookmarks and internal links.
- No new Media admin route.
- No new Customers admin route.
- No real `/admin/options` page.
- No dashboard query expansion yet; this audit identifies the needed cards first.
- No auth/rate-limit changes.
- No checkout changes.
- No homepage design changes.
- No Prisma schema changes in this Phase 3 audit pass.

## QA / Smoke Notes

- `/admin/sign-in` can be smoke-tested without an admin session.
- Protected admin routes redirect to `/admin/sign-in?next=%2Fadmin` without a session. This confirms auth gating, but it does not validate the authenticated dashboard/products/content editor internals.
- A future Phase 3 QA pass should add an admin login fixture or session mock so `/admin`, `/admin/products` and `/admin/content/homepage` can be smoke-tested after authentication.

## Phase 3 Next Steps

1. Add dashboard health cards for low stock, returns, homepage content warnings and cleanup queue failures.
2. Decide whether `/admin/products/special` should redirect to `/admin/special-edition` or be removed after link audit.
3. Build `/admin/media` read-only inventory first, then add cleanup/recheck actions.
4. Build `/admin/customers` read-only list with email verification and early access state.
5. Promote product option management to a dedicated `/admin/products/options` route or remove `/admin/options`.
6. Add per-product-image alt text and explicit image reorder UI.
7. Add full homepage preview/deep links from content editors.
8. Audit `/admin/announcement` vs `/admin/content/announcement` and keep one canonical route.

## Risks

- Several admin areas still share concepts but not vocabulary: gemstones/stones, specialties, Special Edition and merchandising.
- A full IA migration will touch many internal links, breadcrumbs and possibly saved bookmarks; it should be done with redirects.
- Media cleanup can delete production assets if references are missed; keep reference checks conservative and add admin visibility before manual deletion.
- Customer role management is high-risk; block self-demotion and require explicit confirmation before exposing it.
- Settings contains controls that may look operational before backend support exists; label future/static panels clearly before relying on them.
