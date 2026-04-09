import { GuestOrderAccessTokenKind } from "@prisma/client";

import { sendGuestOrderRecoveryEmail } from "@/lib/auth/email";
import { createExpiryDate, createRawToken, hashToken } from "@/lib/auth/tokens";
import { db } from "@/lib/db";
import { setGuestOrderAccessToken } from "@/lib/orderAccessToken";
import {
  hashClientIp,
  logOrderRecoveryEvent,
} from "@/lib/order-recovery-observability";

const RECOVERY_LINK_HOURS = 1;
const RECOVERY_ACCESS_DAYS = 30;
const RECOVERY_REQUEST_COOLDOWN_MINUTES = 10;
const RECOVERY_IP_THROTTLE_WINDOW_MINUTES = 15;
const RECOVERY_IP_THROTTLE_MAX_REQUESTS = 5;

type RecoveryRequestContext = {
  clientIp?: string | null;
  correlationId?: string;
};

function createRecoveryAccessExpiryDate(daysFromNow: number) {
  return new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
}

function createRecoveryCooldownCutoff(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60 * 1000);
}

export async function requestGuestOrderRecovery(
  orderNumberInput: string,
  emailInput: string,
  context: RecoveryRequestContext = {},
) {
  const orderNumber = orderNumberInput.trim();
  const email = emailInput.trim().toLowerCase();
  const clientIpHash = context.clientIp ? hashClientIp(context.clientIp) : null;

  logOrderRecoveryEvent(
    "log",
    "guest_order_recovery_request_received",
    {
      actorType: "guest",
      status: "received",
      result: "received",
      hasClientIp: Boolean(clientIpHash),
      throttleApplied: false,
      cooldownApplied: false,
      tokenValidationSucceeded: null,
    },
    { correlationId: context.correlationId },
  );

  if (!orderNumber || !email) {
    logOrderRecoveryEvent(
      "warn",
      "guest_order_recovery_request_ignored",
      {
        actorType: "guest",
        status: "ignored",
        result: "invalid_input",
        hasClientIp: Boolean(clientIpHash),
        throttleApplied: false,
        cooldownApplied: false,
        tokenValidationSucceeded: null,
      },
      { correlationId: context.correlationId },
    );

    return { status: "ignored" as const };
  }

  if (clientIpHash) {
    const throttleCutoff = createRecoveryCooldownCutoff(RECOVERY_IP_THROTTLE_WINDOW_MINUTES);
    const recentAttemptCount = await db.guestOrderRecoveryRequest.count({
      where: {
        ipHash: clientIpHash,
        createdAt: {
          gte: throttleCutoff,
        },
      },
    });

    if (recentAttemptCount >= RECOVERY_IP_THROTTLE_MAX_REQUESTS) {
      logOrderRecoveryEvent(
        "warn",
        "guest_order_recovery_throttle_hit",
        {
          actorType: "guest",
          status: "rejected",
          result: "ip_throttled",
          hasClientIp: true,
          throttleApplied: true,
          cooldownApplied: false,
          tokenValidationSucceeded: null,
        },
        { correlationId: context.correlationId },
      );

      return { status: "throttled" as const };
    }

    await db.guestOrderRecoveryRequest.create({
      data: {
        ipHash: clientIpHash,
      },
    });
  }

  const order = await db.order.findFirst({
    where: {
      orderNumber,
      guestEmail: email,
      userId: null,
    },
    select: {
      id: true,
      orderNumber: true,
      guestEmail: true,
    },
  });

  if (!order?.guestEmail) {
    logOrderRecoveryEvent(
      "log",
      "guest_order_recovery_request_completed",
      {
        actorType: "guest",
        status: "completed",
        result: "unmatched",
        hasClientIp: Boolean(clientIpHash),
        throttleApplied: false,
        cooldownApplied: false,
        tokenValidationSucceeded: null,
      },
      { correlationId: context.correlationId },
    );

    return { status: "ignored" as const };
  }

  const recentRecoveryRequest = await db.guestOrderAccessToken.findFirst({
    where: {
      orderId: order.id,
      kind: GuestOrderAccessTokenKind.RECOVERY,
      createdAt: {
        gte: createRecoveryCooldownCutoff(RECOVERY_REQUEST_COOLDOWN_MINUTES),
      },
    },
    select: {
      id: true,
    },
  });

  if (recentRecoveryRequest) {
    logOrderRecoveryEvent(
      "log",
      "guest_order_recovery_cooldown_hit",
      {
        orderId: order.id,
        actorType: "guest",
        status: "completed",
        result: "cooldown",
        hasClientIp: Boolean(clientIpHash),
        throttleApplied: false,
        cooldownApplied: true,
        tokenValidationSucceeded: null,
      },
      { correlationId: context.correlationId },
    );

    return { status: "cooldown" as const };
  }

  const token = createRawToken();

  await db.guestOrderAccessToken.create({
    data: {
      orderId: order.id,
      tokenHash: hashToken(token),
      kind: GuestOrderAccessTokenKind.RECOVERY,
      expiresAt: createExpiryDate(RECOVERY_LINK_HOURS),
    },
  });

  try {
    await sendGuestOrderRecoveryEmail({
      email: order.guestEmail,
      orderNumber: order.orderNumber,
      token,
    });
  } catch (error) {
    logOrderRecoveryEvent(
      "error",
      "guest_order_recovery_email_failed",
      {
        orderId: order.id,
        actorType: "guest",
        status: "failed",
        result: "email_send_failed",
        hasClientIp: Boolean(clientIpHash),
        throttleApplied: false,
        cooldownApplied: false,
        tokenValidationSucceeded: null,
        error,
      },
      { correlationId: context.correlationId },
    );

    throw error;
  }

  logOrderRecoveryEvent(
    "log",
    "guest_order_recovery_email_sent",
    {
      orderId: order.id,
      actorType: "guest",
      status: "completed",
      result: "email_sent",
      hasClientIp: Boolean(clientIpHash),
      throttleApplied: false,
      cooldownApplied: false,
      tokenValidationSucceeded: null,
    },
    { correlationId: context.correlationId },
  );

  return { status: "sent" as const };
}

