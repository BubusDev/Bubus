import { NextResponse } from "next/server";

import { getAccessibleCheckoutOrderStatus } from "@/lib/order-access";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { orderId } = await params;
  const order = await getAccessibleCheckoutOrderStatus(orderId);

  if (!order) {
    return NextResponse.json({ error: "ORDER_ACCESS_DENIED" }, { status: 404 });
  }

  return NextResponse.json(
    {
      paymentStatus: order.paymentStatus,
      status: order.status,
      internalStatus: order.internalStatus,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
