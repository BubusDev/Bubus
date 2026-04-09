type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "FINALIZING"
  | "PAID"
  | "FAILED"
  | "CANCELED"
  | "STOCK_UNAVAILABLE";

type InternalStatus =
  | "received"
  | "in_production"
  | "packed"
  | "label_ready"
  | "shipped"
  | "closed"
  | "issue"
  | string
  | null
  | undefined;

export type CustomerOrderStatusInput = {
  status?: string | null;
  paymentStatus: PaymentStatus | string;
  internalStatus?: InternalStatus;
  trackingNumber?: string | null;
  shippingMethod?: string | null;
  statusUpdatedAt?: Date | null;
};

export type CustomerOrderStatusView = {
  label: string;
  detail: string;
  trackingNumber: string | null;
  shippingMethodLabel: string | null;
  lastUpdatedLabel: string | null;
  emailUpdateKey: string | null;
  emailUpdateKind: "processing" | "ready_to_ship" | "shipped" | "issue" | null;
};

function formatShippingMethod(shippingMethod?: string | null) {
  if (!shippingMethod) {
    return null;
  }

  switch (shippingMethod.trim().toLowerCase()) {
    case "foxpost":
      return "Foxpost csomagautomata";
    case "home":
      return "Házhozszállítás";
    default:
      return shippingMethod.trim();
  }
}

function formatStatusDate(value?: Date | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}

export function getCustomerOrderStatusView(
  input: CustomerOrderStatusInput,
): CustomerOrderStatusView {
  const shippingMethodLabel = formatShippingMethod(input.shippingMethod);
  const trackingNumber = input.trackingNumber?.trim() || null;
  const lastUpdatedLabel = formatStatusDate(input.statusUpdatedAt);
  const paymentStatus = input.paymentStatus;

  if (paymentStatus === "FAILED" || paymentStatus === "CANCELED") {
    return {
      label: "Fizetés sikertelen",
      detail: "A fizetés nem zárult le sikeresen. Kérjük, próbáld meg újra a rendelést.",
      trackingNumber,
      shippingMethodLabel,
      lastUpdatedLabel,
      emailUpdateKey: `issue:${paymentStatus}`,
      emailUpdateKind: "issue",
    };
  }

  if (paymentStatus === "STOCK_UNAVAILABLE") {
    return {
      label: "Kézi ellenőrzés szükséges",
      detail: "A fizetés után készleteltérés történt, ezért a rendelést manuálisan ellenőrizzük.",
      trackingNumber,
      shippingMethodLabel,
      lastUpdatedLabel,
      emailUpdateKey: `issue:${paymentStatus}`,
      emailUpdateKind: "issue",
    };
  }

  if (
    paymentStatus === "PENDING" ||
    paymentStatus === "PROCESSING" ||
    paymentStatus === "FINALIZING"
  ) {
    return {
      label: "Fizetés feldolgozás alatt",
      detail:
        input.status?.trim() ||
        "A fizetés megerősítésére várunk, a rendelést a sikeres visszaigazolás után kezdjük feldolgozni.",
      trackingNumber,
      shippingMethodLabel,
      lastUpdatedLabel,
      emailUpdateKey: null,
      emailUpdateKind: null,
    };
  }

  switch (input.internalStatus) {
    case "shipped":
      return {
        label: "Feladva",
        detail: trackingNumber
          ? "A csomagot átadtuk a szállítónak, a követéshez használd a tracking számot."
          : "A csomagot átadtuk a szállítónak, hamarosan megérkezik hozzád.",
        trackingNumber,
        shippingMethodLabel,
        lastUpdatedLabel,
        emailUpdateKey: `shipped:${trackingNumber ?? "pending_tracking"}`,
        emailUpdateKind: "shipped",
      };
    case "label_ready":
      return {
        label: "Feladásra előkészítve",
        detail: "A csomagcímke elkészült, a rendelés rövidesen átadásra kerül a szállítónak.",
        trackingNumber,
        shippingMethodLabel,
        lastUpdatedLabel,
        emailUpdateKey: "ready_to_ship",
        emailUpdateKind: "ready_to_ship",
      };
    case "packed":
      return {
        label: "Becsomagolva",
        detail: "A rendelésedet összekészítettük és a feladás utolsó lépésein dolgozunk.",
        trackingNumber,
        shippingMethodLabel,
        lastUpdatedLabel,
        emailUpdateKey: "ready_to_ship",
        emailUpdateKind: "ready_to_ship",
      };
    case "in_production":
      return {
        label: "Elkészítés alatt",
        detail: "A rendelésed jelenleg készül, hamarosan a csomagolási szakaszba lép.",
        trackingNumber,
        shippingMethodLabel,
        lastUpdatedLabel,
        emailUpdateKey: "processing",
        emailUpdateKind: "processing",
      };
    case "closed":
      return {
        label: "Lezárva",
        detail: "A rendelés teljesítése lezárult. Ha kérdésed van, írj nekünk a kapcsolat oldalon.",
        trackingNumber,
        shippingMethodLabel,
        lastUpdatedLabel,
        emailUpdateKey: null,
        emailUpdateKind: null,
      };
    case "issue":
      return {
        label: "Kézi ellenőrzés alatt",
        detail: "A rendeléseddel kapcsolatban manuális ellenőrzés szükséges. Ha további információ kell, felvesszük veled a kapcsolatot.",
        trackingNumber,
        shippingMethodLabel,
        lastUpdatedLabel,
        emailUpdateKey: "issue:internal_status",
        emailUpdateKind: "issue",
      };
    case "received":
    default:
      return {
        label: paymentStatus === "PAID" ? "Rendelés beérkezett" : input.status?.trim() || "Rendelés fogadva",
        detail:
          paymentStatus === "PAID"
            ? "A fizetés sikeres volt, a rendelésedet rögzítettük és hamarosan megkezdjük a feldolgozását."
            : input.status?.trim() || "A rendelést fogadtuk.",
        trackingNumber,
        shippingMethodLabel,
        lastUpdatedLabel,
        emailUpdateKey: null,
        emailUpdateKind: null,
      };
  }
}
