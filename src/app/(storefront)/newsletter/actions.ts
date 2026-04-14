"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { grantCurrentNewsletterCouponForUser } from "@/lib/coupon-grants";
import { db } from "@/lib/db";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: string) {
  return value.toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function subscribeNewsletterAction(formData: FormData) {
  const email = normalizeEmail(readString(formData, "email"));

  if (!isValidEmail(email)) {
    redirect("/?newsletter=invalid#newsletter");
  }

  await db.newsletterSubscription.upsert({
    where: { email },
    create: { email },
    update: {},
  });

  const user = await getCurrentUser();
  if (user?.email.toLowerCase() === email) {
    await db.user.update({
      where: { id: user.id },
      data: { newsletterSubscribed: true },
    });
    await grantCurrentNewsletterCouponForUser(user.id);
  }

  revalidatePath("/");
  redirect("/?newsletter=subscribed#newsletter");
}
