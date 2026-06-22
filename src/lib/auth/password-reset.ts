import "server-only";

import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/auth/email";
import { hashPassword } from "@/lib/auth/passwords";
import { createExpiryDate, createRawToken, hashToken } from "@/lib/auth/tokens";
import { isValidEmail, isValidPassword, normalizeEmail } from "@/lib/auth/validation";

export const PASSWORD_RESET_GENERIC_MESSAGE =
  "Ha ehhez az email címhez tartozik fiók, elküldtük a jelszó-visszaállítási linket.";

const PASSWORD_RESET_EXPIRY_HOURS = 2;

function assertPasswordResetEmailConfigured() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  if (!process.env.RESEND_API_KEY || !(process.env.AUTH_EMAIL_FROM ?? process.env.EMAIL_FROM)) {
    throw new Error("Password reset email delivery is not configured.");
  }
}

export type PasswordResetTokenState =
  | { status: "valid" }
  | { status: "missing" | "invalid" | "expired" | "used" };

export type ResetPasswordResult =
  | { ok: true }
  | { ok: false; error: "invalid-token" | "password" | "password-confirm" };

export async function createPasswordResetTokenForEmail(emailInput: string) {
  const email = normalizeEmail(emailInput);

  if (!isValidEmail(email)) {
    return { ok: false as const, error: "email" as const };
  }

  assertPasswordResetEmailConfigured();

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (!user) {
    return { ok: true as const, message: PASSWORD_RESET_GENERIC_MESSAGE };
  }

  const token = createRawToken();
  const tokenHash = hashToken(token);

  await db.$transaction([
    db.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { usedAt: new Date() },
    }),
    db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: createExpiryDate(PASSWORD_RESET_EXPIRY_HOURS),
      },
    }),
  ]);

  const { previewUrl } = await sendPasswordResetEmail(user.email, token);

  return {
    ok: true as const,
    message: PASSWORD_RESET_GENERIC_MESSAGE,
    previewUrl,
  };
}

export async function getPasswordResetTokenState(tokenInput: string | null | undefined): Promise<PasswordResetTokenState> {
  const token = tokenInput?.trim();

  if (!token) {
    return { status: "missing" };
  }

  const resetToken = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { expiresAt: true, usedAt: true },
  });

  if (!resetToken) {
    return { status: "invalid" };
  }

  if (resetToken.usedAt) {
    return { status: "used" };
  }

  if (resetToken.expiresAt <= new Date()) {
    return { status: "expired" };
  }

  return { status: "valid" };
}

export async function resetPasswordWithToken({
  token,
  password,
  passwordConfirm,
}: {
  token: string;
  password: string;
  passwordConfirm: string;
}): Promise<ResetPasswordResult> {
  if (!isValidPassword(password)) {
    return { ok: false, error: "password" };
  }

  if (password !== passwordConfirm) {
    return { ok: false, error: "password-confirm" };
  }

  const tokenHash = hashToken(token);
  const passwordHash = await hashPassword(password);
  const now = new Date();

  const result = await db.$transaction(async (tx) => {
    const resetToken = await tx.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: now },
      },
      select: { id: true, userId: true },
    });

    if (!resetToken) {
      return { ok: false as const };
    }

    const consumed = await tx.passwordResetToken.updateMany({
      where: {
        id: resetToken.id,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    });

    if (consumed.count !== 1) {
      return { ok: false as const };
    }

    await tx.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    await tx.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        id: { not: resetToken.id },
        usedAt: null,
      },
      data: { usedAt: now },
    });

    return { ok: true as const };
  });

  if (!result.ok) {
    return { ok: false, error: "invalid-token" };
  }

  return { ok: true };
}
