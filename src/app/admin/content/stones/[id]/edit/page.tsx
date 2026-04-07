import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { db } from "@/lib/db";
import { StoneForm } from "../../StoneForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditStonePage({ params }: Props) {
  const { id } = await params;
  const stone = await db.stone.findUnique({ where: { id } });

  if (!stone) notFound();

  return (
    <AdminShell
      title={`Szerkesztés: ${stone.name}`}
      description="Módosítsd a kő leírását, hatásait és megjelenési adatait."
    >
      <div className="max-w-2xl">
        <StoneForm stone={stone} />
      </div>
    </AdminShell>
  );
}
