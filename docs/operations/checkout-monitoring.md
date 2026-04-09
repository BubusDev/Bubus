# Checkout Monitoring

## Sink

The current external monitoring sink is Vercel runtime logging / Observability.

Checkout telemetry is emitted as newline-delimited JSON records to stdout/stderr with:

- `source: "checkout"`
- `recordType: "event"` or `recordType: "metric"`
- `timestamp`
- normalized checkout fields:
  - `event`
  - `correlationId`
  - `orderId`
  - `paymentIntentId`
  - `actorType`
  - `status`
  - `result`

Metric-style records currently emitted:

- `metric: "checkout_event_total"`
- `metric: "checkout_event_duration_ms"`

These records are intended to be queryable in Vercel Observability or any configured Vercel log drain.

## Dashboard Views

### 1. Payment Intent Initialization

Saved filters:

- `source=checkout`
- `event in (payment_intent_initialization_started, payment_intent_created, payment_intent_reused, payment_intent_reuse_failed, payment_intent_initialization_completed)`

Recommended charts:

- Count of `checkout_event_total` grouped by `event`, `result`
- Avg / P95 of `checkout_event_duration_ms` filtered to `event=payment_intent_initialization_completed`
- Count of `payment_intent_reuse_failed`
- Count of `payment_intent_initialization_rejected`

### 2. Webhook Finalization

Saved filters:

- `source=checkout`
- `event starts with webhook_`

Recommended charts:

- Count of `webhook_finalization_completed`, `webhook_finalization_stopped`, `webhook_finalization_skipped`
- Count grouped by `result` for stopped/skipped events
- Avg / P95 of `checkout_event_duration_ms` filtered to:
  - `event=webhook_finalization_completed`
  - `event=webhook_finalization_stopped`

### 3. Confirmation Email Flow

Saved filters:

- `source=checkout`
- `event starts with confirmation_email_`

Recommended charts:

- Count of claimed / skipped / succeeded / failed email events
- Avg / P95 of `checkout_event_duration_ms` filtered to:
  - `event=confirmation_email_send_succeeded`
  - `event=confirmation_email_send_failed`
  - `event=confirmation_email_send_aborted`

### 4. Stale Checkout Cleanup

Saved filters:

- `source=checkout`
- `event in (stale_checkout_cleanup_run, stale_checkout_cleanup_completed, stale_checkout_cleanup_request_started, stale_checkout_cleanup_request_completed)`

Recommended charts:

- Sum of `expiredOrders` grouped by time bucket
- Count of cleanup runs where `result=expired_orders_found`
- Avg / P95 of `checkout_event_duration_ms` filtered to:
  - `event=stale_checkout_cleanup_run`
  - `event=stale_checkout_cleanup_completed`

## Alert Candidates

### Payment Intent

- Alert when `event=payment_intent_initialization_rejected` spikes above normal baseline
- Alert when `event=payment_intent_reuse_failed` exceeds low hourly threshold
- Alert when P95 `checkout_event_duration_ms` for `event=payment_intent_initialization_completed` crosses latency threshold

### Webhook Finalization

- Alert when `event=webhook_finalization_stopped` with `result in (amount_mismatch, stock_unavailable, missing_order)` exceeds threshold
- Alert when `event=webhook_signature_verification_failed` occurs
- Alert when P95 `checkout_event_duration_ms` for `event=webhook_finalization_completed` crosses threshold

### Confirmation Email

- Alert when `event=confirmation_email_send_failed` exceeds threshold
- Alert when `event=confirmation_email_send_skipped` with lock-related reasons trends upward unexpectedly
- Alert when P95 `checkout_event_duration_ms` for `event in (confirmation_email_send_succeeded, confirmation_email_send_failed)` crosses threshold

### Cleanup

- Alert when cleanup `expiredOrders` spikes above normal baseline
- Alert when cleanup run duration P95 increases materially

## Suggested Query Dimensions

Useful aggregations:

- by `event`
- by `result`
- by `actorType`
- by `level`
- by `orderId` or `correlationId` for incident drill-down

## Gaps

- No managed histogram backend is configured yet; latency charts depend on sink-side aggregation over `checkout_event_duration_ms`
- No trace/span model is present yet
- No retention, saved views, or alert policies are provisioned as infrastructure in this repo
