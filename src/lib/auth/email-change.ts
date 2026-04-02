import { db } from "@/lib/db";
import { sendEmailChangeConfirmationPreview } from "@/lib/auth/email";
import { verifyPassword } from "@/lib/auth/passwords";
import { createExpiryDate, createRawToken, hashToken } from "@/lib/auth/tokens";
import { isValidEmail, normalizeEmail } from "@/lib/auth/validation";

type RequestEmailChangeInput = {
  userId: string;
  currentPassword: string;
  newEmail: string;
};

type RequestEmailChangeResult =
  | {
      ok: true;
      status: "sent" | "unchanged";
      message: string;
      previewUrl?: string;
    }
  | {
      ok: false;
      status: "invalid-email" | "invalid-password";
      message: string;
    };

const GENERIC_CHANGE_MESSAGE =
  "If the new address can be used, we prepared a confirmation link for it.";

export async function requestEmailChange(
  input: RequestEmailChangeInput,
): Promise<RequestEmailChangeResult> {
  const newEmail = normalizeEmail(input.newEmail);

  if (!isValidEmail(newEmail)) {
    return {
      ok: false,
      status: "invalid-email",
      message: "Enter a valid new email address.",
    };
  }

  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      email: true,
      passwordHash: true,
    },
  });

  if (!user || !(await verifyPassword(input.currentPassword, user.passwordHash))) {
    return {
      ok: false,
      status: "invalid-password",
      message: "Your current password is not correct.",
    };
  }

  if (newEmail === user.email) {
    return {
      ok: true,
      status: "unchanged",
      message: "Your email address is already set to that value.",
    };
  }

  const existingUser = await db.user.findUnique({
    where: { email: newEmail },
    select: { id: true },
  });

  if (existingUser) {
    return {
      ok: true,
      status: "sent",
      message: GENERIC_CHANGE_MESSAGE,
    };
  }

  const token = createRawToken();

  await db.$transaction([
    db.emailChangeToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    }),
    db.emailChangeToken.create({
      data: {
        userId: user.id,
        newEmail,
        tokenHash: hashToken(token),
        expiresAt: createExpiryDate(24),
      },
    }),
  ]);

  const { previewUrl } = await sendEmailChangeConfirmationPreview(token);

  return {
    ok: true,
    status: "sent",
    message: GENERIC_CHANGE_MESSAGE,
    previewUrl,
  };
}

export type ConfirmEmailChangeResult =
  | "success"
  | "invalid"
  | "expired"
  | "already-used"
  | "email-taken";

export async function confirmEmailChangeToken(token: string): Promise<ConfirmEmailChangeResult> {
  if (!token) {
    return "invalid";
  }

  const tokenHash = hashToken(token);
  const emailChangeToken = await db.emailChangeToken.findFirst({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      newEmail: true,
      usedAt: true,
      expiresAt: true,
    },
  });

  if (!emailChangeToken) {
    return "invalid";
  }

  if (emailChangeToken.usedAt) {
    const user = await db.user.findUnique({
      where: { id: emailChangeToken.userId },
      select: { email: true },
    });

    return user?.email === emailChangeToken.newEmail ? "success" : "already-used";
  }

  if (emailChangeToken.expiresAt.getTime() < Date.now()) {
    return "expired";
  }

  const existingUser = await db.user.findUnique({
    where: { email: emailChangeToken.newEmail },
    select: { id: true },
  });

  if (existingUser && existingUser.id !== emailChangeToken.userId) {
    return "email-taken";
  }

  await db.$transaction([
    db.emailChangeToken.update({
      where: { id: emailChangeToken.id },
      data: { usedAt: new Date() },
    }),
    db.user.update({
      where: { id: emailChangeToken.userId },
      data: { email: emailChangeToken.newEmail },
    }),
  ]);

  return "success";
}
