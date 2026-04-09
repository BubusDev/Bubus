"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, LoaderCircle, RefreshCcw, ShoppingBag } from "lucide-react";

const POLL_INTERVAL_MS = 2500;

type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "FINALIZING"
  | "PAID"
  | "FAILED"
  | "CANCELED"
  | "STOCK_UNAVAILABLE";

type ConfirmationStatusCardProps = {
  orderId: string;
  orderNumber: string;
  createdAtLabel: string;
  totalLabel: string;
  initialPaymentStatus: PaymentStatus;
  redirectStatus?: string;
  canViewOrder?: boolean;
};

function isPendingPaymentStatus(paymentStatus: PaymentStatus) {
  return (
    paymentStatus === "PENDING" ||
    paymentStatus === "PROCESSING" ||
    paymentStatus === "FINALIZING"
  );
}

function ConfirmationContent({
  tone,
  eyebrow,
  title,
  description,
}: {
  tone: "success" | "warning" | "processing";
  eyebrow: string;
  title: string;
  description: string;
}) {
  const icon =
    tone === "success" ? (
      <CheckCircle2 className="h-9 w-9" />
    ) : tone === "warning" ? (
      <AlertCircle className="h-9 w-9" />
    ) : (
      <LoaderCircle className="h-9 w-9 animate-spin" />
    );

  return (
    <>
      <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full border border-[#f0d6e3] bg-[#fff7fb] text-[#a45b82]">
        {icon}
      </div>
      <p className="mt-6 text-center text-[10px] uppercase tracking-[0.32em] text-[#b06b8e]">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-center font-[family:var(--font-display)] text-[2.8rem] leading-none text-[#4d2741]">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-[42ch] text-center text-sm leading-7 text-[#7a6070]">
        {description}
      </p>
    </>
  );
}

export function ConfirmationStatusCard({
  orderId,
  orderNumber,
  createdAtLabel,
  totalLabel,
  initialPaymentStatus,
  redirectStatus,
  canViewOrder = false,
}: ConfirmationStatusCardProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initialPaymentStatus);
  const [pollingError, setPollingError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mountedRef = useRef(true);

  const refreshPaymentStatus = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (!response.ok) {
        if (mountedRef.current) {
          setPollingError(
            "A rendelés állapotát most nem tudtuk megerősíteni. Próbáld meg újra néhány másodperc múlva.",
          );
        }
        return;
      }

      const payload = (await response.json()) as { paymentStatus?: PaymentStatus };

      if (mountedRef.current) {
        setPollingError("");

        if (payload.paymentStatus) {
          setPaymentStatus(payload.paymentStatus);
        }
      }
    } catch {
      if (mountedRef.current) {
        setPollingError(
          "Ideiglenesen nem érhető el az állapotfrissítés. Próbáld meg újra hamarosan.",
        );
      }
    } finally {
      if (mountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [orderId]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isPendingPaymentStatus(paymentStatus)) {
      return;
    }

    void refreshPaymentStatus();

    const intervalId = window.setInterval(() => {
      void refreshPaymentStatus();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [orderId, paymentStatus, refreshPaymentStatus]);

  const isPaid = paymentStatus === "PAID";
  const isStockUnavailable = paymentStatus === "STOCK_UNAVAILABLE";
  const isFailed = paymentStatus === "FAILED" || paymentStatus === "CANCELED";
  const isUnableToVerify = isPendingPaymentStatus(paymentStatus) && Boolean(pollingError);

  return (
    <section className="rounded-[2.5rem] border border-white/70 bg-white/78 p-8 shadow-[0_24px_55px_rgba(198,129,167,0.12)] backdrop-blur-xl sm:p-10">
      {isPaid ? (
        <ConfirmationContent
          tone="success"
          eyebrow="Fizetés sikeres"
          title="Köszönjük a rendelésedet"
          description="A fizetés beérkezett, a készlet frissült, a rendelés részleteit pedig a fiókodban bármikor újra megnyithatod."
        />
      ) : isUnableToVerify ? (
        <ConfirmationContent
          tone="warning"
          eyebrow="Ellenőrzés szükséges"
          title="A fizetés állapota most nem ellenőrizhető"
          description="A rendelésedet megkaptuk, de a végleges fizetési állapotot pillanatnyilag nem tudjuk visszaolvasni. Újraellenőrizheted innen, vagy frissítheted az oldalt néhány másodperc múlva."
        />
      ) : isStockUnavailable ? (
        <ConfirmationContent
          tone="warning"
          eyebrow="Készletprobléma"
          title="A fizetés nem zárható le rendelésként"
          description="A készlet a fizetés véglegesítése előtt megváltozott. Nem csökkentettük a raktárkészletet ehhez a rendeléshez, és a csapatnak ellenőriznie kell az esetet."
        />
      ) : isFailed ? (
        <ConfirmationContent
          tone="warning"
          eyebrow="Sikertelen fizetés"
          title="A fizetés nem ment végig"
          description="A Stripe nem erősítette meg sikeresnek a tranzakciót. Ellenőrizd az adataidat, majd próbáld meg újra a pénztárból."
        />
      ) : (
        <ConfirmationContent
          tone="processing"
          eyebrow="Feldolgozás alatt"
          title="A fizetés visszaigazolására várunk"
          description={
            redirectStatus === "succeeded"
              ? "A bankkártyás fizetés befejeződött, most a Stripe webhook véglegesíti a rendelést és a készletfrissítést. Ezt az oldalt automatikusan frissítjük."
              : "A Stripe még dolgozza fel a fizetést. Ezt az oldalt néhány másodpercenként automatikusan frissítjük, és azonnal jelezzük, ha a rendelés kifizetett lett."
          }
        />
      )}

      <div className="mt-8 grid gap-4 rounded-[1.8rem] border border-[#f0d8e5] bg-[#fff9fc] p-5 sm:grid-cols-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Rendelésszám</p>
          <p className="mt-2 text-sm font-semibold text-[#4d2741]">{orderNumber}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Dátum</p>
          <p className="mt-2 text-sm font-semibold text-[#4d2741]">{createdAtLabel}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[#b06b8e]">Végösszeg</p>
          <p className="mt-2 text-sm font-semibold text-[#4d2741]">{totalLabel}</p>
        </div>
      </div>

      {pollingError ? (
        <div className="mt-5 rounded-[1.4rem] border border-[#f3cadc] bg-[#fff3f8] px-4 py-3 text-sm text-[#9b476f]">
          {pollingError}
        </div>
      ) : null}

      {isPendingPaymentStatus(paymentStatus) ? (
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              void refreshPaymentStatus();
            }}
            disabled={isRefreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#ead0df] bg-white/90 px-5 text-sm font-medium text-[#6b425a] transition hover:border-[#e6b4cf] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Állapot újraellenőrzése
          </button>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {isPaid && canViewOrder ? (
          <Link
            href={`/orders/${orderId}`}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#f183bc] px-6 text-sm font-medium text-white shadow-[0_16px_35px_rgba(241,131,188,0.28)] transition hover:bg-[#ea6fb0]"
          >
            Rendelés megtekintése
          </Link>
        ) : isPaid ? (
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#f183bc] px-6 text-sm font-medium text-white shadow-[0_16px_35px_rgba(241,131,188,0.28)] transition hover:bg-[#ea6fb0]"
          >
            Tovább válogatok
          </Link>
        ) : (
          <Link
            href="/checkout"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#f183bc] px-6 text-sm font-medium text-white shadow-[0_16px_35px_rgba(241,131,188,0.28)] transition hover:bg-[#ea6fb0]"
          >
            <ShoppingBag className="h-4 w-4" />
            Vissza a pénztárhoz
          </Link>
        )}
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-full border border-[#ead0df] bg-white/90 px-6 text-sm font-medium text-[#6b425a] transition hover:border-[#e6b4cf] hover:bg-white"
        >
          Tovább válogatok
        </Link>
      </div>
    </section>
  );
}
