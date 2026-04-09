import { getAuthBaseUrl } from "@/lib/env";
import { renderGuestOrderRecoveryEmail } from "@/lib/email/guest-order-recovery";
import { renderOrderConfirmationEmail } from "@/lib/email/order-confirmation";
import { renderOrderStatusUpdateEmail } from "@/lib/email/order-status-update";
import { renderRefundConfirmationEmail } from "@/lib/email/refund-confirmation";

type EmailPreviewResult = {
  previewUrl?: string;
};

export class EmailDeliveryError extends Error {
  constructor(
    message: string,
    readonly code: "email_not_configured" | "email_send_failed",
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "EmailDeliveryError";
  }
}

function isDevelopment() {
  return process.env.NODE_ENV !== "production";
}

export function buildEmailVerificationUrl(token: string) {
  const baseUrl = getAuthBaseUrl();
  return new URL(`/verify-email?token=${encodeURIComponent(token)}`, baseUrl).toString();
}

export function buildEmailChangeConfirmationUrl(token: string) {
  const baseUrl = getAuthBaseUrl();
  return new URL(
    `/confirm-email-change?token=${encodeURIComponent(token)}`,
    baseUrl,
  ).toString();
}

export function buildGuestOrderRecoveryUrl(token: string) {
  const baseUrl = getAuthBaseUrl();
  return new URL(`/order-status/recover?token=${encodeURIComponent(token)}`, baseUrl).toString();
}

function getEmailFromAddress() {
  return process.env.AUTH_EMAIL_FROM ?? process.env.EMAIL_FROM;
}

async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = getEmailFromAddress();

  if (!resendApiKey || !from) {
    if (isDevelopment()) {
      return;
    }

    throw new EmailDeliveryError(
      "Email delivery is not configured. Set RESEND_API_KEY and AUTH_EMAIL_FROM (or EMAIL_FROM).",
      "email_not_configured",
    );
  }

  console.info("[auth/email] Sending email via Resend", { to, subject });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let resendMessage = errorText;

    try {
      const parsed = JSON.parse(errorText) as { message?: string; error?: string };
      resendMessage = parsed.message ?? parsed.error ?? errorText;
    } catch {
      resendMessage = errorText;
    }

    console.error("[auth/email] Resend request failed", {
      status: response.status,
      body: resendMessage,
      to,
      subject,
    });

    throw new EmailDeliveryError(
      `Verification email could not be sent: ${response.status} ${resendMessage}`.trim(),
      "email_send_failed",
      { status: response.status, body: resendMessage },
    );
  }

  console.info("[auth/email] Email accepted by Resend", { to, subject });
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  await sendEmail(input);
}

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<EmailPreviewResult> {
  const previewUrl = buildEmailVerificationUrl(token);

  if (isDevelopment()) {
    console.info(`[auth] Email verification URL: ${previewUrl}`);
    return { previewUrl };
  }

  await sendEmail({
    to: email,
    subject: "Verify your email",
    text: `Verify your email address by opening this link: ${previewUrl}`,
    html: [
      "<p>Verify your email address to finish setting up your account.</p>",
      `<p><a href="${previewUrl}">Verify email</a></p>`,
      `<p>If the button does not open, use this link:<br />${previewUrl}</p>`,
    ].join(""),
  });

  return {};
}

export async function sendPasswordResetEmailPreview(token: string): Promise<EmailPreviewResult> {
  const baseUrl = getAuthBaseUrl();
  const previewUrl = new URL(
    `/reset-password?token=${encodeURIComponent(token)}`,
    baseUrl,
  ).toString();

  if (isDevelopment()) {
    console.info(`[auth] Password reset URL: ${previewUrl}`);
    return { previewUrl };
  }

  return {};
}

export async function sendEmailChangeConfirmationPreview(
  token: string,
): Promise<EmailPreviewResult> {
  const previewUrl = buildEmailChangeConfirmationUrl(token);

  if (isDevelopment()) {
    console.info(`[auth] Email change confirmation URL: ${previewUrl}`);
    return { previewUrl };
  }

  return {};
}

export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<EmailPreviewResult> {
  const recipient = process.env.CONTACT_EMAIL_TO ?? getEmailFromAddress();
  const normalizedSubject = subject.trim() || "Egyéb";
  const trimmedMessage = message.trim();

  if (!recipient) {
    if (isDevelopment()) {
      console.info("[contact] Missing contact email recipient, skipping send.", {
        name,
        email,
        subject: normalizedSubject,
        message: trimmedMessage,
      });
      return {};
    }

    throw new EmailDeliveryError(
      "Contact email delivery is not configured. Set CONTACT_EMAIL_TO and AUTH_EMAIL_FROM (or EMAIL_FROM).",
      "email_not_configured",
    );
  }

  if (isDevelopment()) {
    console.info("[contact] Contact message prepared", {
      to: recipient,
      from: email,
      name,
      subject: normalizedSubject,
      message: trimmedMessage,
    });
    return {};
  }

  const escapedName = escapeHtml(name);
  const escapedEmail = escapeHtml(email);
  const escapedSubject = escapeHtml(normalizedSubject);
  const escapedMessage = escapeHtml(trimmedMessage).replace(/\n/g, "<br />");

  await sendEmail({
    to: recipient,
    subject: `Kapcsolatfelvétel: ${normalizedSubject}`,
    text: [
      "Új kapcsolatfelvételi üzenet érkezett.",
      "",
      `Név: ${name}`,
      `E-mail: ${email}`,
      `Tárgy: ${normalizedSubject}`,
      "",
      trimmedMessage,
    ].join("\n"),
    html: [
      "<p>Új kapcsolatfelvételi üzenet érkezett.</p>",
      `<p><strong>Név:</strong> ${escapedName}<br />`,
      `<strong>E-mail:</strong> ${escapedEmail}<br />`,
      `<strong>Tárgy:</strong> ${escapedSubject}</p>`,
      `<p>${escapedMessage}</p>`,
    ].join(""),
  });

  return {};
}

