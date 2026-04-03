import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/auth/email";
import { hashPassword } from "@/lib/auth/passwords";
import { createExpiryDate, createRawToken, hashToken } from "@/lib/auth/tokens";
import {
  getPasswordMinLength,
  isValidEmail,
  isValidPassword,
  normalizeEmail,
} from "@/lib/auth/validation";

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
      const token = createRawToken();

      await db.$transaction([
        db.emailVerificationToken.deleteMany({
          where: {
            userId: existingUser.id,
            usedAt: null,
          },
        }),
        db.emailVerificationToken.create({
          data: {
            userId: existingUser.id,
            tokenHash: hashToken(token),
            expiresAt: createExpiryDate(24),
          },
        }),
      ]);

      await sendVerificationEmail(email, token);
    }

    return { ok: true, message: GENERIC_MESSAGE };
  }

  const passwordHash = await hashPassword(input.password);
  const token = createRawToken();
  const tokenHash = hashToken(token);

  const user = await db.user.create({
    data: {
      email,
      name: email.split("@")[0] || "Customer",
      passwordHash,
      emailVerifiedAt: null,
    },
    select: { id: true },
  });

  await db.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: createExpiryDate(24),
    },
  });

  const { previewUrl } = await sendVerificationEmail(email, token);

  return {
    ok: true,
    message: GENERIC_MESSAGE,
    previewUrl,
  };
}
