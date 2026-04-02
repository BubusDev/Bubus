import { createHash, randomBytes } from "node:crypto";

export function createRawToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createExpiryDate(hoursFromNow: number) {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
}
