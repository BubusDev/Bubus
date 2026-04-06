import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../src/lib/auth/passwords";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const prisma = new PrismaClient();
const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost"]);

const localAccounts = [
  {
    name: "Local Admin",
    email: "local-admin@bubus.test",
    password: "LocalAdmin123!",
    role: "ADMIN" as const,
  },
  {
    name: "Local User",
    email: "local-user@bubus.test",
    password: "LocalUser123!",
    role: "USER" as const,
  },
];

function readConfiguredAuthUrl() {
  const rawUrl =
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.APP_URL ??
    "http://127.0.0.1:3000";

  return /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
}

function assertLocalOnlyContext() {
  const authUrl = new URL(readConfiguredAuthUrl());

  if (!LOCAL_HOSTS.has(authUrl.hostname)) {
    throw new Error(
      `Refusing to seed local auth users because AUTH_URL points to ${authUrl.origin} instead of localhost.`,
    );
  }

  if (!process.env.Bubus_DATABASE_URL) {
    throw new Error("Bubus_DATABASE_URL is not set.");
  }
}

async function main() {
  assertLocalOnlyContext();

  const emailVerifiedAt = new Date("2026-04-06T09:00:00.000Z");

  for (const account of localAccounts) {
    const passwordHash = await hashPassword(account.password);

    await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        passwordHash,
        role: account.role,
        emailVerifiedAt,
        newsletterSubscribed: false,
      },
      create: {
        name: account.name,
        email: account.email,
        passwordHash,
        role: account.role,
        emailVerifiedAt,
        newsletterSubscribed: false,
      },
    });
  }

  console.log("Local auth test accounts are ready:");
  for (const account of localAccounts) {
    console.log(`- ${account.email} / ${account.password} (${account.role})`);
  }
}

main()
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
