import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
import { db } from "@/lib/db";

import { SortableList, type AdminGemstone } from "./components/SortableList";

export default async function AdminDragakovekPage() {
  const stones = await db.stone.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      color: true,
      shortDesc: true,
      longDesc: true,
      effects: true,
      origin: true,
      chakra: true,
      imageUrl: true,
      sortOrder: true,
    },
  });

  const gemstones: AdminGemstone[] = stones.map((stone) => ({
    id: stone.id,
    title: stone.name,
    subtitle: stone.origin ?? "",
    category: stone.color,
    shortPersonality: stone.shortDesc,
    longPersonality: stone.longDesc,
    effects: stone.effects,
    chakras: stone.chakra
      ? stone.chakra.split(",").map((chakra) => chakra.trim()).filter(Boolean)
      : [],
    pairWith: [],
    imageUrl: stone.imageUrl,
    order: stone.sortOrder,
  }));

  return (
    <AdminShell
      title="Drágakövek"
      description="Editorial drágakő kártyák, képek, személyiségleírások és sorrend."
      actions={
        <Link href="/dragakovek" target="_blank" className="admin-button-secondary admin-control-md">
          Preview as user
        </Link>
      }
    >
      <SortableList gemstones={gemstones} />
    </AdminShell>
  );
}
