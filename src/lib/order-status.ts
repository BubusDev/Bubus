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
  language?: "hu" | "en";
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

function formatShippingMethod(shippingMethod?: string | null, language: "hu" | "en" = "hu") {
  if (!shippingMethod) {
    return null;
  }

  switch (shippingMethod.trim().toLowerCase()) {
    case "foxpost":
      return "Foxpost csomagautomata";
    case "home":
      return language === "en" ? "Home delivery" : "Házhozszállítás";
    case "international":
      return "EU home delivery";
    default:
      return shippingMethod.trim();
  }
}

function formatStatusDate(value?: Date | null, language: "hu" | "en" = "hu") {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(language === "en" ? "en-DE" : "hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}

export function getCustomerOrderStatusView(
  input: CustomerOrderStatusInput,
): CustomerOrderStatusView {
  const language = input.language ?? "hu";
  const shippingMethodLabel = formatShippingMethod(input.shippingMethod, language);
  const trackingNumber = input.trackingNumber?.trim() || null;
  const lastUpdatedLabel = formatStatusDate(input.statusUpdatedAt, language);
  const paymentStatus = input.paymentStatus;

  if (paymentStatus === "FAILED" || paymentStatus === "CANCELED") {
    return {
      label: language === "en" ? "Payment failed" : "Fizetés sikertelen",
      detail: language === "en" ? "The payment was not completed successfully. Please try placing the order again." : "A fizetés nem zárult le sikeresen. Kérjük, próbáld meg újra a rendelést.",
      trackingNumber,
      shippingMethodLabel,
      lastUpdatedLabel,
      emailUpdateKey: `issue:${paymentStatus}`,
      emailUpdateKind: "issue",
    };
  }

  if (paymentStatus === "STOCK_UNAVAILABLE") {
    return {
      label: language === "en" ? "Manual review required" : "Kézi ellenőrzés szükséges",
      detail: language === "en" ? "A stock mismatch occurred after payment, so we are reviewing the order manually." : "A fizetés után készleteltérés történt, ezért a rendelést manuálisan ellenőrizzük.",
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
      label: language === "en" ? "Payment processing" : "Fizetés feldolgozás alatt",
      detail:
        input.status?.trim() ||
        (language === "en"
          ? "We are waiting for payment confirmation and will start processing after it succeeds."
          : "A fizetés megerősítésére várunk, a rendelést a sikeres visszaigazolás után kezdjük feldolgozni."),
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
        label: language === "en" ? "Shipped" : "Feladva",
        detail: trackingNumber
          ? language === "en" ? "Your package has been handed to the carrier. Use the tracking number to follow it." : "A csomagot átadtuk a szállítónak, a követéshez használd a tracking számot."
          : language === "en" ? "Your package has been handed to the carrier and will arrive soon." : "A csomagot átadtuk a szállítónak, hamarosan megérkezik hozzád.",
        trackingNumber,
        shippingMethodLabel,
        lastUpdatedLabel,
        emailUpdateKey: `shipped:${trackingNumber ?? "pending_tracking"}`,
        emailUpdateKind: "shipped",
      };
    case "label_ready":
      return {
        label: language === "en" ? "Ready to ship" : "Feladásra előkészítve",
        detail: language === "en" ? "The shipping label is ready and the order will be handed to the carrier soon." : "A csomagcímke elkészült, a rendelés rövidesen átadásra kerül a szállítónak.",
        trackingNumber,
        shippingMethodLabel,
        lastUpdatedLabel,
        emailUpdateKey: "ready_to_ship",
        emailUpdateKind: "ready_to_ship",
      };
    case "packed":
      return {
        label: language === "en" ? "Packed" : "Becsomagolva",
        detail: language === "en" ? "Your order is packed and we are working on the final shipping steps." : "A rendelésedet összekészítettük és a feladás utolsó lépésein dolgozunk.",
        trackingNumber,
        shippingMethodLabel,
        lastUpdatedLabel,
        emailUpdateKey: "ready_to_ship",
        emailUpdateKind: "ready_to_ship",
      };
    case "in_production":
      return {
        label: language === "en" ? "In production" : "Elkészítés alatt",
        detail: language === "en" ? "Your order is being prepared and will move to packing soon." : "A rendelésed jelenleg készül, hamarosan a csomagolási szakaszba lép.",
        trackingNumber,
        shippingMethodLabel,
        lastUpdatedLabel,
        emailUpdateKey: "processing",
        emailUpdateKind: "processing",
      };
    case "closed":
      return {
        label: language === "en" ? "Closed" : "Lezárva",
        detail: language === "en" ? "The order has been completed. If you have questions, contact us anytime." : "A rendelés teljesítése lezárult. Ha kérdésed van, írj nekünk a kapcsolat oldalon.",
        trackingNumber,
        shippingMethodLabel,
        lastUpdatedLabel,
        emailUpdateKey: null,
        emailUpdateKind: null,
      };
    case "issue":
      return {
        label: language === "en" ? "Under manual review" : "Kézi ellenőrzés alatt",
        detail: language === "en" ? "Your order requires manual review. We will contact you if we need more information." : "A rendeléseddel kapcsolatban manuális ellenőrzés szükséges. Ha további információ kell, felvesszük veled a kapcsolatot.",
        trackingNumber,
        shippingMethodLabel,
        lastUpdatedLabel,
        emailUpdateKey: "issue:internal_status",
        emailUpdateKind: "issue",
      };
    case "received":
    default:
      return {
        label: paymentStatus === "PAID" ? (language === "en" ? "Order received" : "Rendelés beérkezett") : input.status?.trim() || (language === "en" ? "Order received" : "Rendelés fogadva"),
        detail:
          paymentStatus === "PAID"
            ? language === "en" ? "Payment was successful. We recorded your order and will start processing it soon." : "A fizetés sikeres volt, a rendelésedet rögzítettük és hamarosan megkezdjük a feldolgozását."
            : input.status?.trim() || (language === "en" ? "We received the order." : "A rendelést fogadtuk."),
        trackingNumber,
        shippingMethodLabel,
        lastUpdatedLabel,
        emailUpdateKey: null,
        emailUpdateKind: null,
      };
  }
}
