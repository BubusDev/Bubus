import { db } from "@/lib/db";
import { sendPasswordResetEmailPreview } from "@/lib/auth/email";
import { createExpiryDate, createRawToken, hashToken } from "@/lib/auth/tokens";
import { normalizeEmail } from "@/lib/auth/validation";

const GENERIC_MESSAGE =
  "If a matching account exists, a password reset link has been prepared.";

export async function createPasswordResetTokenForEmail(emailInput: string) {
  const email = normalizeEmail(emailInput);

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, emailVerifiedAt: true },
  });

  if (!user || !user.emailVerifiedAt) {
    return { ok: true as const, message: GENERIC_MESSAGE };
  }

  const token = createRawToken();

  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: createExpiryDate(2),
    },
  });

  const { previewUrl } = await sendPasswordResetEmailPreview(token);

  return {
    ok: true as const,
    message: GENERIC_MESSAGE,
    previewUrl,
  };
}
