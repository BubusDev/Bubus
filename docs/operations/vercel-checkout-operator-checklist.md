# Vercel Checkout Monitoring Operator Checklist

Use this checklist in the Vercel UI for project `bubuswebshop`. The app-side checkout telemetry is assumed to be live already.

## 1. Open The Correct Project

1. Open Vercel and select the `bubuswebshop` project.
2. Go to `Observability`.
3. Keep two tabs open:
   - `Observability > Logs` for ad-hoc verification
   - `Observability` area where you create dashboards and alerts

## 2. Create Dashboards In This Order

### Dashboard 1: Checkout / Payment Intent

Navigation:

1. Go to `Observability > Dashboards`.
2. Click `New Dashboard`.
3. Name it `Checkout / Payment Intent`.

Add these panels:

1. `Payment intent lifecycle volume`
   - Filter/query:
     - `source = "checkout"`
     - `recordType = "metric"`
     - `metric = "checkout_event_total"`
     - `event IN ["payment_intent_initialization_started","payment_intent_created","payment_intent_reused","payment_intent_reuse_failed","payment_intent_initialization_completed","payment_intent_initialization_rejected"]`
   - Aggregation: `sum(value)`
   - Group by: `event`, `result`
   - Visualization: `Stacked time series`
2. `Payment intent initialization latency`
   - Filter/query:
     - `source = "checkout"`
     - `recordType = "metric"`
     - `metric = "checkout_event_duration_ms"`
     - `event = "payment_intent_initialization_completed"`
   - Aggregation: `avg(value)`, `p95(value)`
   - Group by: `actorType`
   - Visualization: `Time series`
3. `Payment intent failures`
   - Filter/query:
     - `source = "checkout"`
     - `recordType = "metric"`
     - `metric = "checkout_event_total"`
     - `event IN ["payment_intent_reuse_failed","payment_intent_initialization_rejected"]`
   - Aggregation: `sum(value)`
   - Group by: `event`, `result`, `actorType`
   - Visualization: `Single stat` and `Table`

### Dashboard 2: Checkout / Webhook Finalization

Navigation:

1. Go to `Observability > Dashboards`.
2. Click `New Dashboard`.
3. Name it `Checkout / Webhook Finalization`.

Add these panels:

1. `Webhook finalization outcomes`
   - Filter/query:
     - `source = "checkout"`
     - `recordType = "metric"`
     - `metric = "checkout_event_total"`
     - `event IN ["webhook_finalization_triggered","webhook_finalization_claim","webhook_finalization_completed","webhook_finalization_stopped","webhook_finalization_skipped"]`
   - Aggregation: `sum(value)`
   - Group by: `event`, `result`
   - Visualization: `Stacked time series`
2. `Webhook finalization latency`
   - Filter/query:
     - `source = "checkout"`
     - `recordType = "metric"`
     - `metric = "checkout_event_duration_ms"`
     - `event IN ["webhook_finalization_completed","webhook_finalization_stopped","webhook_finalization_skipped"]`
   - Aggregation: `avg(value)`, `p95(value)`
   - Group by: `result`
   - Visualization: `Time series`
3. `Webhook verification/configuration failures`
   - Filter/query:
     - `source = "checkout"`
     - `recordType = "metric"`
     - `metric = "checkout_event_total"`
     - `event IN ["webhook_configuration_error","webhook_signature_verification_failed"]`
   - Aggregation: `sum(value)`
   - Group by: `event`, `result`
   - Visualization: `Table`

### Dashboard 3: Checkout / Confirmation Email

Navigation:

1. Go to `Observability > Dashboards`.
2. Click `New Dashboard`.
3. Name it `Checkout / Confirmation Email`.

Add these panels:

1. `Confirmation email lifecycle`
   - Filter/query:
     - `source = "checkout"`
     - `recordType = "metric"`
     - `metric = "checkout_event_total"`
     - `event IN ["confirmation_email_send_claimed","confirmation_email_send_skipped","confirmation_email_send_started","confirmation_email_send_aborted","confirmation_email_send_succeeded","confirmation_email_send_failed"]`
   - Aggregation: `sum(value)`
   - Group by: `event`, `result`
   - Visualization: `Stacked time series`
2. `Confirmation email send latency`
   - Filter/query:
     - `source = "checkout"`
     - `recordType = "metric"`
     - `metric = "checkout_event_duration_ms"`
     - `event IN ["confirmation_email_send_succeeded","confirmation_email_send_failed","confirmation_email_send_aborted"]`
   - Aggregation: `avg(value)`, `p95(value)`
   - Group by: `result`
   - Visualization: `Time series`
3. `Confirmation email failures by actor type`
   - Filter/query:
     - `source = "checkout"`
     - `recordType = "metric"`
     - `metric = "checkout_event_total"`
     - `event = "confirmation_email_send_failed"`
   - Aggregation: `sum(value)`
   - Group by: `actorType`
   - Visualization: `Table`

### Dashboard 4: Checkout / Cleanup

Navigation:

1. Go to `Observability > Dashboards`.
2. Click `New Dashboard`.
3. Name it `Checkout / Cleanup`.

Add these panels:

