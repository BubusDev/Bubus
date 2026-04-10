import Stripe from "stripe";

import { fromStripeAmount } from "@/lib/catalog";
import { db } from "@/lib/db";
import { recordReturnRequestHistory } from "@/lib/admin-workflow-history";
import { sendRefundConfirmationEmailIfNeeded } from "@/lib/refund-confirmation-email";
import { sendRefundFailureEmailIfNeeded } from "@/lib/refund-failure-email";

type RefundReconciliationRequest = {
  id: string;
  status: string;
  refundStatus: string;
  refundedAmount: number | null;
  refundedAt: Date | null;
  stripeRefundId: string | null;
  order: {
    currency: string;
  };
};

type RefundReconciliationResult =
  | { ok: false; reason: "invalid" | "not_found" | "stripe_error" }
  | {
      ok: true;
      refundStatus: "pending" | "succeeded" | "failed";
      refundChanged: boolean;
    };

export function isEligibleForRefundReconciliation(input: {
  refundStatus: string;
  stripeRefundId: string | null;
}) {
  return (
    (input.refundStatus === "pending" || input.refundStatus === "failed") &&
    Boolean(input.stripeRefundId)
  );
}

export async function reconcileReturnRequestRefundWithStripeRefund(params: {
  request: RefundReconciliationRequest;
  stripeRefund: Stripe.Refund;
  changedById?: string | null;
  sendConfirmationEmail?: boolean;
  sendFailureEmail?: boolean;
}): Promise<RefundReconciliationResult> {
  const {
    request,
    stripeRefund,
    changedById = null,
    sendConfirmationEmail = true,
    sendFailureEmail = true,
  } = params;

  if (!isEligibleForRefundReconciliation(request)) {
    return { ok: false as const, reason: "invalid" as const };
  }

  let nextRefundStatus: "pending" | "succeeded" | "failed" = "pending";
  let refundFailureReason: string | null = null;

  if (stripeRefund.status === "succeeded") {
    nextRefundStatus = "succeeded";
  } else if (stripeRefund.status === "failed" || stripeRefund.status === "canceled") {
    nextRefundStatus = "failed";
    refundFailureReason = stripeRefund.failure_reason ?? `Stripe refund status: ${stripeRefund.status}`;
  }

  const refundedAmount =
    typeof stripeRefund.amount === "number" && Number.isFinite(stripeRefund.amount)
      ? fromStripeAmount(stripeRefund.amount, request.order.currency)
      : request.refundedAmount;
  const refundedAt =
    nextRefundStatus === "succeeded"
      ? request.refundedAt ?? new Date(stripeRefund.created * 1000)
      : null;
  const refundChanged = request.refundStatus !== nextRefundStatus;

  const updatedRequest = await db.returnRequest.updateMany({
    where: {
      id: request.id,
      stripeRefundId: request.stripeRefundId,
      refundStatus: request.refundStatus,
    },
    data: {
      refundStatus: nextRefundStatus,
      refundedAmount,
      refundedAt,
      refundFailureReason: nextRefundStatus === "failed" ? refundFailureReason : null,
      refundProcessingAt: null,
    },
  });

  if (updatedRequest.count === 0) {
    const currentRequest = await db.returnRequest.findUnique({
      where: { id: request.id },
      select: {
        refundStatus: true,
      },
    });

    if (!currentRequest) {
      return { ok: false as const, reason: "not_found" as const };
    }

    return {
      ok: true as const,
      refundStatus:
        currentRequest.refundStatus === "succeeded" || currentRequest.refundStatus === "failed"
          ? currentRequest.refundStatus
          : "pending",
      refundChanged: false,
    };
  }

  await recordReturnRequestHistory({
    returnRequestId: request.id,
    previousStatus: request.status,
    newStatus: request.status,
    previousRefundStatus: request.refundStatus,
    newRefundStatus: nextRefundStatus,
    refundChanged,
    refundedAmount,
    stripeRefundId: request.stripeRefundId,
    changedById,
  });

  if (nextRefundStatus === "succeeded" && sendConfirmationEmail) {
    await sendRefundConfirmationEmailIfNeeded(request.id);
  }

  if (nextRefundStatus === "failed" && refundChanged && sendFailureEmail) {
    await sendRefundFailureEmailIfNeeded(request.id);
  }

  return {
    ok: true as const,
    refundStatus: nextRefundStatus,
    refundChanged,
  };
}

export async function reconcileReturnRequestRefundFromStripe(params: {
  request: RefundReconciliationRequest;
  retrieveStripeRefund: (refundId: string) => Promise<Stripe.Refund>;
  changedById?: string | null;
  sendConfirmationEmail?: boolean;
  sendFailureEmail?: boolean;
}): Promise<RefundReconciliationResult> {
  const {
    request,
    retrieveStripeRefund,
    changedById = null,
    sendConfirmationEmail = true,
    sendFailureEmail = true,
  } = params;

  if (!isEligibleForRefundReconciliation(request)) {
    return { ok: false, reason: "invalid" };
  }

  try {
    const stripeRefund = await retrieveStripeRefund(request.stripeRefundId!);

    return reconcileReturnRequestRefundWithStripeRefund({
      request,
      stripeRefund,
      changedById,
      sendConfirmationEmail,
      sendFailureEmail,
    });
  } catch {
    return { ok: false, reason: "stripe_error" };
  }
}