export async function sendOrderConfirmationEmail({
  email,
  accessModel,
  orderNumber,
  totalLabel,
  createdAtLabel,
  shippingName,
  shippingAddress,
  items,
}: {
  email: string;
  accessModel: "authenticated" | "guest";
  orderNumber: string;
  totalLabel: string;
  createdAtLabel: string;
  shippingName: string;
  shippingAddress: string;
  items: Array<{ name: string; quantity: number; unitPriceLabel: string; lineTotalLabel: string }>;
}): Promise<EmailPreviewResult> {
  const renderedEmail = renderOrderConfirmationEmail({
    locale: "hu",
    accessModel,
    orderNumber,
    totalLabel,
    createdAtLabel,
    shippingName,
    shippingAddress,
    items,
  });

  if (isDevelopment()) {
    console.info("[checkout] Order confirmation email prepared", {
      to: email,
      accessModel,
      orderNumber,
      totalLabel,
      createdAtLabel,
      shippingName,
      shippingAddress,
      subject: renderedEmail.subject,
    });
    return {};
  }

  await sendEmail({
    to: email,
    subject: renderedEmail.subject,
    text: renderedEmail.text,
    html: renderedEmail.html,
  });

  return {};
}

export async function sendOrderStatusUpdateEmail({
  email,
  accessModel,
  orderNumber,
  statusLabel,
  statusDetail,
  trackingNumber,
  shippingMethodLabel,
  lastUpdatedLabel,
}: {
  email: string;
  accessModel: "authenticated" | "guest";
  orderNumber: string;
  statusLabel: string;
  statusDetail: string;
  trackingNumber?: string | null;
  shippingMethodLabel?: string | null;
  lastUpdatedLabel?: string | null;
}): Promise<EmailPreviewResult> {
  const renderedEmail = renderOrderStatusUpdateEmail({
    locale: "hu",
    accessModel,
    orderNumber,
    statusLabel,
    statusDetail,
    trackingNumber,
    shippingMethodLabel,
    lastUpdatedLabel,
  });

  if (isDevelopment()) {
    console.info("[orders] Order status update email prepared", {
      to: email,
      accessModel,
      orderNumber,
      statusLabel,
      trackingNumber,
      shippingMethodLabel,
      lastUpdatedLabel,
      subject: renderedEmail.subject,
    });
    return {};
  }

  await sendEmail({
    to: email,
    subject: renderedEmail.subject,
    text: renderedEmail.text,
    html: renderedEmail.html,
  });

  return {};
}

export async function sendRefundConfirmationEmail({
  email,
  accessModel,
  orderNumber,
  refundedAmountLabel,
  refundedAtLabel,
}: {
  email: string;
  accessModel: "authenticated" | "guest";
  orderNumber: string;
  refundedAmountLabel: string;
  refundedAtLabel: string;
}): Promise<EmailPreviewResult> {
  const renderedEmail = renderRefundConfirmationEmail({
    locale: "hu",
    accessModel,
    orderNumber,
    refundedAmountLabel,
    refundedAtLabel,
  });

  if (isDevelopment()) {
    console.info("[returns] Refund confirmation email prepared", {
      to: email,
      accessModel,
      orderNumber,
      refundedAmountLabel,
      refundedAtLabel,
      subject: renderedEmail.subject,
    });
    return {};
  }

  await sendEmail({
    to: email,
    subject: renderedEmail.subject,
    text: renderedEmail.text,
    html: renderedEmail.html,
  });

  return {};
}

export async function sendGuestOrderRecoveryEmail({
  email,
  orderNumber,
  token,
}: {
  email: string;
  orderNumber: string;
  token: string;
}): Promise<EmailPreviewResult> {
  const recoveryUrl = buildGuestOrderRecoveryUrl(token);
  const renderedEmail = renderGuestOrderRecoveryEmail({
    orderNumber,
    recoveryUrl,
  });

  if (isDevelopment()) {
    console.info("[orders] Guest order recovery email prepared", {
      to: email,
      orderNumber,
      recoveryUrl,
      subject: renderedEmail.subject,
    });
    return {};
  }

  await sendEmail({
    to: email,
    subject: renderedEmail.subject,
    text: renderedEmail.text,
    html: renderedEmail.html,
  });

  return {};
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
