import "server-only";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getValidatedDatabaseUrl() {
  const databaseUrl = process.env.Bubus_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Bubus_DATABASE_URL or DATABASE_URL is not set.");
  }

  if (databaseUrl.includes("YOUR-NEON-HOST.neon.tech")) {
    throw new Error(
      "Bubus_DATABASE_URL still contains the placeholder host `YOUR-NEON-HOST.neon.tech`. Set it to your actual Neon connection string.",
    );
  }

  return databaseUrl;
}

function applyDatabaseUrlFallback(databaseUrl: string) {
  if (!process.env.Bubus_DATABASE_URL) {
    process.env.Bubus_DATABASE_URL = databaseUrl;
  }
}

function getSafeDatabaseIdentity(databaseUrl: string) {
  const { hostname, pathname } = new URL(databaseUrl);

  return {
    host: hostname,
    database: pathname.replace(/^\//, ""),
  };
}

export const db =
  globalForPrisma.prisma ??
  (() => {
    const databaseUrl = getValidatedDatabaseUrl();
    applyDatabaseUrlFallback(databaseUrl);

    if (process.env.DEBUG_DATABASE_IDENTITY === "true") {
      console.info("[db] Prisma runtime database identity", getSafeDatabaseIdentity(databaseUrl));
    }

    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  })();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
