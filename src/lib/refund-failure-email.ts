import { db } from "@/lib/db";
import { sendRefundFailureEmail } from "@/lib/auth/email";

const REFUND_FAILURE_EMAIL_LOCK_TIMEOUT_MS = 10 * 60 * 1000;

type RefundFailureEmailContext = {
  requestId: string;
  recipientEmail: string | null;
  accessModel: "authenticated" | "guest";
  orderNumber: string;
  refundFailureEmailSendingAt: Date | null;
  refundFailureEmailSentAt: Date | null;
};

async function getRefundFailureEmailContext(
  requestId: string,
): Promise<RefundFailureEmailContext | null> {
  const request = await db.returnRequest.findUnique({
    where: { id: requestId },
    include: {
      order: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  });

  if (!request || request.refundStatus !== "failed") {
    return null;
  }

  return {
    requestId: request.id,
    recipientEmail: request.order.user?.email ?? request.order.guestEmail ?? request.requesterEmail,
    accessModel: request.order.userId ? "authenticated" : "guest",
    orderNumber: request.order.orderNumber,
    refundFailureEmailSendingAt: request.refundFailureEmailSendingAt,
    refundFailureEmailSentAt: request.refundFailureEmailSentAt,
  };
}

async function claimRefundFailureEmailSend(requestId: string) {
  const staleLockThreshold = new Date(Date.now() - REFUND_FAILURE_EMAIL_LOCK_TIMEOUT_MS);

  const claimed = await db.returnRequest.updateMany({
    where: {
      id: requestId,
      refundStatus: "failed",
      refundFailureEmailSentAt: null,
      OR: [
        { refundFailureEmailSendingAt: null },
        { refundFailureEmailSendingAt: { lt: staleLockThreshold } },
      ],
    },
    data: {
      refundFailureEmailSendingAt: new Date(),
    },
  });

  return claimed.count > 0;
}

export async function sendRefundFailureEmailIfNeeded(requestId: string) {
  const context = await getRefundFailureEmailContext(requestId);

  if (!context?.recipientEmail) {
    return false;
  }

  if (context.refundFailureEmailSentAt) {
    return false;
  }

  const claimed = await claimRefundFailureEmailSend(requestId);

  if (!claimed) {
    return false;
  }

  try {
    await sendRefundFailureEmail({
      email: context.recipientEmail,
      accessModel: context.accessModel,
      orderNumber: context.orderNumber,
    });

    await db.returnRequest.update({
      where: { id: requestId },
      data: {
        refundFailureEmailSendingAt: null,
        refundFailureEmailSentAt: new Date(),
      },
    });

    return true;
  } catch {
    await db.returnRequest.update({
      where: { id: requestId },
      data: {
        refundFailureEmailSendingAt: null,
      },
    });

    return false;
  }
}
