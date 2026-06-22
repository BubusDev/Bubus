# Chicks Jewelry audit

Audit date: 2026-06-20

Scope: Next.js App Router, TypeScript, Tailwind, Prisma, auth, admin, checkout, homepage/storefront. Code was inspected and checks were run. No production code was changed.

## Rövid verdikt

The project is not fully production-ready yet. The build can pass, Prisma validates, and the ecommerce/admin surface is much more complete than a prototype, but lint currently fails and there are auth, rate limit, password reset, env, and UX gaps that should be fixed before a real launch.

- Production-ready: partially. `npm run build` passes with network access, but `npm run lint` fails and production env fallbacks are too permissive.
- Premium webshop brand: visually promising, but inconsistent. The homepage has a strong editorial direction, but cookie modal obstruction, placeholder-looking footer discovery cards, mixed image quality, and some generic copy make it feel partly unfinished.
- Technically stable: medium. TypeScript and Prisma are clean, checkout has meaningful inventory/payment handling, but client/server boundaries and image handling need tightening.
- Admin usability: medium to good. Product CRUD is feature-rich, orders/returns/promos/content exist, but IA is crowded and destructive actions need safer production defaults.
- Auth security: not production-safe enough. Role checks exist, but there is no visible brute-force/rate-limit layer, password reset is incomplete, Google OAuth is absent, and production URL fallback can silently become localhost.

Checks run:

- `npm run lint`: failed on `src/components/shop/FilterSidebar.tsx:288`; also 8 `no-img-element` warnings.
- `npx tsc --noEmit`: passed.
- `npx prisma validate`: passed.
- `npm run build`: first failed in sandbox because Google Fonts could not be fetched; passed after network approval.
- `npx playwright --version`: `1.59.0`.
- `npx playwright install chromium`: passed after network approval.
- Browser visual smoke audit: passed after escalated Chromium launch. Homepage desktop/mobile and `/admin/sign-in` returned 200. Screenshots were reviewed.

## P0 — Kritikus hibák

1. Lint fails, so the repo should not be considered CI-clean

- Problem: `npm run lint` fails on `src/components/shop/FilterSidebar.tsx:288` because `setMounted(true)` is called synchronously in an effect.
- Why it matters: this blocks a proper production CI gate and can hide other lint regressions.
- Files: `src/components/shop/FilterSidebar.tsx`, `package.json`.
- Suggested fix: remove the mounted-state workaround or replace it with a hydration-safe viewport hook that does not require synchronous state setting in an effect.
- Effort: S.

2. Password reset is modeled but not implemented as a production flow

- Problem: `src/lib/auth/password-reset.ts` creates tokens, but there is no visible `/reset-password` page/route in `src/app`, and `sendPasswordResetEmailPreview()` only logs/returns preview in development and returns `{}` in production.
- Why it matters: users cannot recover accounts in production, despite privacy/legal copy mentioning password reset emails.
- Files: `src/lib/auth/password-reset.ts`, `src/lib/auth/email.ts:153`, missing `src/app/(storefront)/reset-password`.
- Suggested fix: implement request/reset pages, token verification, password update, email sending via Resend in production, token invalidation, and rate limiting.
- Effort: M.

3. Auth base URL can fall back to localhost in production

- Problem: `getAuthBaseUrl()` falls through to `http://localhost:3000` if `AUTH_URL`, `NEXTAUTH_URL`, `APP_URL`, and `VERCEL_URL` are missing.
- Why it matters: verification/order/reset links can be generated with localhost in production, breaking account activation and order recovery.
- Files: `src/lib/env.ts:3`, `src/lib/env.ts:12`, `src/lib/site.ts`, `src/lib/auth/email.ts`.
- Suggested fix: throw in production when no canonical app URL is configured; require `APP_URL` or `AUTH_URL=https://chicksjewelry.com`.
- Effort: S.

4. Login/register/resend verification lack visible rate limiting

