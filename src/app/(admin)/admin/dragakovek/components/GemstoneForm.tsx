"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";

import { upsertGemstoneAction } from "../actions";
import type { AdminGemstone } from "./SortableList";

const categories = ["Féldrágakő", "Kristály", "Ásvány"];
const chakraOptions = [
  { label: "Korona", value: "crown" },
  { label: "Harmadik szem", value: "third-eye" },
  { label: "Torok", value: "throat" },
  { label: "Szív", value: "heart" },
  { label: "Napfonat", value: "solar-plexus" },
  { label: "Szakrális", value: "sacral" },
  { label: "Gyökér", value: "root" },
];

type Props = {
  open: boolean;
  gemstones: AdminGemstone[];
  gemstone: AdminGemstone | null;
  onClose: () => void;
  onSaved: (message: string) => void;
};

const inputClass =
  "w-full rounded-lg border border-[var(--admin-line-200)] bg-white px-3 py-2 text-sm text-[var(--admin-ink-900)] outline-none transition focus:border-[var(--admin-blue-500)] focus:ring-2 focus:ring-[var(--admin-blue-100)]";

export function GemstoneForm({ open, gemstones, gemstone, onClose, onSaved }: Props) {
  const [isPending, startTransition] = useTransition();
  const [effects, setEffects] = useState<string[]>(gemstone?.effects ?? []);
  const [effectInput, setEffectInput] = useState("");
  const [chakras, setChakras] = useState<string[]>(gemstone?.chakras ?? []);
  const [pairWith, setPairWith] = useState<string[]>(gemstone?.pairWith ?? []);
  const [shortText, setShortText] = useState(gemstone?.shortPersonality ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(gemstone?.imageUrl ?? null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }, [gemstone, open]);

  const availablePairs = useMemo(
    () => gemstones.filter((item) => item.id !== gemstone?.id),
    [gemstone?.id, gemstones],
  );

  if (!open) return null;

  function addEffect() {
    const value = effectInput.trim();
    if (!value || effects.includes(value)) return;
    setEffects((current) => [...current, value]);
    setEffectInput("");
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function toggleValue(value: string, values: string[], setter: (next: string[]) => void) {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#172033]/35">
      <div className="ml-auto flex h-full w-full max-w-3xl flex-col bg-[var(--admin-surface-050)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--admin-line-100)] px-6 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--admin-ink-500)]">
              Drágakő kártya
            </p>
            <h2 className="text-lg font-semibold text-[var(--admin-ink-900)]">
              {gemstone ? "Kártya szerkesztése" : "Új kártya"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="admin-button-secondary admin-control-sm">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="flex-1 space-y-5 overflow-y-auto px-6 py-5"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            formData.set("effects", JSON.stringify(effects));
            formData.set("chakras", JSON.stringify(chakras));
            formData.set("pair_with", JSON.stringify(pairWith));

            startTransition(async () => {
              const result = await upsertGemstoneAction(formData);
              if (!result.ok) {
                setError(result.message);
                return;
              }
              onSaved(result.message);
              onClose();
            });
          }}
        >
          {gemstone && <input type="hidden" name="id" value={gemstone.id} />}

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--admin-ink-700)]">
                Cím
              </label>
              <input name="title" defaultValue={gemstone?.title ?? ""} required className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--admin-ink-700)]">
                Alcím / típus
              </label>
              <input
                name="subtitle"
                defaultValue={gemstone?.subtitle ?? ""}
                placeholder="Chile"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--admin-ink-700)]">
              Kategória
            </label>
            <select name="category" defaultValue={gemstone?.category ?? categories[0]} className={inputClass}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--admin-ink-700)]">
              Akcentusszín
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="accent_color"
                defaultValue={gemstone?.accentColor ?? "#7a2a3e"}
                className="h-10 w-16 rounded-lg border border-[var(--admin-line-200)] bg-white p-1"
              />
              <p className="text-xs text-[var(--admin-ink-500)]">
                Finom részletekhez: képszegély, elválasztó és hatás jelölők.
              </p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-medium text-[var(--admin-ink-700)]">
                Rövid személyiség
              </label>
              <span className="text-xs text-[var(--admin-ink-500)]">{shortText.length}/140</span>
            </div>
            <textarea
              name="short_personality"
              value={shortText}
              onChange={(event) => setShortText(event.target.value)}
              maxLength={140}
              rows={2}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--admin-ink-700)]">
              Hosszú személyiségleírás
            </label>
            <textarea
              name="long_personality"
              defaultValue={gemstone?.longPersonality ?? ""}
              rows={6}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--admin-ink-700)]">
              Hatások
            </label>
            <div className="rounded-lg border border-[var(--admin-line-200)] bg-white p-2">
              <div className="mb-2 flex flex-wrap gap-2">
                {effects.map((effect) => (
                  <span key={effect} className="inline-flex items-center gap-1 rounded-full bg-[var(--admin-blue-100)] px-2.5 py-1 text-xs text-[var(--admin-blue-700)]">
                    {effect}
                    <button type="button" onClick={() => setEffects(effects.filter((item) => item !== effect))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={effectInput}
                  onChange={(event) => setEffectInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addEffect();
                    }
                  }}
                  className="min-w-0 flex-1 px-2 py-1.5 text-sm outline-none"
                  placeholder="Uj hatas"
                />
                <button type="button" onClick={addEffect} className="admin-button-secondary admin-control-sm">
                  Hozzáad
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[var(--admin-ink-700)]">
              Csakrák
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {chakraOptions.map((chakra) => (
                <label key={chakra.value} className="flex items-center gap-2 rounded-lg border border-[var(--admin-line-100)] bg-white px-3 py-2 text-sm text-[var(--admin-ink-700)]">
                  <input
                    type="checkbox"
                    checked={chakras.includes(chakra.value)}
                    onChange={() => toggleValue(chakra.value, chakras, setChakras)}
                  />
                  {chakra.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[var(--admin-ink-700)]">
              Párosítható ezekkel
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {availablePairs.map((item) => (
                <label key={item.id} className="flex items-center gap-2 rounded-lg border border-[var(--admin-line-100)] bg-white px-3 py-2 text-sm text-[var(--admin-ink-700)]">
                  <input
                    type="checkbox"
                    checked={pairWith.includes(item.id)}
                    onChange={() => toggleValue(item.id, pairWith, setPairWith)}
                  />
                  {item.title}
                </label>
              ))}
              {availablePairs.length === 0 && (
                <p className="text-sm text-[var(--admin-ink-500)]">Még nincs másik drágakő.</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[var(--admin-ink-700)]">
              Kép
            </label>
            {previewUrl && (
              <div className="mb-3 relative h-24 w-24 overflow-hidden rounded-lg border border-[var(--admin-line-100)] bg-white">
                <Image src={previewUrl} alt="Drágakő előnézet" fill className="object-cover" />
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-[var(--admin-ink-600)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--admin-blue-100)] file:px-3 file:py-2 file:text-sm file:text-[var(--admin-blue-700)]"
            />
          </div>

          <div className="sticky bottom-0 -mx-6 flex justify-end gap-2 border-t border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] px-6 py-4">
            <button type="button" onClick={onClose} className="admin-button-secondary admin-control-md">
              Megse
            </button>
            <button type="submit" disabled={isPending} className="admin-button-primary admin-control-md">
              {isPending ? "Mentes..." : gemstone ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
