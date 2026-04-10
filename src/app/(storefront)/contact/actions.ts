"use server";

import { EmailDeliveryError, sendContactEmail } from "@/lib/auth/email";

type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const initialContactFormState: ContactFormState = {
  status: "idle",
  message: null,
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function submitContactAction(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = normalize(formData.get("name"));
  const email = normalize(formData.get("email"));
  const subject = normalize(formData.get("subject"));
  const message = normalize(formData.get("message"));

  if (!name || !email || !message) {
    return {
      status: "error",
      message: "A név, e-mail és üzenet mező kitöltése kötelező.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      status: "error",
      message: "Adj meg egy érvényes e-mail címet.",
    };
  }

  try {
    await sendContactEmail({ name, email, subject, message });
    return {
      status: "success",
      message: "Üzenet elküldve.",
    };
  } catch (error) {
    if (error instanceof EmailDeliveryError) {
      return {
        status: "error",
        message:
          error.code === "email_not_configured"
            ? "Az üzenetküldés jelenleg nincs beállítva."
            : "Az üzenet küldése nem sikerült. Próbáld meg újra később.",
      };
    }

    return {
      status: "error",
      message: "Váratlan hiba történt. Próbáld meg újra később.",
    };
  }
}
