import { GuestOrderAccessTokenKind } from "@prisma/client";

import { db } from "@/lib/db";
import { hashToken } from "@/lib/auth/tokens";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getGuestOrderAccessToken,
  listGuestOrderAccessEntries,
} from "@/lib/orderAccessToken";

async function getOrderAccessWhere(orderId: string) {
  const [currentUser, guestOrderAccessToken] = await Promise.all([
    getCurrentUser(),
    getGuestOrderAccessToken(orderId),
  ]);

  const accessors = [
    currentUser?.id ? { userId: currentUser.id } : null,
    guestOrderAccessToken
      ? {
          OR: [
            { guestAccessTokenHash: hashToken(guestOrderAccessToken) },
            {
              accessTokens: {
                some: {
                  tokenHash: hashToken(guestOrderAccessToken),
                  kind: GuestOrderAccessTokenKind.ACCESS,
                  expiresAt: {
                    gt: new Date(),
                  },
                },
              },
            },
          ],
        }
      : null,
  ].filter(Boolean) as Array<{ userId: string } | { OR: Array<object> }>;

  if (accessors.length === 0) {
    return null;
  }

  return {
    id: orderId,
    OR: accessors,
  };
}

export async function getAccessibleCheckoutOrder(orderId: string) {
  const where = await getOrderAccessWhere(orderId);

  if (!where) {
    return null;
  }

  return db.order.findFirst({
    where,
  });
}

export async function getAccessibleCheckoutOrderStatus(orderId: string) {
  const where = await getOrderAccessWhere(orderId);

  if (!where) {
    return null;
  }

  return db.order.findFirst({
    where,
    select: {
      id: true,
      userId: true,
      paymentStatus: true,
    },
  });
}

export async function listAccessibleGuestOrders() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    return [];
  }

  const accessEntries = await listGuestOrderAccessEntries();

  if (accessEntries.length === 0) {
    return [];
  }

  const orders = await db.order.findMany({
    where: {
      OR: accessEntries.map((entry) => ({
        id: entry.orderId,
        OR: [
          { guestAccessTokenHash: hashToken(entry.token) },
          {
            accessTokens: {
              some: {
                tokenHash: hashToken(entry.token),
                kind: GuestOrderAccessTokenKind.ACCESS,
                expiresAt: {
                  gt: new Date(),
                },
              },
            },
          },
        ],
      })),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
}
