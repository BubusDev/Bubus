import type { ReactNode } from "react";

import { requireAdminUser } from "@/lib/auth";

export const runtime = "nodejs";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminUser("/admin");

  return children;
}
