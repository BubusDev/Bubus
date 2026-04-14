import { db } from "@/lib/db";
import { EmailDeliveryError, sendVerificationEmail } from "@/lib/auth/email";
import { hashPassword } from "@/lib/auth/passwords";
import { createExpiryDate, createRawToken, hashToken } from "@/lib/auth/tokens";
import {
  getPasswordMinLength,
  isValidEmail,
  isValidPassword,
  normalizeEmail,
} from "@/lib/auth/validation";
import { grantWelcomeCouponForUser } from "@/lib/coupon-grants";

export type RegisterUserInput = {
  email: string;
  password: string;
  passwordConfirm: string;
  termsAccepted: boolean;
};

export type RegisterUserResult =
  | {
      ok: true;
      message: string;
      previewUrl?: string;
    }
  | {
      ok: false;
      fieldErrors: Partial<Record<"email" | "password" | "passwordConfirm" | "termsAccepted", string>>;
    };

type RegisterFieldErrors = Partial<
  Record<"email" | "password" | "passwordConfirm" | "termsAccepted", string>
>;

const GENERIC_MESSAGE =
  "If the details are valid, we will prepare your account and email a verification link.";

export class RegisterUserError extends Error {
  constructor(
    message: string,
    readonly code: "verification_email_failed",
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "RegisterUserError";
  }
}

async function sendVerificationEmailOrThrow({
  email,
  token,
  userId,
  cleanup,
}: {
  email: string;
  token: string;
  userId: string;
  cleanup: () => Promise<void>;
}) {
  console.info("[auth/register] Dispatching verification email", { email, userId });

  try {
    return await sendVerificationEmail(email, token);
  } catch (error) {
    console.error("[auth/register] Verification email failed", { email, userId, error });

    try {
      await cleanup();
    } catch (cleanupError) {
      console.error("[auth/register] Failed to clean up registration after email failure", {
        email,
        userId,
        cleanupError,
      });
    }

    if (error instanceof EmailDeliveryError) {
      throw new RegisterUserError(error.message, "verification_email_failed", error);
    }

    throw error;
  }
}

export async function registerUser(input: RegisterUserInput): Promise<RegisterUserResult> {
  const email = normalizeEmail(input.email);
  const fieldErrors: RegisterFieldErrors = {};

  if (!isValidEmail(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!isValidPassword(input.password)) {
    fieldErrors.password = `Password must be at least ${getPasswordMinLength()} characters.`;
  }

  if (input.password !== input.passwordConfirm) {
    fieldErrors.passwordConfirm = "Passwords do not match.";
  }

  if (!input.termsAccepted) {
    fieldErrors.termsAccepted = "You must accept the terms to continue.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  const existingUser = await db.user.findUnique({
    where: { email },
    select: { id: true, emailVerifiedAt: true },
  });

  if (existingUser) {
    if (!existingUser.emailVerifiedAt) {
      const passwordHash = await hashPassword(input.password);
      const token = createRawToken();
      const verificationToken = await db.$transaction(async (tx) => {
        await tx.passwordResetToken.deleteMany({
          where: { userId: existingUser.id },
        });

        await tx.emailChangeToken.deleteMany({
          where: { userId: existingUser.id },
        });

        await tx.emailVerificationToken.deleteMany({
          where: { userId: existingUser.id },
        });

        await tx.user.update({
          where: { id: existingUser.id },
          data: {
            passwordHash,
            name: email.split("@")[0] || "Customer",
          },
        });

        return tx.emailVerificationToken.create({
          data: {
            userId: existingUser.id,
            tokenHash: hashToken(token),
            expiresAt: createExpiryDate(24),
          },
          select: { id: true },
        });
      });

      await sendVerificationEmailOrThrow({
        email,
        token,
        userId: existingUser.id,
        cleanup: async () => {
          await db.emailVerificationToken.deleteMany({
            where: { id: verificationToken.id },
          });
        },
      });
    }

    return { ok: true, message: GENERIC_MESSAGE };
  }

  const passwordHash = await hashPassword(input.password);
  const token = createRawToken();
  const tokenHash = hashToken(token);

  const registration = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name: email.split("@")[0] || "Customer",
        passwordHash,
        emailVerifiedAt: null,
      },
      select: { id: true },
    });

    await tx.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: createExpiryDate(24),
      },
    });

    await grantWelcomeCouponForUser(tx, user.id);

    return user;
  });

  const { previewUrl } = await sendVerificationEmailOrThrow({
    email,
    token,
    userId: registration.id,
    cleanup: async () => {
      await db.user.delete({
        where: { id: registration.id },
      });
    },
  });

  return {
    ok: true,
    message: GENERIC_MESSAGE,
    previewUrl,
  };
}
