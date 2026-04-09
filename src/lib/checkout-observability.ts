import { randomUUID } from "node:crypto";

type CheckoutLogLevel = "log" | "warn" | "error";
type CheckoutLogContext = {
  correlationId?: string;
};
type CheckoutMetricLevel = "info" | "warn" | "error";

type CheckoutEventData = Record<string, unknown> & {
  orderId?: string | null;
  paymentIntentId?: string | null;
  actorType?: string | null;
  ownerType?: string | null;
  status?: string | null;
  result?: string | null;
  durationMs?: number | null;
};

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return error;
}

export function logCheckoutEvent(
  level: CheckoutLogLevel,
  event: string,
  data: CheckoutEventData = {},
  context: CheckoutLogContext = {},
) {
  const normalizedEvent = {
    source: "checkout",
    recordType: "event",
    timestamp: new Date().toISOString(),
    event,
    correlationId: context.correlationId ?? null,
    orderId: typeof data.orderId === "string" ? data.orderId : null,
    paymentIntentId: typeof data.paymentIntentId === "string" ? data.paymentIntentId : null,
    actorType:
      typeof data.actorType === "string"
        ? data.actorType
        : typeof data.ownerType === "string"
          ? data.ownerType
          : null,
    status: typeof data.status === "string" ? data.status : null,
    result: typeof data.result === "string" ? data.result : null,
    durationMs: typeof data.durationMs === "number" ? data.durationMs : null,
    ...Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        key === "error" ? normalizeError(value) : value,
      ]),
    ),
  };

  console[level](JSON.stringify(normalizedEvent));
  emitCheckoutMetric(level, normalizedEvent);
}

export function resolveRequestCorrelationId(request: Request) {
  return (
    request.headers.get("x-correlation-id") ??
    request.headers.get("x-request-id") ??
    randomUUID()
  );
}

function emitCheckoutMetric(level: CheckoutLogLevel, event: Record<string, unknown>) {
  const metricLevel: CheckoutMetricLevel =
    level === "error" ? "error" : level === "warn" ? "warn" : "info";

  console.log(JSON.stringify({
    source: "checkout",
    recordType: "metric",
    timestamp: new Date().toISOString(),
    metric: "checkout_event_total",
    value: 1,
    event: typeof event.event === "string" ? event.event : "unknown",
    correlationId: typeof event.correlationId === "string" ? event.correlationId : null,
    orderId: typeof event.orderId === "string" ? event.orderId : null,
    paymentIntentId: typeof event.paymentIntentId === "string" ? event.paymentIntentId : null,
    actorType: typeof event.actorType === "string" ? event.actorType : null,
    status: typeof event.status === "string" ? event.status : null,
    result: typeof event.result === "string" ? event.result : null,
    level: metricLevel,
  }));

  if (typeof event.durationMs === "number") {
    console.log(JSON.stringify({
      source: "checkout",
      recordType: "metric",
      timestamp: new Date().toISOString(),
      metric: "checkout_event_duration_ms",
      value: event.durationMs,
      event: typeof event.event === "string" ? event.event : "unknown",
      correlationId: typeof event.correlationId === "string" ? event.correlationId : null,
      orderId: typeof event.orderId === "string" ? event.orderId : null,
      paymentIntentId: typeof event.paymentIntentId === "string" ? event.paymentIntentId : null,
      actorType: typeof event.actorType === "string" ? event.actorType : null,
      status: typeof event.status === "string" ? event.status : null,
      result: typeof event.result === "string" ? event.result : null,
      level: metricLevel,
    }));
  }
}

export function createDurationTracker() {
  const startedAt = performance.now();

  return {
    elapsedMs() {
      return Math.round(performance.now() - startedAt);
    },
  };
}
