import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { requestGuestOrderRecoveryAction } from "@/app/order-status/actions";
import { verifyGuestOrderRecoveryToken } from "@/lib/order-recovery";
import { resolveRecoveryCorrelationId } from "@/lib/order-recovery-observability";

type GuestOrderRecoveryPageProps = {
  searchParams: Promise<{
    status?: string;
    token?: string;
  }>;
};

function getStatusCopy(status?: string) {
  switch (status) {
    case "sent":
      return "Ha találtunk a megadott adatokhoz tartozó vendég rendelést, elküldtük a helyreállító linket az e-mail-címre.";
    case "cooldown":
      return "Nemrég már kértél helyreállító linket ezekhez az adatokhoz. Ha van egyező vendég rendelés, a korábbi link még használható lehet az e-mail-fiókodban.";
    case "expired":
      return "A helyreállító link lejárt. Kérj új linket az alábbi űrlapon.";
    case "invalid":
      return "Ez a helyreállító link nem érvényes. Kérj új linket az alábbi űrlapon.";
    case "already-used":
      return "Ez a link már fel lett használva. Ha ugyanazon az eszközön vagy, a rendelési állapot oldal már elérhető lehet.";
    default:
      return "";
  }
}

export default async function GuestOrderRecoveryPage({
  searchParams,
}: GuestOrderRecoveryPageProps) {
  const resolvedSearchParams = await searchParams;

  if (resolvedSearchParams.token) {
    const headerStore = await headers();
    const verification = await verifyGuestOrderRecoveryToken(resolvedSearchParams.token, {
      correlationId: resolveRecoveryCorrelationId(headerStore),
    });

    if (verification.status === "success") {
      redirect(`/order-status/${verification.orderId}?recovered=1`);
    }

    redirect(`/order-status/recover?status=${verification.status}`);
  }

  const statusMessage = getStatusCopy(resolvedSearchParams.status);

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-20 pt-10">
      <section className="rounded-[2.5rem] border border-white/70 bg-white/78 px-8 py-10 shadow-[0_24px_55px_rgba(198,129,167,0.12)] backdrop-blur-xl sm:px-12 sm:py-12">
        <p className="text-[10px] uppercase tracking-[0.32em] text-[#b06b8e]">
          Vendég rendelés helyreállítása
        </p>
        <h1 className="mt-4 font-[family:var(--font-display)] text-[2.8rem] leading-none text-[#4d2741]">
          Rendelési állapot elérése
        </h1>
        <p className="mt-5 text-sm leading-7 text-[#7a6070]">
          Add meg a rendelésszámot és az e-mail-címet. Ha találunk egyező vendég rendelést,
          küldünk egy rövid ideig érvényes helyreállító linket.
        </p>

        {statusMessage ? (
          <div className="mt-6 rounded-[1.4rem] border border-[#f0d8e5] bg-[#fff9fc] px-4 py-3 text-sm text-[#7a6070]">
            {statusMessage}
          </div>
        ) : null}

        <form action={requestGuestOrderRecoveryAction} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-[#4d2741]">Rendelésszám</span>
            <input
              type="text"
              name="orderNumber"
              required
              placeholder="pl. CJ-123456"
              className="h-12 w-full border border-[#d9d0c8] bg-transparent px-4 text-sm text-[#201a17] outline-none transition focus:border-[#201a17]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-[#4d2741]">E-mail-cím</span>
            <input
              type="email"
              name="email"
              required
              placeholder="guest@example.com"
              className="h-12 w-full border border-[#d9d0c8] bg-transparent px-4 text-sm text-[#201a17] outline-none transition focus:border-[#201a17]"
            />
          </label>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#1f1a17] px-5 text-sm font-medium text-white transition hover:bg-[#3a2f29]"
            >
              Helyreállító link küldése
            </button>
            <Link
              href="/order-status"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#d9d0c8] px-5 text-sm font-medium text-[#201a17] transition hover:bg-[#faf7f3]"
            >
              Vissza a rendelési állapothoz
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
