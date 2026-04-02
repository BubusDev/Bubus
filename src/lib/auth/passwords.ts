import { hash, verify } from "@node-rs/argon2";

const ARGON_OPTIONS = {
  algorithm: 2,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
};

export async function hashPassword(password: string) {
  return hash(password, ARGON_OPTIONS);
}

export async function verifyPassword(password: string, passwordHash: string) {
  try {
    return await verify(passwordHash, password, ARGON_OPTIONS);
  } catch {
    return false;
  }
}
