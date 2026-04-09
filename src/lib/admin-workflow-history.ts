import { db } from "@/lib/db";

export async function recordOrderWorkflowHistory(input: {
  orderId: string;
  previousStatus?: string | null;
  newStatus: string;
  changedById?: string | null;
  source: "single" | "bulk";
  previousAssigneeLabel?: string | null;
  newAssigneeLabel?: string | null;
  assignmentChanged?: boolean;
}) {
  if ((input.previousStatus ?? null) === input.newStatus) {
    if (!input.assignmentChanged) {
      return;
    }
  }

  await db.orderWorkflowHistory.create({
    data: {
      orderId: input.orderId,
      previousStatus: input.previousStatus ?? null,
      newStatus: input.newStatus,
      changedById: input.changedById ?? null,
      source: input.source,
      previousAssigneeLabel: input.previousAssigneeLabel ?? null,
      newAssigneeLabel: input.newAssigneeLabel ?? null,
      assignmentChanged: Boolean(input.assignmentChanged),
    },
  });
}

export async function recordReturnRequestHistory(input: {
  returnRequestId: string;
  previousStatus?: string | null;
  newStatus: string;
  previousRefundStatus?: string | null;
  newRefundStatus?: string | null;
  refundChanged?: boolean;
  refundedAmount?: number | null;
  stripeRefundId?: string | null;
  changedById?: string | null;
  adminNoteChanged?: boolean;
  resolutionChanged?: boolean;
  previousAssigneeLabel?: string | null;
  newAssigneeLabel?: string | null;
  assignmentChanged?: boolean;
}) {
  if (
    (input.previousStatus ?? null) === input.newStatus &&
    (input.previousRefundStatus ?? null) === (input.newRefundStatus ?? null) &&
    !input.assignmentChanged &&
    !input.refundChanged &&
    !input.adminNoteChanged &&
    !input.resolutionChanged
  ) {
    return;
  }

  await db.returnRequestHistory.create({
    data: {
      returnRequestId: input.returnRequestId,
      previousStatus: input.previousStatus ?? null,
      newStatus: input.newStatus,
      previousRefundStatus: input.previousRefundStatus ?? null,
      newRefundStatus: input.newRefundStatus ?? null,
      refundChanged: Boolean(input.refundChanged),
      refundedAmount: input.refundedAmount ?? null,
      stripeRefundId: input.stripeRefundId ?? null,
      changedById: input.changedById ?? null,
      adminNoteChanged: Boolean(input.adminNoteChanged),
      resolutionChanged: Boolean(input.resolutionChanged),
      previousAssigneeLabel: input.previousAssigneeLabel ?? null,
      newAssigneeLabel: input.newAssigneeLabel ?? null,
      assignmentChanged: Boolean(input.assignmentChanged),
    },
  });
}
