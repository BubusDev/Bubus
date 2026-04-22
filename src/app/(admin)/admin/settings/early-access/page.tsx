import type { Metadata } from "next";

import { AdminEarlyAccessManager } from "@/components/admin/AdminEarlyAccessManager";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";

const EARLY_ACCESS_MODE = process.env.EARLY_ACCESS_MODE === "true";

export const metadata: Metadata = {
  title: "Early access — Chicks Jewelry Admin",
  description: "Korai hozzáférésű felhasználók kezelése és jóváhagyása.",
  robots: { index: false, follow: false },
};

export default async function AdminEarlyAccessPage() {
  await requireAdminUser("/admin/settings/early-access");

  const users = await db.user.findMany({
    orderBy: [{ earlyAccess: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      earlyAccess: true,
      createdAt: true,
    },
  });

  return (
    <AdminShell
      title="Early access"
      description="Whitelist alapú korai hozzáférés kezelése a storefront indulása előtt."
    >
      <AdminEarlyAccessManager
        earlyAccessMode={EARLY_ACCESS_MODE}
        users={users.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        }))}
      />
    </AdminShell>
  );
}
