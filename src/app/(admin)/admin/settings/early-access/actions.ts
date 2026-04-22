"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth";
import { sendTransactionalEmail } from "@/lib/auth/email";
import { db } from "@/lib/db";

export async function toggleEarlyAccessAction(input: {
  userId: string;
  sendNotification?: boolean;
}) {
  await requireAdminUser("/admin/settings/early-access");

  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      earlyAccess: true,
    },
  });

  if (!user) {
    throw new Error("A felhasználó nem található.");
  }

  if (user.role === "ADMIN") {
    revalidatePath("/admin/settings/early-access");
    return;
  }

  const nextEarlyAccess = !user.earlyAccess;

  await db.user.update({
    where: { id: user.id },
    data: { earlyAccess: nextEarlyAccess },
  });

  if (nextEarlyAccess && input.sendNotification) {
    try {
      await sendTransactionalEmail({
        to: user.email,
        subject: "Hozzáférésed aktív — Chicks Jewelry",
        text: [
          `Kedves ${user.name ?? "Vásárlónk"}!`,
          "",
          "Örömmel értesítünk, hogy hozzáférésed jóváhagyásra került.",
          "Látogass el az oldalra: https://chicksjewelry.com",
        ].join("\n"),
        html: [
          `<p>Kedves ${user.name ?? "Vásárlónk"}!</p>`,
          "<p>Örömmel értesítünk, hogy hozzáférésed jóváhagyásra került.</p>",
          '<p><a href="https://chicksjewelry.com">Látogass el az oldalra: chicksjewelry.com</a></p>',
        ].join(""),
      });
    } catch (error) {
      console.error("[early-access] Approval email could not be sent", {
        userId: user.id,
        email: user.email,
        error,
      });
    }
  }

  revalidatePath("/admin/settings/early-access");
}

export async function approveAllEarlyAccessAction() {
  await requireAdminUser("/admin/settings/early-access");

  await db.user.updateMany({
    where: {
      role: "USER",
      earlyAccess: false,
    },
    data: {
      earlyAccess: true,
    },
  });

  revalidatePath("/admin/settings/early-access");
}
