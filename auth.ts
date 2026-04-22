import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getAuthBaseUrl, getAuthSecret, getTrustHost } from "./src/lib/env";
import { verifyCredentials } from "./src/lib/auth/credentials";

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
        const email = String(credentials?.email ?? "");
        const password = String(credentials?.password ?? "");
        const user = await verifyCredentials(email, password);

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerifiedAt: user.emailVerifiedAt.toISOString(),
          earlyAccess: user.earlyAccess,
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
        token.earlyAccess = user.earlyAccess;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as "USER" | "ADMIN";
        session.user.emailVerifiedAt =
          typeof token.emailVerifiedAt === "string" ? token.emailVerifiedAt : null;
        session.user.earlyAccess = token.earlyAccess === true;
      }

      return session;
    },
  },
});
