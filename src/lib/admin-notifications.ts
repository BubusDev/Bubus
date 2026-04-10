import { db } from "@/lib/db";
import { sendTransactionalEmail } from "@/lib/auth/email";
import { formatPrice } from "@/lib/catalog";
import { LOW_STOCK_THRESHOLD } from "@/lib/inventory";
const SUMMARY_TIME_ZONE = "Europe/Budapest";

type AdminNotificationPreferenceKey =
  | "adminNotifyNewOrder"
  | "adminNotifyReturnRequest"
  | "adminNotifyLowStock"
  | "adminNotifyWeeklySummary";

async function getAdminRecipients(preference: AdminNotificationPreferenceKey) {
  return db.user.findMany({
    where: {
      role: "ADMIN",
      emailVerifiedAt: { not: null },
      [preference]: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("hu-HU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: SUMMARY_TIME_ZONE,
  }).format(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendToAdmins(
  preference: AdminNotificationPreferenceKey,
  subject: string,
  render: (admin: { id: string; email: string; name: string }) => { html: string; text: string },
) {
  const recipients = await getAdminRecipients(preference);

  await Promise.all(
    recipients.map((admin) =>
      sendTransactionalEmail({
        to: admin.email,
        subject,
        ...render(admin),
      }),
    ),
  );

  return recipients.length;
}

async function claimNewOrderAdminNotification(orderId: string) {
  const claimed = await db.order.updateMany({
    where: {
      id: orderId,
      adminNewOrderNotificationSentAt: null,
      adminNewOrderNotificationSendingAt: null,
    },
    data: {
      adminNewOrderNotificationSendingAt: new Date(),
    },
  });

  return claimed.count > 0;
}

export async function sendNewOrderAdminNotificationIfNeeded(orderId: string) {
  const claimed = await claimNewOrderAdminNotification(orderId);

  if (!claimed) {
    return false;
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: {
        select: { email: true },
      },
    },
  });

  if (!order) {
    return false;
  }

  try {
    await sendToAdmins(
      "adminNotifyNewOrder",
      `Új rendelés érkezett: ${order.orderNumber}`,
      () => ({
        text: [
          "Új rendelés érkezett.",
          `Rendelésszám: ${order.orderNumber}`,
          `Leadva: ${formatDateTime(order.createdAt)}`,
          `Végösszeg: ${formatPrice(order.total)}`,
          `Vevő: ${order.shippingName}`,
          `E-mail: ${order.user?.email ?? order.guestEmail ?? "nincs megadva"}`,
          `Tételek: ${order.items.map((item) => `${item.productName} (${item.quantity} db)`).join(", ")}`,
        ].join("\n"),
        html: [
          "<p>Új rendelés érkezett.</p>",
          `<p><strong>Rendelésszám:</strong> ${escapeHtml(order.orderNumber)}<br />`,
          `<strong>Leadva:</strong> ${escapeHtml(formatDateTime(order.createdAt))}<br />`,
          `<strong>Végösszeg:</strong> ${escapeHtml(formatPrice(order.total))}<br />`,
          `<strong>Vevő:</strong> ${escapeHtml(order.shippingName)}<br />`,
          `<strong>E-mail:</strong> ${escapeHtml(order.user?.email ?? order.guestEmail ?? "nincs megadva")}</p>`,
          `<p><strong>Tételek:</strong> ${escapeHtml(order.items.map((item) => `${item.productName} (${item.quantity} db)`).join(", "))}</p>`,
        ].join(""),
      }),
    );

    await db.order.update({
      where: { id: orderId },
      data: {
        adminNewOrderNotificationSendingAt: null,
        adminNewOrderNotificationSentAt: new Date(),
      },
    });

    return true;
  } catch {
    await db.order.update({
      where: { id: orderId },
      data: {
        adminNewOrderNotificationSendingAt: null,
      },
    });

    return false;
  }
}

export async function sendLowStockAdminNotificationIfNeeded(input: {
  productId: string;
  productName: string;
  productSlug: string;
  stockAfter: number;
}) {
  if (input.stockAfter <= 0 || input.stockAfter >= LOW_STOCK_THRESHOLD) {
    return false;
  }

  const claimed = await db.product.updateMany({
    where: {
      id: input.productId,
      stockQuantity: input.stockAfter,
      lowStockAlertSentAt: null,
    },
    data: {
      lowStockAlertSentAt: new Date(),
    },
  });

  if (claimed.count === 0) {
    return false;
  }

  try {
    await sendToAdmins(
      "adminNotifyLowStock",
      `Alacsony készlet: ${input.productName}`,
      () => ({
        text: [
          "Egy termék alacsony készletszintre csökkent.",
          `Termék: ${input.productName}`,
          `Slug: ${input.productSlug}`,
          `Elérhető készlet: ${input.stockAfter} db`,
        ].join("\n"),
        html: [
          "<p>Egy termék alacsony készletszintre csökkent.</p>",
          `<p><strong>Termék:</strong> ${escapeHtml(input.productName)}<br />`,
          `<strong>Slug:</strong> ${escapeHtml(input.productSlug)}<br />`,
          `<strong>Elérhető készlet:</strong> ${input.stockAfter} db</p>`,
        ].join(""),
      }),
    );

    return true;
  } catch {
    await db.product.update({
      where: { id: input.productId },
      data: { lowStockAlertSentAt: null },
    });

    return false;
  }
}

export async function sendOutOfStockAdminNotification(input: {
  productName: string;
  productSlug: string;
}) {
  await sendToAdmins(
    "adminNotifyLowStock",
    `Elfogyott készlet: ${input.productName}`,
    () => ({
      text: [
        "Egy termék teljesen elfogyott.",
        `Termék: ${input.productName}`,
        `Slug: ${input.productSlug}`,
        "Elérhető készlet: 0 db",
      ].join("\n"),
      html: [
        "<p>Egy termék teljesen elfogyott.</p>",
        `<p><strong>Termék:</strong> ${escapeHtml(input.productName)}<br />`,
        `<strong>Slug:</strong> ${escapeHtml(input.productSlug)}<br />`,
        "<strong>Elérhető készlet:</strong> 0 db</p>",
      ].join(""),
    }),
  );

  return true;
}

export async function sendReturnRequestAdminNotificationIfNeeded(returnRequestId: string) {
  const request = await db.returnRequest.findUnique({
    where: { id: returnRequestId },
    include: {
      order: true,
    },
  });

  if (!request || request.adminNotificationSentAt) {
    return false;
  }

  await sendToAdmins(
    "adminNotifyReturnRequest",
    `Új visszaállítási kérelem: ${request.order.orderNumber}`,
    () => ({
      text: [
        "Új visszaállítási kérelem érkezett.",
        `Rendelésszám: ${request.order.orderNumber}`,
        `Kérelmező e-mail: ${request.requesterEmail}`,
        `Ok: ${request.reason ?? "nincs megadva"}`,
        "",
        request.details,
      ].join("\n"),
      html: [
        "<p>Új visszaállítási kérelem érkezett.</p>",
        `<p><strong>Rendelésszám:</strong> ${escapeHtml(request.order.orderNumber)}<br />`,
        `<strong>Kérelmező e-mail:</strong> ${escapeHtml(request.requesterEmail)}<br />`,
        `<strong>Ok:</strong> ${escapeHtml(request.reason ?? "nincs megadva")}</p>`,
        `<p>${escapeHtml(request.details).replace(/\n/g, "<br />")}</p>`,
      ].join(""),
    }),
  );

  await db.returnRequest.update({
    where: { id: returnRequestId },
    data: {
      adminNotificationSentAt: new Date(),
    },
  });

  return true;
}

function startOfCurrentWeek(reference: Date) {
  const day = reference.getUTCDay();
  const offset = day === 0 ? 6 : day - 1;
  const start = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - offset);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

export function getWeeklySummaryWindow(reference: Date) {
  const currentWeekStart = startOfCurrentWeek(reference);
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setUTCDate(previousWeekStart.getUTCDate() - 7);
  return {
    weekStart: previousWeekStart,
    weekEnd: currentWeekStart,
  };
}

export async function sendWeeklyAdminSummaries(referenceDate = new Date()) {
  const admins = await getAdminRecipients("adminNotifyWeeklySummary");
  const { weekStart, weekEnd } = getWeeklySummaryWindow(referenceDate);

  const paidOrders = await db.order.findMany({
    where: {
      paidAt: {
        gte: weekStart,
        lt: weekEnd,
      },
      paymentStatus: "PAID",
    },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      paidAt: true,
    },
    orderBy: {
      paidAt: "asc",
    },
  });

  const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  let sent = 0;

  for (const admin of admins) {
    const existing = await db.weeklySummaryDispatch.findUnique({
      where: {
        userId_weekStart: {
          userId: admin.id,
          weekStart,
        },
      },
    });

    if (existing) {
      continue;
    }

    await sendTransactionalEmail({
      to: admin.email,
      subject: `Heti összesítő: ${formatDateTime(weekStart)} - ${formatDateTime(new Date(weekEnd.getTime() - 1000))}`,
      text: [
        "Heti rendelési összesítő",
        `Időszak kezdete: ${formatDateTime(weekStart)}`,
        `Időszak vége: ${formatDateTime(new Date(weekEnd.getTime() - 1000))}`,
        `Összes rendelés: ${paidOrders.length}`,
        `Összes bevétel: ${formatPrice(revenue)}`,
        "",
        ...paidOrders.map((order) => `${order.orderNumber} · ${formatPrice(order.total)} · ${formatDateTime(order.paidAt ?? weekStart)}`),
      ].join("\n"),
      html: [
        "<p>Heti rendelési összesítő</p>",
        `<p><strong>Időszak kezdete:</strong> ${escapeHtml(formatDateTime(weekStart))}<br />`,
        `<strong>Időszak vége:</strong> ${escapeHtml(formatDateTime(new Date(weekEnd.getTime() - 1000)))}<br />`,
        `<strong>Összes rendelés:</strong> ${paidOrders.length}<br />`,
        `<strong>Összes bevétel:</strong> ${escapeHtml(formatPrice(revenue))}</p>`,
        paidOrders.length > 0
          ? `<ul>${paidOrders.map((order) => `<li>${escapeHtml(order.orderNumber)} · ${escapeHtml(formatPrice(order.total))} · ${escapeHtml(formatDateTime(order.paidAt ?? weekStart))}</li>`).join("")}</ul>`
          : "<p>Az adott időszakban nem érkezett kifizetett rendelés.</p>",
      ].join(""),
    });

    await db.weeklySummaryDispatch.create({
      data: {
        userId: admin.id,
        weekStart,
      },
    });

    sent += 1;
  }

  return {
    sent,
    orderCount: paidOrders.length,
    revenue,
    weekStart,
    weekEnd,
  };
}