export async function verifyGuestOrderRecoveryToken(
  token: string,
  context: Pick<RecoveryRequestContext, "correlationId"> = {},
) {
  if (!token) {
    logOrderRecoveryEvent(
      "warn",
      "guest_order_recovery_token_validation",
      {
        actorType: "guest",
        status: "rejected",
        result: "missing_token",
        throttleApplied: false,
        cooldownApplied: false,
        tokenValidationSucceeded: false,
      },
      { correlationId: context.correlationId },
    );

    return { status: "invalid" as const };
  }

  const tokenHash = hashToken(token);
  const recoveryToken = await db.guestOrderAccessToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      orderId: true,
      kind: true,
      expiresAt: true,
      usedAt: true,
    },
  });

  if (!recoveryToken || recoveryToken.kind !== GuestOrderAccessTokenKind.RECOVERY) {
    logOrderRecoveryEvent(
      "warn",
      "guest_order_recovery_token_validation",
      {
        actorType: "guest",
        status: "rejected",
        result: "invalid_token",
        throttleApplied: false,
        cooldownApplied: false,
        tokenValidationSucceeded: false,
      },
      { correlationId: context.correlationId },
    );

    return { status: "invalid" as const };
  }

  if (recoveryToken.usedAt) {
    logOrderRecoveryEvent(
      "warn",
      "guest_order_recovery_token_validation",
      {
        orderId: recoveryToken.orderId,
        actorType: "guest",
        status: "rejected",
        result: "already_used",
        throttleApplied: false,
        cooldownApplied: false,
        tokenValidationSucceeded: false,
      },
      { correlationId: context.correlationId },
    );

    return { status: "already_used" as const, orderId: recoveryToken.orderId };
  }

  if (recoveryToken.expiresAt.getTime() < Date.now()) {
    await db.guestOrderAccessToken.delete({
      where: { id: recoveryToken.id },
    });

    logOrderRecoveryEvent(
      "warn",
      "guest_order_recovery_token_validation",
      {
        orderId: recoveryToken.orderId,
        actorType: "guest",
        status: "rejected",
        result: "expired",
        throttleApplied: false,
        cooldownApplied: false,
        tokenValidationSucceeded: false,
      },
      { correlationId: context.correlationId },
    );

    return { status: "expired" as const };
  }

  const accessToken = createRawToken();

  await db.$transaction([
    db.guestOrderAccessToken.update({
      where: { id: recoveryToken.id },
      data: {
        usedAt: new Date(),
      },
    }),
    db.guestOrderAccessToken.create({
      data: {
        orderId: recoveryToken.orderId,
        tokenHash: hashToken(accessToken),
        kind: GuestOrderAccessTokenKind.ACCESS,
        expiresAt: createRecoveryAccessExpiryDate(RECOVERY_ACCESS_DAYS),
      },
    }),
  ]);

  await setGuestOrderAccessToken(recoveryToken.orderId, accessToken);

  logOrderRecoveryEvent(
    "log",
    "guest_order_recovery_token_validation",
    {
      orderId: recoveryToken.orderId,
      actorType: "guest",
      status: "completed",
      result: "success",
      throttleApplied: false,
      cooldownApplied: false,
      tokenValidationSucceeded: true,
    },
    { correlationId: context.correlationId },
  );

  return { status: "success" as const, orderId: recoveryToken.orderId };
}
