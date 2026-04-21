import "server-only";

import { cookies } from "next/headers";

export type CheckoutSessionData = {
  email: string;
  isGuest: boolean;
  userId?: string;
};

const COOKIE_NAME = "checkout_session";
const MAX_AGE = 60 * 60 * 24;

export async function getCheckoutSession(): Promise<CheckoutSessionData | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as CheckoutSessionData;
  } catch {
    return null;
  }
}

export async function setCheckoutSession(data: CheckoutSessionData) {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(data), "utf8").toString("base64");

  cookieStore.set(COOKIE_NAME, encoded, {
    maxAge: MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearCheckoutSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
