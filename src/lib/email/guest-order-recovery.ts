import { getAuthBaseUrl } from "@/lib/env";

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

export function renderGuestOrderRecoveryEmail({
  orderNumber,
  recoveryUrl,
}: {
  orderNumber: string;
  recoveryUrl: string;
}): EmailTemplate {
  const escapedOrderNumber = escapeHtml(orderNumber);
  const escapedRecoveryUrl = escapeHtml(recoveryUrl);
  const baseUrl = getAuthBaseUrl();
  const contactUrl = new URL("/contact", baseUrl).toString();

  return {
    subject: `Vendég rendelés elérése • ${orderNumber}`,
    html: `
      <div style="margin: 0; padding: 32px 16px; background: #f6f2ed; font-family: Georgia, 'Times New Roman', serif; color: #1f1a17;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #ece7e2;">
          <tr>
            <td style="padding: 32px 32px 20px; border-bottom: 1px solid #ece7e2;">
              <div style="font-size: 11px; letter-spacing: 0.32em; text-transform: uppercase; color: #9a7b63; margin-bottom: 12px;">${BRAND_NAME}</div>
              <h1 style="margin: 0 0 10px; font-size: 28px; line-height: 1.2; font-weight: 600;">Rendelés elérésének helyreállítása</h1>
              <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #5c524b;">
                Ezzel a linkkel újra megnyithatod a rendelési állapot oldalt a(z) <strong>${escapedOrderNumber}</strong> rendeléshez.
                A link rövid ideig érvényes, és a megnyitás után ezen a böngészőn is elérhető lesz a rendelés.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 18px;">
                <tr>
                  <td>
                    <a href="${escapedRecoveryUrl}" style="display: inline-block; background: #1f1a17; color: #ffffff; text-decoration: none; padding: 13px 18px; font-size: 14px;">Rendelési állapot megnyitása</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.7; color: #5c524b;">
                Ha a gomb nem nyílik meg, másold be ezt a linket a böngészőbe:
              </p>
              <p style="margin: 0; font-size: 13px; line-height: 1.7; color: #7a7068; word-break: break-all;">${escapedRecoveryUrl}</p>
              <p style="margin: 18px 0 0; font-size: 14px; line-height: 1.7; color: #5c524b;">
                Kérdés esetén: <a href="${escapeHtml(contactUrl)}" style="color: #1f1a17;">Kapcsolat</a>
              </p>
            </td>
          </tr>
        </table>
      </div>
    `.trim(),
    text: [
      `${BRAND_NAME} rendelés elérésének helyreállítása`,
      "",
      `Rendelésszám: ${orderNumber}`,
      "",
      "Nyisd meg ezt a linket a rendelési állapot visszaállításához:",
      recoveryUrl,
      "",
      "A link rövid ideig érvényes.",
    ].join("\n"),
  };
}
