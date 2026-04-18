"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";

import { createAdminImageUploadPathname } from "@/lib/blob-upload";
import { browserSafeProductImageAccept } from "@/lib/image-safety";

type Folder = "products" | "special-edition" | "homepage" | "specialties";

type AdminBlobImageInputProps = {
  /** Name of the hidden input that carries the uploaded URL to the server action. */
  name: string;
  /** Pre-existing image URL shown as a preview before any new upload. */
  defaultUrl?: string;
  label: string;
  folder: Folder;
  previewClassName?: string;
  imageClassName?: string;
};

export function AdminBlobImageInput({
  name,
  defaultUrl = "",
  label,
  folder,
  previewClassName = "",
  imageClassName = "aspect-[4/3] w-full object-cover",
}: AdminBlobImageInputProps) {
  const [blobUrl, setBlobUrl] = useState(defaultUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsUploading(true);

    try {
      const pathname = createAdminImageUploadPathname(folder, file.name);
      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/admin/product-images/upload",
      });
      setBlobUrl(blob.url);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Feltöltési hiba. Próbáld újra.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={blobUrl} />

      {blobUrl && (
        <div
          className={`overflow-hidden rounded-md border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] ${previewClassName}`}
        >
          <img src={blobUrl} alt={label} className={imageClassName} />
        </div>
      )}

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--admin-ink-700)]">{label}</span>
        <input
          type="file"
          accept={browserSafeProductImageAccept}
          disabled={isUploading}
          onChange={handleFileChange}
          className="admin-input block min-h-10 w-full px-2.5 py-2 text-sm text-[var(--admin-ink-700)] file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-[#295da8] file:bg-[#2a63b5] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#24579f] disabled:opacity-60"
        />
      </label>

      {isUploading && <p className="text-xs text-[var(--admin-blue-700)]">Feltöltés folyamatban...</p>}
      {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
    </div>
  );
}
