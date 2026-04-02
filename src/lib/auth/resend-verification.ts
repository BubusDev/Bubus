import { db } from "@/lib/db";
import { sendVerificationEmailPreview } from "@/lib/auth/email";
import { createExpiryDate, createRawToken, hashToken } from "@/lib/auth/tokens";
import { isValidEmail, normalizeEmail } from "@/lib/auth/validation";

const GENERIC_MESSAGE =
  "If there is an unverified account for that email, a fresh verification link has been prepared.";
const RESEND_COOLDOWN_MS = 5 * 60 * 1000;

export async function resendVerificationEmail(emailInput: string) {
  const email = normalizeEmail(emailInput);

  if (!isValidEmail(email)) {
    return { ok: true as const, status: "sent" as const, message: GENERIC_MESSAGE };
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, emailVerifiedAt: true },
  });

  if (!user || user.emailVerifiedAt) {
    return { ok: true as const, status: "sent" as const, message: GENERIC_MESSAGE };
  }

  const recentToken = await db.emailVerificationToken.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (recentToken && Date.now() - recentToken.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return {
      ok: true as const,
      status: "cooldown" as const,
      message: "If a recent verification email was already prepared, please wait a few minutes before trying again.",
    };
  }

  const token = createRawToken();

  await db.$transaction([
    db.emailVerificationToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    }),
    db.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: createExpiryDate(24),
      },
    }),
  ]);

  const { previewUrl } = await sendVerificationEmailPreview(token);

  return {
    ok: true as const,
    status: "sent" as const,
    message: GENERIC_MESSAGE,
    previewUrl,
  };
}
