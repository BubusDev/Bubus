import { NextResponse } from "next/server";

import { syncPendingOrderPaymentStatus } from "@/lib/checkout";
import { resolveRequestCorrelationId } from "@/lib/checkout-observability";
import { getAccessibleCheckoutOrderStatus } from "@/lib/order-access";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { orderId } = await params;
  const correlationId = resolveRequestCorrelationId(request);
  const order = await getAccessibleCheckoutOrderStatus(orderId);

  if (!order) {
    return NextResponse.json({ error: "ORDER_ACCESS_DENIED" }, { status: 404 });
  }

  const resolvedOrder = await syncPendingOrderPaymentStatus(orderId, correlationId);
  const currentOrder = resolvedOrder ?? order;

  return NextResponse.json(
    {
      paymentStatus: currentOrder.paymentStatus,
      status: currentOrder.status,
      internalStatus: currentOrder.internalStatus,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
