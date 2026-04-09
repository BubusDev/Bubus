import { getAuthBaseUrl } from "@/lib/env";

type OrderConfirmationLocale = "hu";
type OrderAccessModel = "authenticated" | "guest";

type OrderConfirmationItem = {
  name: string;
  quantity: number;
  unitPriceLabel: string;
  lineTotalLabel: string;
};

export type OrderConfirmationEmailInput = {
  locale?: OrderConfirmationLocale;
  accessModel: OrderAccessModel;
  orderNumber: string;
  createdAtLabel: string;
  totalLabel: string;
  shippingName: string;
  shippingAddress: string;
  items: OrderConfirmationItem[];
};

type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

const BRAND_NAME = "Chicks Jewelry";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getOrderLinks(accessModel: OrderAccessModel) {
  const baseUrl = getAuthBaseUrl();

  if (accessModel === "authenticated") {
    return {
      primary: {
        label: "Rendeléseim megnyitása",
        href: new URL("/orders", baseUrl).toString(),
      },
      secondary: {
        label: "Vásárlás folytatása",
        href: new URL("/", baseUrl).toString(),
      },
    };
  }

  return {
    primary: {
      label: "Rendelési állapot megnyitása",
      href: new URL("/order-status", baseUrl).toString(),
    },
    secondary: {
      label: "Kapcsolat",
      href: new URL("/contact", baseUrl).toString(),
    },
  };
}

function renderItemsTable(items: OrderConfirmationItem[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #ece7e2; color: #1f1a17; font-size: 14px;">
            <strong>${escapeHtml(item.name)}</strong><br />
            <span style="color: #7a7068;">${item.quantity} db × ${escapeHtml(item.unitPriceLabel)}</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #ece7e2; color: #1f1a17; font-size: 14px; text-align: right; white-space: nowrap;">
            ${escapeHtml(item.lineTotalLabel)}
          </td>
        </tr>`,
    )
    .join("");
}

function renderItemsText(items: OrderConfirmationItem[]) {
  return items
    .map(
      (item) =>
        `- ${item.name} · ${item.quantity} db × ${item.unitPriceLabel} = ${item.lineTotalLabel}`,
    )
    .join("\n");
}

function renderHuTemplate(input: OrderConfirmationEmailInput): EmailTemplate {
  const links = getOrderLinks(input.accessModel);
  const escapedOrderNumber = escapeHtml(input.orderNumber);
  const escapedCreatedAt = escapeHtml(input.createdAtLabel);
  const escapedTotal = escapeHtml(input.totalLabel);
  const escapedShippingName = escapeHtml(input.shippingName);
  const escapedShippingAddress = escapeHtml(input.shippingAddress).replace(/\n/g, "<br />");
  const intro =
    input.accessModel === "authenticated"
      ? "Köszönjük a rendelésedet. A fizetés sikeres volt, és a rendelésedet rögzítettük."
      : "Köszönjük a rendelésedet. A fizetés sikeres volt, és a rendelésedet rögzítettük. Ezt az e-mailt érdemes megőrizni a rendelés adataihoz.";

  const nextStepNote =
    input.accessModel === "authenticated"
      ? "A részletes rendeléselőzményeket a fiókodban is eléred."
      : "A rendelésed állapotát a rendelési állapot oldalon tudod követni ugyanebben a böngészőben. Ha kérdésed van, a kapcsolat oldalon tudsz nekünk írni.";

  const html = `
    <div style="margin: 0; padding: 32px 16px; background: #f6f2ed; font-family: Georgia, 'Times New Roman', serif; color: #1f1a17;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #ece7e2;">
        <tr>
          <td style="padding: 32px 32px 20px; border-bottom: 1px solid #ece7e2;">
            <div style="font-size: 11px; letter-spacing: 0.32em; text-transform: uppercase; color: #9a7b63; margin-bottom: 12px;">${BRAND_NAME}</div>
            <h1 style="margin: 0 0 10px; font-size: 28px; line-height: 1.2; font-weight: 600;">Rendelés visszaigazolás</h1>
            <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #5c524b;">${escapeHtml(intro)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 28px 32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
              <tr>
                <td style="width: 50%; padding-right: 12px; vertical-align: top;">
                  <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8c8178; margin-bottom: 6px;">Rendelés</div>
                  <div style="font-size: 15px; line-height: 1.7;">
                    <strong>${escapedOrderNumber}</strong><br />
                    <span style="color: #5c524b;">${escapedCreatedAt}</span>
                  </div>
                </td>
                <td style="width: 50%; padding-left: 12px; vertical-align: top; text-align: right;">
                  <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8c8178; margin-bottom: 6px;">Végösszeg</div>
                  <div style="font-size: 22px; line-height: 1.2; font-weight: 600;">${escapedTotal}</div>
                </td>
              </tr>
            </table>

            <div style="margin-bottom: 28px;">
              <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8c8178; margin-bottom: 10px;">Tételek</div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${renderItemsTable(input.items)}
              </table>
            </div>

            <div style="margin-bottom: 28px; padding: 18px 20px; background: #faf7f3; border: 1px solid #ece7e2;">
              <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8c8178; margin-bottom: 8px;">Szállítási adatok</div>
              <div style="font-size: 14px; line-height: 1.7;">
                <strong>${escapedShippingName}</strong><br />
                ${escapedShippingAddress}
              </div>
            </div>

            <div style="margin-bottom: 26px; font-size: 14px; line-height: 1.7; color: #5c524b;">
              ${escapeHtml(nextStepNote)}
            </div>

            <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 18px;">
              <tr>
                <td style="padding-right: 12px;">
                  <a href="${escapeHtml(links.primary.href)}" style="display: inline-block; background: #1f1a17; color: #ffffff; text-decoration: none; padding: 13px 18px; font-size: 14px;">${escapeHtml(links.primary.label)}</a>
                </td>
                <td>
                  <a href="${escapeHtml(links.secondary.href)}" style="display: inline-block; background: #ffffff; color: #1f1a17; text-decoration: none; padding: 13px 18px; font-size: 14px; border: 1px solid #d9d0c8;">${escapeHtml(links.secondary.label)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `.trim();

  const text = [
    `${BRAND_NAME} rendelés visszaigazolás`,
    "",
    intro,
    "",
    `Rendelésszám: ${input.orderNumber}`,
    `Dátum: ${input.createdAtLabel}`,
    `Végösszeg: ${input.totalLabel}`,
    "",
    "Tételek:",
    renderItemsText(input.items),
    "",
    "Szállítási adatok:",
    input.shippingName,
    input.shippingAddress,
    "",
    nextStepNote,
    `${links.primary.label}: ${links.primary.href}`,
    `${links.secondary.label}: ${links.secondary.href}`,
  ].join("\n");

  return {
    subject: `Rendelés visszaigazolás • ${input.orderNumber}`,
    html,
    text,
  };
}

export function renderOrderConfirmationEmail(input: OrderConfirmationEmailInput): EmailTemplate {
  switch (input.locale ?? "hu") {
    case "hu":
    default:
      return renderHuTemplate(input);
  }
}