- Problem: auth endpoints accept form posts and do not show IP/email throttling, captcha, lockout, or abuse controls.
- Why it matters: credential stuffing, brute force, and verification-email abuse are realistic production risks.
- Files: `src/app/auth/login/route.ts`, `src/app/auth/register/route.ts`, `src/app/auth/resend-verification/route.ts`, `src/lib/auth/credentials.ts`.
- Suggested fix: add Upstash/Vercel KV or DB-backed rate limits per IP and normalized email; generic errors should remain.
- Effort: M.

5. Product deletion is hard delete

- Problem: `deleteProductAction()` calls `db.product.delete()` and then deletes images.
- Why it matters: in ecommerce, deleting products can break historical reporting, order relations, analytics, and auditability. The code already has archive support, so hard delete is a production footgun.
- Files: `src/app/(admin)/admin/products/actions.ts:550`, `src/app/(admin)/admin/products/actions.ts:564`.
- Suggested fix: remove hard delete from normal admin UI; use archive/unpublish as default. Keep hard delete only for no-order draft products with explicit confirmation.
- Effort: M.

## P1 — Fontos javítások

1. Cookie banner blocks the first shopping path

- Problem: Playwright screenshots show the cookie dialog covering the homepage product showcase on both desktop and mobile.
- Why it matters: it interrupts first-scroll discovery and makes the page feel heavier than the brand direction.
- Files: `src/components/cookies/CookieBanner.tsx`, `src/app/(storefront)/layout.tsx`.
- Suggested fix: make the banner lower, narrower, less tall on mobile, or use a bottom sheet that does not obscure the first product row.
- Effort: S.

2. Homepage footer discovery cards look like placeholders

- Problem: `SiteFooter` uses CSS gradient cards for "Gyöngy/Gyémánt/Holdkő/Kristály"; in screenshot they look unfinished compared with the photographic editorial sections.
- Why it matters: the page ends with a component-library/placeholder feel.
- Files: `src/components/SiteFooter.tsx`.
- Suggested fix: replace gradients with real product/category images from the DB or remove this block until content is real.
- Effort: M.

3. Homepage image optimization is disabled in several key sections

- Problem: `HomeHero`, `HomeInstagramPromo`, and `HomePromoTileGrid` use `next/image` with `unoptimized`.
- Why it matters: LCP and bandwidth suffer, especially for hero/editorial imagery.
- Files: `src/components/home/HomeHero.tsx:21`, `src/components/home/HomeInstagramPromo.tsx`, `src/components/home/HomePromoTileGrid.tsx`.
- Suggested fix: configure image domains/loaders for Vercel Blob and local assets, remove `unoptimized`, provide accurate `sizes`.
- Effort: M.

4. Product cards use CSS background images instead of `next/image`

- Problem: `ProductCard` renders cover/secondary images as `div role="img"` with `background-image`.
- Why it matters: image optimization, responsive sizing, priority/lazy behavior, and SEO/accessibility are weaker.
- Files: `src/components/shop/ProductCard.tsx:166`.
- Suggested fix: migrate to `Image` with object-position/crop metadata support, or keep CSS only where crop math absolutely requires it and accept the performance tradeoff explicitly.
- Effort: M.

5. Product showcase lacks visible section framing/copy

- Problem: the homepage jumps from trust strip to tabs/product carousel without a strong editorial heading or purchase rationale.
- Why it matters: users see products, but the page does not sufficiently explain why these pieces are special.
- Files: `src/app/(storefront)/page.tsx`, `src/components/home/HomeProductShowcase.tsx`.
- Suggested fix: add section heading, short brand/value copy, "Összes újdonság" / "Limitált darabok" CTAs and empty/fallback states.
- Effort: S.

6. Admin IA is functional but too crowded

- Problem: sidebar has many closely related content/product paths: `Merchandising`, `Special Edition`, `Kampány bannerek`, `Kezdőlap`, `Showcase tabok`, etc.
- Why it matters: daily admin users may not know where homepage placement, category nav, and campaign content live.
- Files: `src/components/admin/AdminSidebar.tsx`.
- Suggested fix: consolidate into clearer top-level areas: Products, Orders, Content, Promotions, Media, Settings.
- Effort: M.

7. Admin sign-in uses example placeholders

