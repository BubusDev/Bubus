import { createHash, randomUUID } from "node:crypto";

type RecoveryLogLevel = "log" | "warn" | "error";
type RecoveryLogContext = {
  correlationId?: string;
};

type RecoveryEventData = Record<string, unknown> & {
  orderId?: string | null;
  paymentIntentId?: string | null;
  actorType?: string | null;
  status?: string | null;
  result?: string | null;
  throttleApplied?: boolean | null;
  cooldownApplied?: boolean | null;
  tokenValidationSucceeded?: boolean | null;
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

export function logOrderRecoveryEvent(
  level: RecoveryLogLevel,
  event: string,
  data: RecoveryEventData = {},
  context: RecoveryLogContext = {},
) {
  const normalizedEvent = {
    source: "checkout",
    flow: "order_recovery",
    recordType: "event",
    timestamp: new Date().toISOString(),
    event,
    correlationId: context.correlationId ?? null,
    orderId: typeof data.orderId === "string" ? data.orderId : null,
    paymentIntentId: typeof data.paymentIntentId === "string" ? data.paymentIntentId : null,
    actorType: typeof data.actorType === "string" ? data.actorType : null,
    status: typeof data.status === "string" ? data.status : null,
    result: typeof data.result === "string" ? data.result : null,
    throttleApplied: typeof data.throttleApplied === "boolean" ? data.throttleApplied : null,
    cooldownApplied: typeof data.cooldownApplied === "boolean" ? data.cooldownApplied : null,
    tokenValidationSucceeded:
      typeof data.tokenValidationSucceeded === "boolean" ? data.tokenValidationSucceeded : null,
    ...Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        key === "error" ? normalizeError(value) : value,
      ]),
    ),
  };

  console[level](JSON.stringify(normalizedEvent));
  const metricBase = {
    source: "checkout",
    flow: "order_recovery",
    recordType: "metric",
    timestamp: new Date().toISOString(),
    value: 1,
    event: normalizedEvent.event,
    correlationId: normalizedEvent.correlationId,
    orderId: normalizedEvent.orderId,
    paymentIntentId: normalizedEvent.paymentIntentId,
    actorType: normalizedEvent.actorType,
    status: normalizedEvent.status,
    result: normalizedEvent.result,
    throttleApplied: normalizedEvent.throttleApplied,
    cooldownApplied: normalizedEvent.cooldownApplied,
    tokenValidationSucceeded: normalizedEvent.tokenValidationSucceeded,
    level: level === "error" ? "error" : level === "warn" ? "warn" : "info",
  };

  console.log(JSON.stringify({
    ...metricBase,
    metric: "checkout_event_total",
  }));

  console.log(JSON.stringify({
    ...metricBase,
    metric: "order_recovery_event_total",
  }));
}

export function resolveRecoveryCorrelationId(headers: Headers) {
  return (
    headers.get("x-correlation-id") ??
    headers.get("x-request-id") ??
    randomUUID()
  );
}

export function resolveClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    headers.get("fly-client-ip") ??
    null
  );
}

export function hashClientIp(ipAddress: string) {
  return createHash("sha256").update(ipAddress).digest("hex");
}
