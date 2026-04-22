# Inventory Audit

Date: 2026-04-21

Scope: cart -> checkout -> Stripe PaymentIntent -> webhook finalization -> inventory mutation

## Executive Summary

Code reading does **not** support the hypothesis that stock is decremented when a customer merely starts checkout or opens Stripe.

In the current codebase, `Product.stockQuantity` is decremented only in `applyCompletedOrderInventory()` during paid-order finalization:

- `src/lib/inventory.ts:100-195`
- called from `src/lib/checkout.ts:929-1237`
- reached from:
  - Stripe webhook `payment_intent.succeeded` in `src/app/api/stripe/webhook/route.ts:207-252`
  - confirmation-status reconciliation in `src/lib/checkout.ts:1240-1334`, exposed via `src/app/api/orders/[orderId]/status/route.ts:11-35`

There is **no** checkout-start decrement in:

- `src/app/api/checkout/payment-intent/route.ts:30-123`
- `src/lib/checkout.ts:382-541`

The current implementation is effectively **Option A: payment-confirms-stock**, not the currently-feared Option C.

That means:

- abandoned checkout, failed payment, canceled payment, and stale checkout cleanup do **not** decrement stock in application code
- the observed production symptom is **not explained by a premature decrement path in this repo**
- the likely remaining causes are:
  - a real `payment_intent.succeeded` arriving for orders believed to be abandoned
  - manual/admin stock edits
  - historic data corruption
  - behavior outside this repo or outside the code paths reviewed

Separate findings:

- `reservedQuantity` exists in the schema but is effectively dead; it is read in storefront availability calculations but never incremented or decremented anywhere
- there is no restock path on refund/return
- webhook processing is guarded by order-state transitions, but there is no `ProcessedWebhookEvent` table for event-level deduplication

## Part 1 - Map the Entire Inventory Flow

### 1.1 All stock mutation points

#### `src/lib/inventory.ts:100-195` - `applyCompletedOrderInventory()`

- Trigger: called during paid-order finalization
- Callers:
  - `src/lib/checkout.ts:1110-1117` inside `finalizePaidOrder()`
- External trigger:
  - Stripe `payment_intent.succeeded` webhook via `src/app/api/stripe/webhook/route.ts:207-252`
  - order confirmation polling path via `src/app/api/orders/[orderId]/status/route.ts:20` -> `src/lib/checkout.ts:1275-1285`
- Action:
  - reads current product row
  - validates archived / stock availability
  - runs `tx.product.updateMany({ data: { stockQuantity: { decrement: item.quantity }}})` at `src/lib/inventory.ts:133-144`
  - may update `soldOutAt` at `src/lib/inventory.ts:161-167`
  - writes `InventoryEvent` rows with `type: "ORDER_COMPLETED"` at `src/lib/inventory.ts:181-192`
- Transaction: YES, always used inside `db.$transaction(...)` from `finalizePaidOrder()` at `src/lib/checkout.ts:937`
- Idempotent: PARTIALLY
  - protected by order payment state claim in `src/lib/checkout.ts:962-977`
  - skips already-paid orders at `src/lib/checkout.ts:951-959`
  - no dedicated webhook-event dedupe table
- Problem:
  - not premature
  - this is the only customer-checkout stock decrement path in the repo

#### `src/app/(admin)/admin/products/actions.ts:301-331` - `createProductAction()`

- Trigger: admin creates a product
- Action:
  - creates `Product` with explicit `stockQuantity`
  - initializes `reservedQuantity: 0` at `src/app/(admin)/admin/products/actions.ts:304`
  - creates `InventoryEvent(type: "INITIAL_STOCK")` if stock > 0 at `src/app/(admin)/admin/products/actions.ts:333-342`
- Transaction: NO explicit Prisma `$transaction`
- Idempotent: NO
- Problem:
  - legitimate admin stock initialization
  - not related to checkout abandonment

#### `src/app/(admin)/admin/products/actions.ts:426-493` - `updateProductAction()`

- Trigger: admin edits a product
- Action:
  - `tx.product.update(...)` can directly set `stockQuantity` to any new value
  - logs `InventoryEvent(type: "MANUAL_ADJUSTMENT")` at `src/app/(admin)/admin/products/actions.ts:498-511`
