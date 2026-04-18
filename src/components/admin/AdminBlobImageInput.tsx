"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useId, useRef, useState } from "react";

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
  const statusId = useId();
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const hasMountedRef = useRef(false);
  const [blobUrl, setBlobUrl] = useState(defaultUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    hiddenInputRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [blobUrl]);

  async function uploadFile(file: File) {
    setLastFile(file);
    setErrorMessage(null);
    setUploadProgress(null);
    setUploadStatus("Kép előkészítése...");
    setIsUploading(true);

    try {
      const pathname = createAdminImageUploadPathname(folder, file.name);
      setUploadStatus("Mentés a tárhelyre...");
      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/admin/product-images/upload",
        onUploadProgress: ({ percentage }) => {
          setUploadProgress(percentage);
          setUploadStatus(`Feltöltés... ${percentage}%`);
        },
      });
      setUploadStatus("Feltöltés kész.");
      setBlobUrl(blob.url);
      setErrorMessage(null);
    } catch (err) {
      setUploadProgress(null);
      setUploadStatus("A feltöltés megszakadt.");
      setErrorMessage(err instanceof Error ? err.message : "Feltöltési hiba. Próbáld újra.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    e.currentTarget.value = "";
    await uploadFile(file);
  }

  async function handleRetry() {
    if (!lastFile) return;
    await uploadFile(lastFile);
  }

  return (
    <div className="space-y-2">
      <input ref={hiddenInputRef} type="hidden" name={name} value={blobUrl} />

      {(blobUrl || isUploading) && (
        <div
          className={`relative overflow-hidden rounded-md border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] ${previewClassName}`}
        >
          {blobUrl ? (
            <img src={blobUrl} alt={label} className={imageClassName} />
          ) : (
            <div className="flex min-h-36 items-center justify-center px-4 py-6 text-center text-xs text-[var(--admin-ink-500)]">
              Előnézet készítése...
            </div>
          )}
          {isUploading ? (
            <div className="absolute inset-0 flex items-end bg-white/78 p-3 backdrop-blur-[1px]">
              <div className="w-full rounded-sm border border-[#bfd0ea] bg-white px-3 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between gap-3 text-xs font-medium text-[var(--admin-blue-700)]">
                  <span>{uploadStatus ?? "Feltöltés..."}</span>
                  {uploadProgress !== null ? <span>{uploadProgress}%</span> : null}
                </div>
                {uploadProgress !== null ? (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#dfe8f6]">
                    <div
                      className="h-full rounded-full bg-[var(--admin-blue-600)] transition-[width]"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      )}

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--admin-ink-700)]">{label}</span>
        <input
          type="file"
          accept={browserSafeProductImageAccept}
          disabled={isUploading}
          onChange={handleFileChange}
          aria-describedby={errorMessage || uploadStatus ? statusId : undefined}
          className="admin-input block min-h-10 w-full px-2.5 py-2 text-sm text-[var(--admin-ink-700)] file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-[#295da8] file:bg-[#2a63b5] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#24579f] disabled:cursor-wait disabled:bg-[#f0f4fa] disabled:opacity-70 disabled:file:cursor-wait disabled:file:border-[#8aa8d4] disabled:file:bg-[#8aa8d4]"
        />
      </label>

      <div id={statusId} aria-live="polite" className="space-y-2">
        {isUploading ? (
          <p className="text-xs font-medium text-[var(--admin-blue-700)]">
            {uploadStatus ?? "Feltöltés folyamatban..."}
          </p>
        ) : uploadStatus && !errorMessage ? (
          <p className="text-xs font-medium text-[#24533a]">{uploadStatus}</p>
        ) : null}
        {errorMessage ? (
          <div className="rounded-sm border border-[#e3c7cf] bg-[#fff1f3] px-3 py-2 text-xs leading-5 text-[#99283d]">
            <p>{errorMessage}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {lastFile ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isUploading}
                  className="admin-button-secondary min-h-8 px-2.5 text-xs"
                >
                  Újrapróbálás
                </button>
              ) : null}
              <span className="self-center text-[var(--admin-ink-600)]">
                Válassz képet újra, ha másik fájllal folytatnád.
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
