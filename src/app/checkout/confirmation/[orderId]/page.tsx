import { notFound } from "next/navigation";

import { ConfirmationStatusCard } from "@/components/checkout/ConfirmationStatusCard";
import { getOrderForUser, formatDate } from "@/lib/account";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/catalog";

type ConfirmationPageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ redirect_status?: string }>;
};

export default async function ConfirmationPage({
  params,
  searchParams,
}: ConfirmationPageProps) {
  const user = await requireUser("/orders");
  const { orderId } = await params;
  const resolvedSearchParams = await searchParams;
  const order = await getOrderForUser(user.id, orderId);

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
        initialPaymentStatus={order.paymentStatus}
        redirectStatus={resolvedSearchParams.redirect_status}
      />
    </main>
  );
}
