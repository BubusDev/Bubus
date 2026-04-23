# Early Access Audit

This document captures the pre-rewrite state of the early-access and auth redirect system.

## Scope

Audited files requested:

- `middleware.ts`
- `src/app/coming-soon/page.tsx`
- `src/app/early-access-pending/page.tsx`
- `src/app/(storefront)/sign-in/page.tsx`
- `src/app/(storefront)/sign-up/page.tsx`
- `src/app/auth/login/route.ts`
- `src/lib/auth.ts`
- `src/lib/auth/current-user.ts`
- `auth.ts`
- `next.config.ts`
- `src/app/layout.tsx`
- `src/app/(storefront)/layout.tsx`

Additional redirect sources found during repo sweep that can affect auth/storefront navigation:

- `src/app/(storefront)/login/page.tsx`
- `src/app/admin/sign-in/page.tsx`
- `src/app/auth/register/route.ts`
- `src/app/auth/verify-email/route.ts`

## Redirect Inventory

### `middleware.ts`

Auth source summary:

- Identity source: `getToken()` JWT at line 67.
- Access source: direct SQL query against `"User"` at lines 79-84.

Redirects:

| Line | Trigger condition | Destination | Auth source |
| --- | --- | --- | --- |
| 70-71 | `EARLY_ACCESS_MODE === true`, request is considered protected storefront path, and `token?.sub` is missing or not a string | `"/coming-soon"` with `next` set unless original path is `/` | JWT token via `getToken()` |
| 87-88 | Same protected-path conditions, token has `sub`, SQL query returns no matching user row | `"/coming-soon"` with `next` | JWT token for `sub`, DB query for user lookup |
| 95 | Same protected-path conditions, DB row exists, user is neither `ADMIN` nor `earlyAccess === true` | `"/early-access-pending"` with `next` | DB query result |

Non-redirect control paths:

- 63-64: `NextResponse.next()` if early access mode is off or path is not protected.
- 74-76: `NextResponse.next()` if DB URL is missing, which bypasses gating entirely.
- 91-92: `NextResponse.next()` for `ADMIN` or approved users.

### `src/app/coming-soon/page.tsx`

Auth source summary:

- No auth lookup.
- Reads `EARLY_ACCESS_MODE` only.

Redirects:

| Line | Trigger condition | Destination | Auth source |
| --- | --- | --- | --- |
| 50-51 | `EARLY_ACCESS_MODE === false` | `nextPath` from search params, normalized to `/` if invalid | None; env flag only |

### `src/app/early-access-pending/page.tsx`

Auth source summary:

- `getCurrentUser()` at line 30.
- `getCurrentUser()` is `auth()` session lookup plus `db.user.findUnique()` in `src/lib/auth/current-user.ts`.

Redirects:

| Line | Trigger condition | Destination | Auth source |
| --- | --- | --- | --- |
| 34-35 | `EARLY_ACCESS_MODE === false` | `nextPath` from search params, normalized to `/` if invalid | None; env flag only |
| 38-39 | `getCurrentUser()` returned `null` | `"/coming-soon"` with `next` | `auth()` session plus DB query via `getCurrentUser()` |

### `src/app/(storefront)/sign-in/page.tsx`

Auth source summary:

- `getCurrentUser()` at line 22.
- That resolves through `auth()` session plus `db.user.findUnique()`.

Redirects:

| Line | Trigger condition | Destination | Auth source |
| --- | --- | --- | --- |
| 26 | `getCurrentUser()` returns a user with truthy `emailVerifiedAt` | `nextPath` from search params, normalized to `/new-in` if invalid | `auth()` session plus DB query via `getCurrentUser()` |
| 27 | `getCurrentUser()` returns a user, but line 26 did not fire, so user exists and `emailVerifiedAt` is falsy | `"/verify-email"` | `auth()` session plus DB query via `getCurrentUser()` |

### `src/app/(storefront)/sign-up/page.tsx`

Auth source summary:

- `getCurrentUser()` at line 38.
- That resolves through `auth()` session plus `db.user.findUnique()`.

Redirects:

| Line | Trigger condition | Destination | Auth source |
| --- | --- | --- | --- |
| 43 | `getCurrentUser()` returns a user with truthy `emailVerifiedAt` | `nextPath` from search params, normalized to `/account` if invalid | `auth()` session plus DB query via `getCurrentUser()` |

### `src/app/auth/login/route.ts`

Auth source summary:

- Credentials are checked via `verifyCredentials()` at line 37, which performs a Prisma DB query.
- Session creation uses Auth.js `signIn()` at line 44.

Redirects:

