import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { db } from "./src/lib/db";
import { getAuthBaseUrl, getAuthSecret, getTrustHost } from "./src/lib/env";
import { verifyPassword } from "./src/lib/auth/passwords";
import { normalizeEmail } from "./src/lib/auth/validation";

const authSecret = getAuthSecret();

if (!authSecret && process.env.NODE_ENV === "production") {
  throw new Error("AUTH_SECRET or NEXTAUTH_SECRET must be set in production.");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  basePath: "/api/auth",
  trustHost: getTrustHost(),
  redirectProxyUrl: getAuthBaseUrl(),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = normalizeEmail(String(credentials?.email ?? ""));
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            passwordHash: true,
            emailVerifiedAt: true,
          },
        });

        if (!user || !user.emailVerifiedAt) {
          return null;
        }

        const isValidPassword = await verifyPassword(password, user.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerifiedAt: user.emailVerifiedAt.toISOString(),
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.emailVerifiedAt = user.emailVerifiedAt;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as "USER" | "ADMIN";
        session.user.emailVerifiedAt =
          typeof token.emailVerifiedAt === "string" ? token.emailVerifiedAt : null;
      }

      return session;
    },
  },
});
