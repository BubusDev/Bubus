import { getAuthBaseUrl } from "@/lib/env";

type EmailPreviewResult = {
  previewUrl?: string;
};

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

    throw new Error(
      "Email delivery is not configured. Set RESEND_API_KEY and AUTH_EMAIL_FROM (or EMAIL_FROM).",
    );
  }

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
    throw new Error(`Failed to send email: ${response.status} ${errorText}`);
  }
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