| Line | Trigger condition | Destination | Auth source |
| --- | --- | --- | --- |
| 63-69 | Auth.js throws `AuthError`; if `nextPath` starts with `/admin`, chooses `/admin/sign-in`, otherwise `/sign-in`; adds `error` and `next` query params | `"/admin/sign-in?...` or `"/sign-in?...` | DB-backed credential check via `verifyCredentials()`, then Auth.js result |
| 75 | Credentials sign-in succeeded | `normalizedNextPath` | DB-backed credential check plus Auth.js session creation |

### `src/lib/auth.ts`

Auth source summary:

- All helper redirects here depend on `getCurrentUser()`.
- `getCurrentUser()` uses `auth()` session plus Prisma DB lookup.

Redirects:

| Line | Trigger condition | Destination | Auth source |
| --- | --- | --- | --- |
| 26-27 | `requireAuthenticatedUser()` called and `getCurrentUser()` returned `null` | `"/sign-in?next=..."` | `auth()` session plus DB query via `getCurrentUser()` |
| 55-56 | `requireUser()` called, user exists, but `emailVerifiedAt` is falsy | `"/verify-email"` | `auth()` session plus DB query via `getCurrentUser()` |
| 65-66 | `requireAdminUser()` called and `getCurrentUser()` returned `null` | `"/admin/sign-in?next=..."` | `auth()` session plus DB query via `getCurrentUser()` |
| 69-70 | `requireAdminUser()` called, user exists, but `emailVerifiedAt` is falsy | `"/verify-email"` | `auth()` session plus DB query via `getCurrentUser()` |
| 73-74 | `requireAdminUser()` called, user exists and is verified, but `role !== "ADMIN"` | `"/"` | `auth()` session plus DB query via `getCurrentUser()` |
| 81 | `logoutAndRedirect()` signs out with `redirectTo: "/"` | `"/"` after sign-out | Auth.js sign-out redirect |

### `src/lib/auth/current-user.ts`

Direct redirects:

- None.

Auth/session behavior:

- 13: `auth()` reads the Auth.js session/JWT.
- 26-28: Prisma `db.user.findUnique()` re-fetches the user row from the DB using `session.user.id`.
- Result is either a fresh DB row or `null`.

### `auth.ts`

Direct redirects:

- No direct redirect calls.

Redirect-related config and auth data:

- 21-23: Auth.js is configured with `pages.signIn = "/sign-in"`, so Auth.js-authored redirects for unauthenticated access target `/sign-in`.
- 30-46: `authorize()` returns `role`, `emailVerifiedAt`, and `earlyAccess` from DB-backed `verifyCredentials()`.
- 51-57: `jwt()` callback copies `role`, `emailVerifiedAt`, and `earlyAccess` from `user` into the JWT only at sign-in time.
- 61-68: `session()` callback copies those JWT values into `session.user`.

Important gap:

- The JWT callback does not refresh `role` or `earlyAccess` after sign-in, so token/session claims can become stale after an admin changes approval.

### `next.config.ts`

Redirects:

| Line | Trigger condition | Destination | Auth source |
| --- | --- | --- | --- |
| 7 | Request path is `/dragakovek` | `"/gemstones"` | None |
| 8 | Request path is `/admin/dragakovek` | `"/admin/gemstones"` | None |

These are unrelated to early access.

### `src/app/layout.tsx`

Direct redirects:

- None.

### `src/app/(storefront)/layout.tsx`

Direct redirects:

- None.

Auth/session behavior:

- 26: `getHeaderUser()` reads `getCurrentUser()`, which uses `auth()` session plus DB lookup.
- This affects header rendering, not route gating.

## Additional Redirect Sources Found Outside Requested File List

These are not the core early-access gate, but they do participate in storefront/auth navigation:

### `src/app/(storefront)/login/page.tsx`

| Line | Trigger condition | Destination | Auth source |
| --- | --- | --- | --- |
| 25-29 | Always; this page is only an alias router | `/sign-up?next=...` when `mode=register`, otherwise `/sign-in?next=...` | None |

### `src/app/admin/sign-in/page.tsx`

Auth source summary:

- `getCurrentUser()` at line 25, which is `auth()` session plus DB query.

Redirects:

| Line | Trigger condition | Destination | Auth source |
| --- | --- | --- | --- |
| 29-30 | Logged-in verified admin | `nextPath` normalized to `/admin` | `auth()` session plus DB query |
| 33-34 | Logged-in verified non-admin | `/` | `auth()` session plus DB query |

This route is excluded from storefront early-access gating by middleware, but it still changes overall auth navigation.

### `src/app/auth/register/route.ts`

| Line | Trigger condition | Destination | Auth source |
| --- | --- | --- | --- |
| 40-46 | `registerUser()` returned validation errors | `/sign-up?error=...&next=...` | DB-backed registration logic |
| 54 | Registration succeeded | `/sign-up?status=submitted&next=...` | DB-backed registration logic |
| 63-69 | Registration created user but email delivery failed with `RegisterUserError` | `/sign-up?error=emailDelivery&message=...&next=...` | DB-backed registration logic |
| 72-78 | Unhandled registration failure | `/sign-up?error=service&next=...` | DB-backed registration logic |