- Problem: `admin@pelda.hu` and password dots are visible in the admin sign-in screenshot.
- Why it matters: looks non-production and can imply default/admin account conventions.
- Files: `src/app/admin/sign-in/page.tsx`.
- Suggested fix: remove placeholder email or use neutral `email@domain.hu`; keep copy concise.
- Effort: S.

8. No Google OAuth implementation found

- Problem: NextAuth providers include only Credentials.
- Why it matters: if Google login is expected, it is missing. If not expected, the project should explicitly not show/google-reference it.
- Files: `auth.ts`.
- Suggested fix: either add Google provider with account linking rules or document credentials-only auth.
- Effort: M.

## P2 — Brand / UX / minőségi javítások

- Hero is strong visually, but the CTA "Lepődj meg!" is weak for ecommerce. Use clearer conversion CTAs like "Fedezd fel a limitált darabokat" or "Vásárold meg a kollekciót".
- Navigation is clear on desktop, but category names look generic and crowded. Add hierarchy: Újdonságok, Karkötők, Nyakláncok, Ajándékok, Akció, Különlegességek.
- The homepage has no strong "about the maker/brand promise" storytelling section beyond the Instagram block.
- No testimonial/review section is visible on homepage.
- No visible shipping/returns/payment trust row beyond short value words.
- Newsletter copy is too casual for premium/luxury: "Nem tipikus spam..." should be more polished.
- Product cards are clean, but product name/price typography is small on desktop and mobile, weakening browse confidence.
- Mobile screenshot shows the first viewport is crowded by announcement, header, hero, value strip, and cookie modal.
- Editorial/luxury direction is present, but the color system mixes rose, olive, black, blue admin, pastel gradients, and generic dark footer. Storefront should be tightened.

## P3 — Nice to have

- Add structured data for Organization, WebSite, Product, BreadcrumbList.
- Add per-homepage OG image, not only product OG.
- Add real customer reviews/testimonials with admin moderation.
- Add image alt quality scoring in admin for product images.
- Add order invoice integration or remove "Számla hamarosan" until implemented.
- Add admin activity for product/content changes, not only orders/returns where applicable.
- Add dashboard alerts: low stock, failed payments, unpublished homepage slots, missing images.

## Homepage audit részletesen

What works:

- The first impression is much better than a raw component library. The hero uses a full-bleed editorial image, serif typography, whitespace, and a premium boutique direction.
- Cart access is visible in the header on desktop and mobile.
- The homepage has meaningful sections: hero, value strip, product showcase, Instagram promo, material/collection tiles, newsletter, footer discovery.
- Mobile layout does not visibly collapse in the screenshot; content stacks cleanly.
- Admin-managed homepage content exists through `getHomepageContent()` and admin content routes.

What is weak:

- The cookie banner dominates the first shopping area.
- The hero CTA is not commerce-clear.
- Product showcase appears before enough persuasion/storytelling.
- Footer discovery gradients look fake/placeholder.
- Some sections use large images without optimization.
- The homepage title/description are generic site-level metadata only. `src/app/layout.tsx` sets `title: siteName`; there is no richer homepage metadata or OG setup.
- Product cards and homepage showcase do not expose enough quick-buy/value info in the first glance.

What is missing:

- Customer proof/testimonials.
- Strong "why Chicks Jewelry" story.
- Shipping/returns/payment trust details.
- Featured collection with a stronger editorial narrative.
- Clear "New arrivals" and "Featured/Best sellers" section labels.
- Real category image strip sourced from product/category media.
- Homepage-specific OG image and structured data.

Suggested homepage restructure:

1. Hero
- Goal: immediate brand and conversion.
- Content: "Chicks Jewelry" editorial collection promise, one main collection message.
- Visual: one premium jewelry/lifestyle image, no card wrapper.
- CTA: "Fedezd fel a limitált darabokat"; secondary "Újdonságok".
- Files: `src/components/home/HomeHero.tsx`, `src/lib/homepage-content.ts`.

2. Brand promise / trust row
- Goal: reduce hesitation.
- Content: kézzel készített, féldrágakövek, limitált darabok, biztonságos fizetés, gyors szállítás.
- Visual: restrained text/icon row.
- CTA: none or "Tudj meg többet".
- Files: `src/components/home/ValueStrip.tsx`.

