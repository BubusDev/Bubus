export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "FINALIZING"
  | "PAID"
  | "FAILED"
  | "CANCELED"
  | "STOCK_UNAVAILABLE";

export type ConfirmationStatusSnapshot = {
  paymentStatus: PaymentStatus;
  status: string | null;
  internalStatus: string | null;
};

type ConfirmationStatusPayload =
  | Partial<ConfirmationStatusSnapshot>
  | {
      order?: Partial<ConfirmationStatusSnapshot> | null;
    };

function hasNestedOrderPayload(
  payload: ConfirmationStatusPayload | null | undefined,
): payload is { order?: Partial<ConfirmationStatusSnapshot> | null } {
  return payload != null && "order" in payload;
}

const PENDING_PAYMENT_STATUSES: PaymentStatus[] = ["PENDING", "PROCESSING", "FINALIZING"];
const TERMINAL_PAYMENT_STATUSES: PaymentStatus[] = [
  "PAID",
  "FAILED",
  "CANCELED",
  "STOCK_UNAVAILABLE",
];

const PAYMENT_STATUS_RANK: Record<PaymentStatus, number> = {
  PENDING: 0,
  PROCESSING: 1,
  FINALIZING: 2,
  PAID: 3,
  FAILED: 3,
  CANCELED: 3,
  STOCK_UNAVAILABLE: 3,
};

function isPaymentStatus(value: unknown): value is PaymentStatus {
  return [...PENDING_PAYMENT_STATUSES, ...TERMINAL_PAYMENT_STATUSES].includes(value as PaymentStatus);
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function isPendingPaymentStatus(paymentStatus: PaymentStatus) {
  return PENDING_PAYMENT_STATUSES.includes(paymentStatus);
}

export function isTerminalPaymentStatus(paymentStatus: PaymentStatus) {
  return TERMINAL_PAYMENT_STATUSES.includes(paymentStatus);
}

export function normalizeConfirmationStatusSnapshot(
  payload: ConfirmationStatusPayload | null | undefined,
  fallbackPaymentStatus: PaymentStatus,
): ConfirmationStatusSnapshot {
  const source =
    hasNestedOrderPayload(payload) && payload.order
      ? payload.order
      : payload && !hasNestedOrderPayload(payload)
        ? payload
        : null;

  return {
    paymentStatus: isPaymentStatus(source?.paymentStatus)
      ? source.paymentStatus
      : fallbackPaymentStatus,
    status: readString(source?.status),
    internalStatus: readString(source?.internalStatus),
  };
}

export function shouldApplyConfirmationStatusUpdate(
  currentStatus: PaymentStatus,
  nextStatus: PaymentStatus,
) {
  if (currentStatus === nextStatus) {
    return false;
  }

  if (isTerminalPaymentStatus(currentStatus) && isPendingPaymentStatus(nextStatus)) {
    return false;
  }

  return PAYMENT_STATUS_RANK[nextStatus] >= PAYMENT_STATUS_RANK[currentStatus];
}
