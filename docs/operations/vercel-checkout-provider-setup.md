# Vercel Checkout Monitoring Setup

This document turns the checkout observability spec into provider-ready dashboard and alert definitions for Vercel Observability using the current emitted JSON records.

## Data Model Assumptions

All checkout telemetry is emitted as JSON logs with:

- `source = "checkout"`
- `recordType = "event"` or `recordType = "metric"`
- `metric = "checkout_event_total"` or `metric = "checkout_event_duration_ms"` for metric-style records
- normalized dimensions:
  - `event`
  - `correlationId`
  - `orderId`
  - `paymentIntentId`
  - `actorType`
  - `status`
  - `result`
  - `level`

## Dashboards

### Dashboard: Checkout / Payment Intent

Dashboard name:

- `Checkout / Payment Intent`

Panels:

1. `Payment intent lifecycle volume`
- Data source: logs/metrics
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_total`
  - `event IN [payment_intent_initialization_started, payment_intent_created, payment_intent_reused, payment_intent_reuse_failed, payment_intent_initialization_completed, payment_intent_initialization_rejected]`
- Visualization: stacked time series
- Aggregation: sum(`value`)
- Group by: `event`, `result`

2. `Payment intent initialization latency`
- Data source: logs/metrics
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_duration_ms`
  - `event = payment_intent_initialization_completed`
- Visualization: time series
- Aggregation: avg(`value`), p95(`value`)
- Group by: `actorType`

3. `Payment intent failures`
- Data source: logs/metrics
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_total`
  - `event IN [payment_intent_reuse_failed, payment_intent_initialization_rejected]`
- Visualization: single stat + table
- Aggregation: sum(`value`)
- Group by: `event`, `result`, `actorType`

### Dashboard: Checkout / Webhook Finalization

Dashboard name:

- `Checkout / Webhook Finalization`

Panels:

1. `Webhook finalization outcomes`
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_total`
  - `event IN [webhook_finalization_triggered, webhook_finalization_claim, webhook_finalization_completed, webhook_finalization_stopped, webhook_finalization_skipped]`
- Visualization: stacked time series
- Aggregation: sum(`value`)
- Group by: `event`, `result`

2. `Webhook finalization latency`
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_duration_ms`
  - `event IN [webhook_finalization_completed, webhook_finalization_stopped, webhook_finalization_skipped]`
- Visualization: time series
- Aggregation: avg(`value`), p95(`value`)
- Group by: `result`

3. `Webhook verification/configuration failures`
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_total`
  - `event IN [webhook_configuration_error, webhook_signature_verification_failed]`
- Visualization: table
- Aggregation: sum(`value`)
- Group by: `event`, `result`

### Dashboard: Checkout / Confirmation Email

Dashboard name:

- `Checkout / Confirmation Email`

Panels:

1. `Confirmation email lifecycle`
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_total`
  - `event IN [confirmation_email_send_claimed, confirmation_email_send_skipped, confirmation_email_send_started, confirmation_email_send_aborted, confirmation_email_send_succeeded, confirmation_email_send_failed]`
- Visualization: stacked time series
- Aggregation: sum(`value`)
- Group by: `event`, `result`

2. `Confirmation email send latency`
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_duration_ms`
  - `event IN [confirmation_email_send_succeeded, confirmation_email_send_failed, confirmation_email_send_aborted]`
- Visualization: time series
- Aggregation: avg(`value`), p95(`value`)
- Group by: `result`

3. `Confirmation email failures by actor type`
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_total`
  - `event = confirmation_email_send_failed`
- Visualization: table
- Aggregation: sum(`value`)
- Group by: `actorType`

### Dashboard: Checkout / Cleanup

Dashboard name:

- `Checkout / Cleanup`

Panels:

1. `Cleanup run volume`
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_total`
  - `event IN [stale_checkout_cleanup_run, stale_checkout_cleanup_completed, stale_checkout_cleanup_request_started, stale_checkout_cleanup_request_completed]`
- Visualization: time series
- Aggregation: sum(`value`)
- Group by: `event`, `result`

2. `Cleanup expired order spikes`
- Data source: structured event logs
- Filter:
  - `source = checkout`
  - `recordType = event`
  - `event IN [stale_checkout_cleanup_run, stale_checkout_cleanup_completed]`
- Visualization: time series
- Aggregation: sum(`expiredOrders`)
- Group by: `event`

3. `Cleanup latency`
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_duration_ms`
  - `event IN [stale_checkout_cleanup_run, stale_checkout_cleanup_completed]`
- Visualization: time series
- Aggregation: avg(`value`), p95(`value`)
- Group by: `event`

## Alerts

### Alert: Payment intent initialization failures

Name:

- `Checkout: payment intent init failures`

Condition:

- Source: `checkout_event_total`
- Window: 10 minutes
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_total`
  - `event IN [payment_intent_initialization_rejected, payment_intent_reuse_failed]`
- Trigger: sum(`value`) >= 5 in 10 minutes
- Severity: warning

### Alert: Webhook finalization stopped

Name:

- `Checkout: webhook finalization stopped`

Condition:

- Source: `checkout_event_total`
- Window: 10 minutes
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_total`
  - `event = webhook_finalization_stopped`
  - `result IN [amount_mismatch, stock_unavailable, missing_order, missing_order_after_claim]`
- Trigger: sum(`value`) >= 1 in 10 minutes
- Severity: critical

### Alert: Confirmation email failures

Name:

- `Checkout: confirmation email failures`

Condition:

- Source: `checkout_event_total`
- Window: 15 minutes
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_total`
  - `event = confirmation_email_send_failed`
- Trigger: sum(`value`) >= 3 in 15 minutes
- Severity: warning

### Alert: Stale cleanup spike

Name:

- `Checkout: stale cleanup spike`

Condition:

- Source: event logs
- Window: 1 hour
- Filter:
  - `source = checkout`
  - `recordType = event`
  - `event = stale_checkout_cleanup_completed`
- Trigger: sum(`expiredOrders`) >= 25 in 1 hour
- Severity: warning

### Alert: High latency on critical paths

Name:

- `Checkout: high latency critical paths`

Condition A:

- Source: `checkout_event_duration_ms`
- Window: 15 minutes
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_duration_ms`
  - `event = payment_intent_initialization_completed`
- Trigger: p95(`value`) >= 2500
- Severity: warning

Condition B:

- Source: `checkout_event_duration_ms`
- Window: 15 minutes
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_duration_ms`
  - `event = webhook_finalization_completed`
- Trigger: p95(`value`) >= 4000
- Severity: warning

Condition C:

- Source: `checkout_event_duration_ms`
- Window: 15 minutes
- Filter:
  - `source = checkout`
  - `recordType = metric`
  - `metric = checkout_event_duration_ms`
  - `event = confirmation_email_send_succeeded`
- Trigger: p95(`value`) >= 5000
- Severity: warning

## Manual Provider UI Steps

Because this repository does not currently contain authenticated Vercel Observability provisioning access, the following still must be performed manually in the provider UI:

1. Create the 4 dashboards with the panel definitions above.
2. Save the panel filters/views in Vercel Observability.
3. Create the 5 alert rules and wire notification targets.
4. Choose retention, alert mute windows, and ownership.

## Remaining Gaps

- No histogram-native metric backend is configured; latency charts depend on sink-side percentile aggregation over `checkout_event_duration_ms`
- No full tracing/span model
- No config-as-code provisioning for Vercel dashboards/alerts in this repo
- No retention tuning or notification routing policy is encoded here
