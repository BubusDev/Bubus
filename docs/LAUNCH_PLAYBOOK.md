# Launch Playbook

This document is the single source of truth for transitioning the Chicks Jewelry webshop from pre-launch (early access) mode to public live mode.

## Pre-launch checklist

Before executing the launch, confirm ALL items are complete:

- [ ] Production audit findings addressed (see `docs/PRODUCTION_AUDIT.md` if it exists)
- [ ] Legal placeholders replaced on `/privacy` page (grep returns zero `[PLACEHOLDER: ...]` matches)
- [ ] Legal placeholders replaced on `/cookies` page
- [ ] `CONSENT_LOG_SALT` env var set in Vercel Production
- [ ] Stripe webhook configured in production and signature secret set
- [ ] Database backups verified (can restore from backup if needed)
- [ ] End-to-end purchase flow tested on production with real card + refund
- [ ] Email notifications working (order confirmation, shipping, etc.)
- [ ] All images optimized and loading correctly on slow connections
- [ ] Mobile responsive layout verified on real devices
- [ ] SEO metadata present on all public pages (`generateMetadata`)

## Launch steps (in order)

### Step 1 — Disable early access gate

In Vercel Dashboard → Settings → Environment Variables:

- Find `EARLY_ACCESS_MODE`
- Change value from `true` to `false`
- Environment: Production ✓
- Save

**Do NOT redeploy yet** — continue to Step 2 first.

### Step 2 — Enable search engine indexing

Remove noindex directives in two places:

**File 1: `public/robots.txt`**

Replace current content:

```txt
User-agent: *
Disallow: /
```

With production version:

```txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /checkout/
Disallow: /account/
Disallow: /orders/
Disallow: /favourites
Disallow: /cart

Sitemap: https://www.chicksjewelry.com/sitemap.xml
```

**File 2: `src/app/layout.tsx`**

Remove or change the robots metadata:

```ts
// Remove this block:
robots: {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
},
```

Or replace with production version:

```ts
robots: {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true },
},
```

### Step 3 — Generate sitemap

If `src/app/sitemap.ts` doesn't exist, create it:

```ts
import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true, updatedAt: true },
  });

  const baseUrl = 'https://www.chicksjewelry.com';

  const staticPages = [
    '', '/new-in', '/necklaces', '/bracelets', '/gemstones',
    '/about', '/contact', '/faq', '/terms', '/privacy', '/cookies',
  ];

  return [
    ...staticPages.map(path => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    })),
    ...products.map(p => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ];
}
```

### Step 4 — Bulk approve existing test users (optional)

If there are test/beta users in the DB whose `earlyAccess = false` and you want them to have full access going forward, run:

Via admin UI: `/admin/settings/early-access` → "Mindenkit jóváhagy" button

Or via SQL in Neon:

```sql
UPDATE "User" SET "earlyAccess" = true WHERE "earlyAccess" = false;
```

This is optional — since `EARLY_ACCESS_MODE=false` means the gate is off anyway, everyone has access. But having all users approved keeps the data clean if you ever re-enable the gate.

### Step 5 — Commit and deploy

```bash
git add public/robots.txt src/app/layout.tsx src/app/sitemap.ts
git commit -m "Launch: enable indexing, remove noindex, add sitemap"
git push
```

Vercel auto-deploys on push. Wait ~2 minutes for the deployment to complete.

### Step 6 — Verify production

Run these curl commands and confirm expected responses:

```bash
# Main pages should return 200, not 307
curl -sI https://www.chicksjewelry.com/ | grep -i "http\|location"
curl -sI https://www.chicksjewelry.com/necklaces | grep -i "http\|location"

# Sitemap and robots
curl https://www.chicksjewelry.com/robots.txt
curl https://www.chicksjewelry.com/sitemap.xml
```

Expected:

- `/` returns 200 (not 307 to `/coming-soon`)
- `/necklaces` returns 200
- `/robots.txt` shows "Allow: /" not "Disallow: /"
- `/sitemap.xml` returns valid XML with all products listed

### Step 7 — Test in browser

1. Incognito window → `chicksjewelry.com` → homepage loads immediately (no coming-soon)
2. Navigate to a product → product page loads
3. Add to cart → proceed to checkout → Stripe payment flow works
4. Complete a test purchase with a real card ($1 minimum)
5. Verify order confirmation email received
6. Verify order appears in `/admin/orders`
7. Refund the test order via `/admin/orders/[id]`
8. Verify refund email received

### Step 8 — Submit to Google

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property for `chicksjewelry.com`
3. Verify ownership (DNS or HTML file)
4. Submit sitemap: `https://www.chicksjewelry.com/sitemap.xml`
5. Request indexing for homepage and main category pages

### Step 9 — Announce launch

Now safe to:

- Post on Instagram
- Send launch email to newsletter subscribers (if any)
- Share with friends and customers

## Rollback procedure

If something goes wrong after launch and you need to re-enable early access:

1. Vercel env var → `EARLY_ACCESS_MODE=true` → Save → Redeploy
2. Site returns to coming-soon page for non-approved users
3. Investigate the issue, fix, then repeat launch steps

Early access infrastructure stays in the codebase permanently — it's reusable for future soft launches (new product lines, members-only events, etc).

## Post-launch monitoring

First 48 hours:

- Check Vercel Function Logs for errors
- Check Stripe Dashboard for payment issues
- Monitor Google Search Console for indexing progress
- Watch for customer support emails

## Do NOT do these at launch

- Do NOT delete the `/coming-soon` or `/early-access-pending` pages — they stay for future use
- Do NOT remove the middleware early-access logic — it's behind the env flag, harmless when disabled
- Do NOT delete the `earlyAccess` database column — keeps historical data
- Do NOT remove the admin whitelist page — useful for future campaigns
