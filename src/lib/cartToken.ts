import { randomUUID } from "node:crypto";

import { cookies } from "next/headers";

const COOKIE_NAME = "guest_cart_token";
const MAX_AGE = 60 * 60 * 24 * 30;

export async function getGuestCartToken() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function ensureGuestCartToken() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME)?.value;

  if (existing) {
    return existing;
  }

  const token = randomUUID();

  cookieStore.set(COOKIE_NAME, token, {
    maxAge: MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return token;
}

export async function clearGuestCartToken() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
