import { NextResponse } from "next/server";

import { auth } from "../../../../../../auth";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user?.id || !session.user.emailVerifiedAt) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { orderId } = await params;
  const order = await db.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
    },
    select: {
      paymentStatus: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json(
    { paymentStatus: order.paymentStatus },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