- Transaction: product update YES (`db.$transaction`), inventory event logging NO (event insert happens after transaction commits)
- Idempotent: NO
- Problem:
  - legitimate manual override path
  - if production stock is drifting, admin edits are one non-checkout cause to audit

### Stock-related fields that are **not** currently mutated in checkout

#### `Product.reservedQuantity`

- Schema field exists at `prisma/schema.prisma:184-185`
- Availability calculations subtract it:
  - `src/lib/inventory.ts:33-39`
  - `src/lib/product-lifecycle.ts:158-177`
  - `src/lib/catalog.ts:99-102`
- Actual writes found in repo:
  - only initialization to `0` on product creation at `src/app/(admin)/admin/products/actions.ts:304`
- Conclusion:
  - reservation system is not implemented
  - storefront code is reservation-aware in shape, but no runtime code updates reservations

### Files reviewed that do **not** decrement stock

#### `src/app/api/checkout/payment-intent/route.ts:30-123`

- Trigger: client POST when user proceeds to payment
- Action: delegates to `initializeStripeCheckout()`
- Stock mutation: NONE

#### `src/lib/checkout.ts:382-541` - `initializeStripeCheckout()`

- Trigger: checkout initialization / PaymentIntent create or reuse
- Action:
  - upserts draft order
  - validates cart snapshot
  - creates or updates Stripe `PaymentIntent`
  - persists `stripePaymentIntentId`
- Stock mutation: NONE

#### `src/lib/checkout-cleanup.ts:38-88`

- Trigger: stale checkout cleanup
- Action: marks old unpaid orders as `CANCELED`
- Stock mutation: NONE

#### `src/lib/checkout.ts:792-824` - `markOrderPaymentState()`

- Trigger: payment failure / processing / cancel webhook states
- Action: updates order payment state only
- Stock mutation: NONE

#### `src/app/(admin)/admin/returns/actions.ts:466-560`

- Trigger: admin initiates Stripe refund
- Action: creates Stripe refund and updates `ReturnRequest`
- Stock mutation: NONE

### 1.2 Intended lifecycle

Recommended lifecycle for this store:

1. User adds to cart -> no stock change
2. User starts checkout -> create temporary reservation only if reservation model is adopted
3. Stripe `PaymentIntent` created -> no stock decrement
4. Payment succeeds -> commit reservation or decrement stock
5. Payment fails / checkout abandoned -> release reservation or do nothing
6. Order refunded -> restore stock according to business policy

### 1.3 Actual lifecycle in current code

Current behavior from code reading:

1. User adds to cart
   - cart row changes only
   - no stock or reservation write
2. User opens checkout
   - `getCheckoutCartSnapshot()` validates against `availableToSell`
   - no stock or reservation write
3. PaymentIntent is created or reused
   - draft order is created/updated
   - Stripe PaymentIntent is created/updated
   - no stock or reservation write
4. Payment succeeds
   - webhook `payment_intent.succeeded` calls `finalizePaidOrder()`
   - `finalizePaidOrder()` calls `applyCompletedOrderInventory()`
   - stock decrements here, inside a transaction
5. Payment fails / is canceled / checkout goes stale
   - order status changes only
   - no stock restoration is needed because no stock was reserved or decremented earlier
6. Refunds / returns
   - no stock restoration path exists

### 1.4 Actual divergence from intended flow

The codebase diverges from the proposed reservation model in two ways:

1. It does **not** reserve stock at checkout start even though `reservedQuantity` and reservation-aware availability reads suggest that idea was anticipated.
2. It does **not** restore stock on refund / return.

It does **not** diverge by decrementing stock before payment success.

### 1.5 Bug assessment for the specific production symptom

Based on code reading alone:

- there is no code path in this repo that decrements stock when a user merely opens Stripe
- the specific symptom "abandoned checkouts silently decrement stock" is **not reproducible from code structure alone**

If the symptom is real in production, the next thing to inspect is **production Stripe event history for the affected orders/payment intents**, because the only automated decrement path requires either:

- `payment_intent.succeeded` webhook handling, or
- confirmation polling observing Stripe status `succeeded`

Without production data, the exact root cause of the observed disappearing inventory cannot be proven from code alone.

