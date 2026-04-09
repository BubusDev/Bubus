import { db } from "@/lib/db";
import { sendOrderStatusUpdateEmail } from "@/lib/auth/email";
import { getCustomerOrderStatusView } from "@/lib/order-status";
import { renderOrderStatusUpdateEmail } from "@/lib/email/order-status-update";

const STATUS_UPDATE_EMAIL_LOCK_TIMEOUT_MS = 10 * 60 * 1000;

type OrderStatusUpdateEmailContext = {
  orderId: string;
  orderNumber: string;
  accessModel: "authenticated" | "guest";
  recipientEmail: string | null;
  projectedEmailUpdateKey: string | null;
  projectedStatusLabel: string;
  projectedStatusDetail: string;
  trackingNumber: string | null;
  shippingMethodLabel: string | null;
  lastUpdatedLabel: string | null;
  lastStatusUpdateEmailKey: string | null;
  statusUpdateEmailSendingKey: string | null;
  statusUpdateEmailSendingAt: Date | null;
  statusUpdateEmailSentAt: Date | null;
};

async function getOrderStatusUpdateEmailContext(
  orderId: string,
): Promise<OrderStatusUpdateEmailContext | null> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  const customerStatus = getCustomerOrderStatusView({
    status: order.status,
    paymentStatus: order.paymentStatus,
    internalStatus: order.internalStatus,
    trackingNumber: order.trackingNumber,
    shippingMethod: order.shippingMethod,
    statusUpdatedAt: order.statusUpdatedAt,
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    accessModel: order.userId ? "authenticated" : "guest",
    recipientEmail: order.user?.email ?? order.guestEmail,
    projectedEmailUpdateKey: customerStatus.emailUpdateKey,
    projectedStatusLabel: customerStatus.label,
    projectedStatusDetail: customerStatus.detail,
    trackingNumber: customerStatus.trackingNumber,
    shippingMethodLabel: customerStatus.shippingMethodLabel,
    lastUpdatedLabel: customerStatus.lastUpdatedLabel,
    lastStatusUpdateEmailKey: order.statusUpdateEmailKey,
    statusUpdateEmailSendingKey: order.statusUpdateEmailSendingKey,
    statusUpdateEmailSendingAt: order.statusUpdateEmailSendingAt,
    statusUpdateEmailSentAt: order.statusUpdateEmailSentAt,
  };
}

async function claimOrderStatusUpdateEmailSend(orderId: string, nextKey: string, force = false) {
  const orderState = await db.order.findUnique({
    where: { id: orderId },
    select: {
      statusUpdateEmailKey: true,
      statusUpdateEmailSendingAt: true,
    },
  });

  if (!orderState || (!force && orderState.statusUpdateEmailKey === nextKey)) {
    return false;
  }

  const staleLockThreshold = new Date(Date.now() - STATUS_UPDATE_EMAIL_LOCK_TIMEOUT_MS);

  const claimed = await db.order.updateMany({
    where: {
      id: orderId,
      ...(force
        ? {}
        : {
            statusUpdateEmailKey: {
              not: nextKey,
            },
          }),
      OR: [
        { statusUpdateEmailSendingAt: null },
        { statusUpdateEmailSendingAt: { lt: staleLockThreshold } },
      ],
    },
    data: {
      statusUpdateEmailSendingKey: nextKey,
      statusUpdateEmailSendingAt: new Date(),
    },
  });

  return claimed.count > 0;
}

async function sendOrderStatusUpdateEmailForContext(
  context: OrderStatusUpdateEmailContext,
  force = false,
) {
  if (!context.projectedEmailUpdateKey) {
    return false;
  }

  if (!context.recipientEmail) {
    return false;
  }

  const claimed = await claimOrderStatusUpdateEmailSend(
    context.orderId,
    context.projectedEmailUpdateKey,
    force,
  );

  if (!claimed) {
    return false;
  }

  try {
    await sendOrderStatusUpdateEmail({
      email: context.recipientEmail,
      accessModel: context.accessModel,
      orderNumber: context.orderNumber,
      statusLabel: context.projectedStatusLabel,
      statusDetail: context.projectedStatusDetail,
      trackingNumber: context.trackingNumber,
      shippingMethodLabel: context.shippingMethodLabel,
      lastUpdatedLabel: context.lastUpdatedLabel,
    });

    await db.order.update({
      where: { id: context.orderId },
      data: {
        statusUpdateEmailKey: context.projectedEmailUpdateKey,
        statusUpdateEmailSendingKey: null,
        statusUpdateEmailSendingAt: null,
        statusUpdateEmailSentAt: new Date(),
      },
    });

    return true;
  } catch {
    await db.order.update({
      where: { id: context.orderId },
      data: {
        statusUpdateEmailSendingKey: null,
        statusUpdateEmailSendingAt: null,
      },
    });

    return false;
  }
}

export async function getOrderStatusUpdateEmailAdminState(orderId: string) {
  const context = await getOrderStatusUpdateEmailContext(orderId);

  if (!context) {
    return null;
  }

  const preview = context.projectedEmailUpdateKey
    ? renderOrderStatusUpdateEmail({
        locale: "hu",
        accessModel: context.accessModel,
        orderNumber: context.orderNumber,
        statusLabel: context.projectedStatusLabel,
        statusDetail: context.projectedStatusDetail,
        trackingNumber: context.trackingNumber,
        shippingMethodLabel: context.shippingMethodLabel,
        lastUpdatedLabel: context.lastUpdatedLabel,
      })
    : null;

  return {
    ...context,
    preview,
    isSending: Boolean(context.statusUpdateEmailSendingAt),
  };
}

export async function sendOrderStatusUpdateEmailIfNeeded(orderId: string) {
  const context = await getOrderStatusUpdateEmailContext(orderId);

  if (!context) {
    return false;
  }

  return sendOrderStatusUpdateEmailForContext(context, false);
}

export async function resendOrderStatusUpdateEmailByAdmin(orderId: string) {
  const context = await getOrderStatusUpdateEmailContext(orderId);

  if (!context) {
    return false;
  }

  return sendOrderStatusUpdateEmailForContext(context, true);
}
