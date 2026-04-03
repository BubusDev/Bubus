import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getValidatedDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  if (databaseUrl.includes("YOUR-NEON-HOST.neon.tech")) {
    throw new Error(
      "DATABASE_URL still contains the placeholder host `YOUR-NEON-HOST.neon.tech`. Set it to your actual Neon connection string.",
    );
  }

  return databaseUrl;
}

export const db =
  globalForPrisma.prisma ??
  (() => {
    getValidatedDatabaseUrl();

    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  })();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