3. Featured collection
- Goal: sell one curated editorial story.
- Content: 4-6 products, short intro, collection image.
- Visual: asymmetric editorial grid.
- CTA: "Kollekció megnyitása".
- Files: `src/components/home/HomeProductShowcase.tsx`, `src/lib/homepage-showcase.ts`.

4. New arrivals
- Goal: browsing momentum.
- Content: fresh products, price, add-to-cart/wishlist.
- Visual: clean product grid, real product cards.
- CTA: "Összes újdonság".
- Files: `src/components/shop/ProductCard.tsx`, `src/lib/products-server.ts`.

5. Category strip
- Goal: route users by shopping intent.
- Content: karkötők, nyakláncok, drágakövek, ajándékok.
- Visual: real imagery, not gradients.
- CTA: category card links.
- Files: `src/components/home/HomePromoTileGrid.tsx`, `src/components/SiteFooter.tsx`.

6. Editorial/storytelling section
- Goal: brand depth.
- Content: short story about materials, maker, limited pieces.
- Visual: text + detail image, plenty of whitespace.
- CTA: "Ismerd meg a márkát".
- Files: new homepage section or `src/app/(storefront)/about/page.tsx` content reuse.

7. Testimonials
- Goal: social proof.
- Content: 3 customer quotes or review cards.
- Visual: minimal quotes, no heavy cards.
- CTA: none.
- Files: new component/admin model later.

8. Instagram/social proof
- Goal: community and live brand.
- Content: current Instagram CTA.
- Visual: keep large editorial image but optimize it.
- CTA: "Kövess Instagramon".
- Files: `src/components/home/HomeInstagramPromo.tsx`.

9. Final CTA
- Goal: close the page.
- Content: "Találd meg a következő mindennapi darabod."
- Visual: simple centered text, one button.
- CTA: "Vásárlás".
- Files: new homepage section.

Copywriting direction:

- Less generic ecommerce, more restrained editorial Hungarian.
- Replace "Lepődj meg!" with direct premium shopping CTAs.
- Avoid casual newsletter phrasing like "Nem tipikus spam"; use "Elsőként értesítünk az új, limitált darabokról és exkluzív kedvezményekről."

## Admin audit részletesen

Current admin flow:

- `/admin` dashboard exists with recent orders/activity.
- Products page is a client-managed list/edit/new experience.
- Product form supports status, stock, compare-at price, badges, category/options, homepage placement, specialties, multiple images, crop, cover image, archive.
- Orders, order detail, returns, promo codes, content, homepage showcase, announcement, gemstones, early access, and settings routes exist.
- Admin layout calls `requireAdminUser("/admin")`, so route group pages are guarded.

Missing or weak functions:

- No dedicated Media section despite Vercel Blob/image complexity.
- No Customers section; users exist in Prisma but no clear admin customer management route was found.
- Hard delete product remains available in server action.
- Admin information architecture mixes merchandising/content/campaign concepts.
- Toast/form error model appears custom and likely inconsistent across complex actions.
- Admin sign-in is visually clean but looks generic enterprise, not brand-aware.

Security risks:

- Admin route group is guarded, but all admin mutations must continue to keep their own `requireAdminUser` checks. Many do; this should be enforced as a code review rule.
- Internal cron endpoints depend on `CRON_SECRET`; this is acceptable only if production env and Vercel cron headers are documented and tested.
- Product image upload path allows client-requested paths under whitelisted prefixes. It checks prefix and unsafe path, but collision/overwrite behavior should be reviewed because `addRandomSuffix: false`.

Better admin IA:

- Dashboard: today metrics, low stock, unpaid/failed orders, open returns, content warnings.
- Products: list, create/edit, archive, inventory, product options.
- Orders: all orders, fulfillment queues, return/refund workflow.
- Collections/Categories: category nav, homepage placement, special collections, gemstone taxonomy.
- Customers: users, email verification state, orders, coupons, role/early access.
- Media: product/homepage/specialty image library, unused blob cleanup, alt text, crop preview.
- Settings: admin profile, notifications, auth/env readiness checklist, early access, announcement bar.

