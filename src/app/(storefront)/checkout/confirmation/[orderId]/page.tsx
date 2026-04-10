import { notFound } from "next/navigation";

import { ConfirmationStatusCard } from "@/components/checkout/ConfirmationStatusCard";
import { formatDate } from "@/lib/account";
import { formatPrice } from "@/lib/catalog";
import { type ConfirmationStatusSnapshot } from "@/lib/checkout-confirmation-status";
import { getAccessibleCheckoutOrder } from "@/lib/order-access";

type ConfirmationPageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ redirect_status?: string }>;
};

export default async function ConfirmationPage({
  params,
  searchParams,
}: ConfirmationPageProps) {
  const { orderId } = await params;
  const resolvedSearchParams = await searchParams;
  const order = await getAccessibleCheckoutOrder(orderId);

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[980px] px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <ConfirmationStatusCard
        orderId={order.id}
        orderNumber={order.orderNumber}
        createdAtLabel={formatDate(order.createdAt)}
        totalLabel={formatPrice(order.total)}
        initialStatus={
          {
            paymentStatus: order.paymentStatus,
            status: order.status,
            internalStatus: order.internalStatus,
          } satisfies ConfirmationStatusSnapshot
        }
        redirectStatus={resolvedSearchParams.redirect_status}
        canViewOrder={Boolean(order.userId)}
      />
    </main>
  );
}