1. `Cleanup run volume`
   - Filter/query:
     - `source = "checkout"`
     - `recordType = "metric"`
     - `metric = "checkout_event_total"`
     - `event IN ["stale_checkout_cleanup_run","stale_checkout_cleanup_completed","stale_checkout_cleanup_request_started","stale_checkout_cleanup_request_completed"]`
   - Aggregation: `sum(value)`
   - Group by: `event`, `result`
   - Visualization: `Time series`
2. `Cleanup expired order spikes`
   - Filter/query:
     - `source = "checkout"`
     - `recordType = "event"`
     - `event IN ["stale_checkout_cleanup_run","stale_checkout_cleanup_completed"]`
   - Aggregation: `sum(expiredOrders)`
   - Group by: `event`
   - Visualization: `Time series`
3. `Cleanup latency`
   - Filter/query:
     - `source = "checkout"`
     - `recordType = "metric"`
     - `metric = "checkout_event_duration_ms"`
     - `event IN ["stale_checkout_cleanup_run","stale_checkout_cleanup_completed"]`
   - Aggregation: `avg(value)`, `p95(value)`
   - Group by: `event`
   - Visualization: `Time series`

## 3. Create Alerts In This Order

Use the team’s checkout/on-call notification destination for every alert.

Navigation:

1. Go to `Observability > Alerts`.
2. Click `New Alert`.
3. Create the alerts below in this order.

### Alert 1: Checkout: payment intent init failures

- Query/filter:
  - `source = "checkout"`
  - `recordType = "metric"`
  - `metric = "checkout_event_total"`
  - `event IN ["payment_intent_initialization_rejected","payment_intent_reuse_failed"]`
- Condition: `sum(value) >= 5`
- Window: `10 minutes`
- Severity: `warning`
- Notification target: team checkout/on-call channel

### Alert 2: Checkout: webhook finalization stopped

- Query/filter:
  - `source = "checkout"`
  - `recordType = "metric"`
  - `metric = "checkout_event_total"`
  - `event = "webhook_finalization_stopped"`
  - `result IN ["amount_mismatch","stock_unavailable","missing_order","missing_order_after_claim"]`
- Condition: `sum(value) >= 1`
- Window: `10 minutes`
- Severity: `critical`
- Notification target: team checkout/on-call channel

### Alert 3: Checkout: confirmation email failures

- Query/filter:
  - `source = "checkout"`
  - `recordType = "metric"`
  - `metric = "checkout_event_total"`
  - `event = "confirmation_email_send_failed"`
- Condition: `sum(value) >= 3`
- Window: `15 minutes`
- Severity: `warning`
- Notification target: team checkout/on-call channel

### Alert 4: Checkout: stale cleanup spike

- Query/filter:
  - `source = "checkout"`
  - `recordType = "event"`
  - `event = "stale_checkout_cleanup_completed"`
- Condition: `sum(expiredOrders) >= 25`
- Window: `1 hour`
- Severity: `warning`
- Notification target: team checkout/on-call channel

### Alert 5: Checkout: high latency critical paths

Create one alert with three conditions if the UI supports it. Otherwise create three separate warning alerts.

- Condition A
  - Filter/query:
    - `source = "checkout"`
    - `recordType = "metric"`
    - `metric = "checkout_event_duration_ms"`
    - `event = "payment_intent_initialization_completed"`
  - Threshold: `p95(value) >= 2500`
  - Window: `15 minutes`
- Condition B
  - Filter/query:
    - `source = "checkout"`
    - `recordType = "metric"`
    - `metric = "checkout_event_duration_ms"`
    - `event = "webhook_finalization_completed"`
  - Threshold: `p95(value) >= 4000`
  - Window: `15 minutes`
- Condition C
  - Filter/query:
    - `source = "checkout"`
    - `recordType = "metric"`
    - `metric = "checkout_event_duration_ms"`
    - `event = "confirmation_email_send_succeeded"`
  - Threshold: `p95(value) >= 5000`
  - Window: `15 minutes`
- Severity: `warning`
- Notification target: team checkout/on-call channel

## 4. Verification

1. Open `Observability > Logs`.
2. Filter to:
   - `source = "checkout"`
3. Run one real or test checkout end-to-end.
4. Confirm these records appear with the same `correlationId`:
   - `payment_intent_initialization_completed`
   - `webhook_finalization_completed`
   - `confirmation_email_send_succeeded`
5. Open `Checkout / Payment Intent` and confirm the lifecycle and latency panels show new data within the selected time range.
6. Open `Checkout / Webhook Finalization` and confirm a completed finalization event is visible.
7. Open `Checkout / Confirmation Email` and confirm a send lifecycle event is visible.
8. Trigger or wait for a cleanup run, then open `Checkout / Cleanup` and confirm:
   - `stale_checkout_cleanup_completed` appears in logs
   - the cleanup volume or expired-orders panel updates
9. Open `Observability > Alerts` and confirm all 5 alerts are enabled and attached to the correct notification target.

## 5. Manual Notes

- If Vercel does not support multi-condition latency alerts in one rule, create 3 separate latency alerts with the same thresholds above.
- If percentile aggregation is not available in the chosen alert builder, use the closest supported latency percentile or a temporary avg-based fallback and record that deviation in ops notes.
