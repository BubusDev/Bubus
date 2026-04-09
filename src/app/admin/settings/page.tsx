import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";
import { requireAdminUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Beállítások — Chicks Jewelry Admin",
  description: "Fiók- és boltbeállítások kezelése.",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const user = await requireAdminUser("/admin/settings");

  return (
    <AdminShell
      title="Beállítások"
      description="Fiókod, bolt adataid és értesítési preferenciáid egy helyen."
    >
      <AdminSettingsClient
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone ?? null,
          adminNotifyNewOrder: user.adminNotifyNewOrder,
          adminNotifyReturnRequest: user.adminNotifyReturnRequest,
          adminNotifyLowStock: user.adminNotifyLowStock,
          adminNotifyWeeklySummary: user.adminNotifyWeeklySummary,
        }}
      />
    </AdminShell>
  );
}
