import { redirect } from "next/navigation";

import { signOut } from "../../auth";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { HeaderUser } from "@/lib/header-data";

function normalizeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/";
  }

  return nextPath;
}

function toHeaderRole(role: "USER" | "ADMIN"): HeaderUser["role"] {
  return role === "ADMIN" ? "admin" : "user";
}

export { getCurrentUser };

export async function requireAuthenticatedUser(nextPath = "/") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(normalizeNextPath(nextPath))}`);
  }

  return user;
}

export async function getHeaderUser(): Promise<HeaderUser | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: toHeaderRole(user.role),
  };
}

export async function requireUser(nextPath = "/") {
  const user = await requireAuthenticatedUser(nextPath);

  if (!user.emailVerifiedAt) {
    redirect("/verify-email");
  }

  return user;
}

export async function requireAdminUser(nextPath = "/admin") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/admin/sign-in?next=${encodeURIComponent(normalizeNextPath(nextPath))}`);
  }

  if (!user.emailVerifiedAt) {
    redirect("/verify-email");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}

export async function logoutAndRedirect() {
  await signOut({ redirectTo: "/" });
}
