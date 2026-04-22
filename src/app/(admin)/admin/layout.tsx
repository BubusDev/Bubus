import type { CSSProperties, ReactNode } from "react";

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
    <div
      className="font-sans"
      style={
        {
          ["--font-display" as string]: "var(--font-sans)",
          ["--font-serif" as string]: "var(--font-sans)",
        } as CSSProperties
      }
    >
      <AdminResponsiveShell>{children}</AdminResponsiveShell>
    </div>
  );
}