## Part 2 - Stock Reservation Strategy

### Option A - Payment-confirms-stock

- Behavior:
  - no stock change in cart or checkout
  - only decrement on verified payment success
- Pros:
  - simplest implementation
  - already closest to current code
  - abandoned checkout cannot consume stock
- Cons:
  - oversell is possible when two users pay for the last unit
- Current repo status:
  - this is effectively what the app already does today

### Option B - Temporary reservation with TTL

- Behavior:
  - create reservation rows when checkout starts
  - availability = stock - active reservations
  - commit reservation on payment success
  - release on failure / cancel / expiry
- Pros:
  - standard e-commerce approach
  - solves oversell without hard-decrementing stock prematurely
  - maps well to the already-existing `reservedQuantity` / `availableToSell` concepts
- Cons:
  - more schema, cron, and idempotency complexity
- Recommendation:
  - best long-term fit for this store

### Option C - Hard lock during checkout

- Behavior:
  - decrement stock immediately when checkout starts
  - restore on failure / cancel / abandonment
- Pros:
  - prevents oversell without separate reservation accounting
- Cons:
  - fragile
  - requires perfect cleanup
  - the exact class of bug being investigated happens when restore logic is incomplete
- Current repo status:
  - **not** what this code currently does

### Recommendation

Recommend **Option B**.

Reason:

- current code already avoids premature decrement
- the real missing capability is reservation, not rollback
- `reservedQuantity` exists conceptually but is unused, so the codebase already points in this direction

## Part 3 - Implementation Plan

This section is planning only. No code changes were made as part of this audit.

### 3.1 Database changes

Add a dedicated reservation model instead of relying on the currently-unused scalar `reservedQuantity`.

Proposed schema:

```prisma
model StockReservation {
  id              String            @id @default(cuid())
  productId       String
  product         Product           @relation(fields: [productId], references: [id])
  quantity        Int
  cartId          String?
  sessionId       String?
  paymentIntentId String?           @unique
  status          ReservationStatus @default(PENDING)
  expiresAt       DateTime
  createdAt       DateTime          @default(now())
  committedAt     DateTime?
  releasedAt      DateTime?

  @@index([productId, status])
  @@index([expiresAt, status])
  @@index([paymentIntentId])
}

enum ReservationStatus {
  PENDING
  COMMITTED
  RELEASED
}
```

### 3.2 Helper: available stock calculation

Today availability is computed from `stockQuantity - reservedQuantity`, but `reservedQuantity` never changes.

Replace that with a server helper that subtracts active reservations.

### 3.3 Checkout start

Current checkout-start path:

- `src/app/api/checkout/payment-intent/route.ts:30-123`
- `src/lib/checkout.ts:382-541`

Change needed:

- keep draft order / PaymentIntent creation
- add reservation creation in the same transaction boundary as checkout initialization
- reject with 409 if any line cannot be reserved

### 3.4 Payment success webhook

Current success path:

- `src/app/api/stripe/webhook/route.ts:207-252`
- `src/lib/checkout.ts:929-1237`

Change needed:

- commit reservations and decrement stock in one transaction
- make commit idempotent per reservation and per webhook event

### 3.5 Failure / cancellation

Current failure/cancel path only changes order state:

- `src/app/api/stripe/webhook/route.ts:189-205`
- `src/lib/checkout.ts:792-824`

Change needed:

- release pending reservations for the payment intent

### 3.6 Expiration cleanup

Current cleanup route only cancels stale orders:

- `src/app/api/internal/checkout/cleanup/route.ts:21-69`
- `src/lib/checkout-cleanup.ts:38-88`

Change needed:

- add reservation-expiry cleanup
- keep stale-order cleanup separate from reservation cleanup

### 3.7 Stock display

Current storefront display uses availability helpers:

- `src/lib/product-lifecycle.ts:158-177`
- `src/lib/catalog.ts:99-102`
- `src/lib/products-server.ts:385-405`
- `src/lib/account.ts:257-288`

Change needed:

- switch those reads to real active reservations, not dead `reservedQuantity`
- admin pages should still show raw on-hand stock

## Part 4 - Data Repair

### Current limitation

There is no `initialStock` field in `Product`.

