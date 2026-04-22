import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/passwords";
import { normalizeEmail } from "@/lib/auth/validation";

export type VerifiedCredentialsUser = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  emailVerifiedAt: Date;
  earlyAccess: boolean;
};

export async function verifyCredentials(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      earlyAccess: true,
      passwordHash: true,
      emailVerifiedAt: true,
    },
  });

  if (!user || !user.emailVerifiedAt) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerifiedAt: user.emailVerifiedAt,
    earlyAccess: user.earlyAccess,
  } satisfies VerifiedCredentialsUser;
}
