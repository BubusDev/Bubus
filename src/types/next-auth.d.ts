import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      emailVerifiedAt: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role: "USER" | "ADMIN";
    emailVerifiedAt: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "USER" | "ADMIN";
    emailVerifiedAt?: string | null;
  }
}
