import { db } from "@/lib/db";
import { formatPrice } from "@/lib/catalog";
import { sendRefundConfirmationEmail } from "@/lib/auth/email";

const REFUND_CONFIRMATION_EMAIL_LOCK_TIMEOUT_MS = 10 * 60 * 1000;

type RefundConfirmationEmailContext = {
  requestId: string;
  recipientEmail: string | null;
  accessModel: "authenticated" | "guest";
  orderNumber: string;
  refundedAmountLabel: string;
  refundedAtLabel: string;
  refundConfirmationEmailSendingAt: Date | null;
  refundConfirmationEmailSentAt: Date | null;
};

async function getRefundConfirmationEmailContext(
  requestId: string,
): Promise<RefundConfirmationEmailContext | null> {
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

  if (!request || request.refundStatus !== "succeeded") {
    return null;
  }

  return {
    requestId: request.id,
    recipientEmail: request.order.user?.email ?? request.order.guestEmail ?? request.requesterEmail,
    accessModel: request.order.userId ? "authenticated" : "guest",
    orderNumber: request.order.orderNumber,
    refundedAmountLabel: formatPrice(request.refundedAmount ?? 0),
    refundedAtLabel: (request.refundedAt ?? request.updatedAt).toLocaleString("hu-HU"),
    refundConfirmationEmailSendingAt: request.refundConfirmationEmailSendingAt,
    refundConfirmationEmailSentAt: request.refundConfirmationEmailSentAt,
  };
}

async function claimRefundConfirmationEmailSend(requestId: string) {
  const staleLockThreshold = new Date(Date.now() - REFUND_CONFIRMATION_EMAIL_LOCK_TIMEOUT_MS);

  const claimed = await db.returnRequest.updateMany({
    where: {
      id: requestId,
      refundStatus: "succeeded",
      refundConfirmationEmailSentAt: null,
      OR: [
        { refundConfirmationEmailSendingAt: null },
        { refundConfirmationEmailSendingAt: { lt: staleLockThreshold } },
      ],
    },
    data: {
      refundConfirmationEmailSendingAt: new Date(),
    },
  });

  return claimed.count > 0;
}

export async function sendRefundConfirmationEmailIfNeeded(requestId: string) {
  const context = await getRefundConfirmationEmailContext(requestId);

  if (!context?.recipientEmail) {
    return false;
  }

  if (context.refundConfirmationEmailSentAt) {
    return false;
  }

  const claimed = await claimRefundConfirmationEmailSend(requestId);

  if (!claimed) {
    return false;
  }

  try {
    await sendRefundConfirmationEmail({
      email: context.recipientEmail,
      accessModel: context.accessModel,
      orderNumber: context.orderNumber,
      refundedAmountLabel: context.refundedAmountLabel,
      refundedAtLabel: context.refundedAtLabel,
    });

    await db.returnRequest.update({
      where: { id: requestId },
      data: {
        refundConfirmationEmailSendingAt: null,
        refundConfirmationEmailSentAt: new Date(),
      },
    });

    return true;
  } catch {
    await db.returnRequest.update({
      where: { id: requestId },
      data: {
        refundConfirmationEmailSendingAt: null,
      },
    });

    return false;
  }
}