### `src/app/auth/verify-email/route.ts`

| Line | Trigger condition | Destination | Auth source |
| --- | --- | --- | --- |
| 15 | Always after POST; redirects back to `/verify-email` with status query param | `/verify-email?status=...` | DB-backed email verification logic |

## Conflict Analysis

These are the current disagreement points.

### 1. Middleware and pages use different truth sources

- `middleware.ts` uses JWT only for identity (`token.sub`) and then queries the DB directly for `role` and `earlyAccess`.
- `coming-soon`, `early-access-pending`, `sign-in`, `sign-up`, admin sign-in, and helpers in `src/lib/auth.ts` use `getCurrentUser()`.
- `getCurrentUser()` uses `auth()` session first, then does a DB lookup by `session.user.id`.

Result:

- Middleware decision path and page decision path are not identical systems.
- Middleware can allow a request through based on one combination of token + DB state, while a page can immediately redirect again based on session + DB state.

### 2. JWT/session claims can become stale after approval changes

Current `auth.ts` behavior:

- JWT gets `role`, `emailVerifiedAt`, and `earlyAccess` only when `user` is present in the JWT callback.
- That happens during sign-in.
- There is no refresh path for `trigger === "update"` and no periodic DB re-hydration in the JWT callback.

Result:

- If an admin changes `earlyAccess` or `role` after the user already signed in, `session.user` can remain stale until the user signs in again.

### 3. Middleware uses fresh DB access state while pages can still use stale session-derived assumptions

Specific mismatch:

- Middleware checks live DB `role` and `earlyAccess`.
- Pages like `sign-in` and `sign-up` branch on `getCurrentUser()` and `user.emailVerifiedAt`.
- `getCurrentUser()` re-queries the DB row, but its identity still comes from the JWT/session and can be absent or invalid independently from middleware’s logic.

Practical effect:

- A user can be routed to an early-access page by middleware and then redirected again by the page because the page is running its own auth logic.

### 4. `coming-soon` and `early-access-pending` still redirect on env/user state

Current behavior:

- `coming-soon` redirects away when `EARLY_ACCESS_MODE` is false.
- `early-access-pending` redirects away when `EARLY_ACCESS_MODE` is false.
- `early-access-pending` also redirects logged-out users to `/coming-soon`.

Why this conflicts:

- Middleware is already deciding who should see storefront content.
- These pages are making their own routing decisions after middleware has already chosen the destination.
- That creates a second redirect system on pages that are supposed to be terminal destinations.

### 5. `sign-in` and `sign-up` pages perform auth redirects before form render

Current behavior:

- `sign-in` redirects verified users to `nextPath` and unverified users to `/verify-email`.
- `sign-up` redirects verified users to `nextPath`.

Why this conflicts:

- These are page-level redirects outside middleware.
- They are not early-access decisions, but they still alter storefront navigation and can mask or compound early-access routing problems.

### 6. Middleware fallback on missing DB URL disables gating entirely

Current behavior:

- `middleware.ts` line 74-76 logs an error and returns `NextResponse.next()` when `DB_URL` is missing.

Why this conflicts:

- Early-access mode can be enabled while middleware silently fails open.
- That means page-level redirects and auth-page redirects become the only behavior left, which is the opposite of a single source of truth.

### 7. Environment variable handling is inconsistent across access systems

Current behavior:

- `middleware.ts` accepts `Bubus_DATABASE_URL ?? DATABASE_URL`.
- Prisma DB access in `src/lib/db.ts` accepts only `Bubus_DATABASE_URL`.

Why this conflicts:

- If only `DATABASE_URL` is configured, middleware can work while Prisma-backed auth/session lookups fail.
- That creates another source-of-truth split between middleware and the rest of the app.

### 8. Middleware `getToken()` uses the default non-secure cookie name

Current behavior:

- `middleware.ts` calls `getToken({ req, secret })` without `secureCookie`.
- Auth.js uses `__Secure-authjs.session-token` on HTTPS deployments.
- `getToken()` defaults to `authjs.session-token` unless `secureCookie` is set.

Why this conflicts:

- Production browsers authenticate with the secure cookie name.
- Middleware can treat an authenticated production user as logged out if it looks for the non-secure cookie.
- That directly breaks the approved/admin storefront flows even when the JWT itself is correct.

## Pre-Rewrite Conclusion

The bug source is not one redirect. It is the combination of:

- Middleware making routing decisions.
- Pages making their own auth-based redirects.
- Auth.js storing `role` and `earlyAccess` in JWT only at sign-in time.
- Fresh DB reads in some places, token/session-derived identity in others.
- Fail-open middleware behavior when DB config is missing.

The rewrite should collapse early-access routing to one place only: middleware.
