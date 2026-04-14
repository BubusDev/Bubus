import { PromoCodeEligibilityRule, type Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { normalizePromoCode } from "@/lib/promo-codes";

export const WELCOME_COUPON_CODE = "UDVNALUNK";
export const WELCOME_COUPON_SOURCE = "welcome";
export const WELCOME_COUPON_CYCLE = "initial";
export const NEWSLETTER_COUPON_SOURCE = "newsletter_monthly";

export function getNewsletterCouponCycle(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function getNewsletterCouponCode(cycle = getNewsletterCouponCycle()) {
  return normalizePromoCode(`HIRLEVEL${cycle.replace("-", "")}`);
}

function getCycleStart(cycle: string) {
  const [yearValue, monthValue] = cycle.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("INVALID_COUPON_CYCLE");
  }

  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
}

function getNextCycleStart(cycle: string) {
  const start = getCycleStart(cycle);
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1, 0, 0, 0, 0));
}

async function ensureWelcomePromoCode(tx: Prisma.TransactionClient) {
  return tx.promoCode.upsert({
    where: { code: WELCOME_COUPON_CODE },
    update: {
      discountPercent: 10,
      eligibilityRule: PromoCodeEligibilityRule.REGISTERED_USERS_ONLY,
      isActive: true,
      oneTimeUse: true,
      perCustomerUsageLimit: 1,
    },
    create: {
      code: WELCOME_COUPON_CODE,
      discountPercent: 10,
      eligibilityRule: PromoCodeEligibilityRule.REGISTERED_USERS_ONLY,
      validFrom: new Date("2020-01-01T00:00:00.000Z"),
      isActive: true,
      oneTimeUse: true,
      perCustomerUsageLimit: 1,
    },
  });
}

async function ensureNewsletterPromoCode(tx: Prisma.TransactionClient, cycle: string) {
  return tx.promoCode.upsert({
    where: { code: getNewsletterCouponCode(cycle) },
    update: {
      discountPercent: 15,
      eligibilityRule: PromoCodeEligibilityRule.REGISTERED_USERS_ONLY,
      isActive: true,
      oneTimeUse: true,
      perCustomerUsageLimit: 1,
      validFrom: getCycleStart(cycle),
      validUntil: getNextCycleStart(cycle),
    },
    create: {
      code: getNewsletterCouponCode(cycle),
      discountPercent: 15,
      eligibilityRule: PromoCodeEligibilityRule.REGISTERED_USERS_ONLY,
      validFrom: getCycleStart(cycle),
      validUntil: getNextCycleStart(cycle),
      isActive: true,
      oneTimeUse: true,
      perCustomerUsageLimit: 1,
    },
  });
}

export async function grantWelcomeCouponForUser(
  tx: Prisma.TransactionClient,
  userId: string,
) {
  const promoCode = await ensureWelcomePromoCode(tx);

  return tx.promoCodeGrant.upsert({
    where: {
      userId_source_cycle: {
        userId,
        source: WELCOME_COUPON_SOURCE,
        cycle: WELCOME_COUPON_CYCLE,
      },
    },
    update: {},
    create: {
      userId,
      promoCodeId: promoCode.id,
      source: WELCOME_COUPON_SOURCE,
      cycle: WELCOME_COUPON_CYCLE,
    },
  });
}

export async function grantCurrentNewsletterCouponForUser(
  userId: string,
  cycle = getNewsletterCouponCycle(),
) {
  return db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, newsletterSubscribed: true },
    });

    if (!user?.newsletterSubscribed) {
      return null;
    }

    const promoCode = await ensureNewsletterPromoCode(tx, cycle);

    return tx.promoCodeGrant.upsert({
      where: {
        userId_source_cycle: {
          userId,
          source: NEWSLETTER_COUPON_SOURCE,
          cycle,
        },
      },
      update: {},
      create: {
        userId,
        promoCodeId: promoCode.id,
        source: NEWSLETTER_COUPON_SOURCE,
        cycle,
      },
    });
  });
}

export async function grantMonthlyNewsletterCoupons(cycle = getNewsletterCouponCycle()) {
  return db.$transaction(async (tx) => {
    const promoCode = await ensureNewsletterPromoCode(tx, cycle);
    const users = await tx.user.findMany({
      where: { newsletterSubscribed: true },
      select: { id: true },
    });

    const created = await tx.promoCodeGrant.createMany({
      data: users.map((user) => ({
          userId: user.id,
          promoCodeId: promoCode.id,
          source: NEWSLETTER_COUPON_SOURCE,
          cycle,
      })),
      skipDuplicates: true,
    });

    return {
      cycle,
      couponCode: promoCode.code,
      subscriberCount: users.length,
      created: created.count,
      existing: users.length - created.count,
    };
  });
}
