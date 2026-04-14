import type { Prisma, PromoCode } from "@prisma/client";

import { normalizeStoredPrice } from "@/lib/catalog";

export type PromoValidationErrorCode =
  | "invalid_code"
  | "inactive_code"
  | "expired_code"
  | "not_yet_active"
  | "already_used"
  | "usage_limit_reached"
  | "minimum_order_amount_not_met";

export type PromoIdentity = {
  userId?: string | null;
  email?: string | null;
};

export type AppliedPromo = {
  id: string;
  code: string;
  discountPercent: number;
  discountAmount: number;
};

export type PromoValidationResult =
  | {
      ok: true;
      promoCode: PromoCode;
      discountAmount: number;
      total: number;
    }
  | {
      ok: false;
      error: PromoValidationErrorCode;
      minimumOrderAmount?: number;
    };

export const promoValidationMessages: Record<PromoValidationErrorCode, string> = {
  invalid_code: "Ez a promóciós kód nem található.",
  inactive_code: "Ez a promóciós kód jelenleg nem aktív.",
  expired_code: "Ez a promóciós kód már lejárt.",
  not_yet_active: "Ez a promóciós kód még nem aktív.",
  already_used: "Ezt a promóciós kódot már felhasználtad.",
  usage_limit_reached: "Ez a promóciós kód elérte a felhasználási limitet.",
  minimum_order_amount_not_met: "A kosár értéke nem éri el a kód minimum rendelési összegét.",
};

export function normalizePromoCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function normalizePromoEmail(email?: string | null) {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
}

export function calculatePromoDiscount(subtotal: number, discountPercent: number) {
  const normalizedSubtotal = normalizeStoredPrice(subtotal);
  const boundedPercent = Math.min(100, Math.max(1, Math.floor(discountPercent)));
  return Math.min(
    normalizedSubtotal,
    Math.max(0, Math.floor((normalizedSubtotal * boundedPercent) / 100)),
  );
}

function getPromoCustomerKey(input: PromoIdentity) {
  if (input.userId) {
    return `user:${input.userId}`;
  }

  const email = normalizePromoEmail(input.email);
  return email ? `email:${email}` : null;
}

export async function validatePromoCode(
  tx: Prisma.TransactionClient,
  input: {
    code: string;
    subtotal: number;
    identity?: PromoIdentity;
    now?: Date;
  },
): Promise<PromoValidationResult> {
  const code = normalizePromoCode(input.code);
  const subtotal = normalizeStoredPrice(input.subtotal);
  const now = input.now ?? new Date();
  const email = normalizePromoEmail(input.identity?.email);

  if (!code) {
    return { ok: false, error: "invalid_code" };
  }

  const promoCode = await tx.promoCode.findUnique({
    where: { code },
  });

  if (!promoCode) {
    return { ok: false, error: "invalid_code" };
  }

  if (!promoCode.isActive) {
    return { ok: false, error: "inactive_code" };
  }

  if (promoCode.validFrom > now) {
    return { ok: false, error: "not_yet_active" };
  }

  if (promoCode.validUntil && promoCode.validUntil < now) {
    return { ok: false, error: "expired_code" };
  }

  if (
    promoCode.totalUsageLimit != null &&
    promoCode.redeemedCount >= promoCode.totalUsageLimit
  ) {
    return { ok: false, error: "usage_limit_reached" };
  }

  if (
    promoCode.minimumOrderAmount != null &&
    subtotal < promoCode.minimumOrderAmount
  ) {
    return {
      ok: false,
      error: "minimum_order_amount_not_met",
      minimumOrderAmount: promoCode.minimumOrderAmount,
    };
  }

  const customerLimit = promoCode.oneTimeUse ? 1 : promoCode.perCustomerUsageLimit;
  if (customerLimit != null && customerLimit > 0) {
    if (input.identity?.userId || email) {
      const redeemedByCustomer = await tx.promoCodeRedemption.count({
        where: {
          promoCodeId: promoCode.id,
          OR: [
            input.identity?.userId ? { userId: input.identity.userId } : undefined,
            email ? { customerEmail: email } : undefined,
          ].filter(Boolean) as Prisma.PromoCodeRedemptionWhereInput[],
        },
      });

      if (redeemedByCustomer >= customerLimit) {
        return { ok: false, error: "already_used" };
      }
    }
  }

  const discountAmount = calculatePromoDiscount(subtotal, promoCode.discountPercent);

  return {
    ok: true,
    promoCode,
    discountAmount,
    total: Math.max(0, subtotal - discountAmount),
  };
}

export async function finalizePromoRedemption(
  tx: Prisma.TransactionClient,
  input: {
    promoCodeId: string;
    orderId: string;
    userId?: string | null;
    email?: string | null;
    subtotal: number;
    discountAmount: number;
  },
) {
  const promoCode = await tx.promoCode.findUnique({
    where: { id: input.promoCodeId },
  });

  if (!promoCode) {
    throw new Error("PROMO_INVALID_CODE");
  }

  const validation = await validatePromoCode(tx, {
    code: promoCode.code,
    subtotal: input.subtotal,
    identity: { userId: input.userId, email: input.email },
  });

  if (!validation.ok) {
    throw new Error(`PROMO_${validation.error.toUpperCase()}`);
  }

  const incremented = await tx.promoCode.updateMany({
    where: {
      id: promoCode.id,
      ...(promoCode.totalUsageLimit == null
        ? {}
        : { redeemedCount: { lt: promoCode.totalUsageLimit } }),
    },
    data: {
      redeemedCount: { increment: 1 },
    },
  });

  if (incremented.count === 0) {
    throw new Error("PROMO_USAGE_LIMIT_REACHED");
  }

  const customerLimit = promoCode.oneTimeUse ? 1 : promoCode.perCustomerUsageLimit;
  const customerKey =
    customerLimit === 1
      ? getPromoCustomerKey({ userId: input.userId, email: input.email })
      : null;

  return tx.promoCodeRedemption.create({
    data: {
      promoCodeId: promoCode.id,
      orderId: input.orderId,
      userId: input.userId ?? null,
      customerEmail: normalizePromoEmail(input.email),
      customerKey,
      discountAmount: normalizeStoredPrice(input.discountAmount),
    },
  });
}
