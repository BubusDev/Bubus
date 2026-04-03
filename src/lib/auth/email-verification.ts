import { db } from "@/lib/db";
import { hashToken } from "@/lib/auth/tokens";

export type VerifyEmailResult = "success" | "invalid" | "expired" | "already-used";

export async function verifyEmailToken(token: string): Promise<VerifyEmailResult> {
  if (!token) {
    return "invalid";
  }

  const tokenHash = hashToken(token);
  const verificationToken = await db.emailVerificationToken.findFirst({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      usedAt: true,
      expiresAt: true,
    },
  });

  if (!verificationToken) {
    return "invalid";
  }

  if (verificationToken.usedAt) {
    await db.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    const user = await db.user.findUnique({
      where: { id: verificationToken.userId },
      select: { emailVerifiedAt: true },
    });
    return user?.emailVerifiedAt ? "success" : "already-used";
  }

  if (verificationToken.expiresAt.getTime() < Date.now()) {
    await db.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    return "expired";
  }

  await db.$transaction([
    db.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    db.emailVerificationToken.deleteMany({
      where: {
        userId: verificationToken.userId,
      },
    }),
  ]);

  return "success";
}