That means exact reconstruction of expected current stock from first principles is not always possible from application tables alone.

What is available:

- current `Product.stockQuantity`
- `InventoryEvent` rows:
  - `INITIAL_STOCK`
  - `MANUAL_ADJUSTMENT`
  - `ORDER_COMPLETED`
- order and return data

### Repair-script recommendation

Create `scripts/repair-inventory.ts` that:

1. reads all products
2. reconstructs expected stock from `InventoryEvent` history where possible
3. cross-checks with paid orders in the last 90 days
4. outputs discrepancies as CSV
5. does **not** auto-apply corrections

Preferred reconstruction logic:

- if `InventoryEvent` history is complete, expected stock = sum of all `quantityDelta`
- if event history is incomplete, fall back to a weaker report based on paid orders and known manual adjustments

Suggested CSV columns:

- `productId`
- `slug`
- `name`
- `currentStockQuantity`
- `reconstructedExpectedStock`
- `difference`
- `initialStockEventFound`
- `manualAdjustmentCount`
- `paidOrderUnits`
- `notes`

### Important note

Because the audited code does not prematurely decrement on checkout start, the repair script should not assume "all missing stock came from abandoned checkouts". It should produce evidence, not a theory-driven correction.

## Part 5 - Additional Robustness Improvements

### 5.1 Race-condition prevention

Current state:

- order finalization uses a transaction and claim step
- inventory decrement uses `updateMany` with `stockQuantity >= quantity`
- checkout-start path does not reserve stock, so oversell remains possible

Recommendation:

- use `Serializable` transactions for reservation creation / commit flows
- if staying on Option A, accept oversell and handle it operationally
- if moving to Option B, make reservation writes serializable

### 5.2 Stripe webhook reliability

Current state:

- signature verification exists at `src/app/api/stripe/webhook/route.ts:27-59`
- finalization is guarded by order payment state claims at `src/lib/checkout.ts:951-1033`
- there is no processed-event table keyed by Stripe event ID

Recommendation:

- add `ProcessedWebhookEvent`
- persist Stripe event ID and processing result
- short-circuit duplicate deliveries before business logic

### 5.3 Observability

Current state:

- checkout observability logs are extensive
- `InventoryEvent` exists, but only records:
  - initial stock
  - manual adjustment
  - completed order decrement
- there is no immutable audit log for all inventory-affecting decisions such as reservation create/release, refund restock, or webhook dedupe

Recommendation:

- add `StockAuditLog` with:
  - `productId`
  - `delta`
  - `reason`
  - `orderId`
  - `paymentIntentId`
  - `reservationId`
  - `userId`
  - `actorType`
- alert on negative stock and mismatched finalization outcomes

### 5.4 User experience at stock boundaries

Current state:

- server-side checkout validation exists in `getCheckoutCartSnapshot()` at `src/lib/checkout.ts:183-203`
- cart and product views already compute availability snapshots
- no reservation countdown exists

Recommendation:

- after reservation rollout, show hold-expiry countdown in checkout
- preserve current server-side recheck on checkout start
- surface product-specific stock failure messages instead of generic insufficient-stock errors

### 5.5 Testing

Current state:

- there is coverage that archived products do not decrement inventory during finalization:
  - `tests/e2e/archived-product-safety.spec.ts:398-428`
- there is no visible coverage for:
  - duplicate Stripe success events
  - reservation expiry
  - refund restock
  - two-user race on last item

Recommendation:

- add integration coverage for:
  - two buyers racing for last item
  - abandoned checkout reservation expiry
  - webhook replay / duplicate delivery
  - refund restock behavior

## Bottom Line

The audited codebase does **not** currently decrement stock on checkout initiation or on PaymentIntent creation. Stock decrements only after a payment-success path reaches `finalizePaidOrder()` and `applyCompletedOrderInventory()`.

So the exact bug as described is **not visible in code**. The code-level issues that are real and actionable are:

- no reservation system
- dead `reservedQuantity` field
- no stock restoration on refund/return
- no event-level Stripe webhook dedupe table

If inventory is disappearing for genuinely unpaid abandoned checkouts, the next audit step has to be production-data forensics on affected orders and Stripe events, because the repo alone does not show a premature stock decrement path.
