import { getAuthBaseUrl } from "@/lib/env";

type RefundFailureLocale = "hu";
type OrderAccessModel = "authenticated" | "guest";

export type RefundFailureEmailInput = {
  locale?: RefundFailureLocale;
  accessModel: OrderAccessModel;
  orderNumber: string;
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

function getLinks(accessModel: OrderAccessModel) {
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

function renderHuTemplate(input: RefundFailureEmailInput): EmailTemplate {
  const links = getLinks(input.accessModel);
  const html = `
    <div style="margin: 0; padding: 32px 16px; background: #f6f2ed; font-family: Georgia, 'Times New Roman', serif; color: #1f1a17;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #ece7e2;">
        <tr>
          <td style="padding: 32px 32px 20px; border-bottom: 1px solid #ece7e2;">
            <div style="font-size: 11px; letter-spacing: 0.32em; text-transform: uppercase; color: #9a7b63; margin-bottom: 12px;">${BRAND_NAME}</div>
            <h1 style="margin: 0 0 10px; font-size: 28px; line-height: 1.2; font-weight: 600;">A visszatérítés most nem sikerült</h1>
            <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #5c524b;">A rendelésedhez kapcsolódó visszatérítést megpróbáltuk feldolgozni, de a tranzakció nem tudott sikeresen befejeződni.</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 28px 32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ece7e2; color: #8c8178; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em;">Rendelésszám</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ece7e2; color: #1f1a17; font-size: 14px; text-align: right;">${escapeHtml(input.orderNumber)}</td>
              </tr>
            </table>

            <div style="margin-bottom: 26px; font-size: 14px; line-height: 1.7; color: #5c524b;">
              Kérjük, lépj kapcsolatba velünk, és segítünk a visszatérítés ellenőrzésében vagy az egyeztetés folytatásában.
            </div>

            <table role="presentation" cellspacing="0" cellpadding="0">
              <tr>
                <td style="padding-right: 12px;">
                  <a href="${escapeHtml(links.secondary.href)}" style="display: inline-block; background: #1f1a17; color: #ffffff; text-decoration: none; padding: 13px 18px; font-size: 14px;">${escapeHtml(links.secondary.label)}</a>
                </td>
                <td>
                  <a href="${escapeHtml(links.primary.href)}" style="display: inline-block; background: #ffffff; color: #1f1a17; text-decoration: none; padding: 13px 18px; font-size: 14px; border: 1px solid #d9d0c8;">${escapeHtml(links.primary.label)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `.trim();

  const text = [
    `${BRAND_NAME} visszatérítés sikertelen`,
    "",
    `Rendelésszám: ${input.orderNumber}`,
    "",
    "A rendelésedhez kapcsolódó visszatérítést megpróbáltuk feldolgozni, de a tranzakció nem tudott sikeresen befejeződni.",
    "Kérjük, lépj kapcsolatba velünk, és segítünk a visszatérítés ellenőrzésében vagy az egyeztetés folytatásában.",
    "",
    `${links.secondary.label}: ${links.secondary.href}`,
    `${links.primary.label}: ${links.primary.href}`,
  ].join("\n");

  return {
    subject: `A visszatérítés nem fejeződött be • ${input.orderNumber}`,
    html,
    text,
  };
}

export function renderRefundFailureEmail(input: RefundFailureEmailInput): EmailTemplate {
  switch (input.locale ?? "hu") {
    case "hu":
    default:
      return renderHuTemplate(input);
  }
}
