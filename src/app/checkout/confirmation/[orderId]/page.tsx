import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";

import { getOrderForUser, formatDate } from "@/lib/account";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/catalog";

type ConfirmationPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const user = await requireUser("/orders");
  const { orderId } = await params;
  const order = await getOrderForUser(user.id, orderId);

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[980px] px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <section className="rounded-[2.5rem] border border-white/70 bg-white/78 p-8 shadow-[0_24px_55px_rgba(198,129,167,0.12)] backdrop-blur-xl sm:p-10">
        <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full border border-[#f0d6e3] bg-[#fff7fb] text-[#a45b82]">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.32em] text-[#b06b8e]">
          Rendelés visszaigazolva
        </p>
        <h1 className="mt-3 text-center font-[family:var(--font-display)] text-[2.8rem] leading-none text-[#4d2741]">
          Köszönjük a rendelésedet
        </h1>
        <p className="mx-auto mt-4 max-w-[42ch] text-center text-sm leading-7 text-[#7a6070]">
          A rendelésed sikeresen rögzítettük. A részleteket a fiókodban bármikor újra megnyithatod.
        </p>

        <div className="mt-8 grid gap-4 rounded-[1.8rem] border border-[#f0d8e5] bg-[#fff9fc] p-5 sm:grid-cols-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Rendelésszám</p>
            <p className="mt-2 text-sm font-semibold text-[#4d2741]">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Dátum</p>
            <p className="mt-2 text-sm font-semibold text-[#4d2741]">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Végösszeg</p>
            <p className="mt-2 text-sm font-semibold text-[#4d2741]">{formatPrice(order.total)}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/orders/${order.id}`}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#f183bc] px-6 text-sm font-medium text-white shadow-[0_16px_35px_rgba(241,131,188,0.28)] transition hover:bg-[#ea6fb0]"
          >
            Rendelés megtekintése
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#ead0df] bg-white/90 px-6 text-sm font-medium text-[#6b425a] transition hover:border-[#e6b4cf] hover:bg-white"
          >
            Tovább válogatok
          </Link>
        </div>
      </section>
    </main>
  );
}
