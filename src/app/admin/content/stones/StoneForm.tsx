"use client";

import type { Stone } from "@prisma/client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { upsertStoneAction } from "./actions";

type Props = {
  stone?: Stone | null;
};

export function StoneForm({ stone }: Props) {
  const [effects, setEffects] = useState<string[]>(stone?.effects ?? []);
  const [effectInput, setEffectInput] = useState("");
  const [colorHex, setColorHex] = useState(stone?.colorHex ?? "#f9c8dc");
  const nameRef = useRef<HTMLInputElement>(null);

  // Image state
  const [previewUrl, setPreviewUrl] = useState<string | null>(stone?.imageUrl ?? null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      // Revoke any object URLs we created
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveImage(false);
  }

  function handleRemoveImage() {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Auto-generate slug from name
  function toSlug(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  const [slug, setSlug] = useState(stone?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!stone);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugManual) setSlug(toSlug(e.target.value));
  }

  function handleEffectKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = effectInput.trim();
      if (val && !effects.includes(val)) {
        setEffects((prev) => [...prev, val]);
      }
      setEffectInput("");
    }
  }

  function removeEffect(effect: string) {
    setEffects((prev) => prev.filter((e) => e !== effect));
  }

  const inputClass =
    "w-full rounded-xl border border-[#ecd3e3] bg-white/80 px-4 py-2.5 text-sm text-[#4d2741] outline-none focus:border-[#c45a85] focus:ring-1 focus:ring-[#c45a85]/30 transition";

  return (
    <form action={upsertStoneAction} encType="multipart/form-data" className="space-y-5">
      {stone && <input type="hidden" name="id" value={stone.id} />}
      <input type="hidden" name="effects" value={effects.join(",")} />
      <input type="hidden" name="removeImage" value={removeImage ? "1" : "0"} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-[#9a6878]">
            Név
          </label>
          <input
            ref={nameRef}
            name="name"
            defaultValue={stone?.name ?? ""}
            onChange={handleNameChange}
            required
            className={inputClass}
            placeholder="Rózsakvarc"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-[#9a6878]">
            Slug
          </label>
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManual(true);
            }}
            required
            className={inputClass}
            placeholder="rozsakvarc"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-[#9a6878]">
            Szín neve
          </label>
          <input
            name="color"
            defaultValue={stone?.color ?? ""}
            required
            className={inputClass}
            placeholder="rózsaszín"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-[#9a6878]">
            Szín hex
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-lg border border-[#ecd3e3] bg-white p-1"
            />
            <input
              name="colorHex"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              required
              className={`${inputClass} flex-1`}
              placeholder="#f9c8dc"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-[#9a6878]">
          Rövid leírás{" "}
          <span className="normal-case tracking-normal text-[#c0a0b4]">(max 150 karakter)</span>
        </label>
        <textarea
          name="shortDesc"
          defaultValue={stone?.shortDesc ?? ""}
          required
          maxLength={150}
          rows={2}
          className={inputClass}
          placeholder="Rövid leírás a termékmodálban..."
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-[#9a6878]">
          Hosszú leírás
        </label>
        <textarea
          name="longDesc"
          defaultValue={stone?.longDesc ?? ""}
          required
          rows={5}
          className={inputClass}
          placeholder="Teljes leírás a /stones oldalon..."
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-[#9a6878]">
          Hatások{" "}
          <span className="normal-case tracking-normal text-[#c0a0b4]">(Enter-rel hozzáadni)</span>
        </label>
        <div className="flex flex-wrap gap-2 rounded-xl border border-[#ecd3e3] bg-white/80 px-3 py-2.5 focus-within:border-[#c45a85] focus-within:ring-1 focus-within:ring-[#c45a85]/30 transition">
          {effects.map((effect) => (
            <span
              key={effect}
              className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs text-[#9a5a72]"
            >
              {effect}
              <button
                type="button"
                onClick={() => removeEffect(effect)}
                className="text-[#c0a0b4] hover:text-[#c45a85]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={effectInput}
            onChange={(e) => setEffectInput(e.target.value)}
            onKeyDown={handleEffectKeyDown}
            className="min-w-[120px] flex-1 bg-transparent text-sm text-[#4d2741] outline-none placeholder:text-[#c0a0b4]"
            placeholder="Pl. Szeretet..."
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-[#9a6878]">
            Lelőhely
          </label>
          <input
            name="origin"
            defaultValue={stone?.origin ?? ""}
            className={inputClass}
            placeholder="Brazília, Madagaszkár"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-[#9a6878]">
            Csakra
          </label>
          <input
            name="chakra"
            defaultValue={stone?.chakra ?? ""}
            className={inputClass}
            placeholder="Szív csakra"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-[#9a6878]">
            Sorrend
          </label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={stone?.sortOrder ?? 0}
            className={inputClass}
            min={0}
          />
        </div>
      </div>

      {/* Kő fotója */}
      <div>
        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-[#9a6878]">
          Kő fotója{" "}
          <span className="normal-case tracking-normal text-[#c0a0b4]">(opcionális)</span>
        </label>

        {previewUrl && (
          <div className="mb-3 flex items-center gap-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-full shadow-md ring-2 ring-[#f0d4e0]">
              <Image src={previewUrl} alt="Kő fotó előnézet" fill className="object-cover" />
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-[#c45a85] transition hover:bg-rose-100"
            >
              <X className="h-3.5 w-3.5" />
              Eltávolítás
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          name="stoneImage"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-[#7a5a6c] file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-rose-50 file:px-4 file:py-2 file:text-xs file:font-medium file:text-[#c0517a] hover:file:bg-rose-100"
        />
      </div>

      {/* Preview */}
      <div className="flex items-center gap-3 rounded-2xl border border-[#f0dbe6] bg-[#fff5f8] p-4">
        <div
          className="h-10 w-10 flex-shrink-0 rounded-full shadow-inner"
          style={{
            background: `radial-gradient(circle at 35% 35%, white 0%, ${colorHex} 100%)`,
          }}
        />
        <p className="text-[12px] text-[#9a6878]">Szín előnézet · a kör a megadott hex alapján frissül</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#c45a85] to-[#9b3d6e] px-8 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
        >
          {stone ? "Mentés" : "Létrehozás"}
        </button>
        <a
          href="/admin/content/stones"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-[#ecd3e3] bg-white px-6 text-sm font-medium text-[#6b425a] transition hover:border-[#e9b6d0]"
        >
          Mégse
        </a>
      </div>
    </form>
  );
}