## Auth audit részletesen

Current auth flow:

- NextAuth v5 Credentials provider in `auth.ts`.
- Login posts to `src/app/auth/login/route.ts`.
- Register posts to `src/app/auth/register/route.ts`.
- Email verification tokens are hashed and expire.
- Credentials login rejects unverified users.
- Session is JWT-based; role and earlyAccess are stored in token/session.
- Admin pages use `requireAdminUser()`, checking login, verification, and role.

Problematic edge cases:

- Unverified login returns generic invalid credentials. Secure, but UX should direct users through resend verification after a failed login attempt without account enumeration.
- Existing unverified email registration resets password and token. This is useful, but should be rate limited.
- Password reset has token model but no real production flow.
- No OAuth provider exists.
- No visible login/register rate limiting.
- Production URL fallback can generate localhost links.

Recommended final auth architecture:

- Keep Credentials + Argon2 if that is intentional.
- Add production URL fail-fast.
- Add per-IP and per-email rate limiting to login/register/resend/reset.
- Implement full password reset.
- Add optional Google OAuth only if business wants it; define account linking rules before enabling.
- Add admin customer/user screen for verification state and roles.
- Add smoke tests for: unverified user, verified user, admin login, non-admin admin access, expired token, used token, duplicate email.

## Technikai audit

Architecture:

- App Router structure is clear: `(storefront)`, `(admin)`, API routes, auth routes.
- Server action usage is extensive. It fits the app, but complex server actions should have shared validation/error patterns.
- `AuthSessionProvider` wraps the whole app in `src/app/layout.tsx`; check whether all pages need a client session provider.

Data model:

- Prisma schema is broad and ecommerce-ready: users, products, product images, options, carts, orders, returns, promos, tokens.
- Only `USER` and `ADMIN` roles exist. The requested `EDITOR` role is not implemented.
- Product lifecycle has DRAFT/ACTIVE/ARCHIVED, which is good. Hard delete should be constrained.

API/server actions:

- Stripe webhook verifies signature and handles payment/refund events.
- Checkout validates unavailable products and insufficient stock.
- Guest order access uses hashed access tokens/cookies, which is better than raw ID-only access.
- Cron routes are secret-protected but need production env checklist coverage.

Build/lint/type:

- `npm run lint` fails.
- TypeScript passes.
- Prisma validates.
- Build passes with network access; first sandbox build failed because `next/font/google` fetch could not reach Google Fonts.

Performance:

- `unoptimized` images in hero/editorial sections.
- Product cards use background images.
- Multiple client components on homepage/header/cart/cookie stack. Some are necessary, but the homepage product carousel is fully client-side.
- Google Fonts require network at build time; consider self-hosted fonts if CI/deployment network reliability matters.

Maintainability:

- Admin product form is very large and complex.
- Inline `<style>` inside `HomeProductShowcase` makes styling harder to govern.
- Many hard-coded colors exist in components and global CSS; a tighter design token layer would help.

## Javasolt új homepage struktúra

1. Hero
- Goal: premium first impression and first conversion.
- Content: brand/category headline, one sentence value promise.
- Visual: full-width jewelry/lifestyle image, strong serif headline, restrained overlay.
- CTA: "Fedezd fel a limitált darabokat"; secondary "Újdonságok".
- Files: `src/components/home/HomeHero.tsx`, `src/lib/homepage-content.ts`.

2. Brand promise / trust row
- Goal: trust and orientation.
- Content: Kézzel alkotva, Féldrágakövek, Limitált darabok, Biztonságos fizetés, Szállítás.
- Visual: small uppercase row, optional icons.
- CTA: none.
- Files: `src/components/home/ValueStrip.tsx`.

3. Featured collection
- Goal: editorial selling.
- Content: selected collection + 4-6 products.
- Visual: split editorial/product grid.
- CTA: "Kollekció megnyitása".
- Files: `src/components/home/HomeProductShowcase.tsx`.

