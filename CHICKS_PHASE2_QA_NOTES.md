# Chicks Phase 2 QA Notes

Date: 2026-06-20

## Scope Checked

- Homepage visual QA on desktop and mobile: hero first viewport, headline/subheadline, CTA visibility, image crop, whitespace, section rhythm, product showcase readability, storytelling length, final CTA, footer transition, cookie banner, and mobile horizontal overflow.
- Homepage Hungarian copy QA: removed legacy/sugary wording from public fallbacks and kept the tone more restrained and product-led.
- Product showcase/card QA: checked stable 3:4 image ratio, mobile card sizing, product links, product names/prices, sale compare price display, and storefront-only product sourcing.
- Admin-managed homepage fallback QA: checked `getHomepageContent()`, block normalization, missing admin copy/image fallback, promo tile fallback, missing material pick behavior, and legacy copy shielding.
- SEO/metadata QA: checked homepage title, description, canonical, OG metadata, global site description, favicon/icon metadata, and Organization/WebSite JSON-LD.
- Image/performance QA: checked homepage `next/image` usage, `sizes`, hero `priority`, Vercel Blob compatibility through existing `remotePatterns`, and removed homepage `unoptimized` usage where optimization is supported.
- Accessibility basics: checked single homepage H1, CTA/link roles, focus-visible states, product showcase buttons, image alt text, cookie banner keyboard controls, and rough contrast from screenshots.

## Polish Changes Made

- Rewrote public fallback copy to avoid legacy phrases like "Lepődj meg!" and generic luxury/marketing language.
- Replaced seed/demo promo tile fallback images with existing public upload assets and more production-safe fallback labels.
- Kept legacy admin-managed copy detection in `normalizeBlock()` so old admin content maps to cleaner public fallback copy.
- Added homepage-specific metadata, OG metadata, canonical, and Organization/WebSite structured data.
- Updated global site description to Hungarian storefront copy and added icon metadata to avoid `/favicon.ico` console 404.
- Removed `unoptimized` from homepage images and added explicit `sizes` for hero, promo tiles, material picks, and Instagram block.
- Added sale compare-price rendering to homepage product showcase cards.
- Added focus-visible styles/ARIA pressed state to homepage showcase tab/nav controls.
- Removed the placeholder-feeling homepage footer discovery band so the final CTA transitions directly into the dark footer.
- Moved the cookie banner to a less intrusive desktop bottom-right placement and compacted spacing.

## Files Modified In This QA Pass

- `CHICKS_PHASE2_QA_NOTES.md`
- `src/app/(storefront)/page.tsx`
- `src/app/layout.tsx`
- `src/components/RouteAwareSiteFooter.tsx`
- `src/components/cookies/CookieBanner.tsx`
- `src/components/home/HomeHero.tsx`
- `src/components/home/HomeInstagramPromo.tsx`
- `src/components/home/HomeNewsletterBlock.tsx`
- `src/components/home/HomeProductShowcase.tsx`
- `src/components/home/HomePromoTileGrid.tsx`
- `src/components/home/ValueStrip.tsx`
- `src/lib/homepage-content.ts`
- `src/lib/site.ts`

## Screenshot / Smoke Test

- Playwright smoke ran against production build with local Chrome.
- Screenshots written to `/private/tmp/chicks-phase2-qa/`:
  - `homepage-desktop.png`
  - `homepage-mobile.png`
  - `cart.png`
  - `product.png`
- Smoke coverage:
  - `/` desktop
  - `/` mobile
  - mobile horizontal overflow check
  - console/page error check
  - `/cart`
  - first active `/product/[slug]` link found from homepage

## Check Results

- `npm run lint`: passed with 8 existing warnings for `<img>` usage outside this homepage QA scope.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed. First sandboxed run failed because `next/font` could not fetch Google Fonts; rerun with network permission passed.
- Playwright final smoke: passed, 3/3.

## Remaining Compromises

- Cookie banner is now less intrusive on homepage desktop, but on cart/PDP it can still overlap a primary content area. A more considered consent UX should be handled separately.
- Promo tile fallback images reuse the small set of currently available public upload assets; richer production imagery would improve the category section.
- Product cards outside the homepage still include existing background-image based rendering in some storefront components; not changed in this pass.
- Existing lint warnings for `<img>` remain in admin/order/ProductImageFrame files and were not part of the requested homepage/storefront redesign polish.

## Phase 3 Candidates

- Admin IA/content refactor for homepage blocks, media selection, and category discovery.
- Dedicated cookie consent layout pass with route-aware placement or non-blocking bottom sheet behavior.
- Broader image system cleanup for product cards and admin/order previews.
- Richer production image set for homepage fallback/category tiles.
- More complete SEO pass for collection pages and social preview assets.
