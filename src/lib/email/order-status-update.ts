import { getAuthBaseUrl } from "@/lib/env";

type OrderStatusUpdateLocale = "hu";
type OrderAccessModel = "authenticated" | "guest";

export type OrderStatusUpdateEmailInput = {
  locale?: OrderStatusUpdateLocale;
  accessModel: OrderAccessModel;
  orderNumber: string;
  statusLabel: string;
  statusDetail: string;
  trackingNumber?: string | null;
  shippingMethodLabel?: string | null;
  lastUpdatedLabel?: string | null;
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
        label: "Kapcsolat",
        href: new URL("/contact", baseUrl).toString(),
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

function renderInfoRow(label: string, value?: string | null) {
  if (!value) {
    return "";
  }

  return `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #ece7e2; color: #8c8178; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em;">
        ${escapeHtml(label)}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #ece7e2; color: #1f1a17; font-size: 14px; text-align: right;">
        ${escapeHtml(value)}
      </td>
    </tr>
  `;
}

function renderHuTemplate(input: OrderStatusUpdateEmailInput): EmailTemplate {
  const links = getOrderLinks(input.accessModel);
  const detailsTable = [
    renderInfoRow("Rendelésszám", input.orderNumber),
    renderInfoRow("Státusz", input.statusLabel),
    renderInfoRow("Tracking szám", input.trackingNumber),
    renderInfoRow("Szállítás", input.shippingMethodLabel),
    renderInfoRow("Frissítve", input.lastUpdatedLabel),
  ].join("");

  const html = `
    <div style="margin: 0; padding: 32px 16px; background: #f6f2ed; font-family: Georgia, 'Times New Roman', serif; color: #1f1a17;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #ece7e2;">
        <tr>
          <td style="padding: 32px 32px 20px; border-bottom: 1px solid #ece7e2;">
            <div style="font-size: 11px; letter-spacing: 0.32em; text-transform: uppercase; color: #9a7b63; margin-bottom: 12px;">${BRAND_NAME}</div>
            <h1 style="margin: 0 0 10px; font-size: 28px; line-height: 1.2; font-weight: 600;">Rendelés állapotfrissítés</h1>
            <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #5c524b;">${escapeHtml(input.statusDetail)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 28px 32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
              ${detailsTable}
            </table>

            <table role="presentation" cellspacing="0" cellpadding="0">
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
    `${BRAND_NAME} rendelés állapotfrissítés`,
    "",
    `Rendelésszám: ${input.orderNumber}`,
    `Státusz: ${input.statusLabel}`,
    input.trackingNumber ? `Tracking szám: ${input.trackingNumber}` : null,
    input.shippingMethodLabel ? `Szállítás: ${input.shippingMethodLabel}` : null,
    input.lastUpdatedLabel ? `Frissítve: ${input.lastUpdatedLabel}` : null,
    "",
    input.statusDetail,
    "",
    `${links.primary.label}: ${links.primary.href}`,
    `${links.secondary.label}: ${links.secondary.href}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Rendelés állapotfrissítés • ${input.orderNumber}`,
    html,
    text,
  };
}

export function renderOrderStatusUpdateEmail(
  input: OrderStatusUpdateEmailInput,
): EmailTemplate {
  switch (input.locale ?? "hu") {
    case "hu":
    default:
      return renderHuTemplate(input);
  }
}