4. New arrivals
- Goal: commerce browse.
- Content: product grid from active new products.
- Visual: image-led cards, clearer price and CTA.
- CTA: "Összes újdonság".
- Files: `src/components/shop/ProductCard.tsx`, `src/lib/products-server.ts`.

5. Category strip
- Goal: route users.
- Content: Karkötők, Nyakláncok, Drágakövek, Ajándékok.
- Visual: real category images.
- CTA: full-card links.
- Files: `src/components/home/HomePromoTileGrid.tsx`, `src/components/CategoryNav.tsx`.

6. Editorial/storytelling section
- Goal: brand depth.
- Content: materials, handmade quality, limited approach.
- Visual: whitespace, one detail image.
- CTA: "Rólunk".
- Files: new `HomeStorySection`.

7. Testimonials
- Goal: proof.
- Content: 3 short customer quotes.
- Visual: simple text, no heavy card grid.
- CTA: none.
- Files: new model/component later.

8. Instagram/social proof
- Goal: community.
- Content: Instagram CTA and current handle.
- Visual: optimized image.
- CTA: "Kövess Instagramon".
- Files: `src/components/home/HomeInstagramPromo.tsx`.

9. Final CTA
- Goal: final conversion.
- Content: short brand closing line.
- Visual: centered, quiet.
- CTA: "Vásárlás".
- Files: new `HomeFinalCta`.

## Javasolt admin újrastruktúra

- Dashboard: daily revenue/order count, open fulfillment tasks, failed payments, low stock, homepage content warnings, recent admin activity.
- Products: all products, new/edit, drafts, archived, inventory, product options, image/crop status, product coupons.
- Orders: order list, status queues, order detail, refunds/returns, tracking updates, email resend.
- Collections/Categories: category nav, gemstone filters, special editions, homepage placements, showcase tabs.
- Customers: registered users, email verification, order history, coupons, early access, role management.
- Media: Vercel Blob uploads, product images, homepage images, unused files, alt text/crop checks, cleanup queue.
- Settings: store settings, admin profile, notification preferences, auth URL/env status, cookie/tracking IDs, early access mode.

## Implementációs roadmap

### Phase 1 — Stabilizálás

- Fix lint failure in `FilterSidebar`.
- Add production fail-fast for missing `APP_URL`/`AUTH_URL`.
- Implement full password reset or remove/reset UI references until done.
- Add auth rate limiting.
- Remove or restrict hard product delete.
- Add env readiness checklist for Stripe, Resend, Blob, Cron, Auth.
- Add smoke tests for auth/admin route protection.

### Phase 2 — Homepage és brand újraépítés

- Reduce cookie banner obstruction.
- Rewrite hero CTA/copy.
- Add homepage section headings and stronger commerce CTAs.
- Replace gradient footer discovery cards with real category/product images.
- Optimize `next/image` usage and remove unnecessary `unoptimized`.
- Add homepage metadata, OG image, and structured data.
- Add brand story and trust/testimonial sections.

### Phase 3 — Admin és ecommerce minőség

- Restructure admin sidebar and content ownership.
- Add Customers and Media admin sections.
- Improve product form error/toast/loading states.
- Add safer destructive confirmations and audit logs.
- Finish invoice UX or remove "Számla hamarosan".
- Add dashboard operational alerts.
- Expand e2e tests around checkout, admin product edits, returns, and auth edge cases.

## Első 10 konkrét teendő

1. Fix `src/components/shop/FilterSidebar.tsx:288`, then rerun `npm run lint`.
2. Make `getAuthBaseUrl()` throw in production if no real public URL is configured.
3. Implement rate limiting for `/auth/login`, `/auth/register`, `/auth/resend-verification`.
4. Complete password reset pages/routes/email sending or remove all reset references until ready.
5. Disable hard product delete for products with order history; prefer archive.
6. Reduce cookie banner size/position so it does not cover the product showcase.
7. Replace `SiteFooter` gradient discovery cards with real images or remove the block.
8. Remove `unoptimized` from homepage images after configuring image domains/loaders.
9. Add homepage-specific metadata/OG and Product/Breadcrumb structured data.
10. Refactor admin IA into Products, Orders, Collections/Categories, Customers, Media, Settings.
