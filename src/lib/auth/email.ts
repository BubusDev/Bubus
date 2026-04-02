type EmailPreviewResult = {
  previewUrl?: string;
};

function isDevelopment() {
  return process.env.NODE_ENV !== "production";
}

export function buildEmailVerificationUrl(token: string) {
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  return new URL(`/verify-email?token=${encodeURIComponent(token)}`, baseUrl).toString();
}

export function buildEmailChangeConfirmationUrl(token: string) {
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  return new URL(
    `/confirm-email-change?token=${encodeURIComponent(token)}`,
    baseUrl,
  ).toString();
}

export async function sendVerificationEmailPreview(token: string): Promise<EmailPreviewResult> {
  const previewUrl = buildEmailVerificationUrl(token);

  if (isDevelopment()) {
    console.info(`[auth] Email verification URL: ${previewUrl}`);
    return { previewUrl };
  }

  return {};
}

export async function sendPasswordResetEmailPreview(token: string): Promise<EmailPreviewResult> {
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
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
