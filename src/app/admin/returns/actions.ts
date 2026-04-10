"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { toStripeAmount } from "@/lib/catalog";
import { db } from "@/lib/db";
import { recordReturnRequestHistory } from "@/lib/admin-workflow-history";
import { sendRefundConfirmationEmailIfNeeded } from "@/lib/refund-confirmation-email";
import {
  isEligibleForRefundReconciliation,
  reconcileReturnRequestRefundFromStripe,
} from "@/lib/return-refund-reconciliation";
import { getStripe } from "@/lib/stripe";

const bulkTransitionMap = {
  move_to_in_review: { from: "new", to: "in_review" },
  move_to_approved: { from: "in_review", to: "approved" },
  move_to_rejected: { from: "in_review", to: "rejected" },
  move_to_completed: { from: "approved", to: "completed" },
} as const;

const bulkRefundReconcileAction = "reconcile_refunds" as const;

type BulkRefundReconcileItemResultCode =
  | "updated_succeeded"
  | "updated_failed"
  | "updated_pending"
  | "skipped_not_eligible"
  | "skipped_missing_stripe_refund_id"
  | "skipped_unchanged"
  | "skipped_not_found"
  | "skipped_stripe_lookup_failed";

type BulkRefundReconcileItemResult = {
  requestId: string;
  code: BulkRefundReconcileItemResultCode;
};

