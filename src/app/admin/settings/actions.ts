"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function updateProfileAction(formData: FormData) {
  const user = await requireAdminUser("/admin/settings");

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name) throw new Error("A név megadása kötelező.");

  await db.user.update({
    where: { id: user.id },
    data: { name, phone: phone || null },
  });

  revalidatePath("/admin/settings");
}

export async function updateNotificationPreferencesAction(formData: FormData) {
  const user = await requireAdminUser("/admin/settings");

  await db.user.update({
    where: { id: user.id },
    data: {
      adminNotifyNewOrder: formData.get("adminNotifyNewOrder") === "on",
      adminNotifyReturnRequest: formData.get("adminNotifyReturnRequest") === "on",
      adminNotifyLowStock: formData.get("adminNotifyLowStock") === "on",
      adminNotifyWeeklySummary: formData.get("adminNotifyWeeklySummary") === "on",
    },
  });

  revalidatePath("/admin/settings");
}
