"use server";

import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { setCheckoutSession } from "@/lib/checkoutSession";

const contactSchema = z.object({
  email: z.string().trim().email("Érvényes e-mail-cím szükséges"),
  mode: z.enum(["guest", "login", "register"]),
});

export async function submitContactStep(formData: FormData) {
  const user = await getCurrentUser();

  if (user?.emailVerifiedAt) {
    await setCheckoutSession({
      email: user.email,
      isGuest: false,
      userId: user.id,
    });

    return { success: true, nextStep: "shipping" as const, email: user.email };
  }

  const parsed = contactSchema.safeParse({
    email: formData.get("email"),
    mode: formData.get("mode"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Hiba történt",
    };
  }

  if (parsed.data.mode === "guest") {
    await setCheckoutSession({
      email: parsed.data.email,
      isGuest: true,
    });

    return {
      success: true,
      nextStep: "shipping" as const,
      email: parsed.data.email,
    };
  }

  return { success: false, error: "Ismeretlen mód" };
}