function formatAssigneeLabel(input: { name?: string | null; email?: string | null } | null | undefined) {
  if (!input) {
    return null;
  }

  return input.name?.trim() || input.email?.trim() || null;
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readPositiveInteger(formData: FormData, key: string) {
  const value = readString(formData, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed);
}

function buildReturnsRedirect(input: {
  currentFilter: string;
  currentRefundFilter: string;
  bulk: string;
  updated?: number;
  skipped?: number;
  bulkKind?: "status_transition" | "refund_reconcile";
  bulkResults?: string;
}) {
  const targetUrl = new URL("http://localhost/admin/returns");

  if (input.currentFilter) {
    targetUrl.searchParams.set("status", input.currentFilter);
  }

  if (input.currentRefundFilter) {
    targetUrl.searchParams.set("refund", input.currentRefundFilter);
  }

  targetUrl.searchParams.set("bulk", input.bulk);

  if (input.bulkKind) {
    targetUrl.searchParams.set("bulkKind", input.bulkKind);
  }

  if (typeof input.updated === "number") {
    targetUrl.searchParams.set("updated", String(input.updated));
  }

  if (typeof input.skipped === "number") {
    targetUrl.searchParams.set("skipped", String(input.skipped));
  }

  if (input.bulkResults) {
    targetUrl.searchParams.set("bulkResults", input.bulkResults);
  }

  return `${targetUrl.pathname}${targetUrl.search}`;
}

function serializeBulkRefundReconcileResults(results: BulkRefundReconcileItemResult[]) {
  if (results.length === 0) {
    return "";
  }

  return Buffer.from(JSON.stringify(results)).toString("base64url");
}

export async function updateReturnRequestAction(formData: FormData) {
  const admin = await requireAdminUser("/admin/returns");

  const requestId = readString(formData, "requestId");

  if (!requestId) {
    return;
  }

  const status = readString(formData, "status") || "new";
  const adminNote = readString(formData, "adminNote");
  const resolution = readString(formData, "resolution");

  const previousRequest = await db.returnRequest.findUnique({
    where: { id: requestId },
    select: {
      status: true,
      refundStatus: true,
      adminNote: true,
      resolution: true,
    },
  });

  const updatedRequest = await db.returnRequest.update({
    where: { id: requestId },
    data: {
      status,
      adminNote: adminNote || null,
      resolution: resolution || null,
    },
  });

  await recordReturnRequestHistory({
    returnRequestId: requestId,
    previousStatus: previousRequest?.status ?? null,
    newStatus: updatedRequest.status,
    previousRefundStatus: previousRequest?.refundStatus ?? null,
    newRefundStatus: updatedRequest.refundStatus,
    changedById: admin.id,
    adminNoteChanged: (previousRequest?.adminNote ?? null) !== (updatedRequest.adminNote ?? null),
    resolutionChanged: (previousRequest?.resolution ?? null) !== (updatedRequest.resolution ?? null),
  });

  revalidatePath("/admin/returns");
  revalidatePath(`/admin/returns/${requestId}`);
  redirect(`/admin/returns/${requestId}`);
}

export async function bulkUpdateReturnRequestAction(formData: FormData) {
  const admin = await requireAdminUser("/admin/returns");

  const selectedRequestIds = formData
    .getAll("requestIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);
  const bulkAction = formData.get("bulkAction");
  const currentFilter =
    typeof formData.get("currentFilter") === "string" ? String(formData.get("currentFilter")) : "";
  const currentRefundFilter =
    typeof formData.get("currentRefundFilter") === "string"
      ? String(formData.get("currentRefundFilter"))
      : "";
  const redirectBase = {
    currentFilter,
    currentRefundFilter,
  };

  if (typeof bulkAction !== "string" || selectedRequestIds.length === 0) {
    redirect(buildReturnsRedirect({ ...redirectBase, bulk: "invalid" }));
  }

  if (bulkAction === bulkRefundReconcileAction) {
    const requests = await db.returnRequest.findMany({
      where: {
        id: {
          in: selectedRequestIds,
        },
      },
      select: {
        id: true,
        status: true,
        refundStatus: true,
        refundedAmount: true,
        refundedAt: true,
        stripeRefundId: true,
        order: {
          select: {
            currency: true,
          },
        },
      },
    });

    const requestMap = new Map(requests.map((request) => [request.id, request]));

    let updated = 0;
    let skipped = 0;
    const results: BulkRefundReconcileItemResult[] = [];

    for (const requestId of selectedRequestIds) {
      const request = requestMap.get(requestId);

      if (!request) {
        skipped += 1;
        results.push({ requestId, code: "skipped_not_found" });
        continue;
      }

      if (!request.stripeRefundId) {
        skipped += 1;
        results.push({ requestId, code: "skipped_missing_stripe_refund_id" });
        continue;
      }

      if (!isEligibleForRefundReconciliation(request)) {
        skipped += 1;
        results.push({ requestId, code: "skipped_not_eligible" });
        continue;
      }

      const result = await reconcileReturnRequestRefundFromStripe({
        request,
        changedById: admin.id,
        retrieveStripeRefund: (refundId) => getStripe().refunds.retrieve(refundId),
      });

      if (!result.ok) {
        skipped += 1;
        results.push({
          requestId: request.id,
          code:
            result.reason === "stripe_error"
              ? "skipped_stripe_lookup_failed"
              : result.reason === "invalid"
                ? "skipped_not_eligible"
                : "skipped_not_found",
        });
        continue;
      }

      if (!result.refundChanged) {
        skipped += 1;
        results.push({ requestId: request.id, code: "skipped_unchanged" });
        continue;
      }

      updated += 1;
      results.push({
        requestId: request.id,
        code:
          result.refundStatus === "succeeded"
            ? "updated_succeeded"
            : result.refundStatus === "failed"
              ? "updated_failed"
              : "updated_pending",
      });
    }

    revalidatePath("/admin/returns");
    for (const requestId of selectedRequestIds) {
      revalidatePath(`/admin/returns/${requestId}`);
    }

    redirect(
      buildReturnsRedirect({
        ...redirectBase,
        bulk: "done",
        bulkKind: "refund_reconcile",
        updated,
        skipped,
        bulkResults: serializeBulkRefundReconcileResults(results),
      }),
    );
  }

  if (!(bulkAction in bulkTransitionMap)) {
    redirect(buildReturnsRedirect({ ...redirectBase, bulk: "invalid" }));
  }

  const transition = bulkTransitionMap[bulkAction as keyof typeof bulkTransitionMap];
  const requests = await db.returnRequest.findMany({
    where: {
      id: {
        in: selectedRequestIds,
      },
    },
    select: {
      id: true,
      status: true,
      refundStatus: true,
    },
  });

  let updated = 0;
  let skipped = 0;

  for (const request of requests) {
    if (request.status !== transition.from) {
      skipped += 1;
      continue;
    }

    const updatedRequest = await db.returnRequest.update({
      where: { id: request.id },
      data: {
        status: transition.to,
      },
      select: {
        id: true,
        status: true,
        refundStatus: true,
      },
    });

    await recordReturnRequestHistory({
      returnRequestId: request.id,
      previousStatus: request.status,
      newStatus: updatedRequest.status,
      previousRefundStatus: request.refundStatus,
      newRefundStatus: updatedRequest.refundStatus,
      changedById: admin.id,
    });

    updated += 1;
  }

  skipped += Math.max(0, selectedRequestIds.length - requests.length);

  revalidatePath("/admin/returns");
  for (const requestId of selectedRequestIds) {
    revalidatePath(`/admin/returns/${requestId}`);
  }

  redirect(
    buildReturnsRedirect({
      ...redirectBase,
      bulk: "done",
      bulkKind: "status_transition",
      updated,
      skipped,
    }),
  );
}

export async function updateReturnRequestAssignmentAction(formData: FormData) {
  const admin = await requireAdminUser("/admin/returns");

  const requestId = readString(formData, "requestId");

  if (!requestId) {
    return;
  }

  const assignedToId = readString(formData, "assignedToId");
  const previousRequest = await db.returnRequest.findUnique({
    where: { id: requestId },
    select: {
      status: true,
      refundStatus: true,
      assignedTo: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const updatedRequest = await db.returnRequest.update({
    where: { id: requestId },
    data: {
      assignedToId: assignedToId || null,
    },
    select: {
      id: true,
      status: true,
      refundStatus: true,
      assignedTo: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  await recordReturnRequestHistory({
    returnRequestId: requestId,
    previousStatus: previousRequest?.status ?? null,
    newStatus: updatedRequest.status,
    previousRefundStatus: previousRequest?.refundStatus ?? null,
    newRefundStatus: updatedRequest.refundStatus,
    changedById: admin.id,
    previousAssigneeLabel: formatAssigneeLabel(previousRequest?.assignedTo),
    newAssigneeLabel: formatAssigneeLabel(updatedRequest.assignedTo),
    assignmentChanged:
      formatAssigneeLabel(previousRequest?.assignedTo) !== formatAssigneeLabel(updatedRequest.assignedTo),
  });

  revalidatePath("/admin/returns");
  revalidatePath(`/admin/returns/${requestId}`);
  redirect(`/admin/returns/${requestId}`);
}

export async function triggerReturnRequestRefundAction(formData: FormData) {
  const admin = await requireAdminUser("/admin/returns");

  const requestId = readString(formData, "requestId");
  const refundAmount = readPositiveInteger(formData, "refundAmount");

  if (!requestId) {
    return;
  }

  const request = await db.returnRequest.findUnique({
    where: { id: requestId },
    include: {
      order: {
        select: {
          id: true,
          total: true,
          currency: true,
          stripePaymentIntentId: true,
          paymentStatus: true,
        },
      },
    },
  });

  if (!request) {
    redirect(`/admin/returns/${requestId}?refund=invalid`);
  }

  const normalizedRefundAmount = refundAmount ?? request.order.total;
  const canRefund =
    (request.status === "approved" || request.status === "completed") &&
    request.order.paymentStatus === "PAID" &&
    Boolean(request.order.stripePaymentIntentId) &&
    normalizedRefundAmount > 0 &&
    normalizedRefundAmount <= request.order.total;
  const alreadyHandled =
    request.refundStatus === "pending" ||
    request.refundStatus === "succeeded" ||
    Boolean(request.stripeRefundId);

  if (!canRefund || alreadyHandled) {
    redirect(`/admin/returns/${requestId}?refund=invalid`);
  }

  const started = await db.returnRequest.updateMany({
    where: {
      id: request.id,
      stripeRefundId: null,
      refundStatus: {
        in: ["not_refunded", "failed"],
      },
    },
    data: {
      refundStatus: "pending",
      refundFailureReason: null,
      refundProcessingAt: new Date(),
    },
  });

  if (started.count === 0) {
    redirect(`/admin/returns/${request.id}?refund=duplicate`);
  }

  try {
    const stripeRefund = await getStripe().refunds.create({
      payment_intent: request.order.stripePaymentIntentId ?? undefined,
      amount: toStripeAmount(normalizedRefundAmount, request.order.currency),
      metadata: {
        returnRequestId: request.id,
        orderId: request.order.id,
        triggeredByAdminId: admin.id,
      },
    });

    const nextRefundStatus = stripeRefund.status === "succeeded" ? "succeeded" : "pending";
    const updatedRequest = await db.returnRequest.update({
      where: { id: request.id },
      data: {
        refundStatus: nextRefundStatus,
        refundedAmount: normalizedRefundAmount,
        refundedAt: stripeRefund.status === "succeeded" ? new Date() : null,
        stripeRefundId: stripeRefund.id,
        refundFailureReason: null,
        refundProcessingAt: null,
      },
      select: {
        status: true,
        refundStatus: true,
      },
    });

    await recordReturnRequestHistory({
      returnRequestId: request.id,
      previousStatus: request.status,
      newStatus: updatedRequest.status,
      previousRefundStatus: request.refundStatus,
      newRefundStatus: updatedRequest.refundStatus,
      refundChanged: request.refundStatus !== updatedRequest.refundStatus,
      refundedAmount: normalizedRefundAmount,
      stripeRefundId: stripeRefund.id,
      changedById: admin.id,
    });

    if (updatedRequest.refundStatus === "succeeded") {
      await sendRefundConfirmationEmailIfNeeded(request.id);
    }

    revalidatePath("/admin/returns");
    revalidatePath(`/admin/returns/${request.id}`);
    redirect(`/admin/returns/${request.id}?refund=done`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ismeretlen Stripe hiba.";
    const updatedRequest = await db.returnRequest.update({
      where: { id: request.id },
      data: {
        refundStatus: "failed",
        refundFailureReason: message,
        refundProcessingAt: null,
      },
      select: {
        status: true,
        refundStatus: true,
      },
    });

    await recordReturnRequestHistory({
      returnRequestId: request.id,
      previousStatus: request.status,
      newStatus: updatedRequest.status,
      previousRefundStatus: request.refundStatus,
      newRefundStatus: updatedRequest.refundStatus,
      refundChanged: request.refundStatus !== updatedRequest.refundStatus,
      changedById: admin.id,
    });

    revalidatePath("/admin/returns");
    revalidatePath(`/admin/returns/${request.id}`);
    redirect(`/admin/returns/${request.id}?refund=failed`);
  }
}

export async function reconcileReturnRequestRefundAction(formData: FormData) {
  const admin = await requireAdminUser("/admin/returns");
  const requestId = readString(formData, "requestId");

  if (!requestId) {
    return;
  }

  const request = await db.returnRequest.findUnique({
    where: { id: requestId },
    include: {
      order: {
        select: {
          currency: true,
        },
      },
    },
  });

  if (!request || !isEligibleForRefundReconciliation(request)) {
    redirect(`/admin/returns/${requestId}?refund=invalid`);
  }
  const result = await reconcileReturnRequestRefundFromStripe({
    request,
    changedById: admin.id,
    retrieveStripeRefund: (refundId) => getStripe().refunds.retrieve(refundId),
  });

  revalidatePath("/admin/returns");
  revalidatePath(`/admin/returns/${request.id}`);

  if (!result.ok) {
    redirect(`/admin/returns/${request.id}?refund=reconcile_error`);
  }

  if (result.refundStatus === "pending") {
    redirect(`/admin/returns/${request.id}?refund=still_pending`);
  }

  redirect(`/admin/returns/${request.id}?refund=reconciled`);
}
