import "server-only";

import { cookies } from "next/headers";

const COOKIE_NAME = "guest_order_access";
const MAX_AGE = 60 * 60 * 24 * 30;
const MAX_ENTRIES = 50;

type GuestOrderAccessCookieEntry = {
  token: string;
  updatedAt: number;
};

type GuestOrderAccessCookie = Record<string, GuestOrderAccessCookieEntry>;

function pruneGuestOrderAccessCookie(data: GuestOrderAccessCookie) {
  const cutoff = Date.now() - MAX_AGE * 1000;
  const entries = Object.entries(data)
    .filter(([, value]) => value.updatedAt >= cutoff && value.token)
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
    .slice(0, MAX_ENTRIES);

  return Object.fromEntries(entries);
}

async function readGuestOrderAccessCookie(): Promise<GuestOrderAccessCookie> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;

  if (!raw) {
    return {};
  }

  try {
    return pruneGuestOrderAccessCookie(
      JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as GuestOrderAccessCookie,
    );
  } catch {
    return {};
  }
}

async function writeGuestOrderAccessCookie(data: GuestOrderAccessCookie) {
  const cookieStore = await cookies();
  const encoded = Buffer.from(
    JSON.stringify(pruneGuestOrderAccessCookie(data)),
    "utf8",
  ).toString("base64");

  cookieStore.set(COOKIE_NAME, encoded, {
    maxAge: MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function getGuestOrderAccessToken(orderId: string) {
  const accessMap = await readGuestOrderAccessCookie();
  return accessMap[orderId]?.token ?? null;
}

export async function listGuestOrderAccessEntries() {
  const accessMap = await readGuestOrderAccessCookie();
  return Object.entries(accessMap).map(([orderId, entry]) => ({
    orderId,
    token: entry.token,
    updatedAt: entry.updatedAt,
  }));
}

export async function setGuestOrderAccessToken(orderId: string, token: string) {
  const accessMap = await readGuestOrderAccessCookie();
  accessMap[orderId] = {
    token,
    updatedAt: Date.now(),
  };
  await writeGuestOrderAccessCookie(accessMap);
}
