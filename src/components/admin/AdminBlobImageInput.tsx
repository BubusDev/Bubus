"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";

import { createAdminImageUploadPathname } from "@/lib/blob-upload";
import { browserSafeProductImageAccept } from "@/lib/image-safety";

type Folder = "products" | "special-edition" | "homepage";

type AdminBlobImageInputProps = {
  /** Name of the hidden input that carries the uploaded URL to the server action. */
  name: string;
  /** Pre-existing image URL shown as a preview before any new upload. */
  defaultUrl?: string;
  label: string;
  folder: Folder;
};

export function AdminBlobImageInput({
  name,
  defaultUrl = "",
  label,
  folder,
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
        <div className="overflow-hidden rounded-[1.5rem] border border-[#f0d8e5] bg-[#fff7fb]">
          <img src={blobUrl} alt={label} className="aspect-[4/3] w-full object-cover" />
        </div>
      )}

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[#5a374e]">{label}</span>
        <input
          type="file"
          accept={browserSafeProductImageAccept}
          disabled={isUploading}
          onChange={handleFileChange}
          className="block w-full rounded-2xl border border-[#edd1e1] bg-white px-4 py-3 text-sm text-[#4d2741] file:mr-4 file:rounded-full file:border-0 file:bg-[#f183bc] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white disabled:opacity-60"
        />
      </label>

      {isUploading && <p className="text-xs text-[#af7795]">Feltöltés folyamatban...</p>}
      {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
    </div>
  );
}
