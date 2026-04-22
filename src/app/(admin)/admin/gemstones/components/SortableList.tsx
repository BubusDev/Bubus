"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";

import { deleteGemstoneAction, updateGemstoneOrderAction } from "../actions";
import { GemstoneForm } from "./GemstoneForm";

export type AdminGemstone = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  shortPersonality: string;
  longPersonality: string;
  effects: string[];
  chakras: string[];
  pairWith: string[];
  imageUrl: string | null;
  accentColor: string | null;
  order: number;
};

function SortableRow({
  gemstone,
  onEdit,
  onDelete,
}: {
  gemstone: AdminGemstone;
  onEdit: (gemstone: AdminGemstone) => void;
  onDelete: (gemstone: AdminGemstone) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: gemstone.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`grid grid-cols-[auto_56px_1fr_auto] items-center gap-4 border-b border-[var(--admin-line-100)] px-5 py-4 transition ${
        isDragging ? "scale-[1.01] bg-white shadow-lg" : "bg-white hover:bg-[var(--admin-surface-050)]"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab rounded-lg p-2 text-[var(--admin-ink-500)] hover:bg-[var(--admin-blue-100)] active:cursor-grabbing"
        aria-label="Sorrend modositas"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-[var(--admin-surface-100)]">
        {gemstone.imageUrl ? (
          <Image src={gemstone.imageUrl} alt={gemstone.title} fill sizes="56px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[var(--admin-ink-500)]">
            {gemstone.title.slice(0, 1)}
          </div>
        )}
      </div>
      <button type="button" onClick={() => onEdit(gemstone)} className="min-w-0 text-left">
        <p className="truncate text-sm font-semibold text-[var(--admin-ink-900)]">{gemstone.title}</p>
        <p className="truncate text-xs text-[var(--admin-ink-500)]">
          {gemstone.category} · {gemstone.subtitle || "Nincs tipus"} · {gemstone.effects.length} hatas
        </p>
      </button>
      <div className="flex gap-2">
        <button type="button" onClick={() => onEdit(gemstone)} className="admin-button-secondary admin-control-sm">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <button type="button" onClick={() => onDelete(gemstone)} className="admin-button-danger admin-control-sm">
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}

export function SortableList({ gemstones }: { gemstones: AdminGemstone[] }) {
  const router = useRouter();
  const [items, setItems] = useState(gemstones);
  const [editing, setEditing] = useState<AdminGemstone | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const ids = useMemo(() => items.map((item) => item.id), [items]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    setToast("Sorrend mentese...");

    startTransition(async () => {
      await updateGemstoneOrderAction(next.map((item) => item.id));
      setToast("Sorrend frissitve.");
    });
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(gemstone: AdminGemstone) {
    setEditing(gemstone);
    setFormOpen(true);
  }

  function handleDelete(gemstone: AdminGemstone) {
    if (!window.confirm(`Töröljük ezt a drágakövet: ${gemstone.title}?`)) return;
    const previous = items;
    setItems(items.filter((item) => item.id !== gemstone.id));
    setToast("Torles folyamatban...");

    startTransition(async () => {
      const result = await deleteGemstoneAction(gemstone.id);
      if (!result.ok) {
        setItems(previous);
        setToast("A torles nem sikerult.");
        return;
      }
      setToast(result.message);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--admin-ink-600)]">
          {items.length} drágakő az editorial listában
        </p>
        <div className="flex gap-2">
          <a href="/gemstones" target="_blank" className="admin-button-secondary admin-control-md">
            Preview as user
          </a>
          <button type="button" onClick={openCreate} className="admin-button-primary admin-control-md">
            <Plus className="h-4 w-4" />
            Uj kartya
          </button>
        </div>
      </div>

      {toast && (
        <p className="rounded-lg border border-[var(--admin-line-100)] bg-white px-4 py-3 text-sm text-[var(--admin-ink-700)]">
          {toast} {isPending ? "" : ""}
        </p>
      )}

      <div className="admin-table-shell overflow-hidden">
        {items.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-[var(--admin-ink-500)]">
            Még nincs drágakő. Hozd létre az első kártyát.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              {items.map((gemstone) => (
                <SortableRow
                  key={gemstone.id}
                  gemstone={gemstone}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <GemstoneForm
        key={`${formOpen ? "open" : "closed"}-${editing?.id ?? "new"}`}
        open={formOpen}
        gemstones={items}
        gemstone={editing}
        onClose={() => setFormOpen(false)}
        onSaved={(message) => {
          setToast(message);
          router.refresh();
        }}
      />
    </div>
  );
}
