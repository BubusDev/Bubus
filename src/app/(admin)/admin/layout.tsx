import type { ReactNode } from "react";

import { requireAdminUser } from "@/lib/auth";
import { AdminResponsiveShell } from "@/components/admin/AdminResponsiveShell";

export const runtime = "nodejs";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminUser("/admin");

  return (
    <AdminResponsiveShell>{children}</AdminResponsiveShell>
  );
}
