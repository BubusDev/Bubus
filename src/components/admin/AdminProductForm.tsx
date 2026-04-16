"use client";

import { upload } from "@vercel/blob/client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { Archive, ChevronDown, ImagePlus, Plus, Save, Sparkles, Star, Trash2, X } from "lucide-react";

import {
  createProductOptionAction,
  deleteProductOptionAction,
  toggleProductArchiveAction,
} from "@/app/(admin)/admin/products/actions";
import { createProductImageUploadPathname } from "@/lib/blob-upload";
import { homepagePlacementLabels } from "@/lib/catalog";
import {
  type AdminProductFormOptions,
  type AdminProductFormValues,
  type ProductOptionGroup,
  type ProductOptionValue,
} from "@/lib/products";
import {
  getUnsafeProductImageMessage,
  isHeicImageFile,
  isUploadAcceptedImageFile,
  productImageFormatHelpText,
  productImageInputAccept,
} from "@/lib/image-safety";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminProductFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  options: AdminProductFormOptions;
  optionGroups: ProductOptionGroup[];
  submitLabel: string;
  values: AdminProductFormValues;
};

type PendingImage = {
  id: string;
  previewUrl: string;
  name: string;
  kind: "existing" | "upload";
  uploadedUrl: string;
  status: "ready" | "uploading" | "error";
  errorMessage?: string;
};

type ProductFormState = {
  name: string;
  slug: string;
  status: AdminProductFormValues["status"];
  badge: string;
  collectionLabel: string;
  price: string;
  stockQuantity: string;
  compareAtPrice: string;
  shortDescription: string;
  description: string;
  category: string;
  stoneType: string;
  color: string;
  style: string;
  occasion: string;
  availability: string;
  tone: string;
  homepagePlacement: AdminProductFormValues["homepagePlacement"];
  isNew: boolean;
  isGiftable: boolean;
  isOnSale: boolean;
  specialtyKey: string;
  specialtyIds: string[];
};

type FormFieldName = keyof ProductFormState;
type FormErrorState = Partial<Record<FormFieldName, string>>;
type OptionListKey = Exclude<keyof AdminProductFormOptions, "homepagePlacements" | "specialties" | "statuses">;

type SelectFieldProps = {
  error?: string;
  fieldName: ProductOptionGroup["fieldName"];
  label: string;
  onChange: (nextValue: string) => void;
  onOptionCreated: (type: ProductOptionGroup["type"], option: ProductOptionValue) => void;
  onOptionDeleted: (fieldName: ProductOptionGroup["fieldName"], option: ProductOptionValue) => void;
  onOptionRestored: (fieldName: ProductOptionGroup["fieldName"], option: ProductOptionValue) => void;
  optionType: ProductOptionGroup["type"];
  options: ProductOptionValue[];
  selectedValue: string;
};

type UploadedImagePayload = {
  key: string;
  url: string;
};

type SubmissionEntrySummary = {
  field: string;
  count: number;
  bytes: number;
  containsFile: boolean;
  containsBlob: boolean;
  containsDataImage: boolean;
  containsBase64DataUri: boolean;
  preview: string;
};

type SubmissionInspection = {
  totalBytes: number;
  fields: SubmissionEntrySummary[];
  hasBinaryEntry: boolean;
  hasInlineDataImage: boolean;
  hasBase64DataUri: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const requiredFieldMessages: Partial<Record<FormFieldName, string>> = {
  name: "A termék neve kötelező.",
  slug: "A slug kötelező.",
  badge: "A címke kötelező.",
  collectionLabel: "A kollekciócímke kötelező.",
  price: "Az ár kötelező.",
  shortDescription: "A rövid leírás kötelező.",
  description: "A teljes leírás kötelező.",
  category: "A kategória kötelező.",
  stoneType: "A kőtípus kötelező.",
  color: "A szín kötelező.",
  style: "A stílus kötelező.",
  occasion: "Az alkalom kötelező.",
  availability: "Az elérhetőség kötelező.",
  tone: "A vizuális tónus kötelező.",
  homepagePlacement: "A kezdőlapi kihelyezés kötelező.",
};

const statusLabels: Record<AdminProductFormValues["status"], string> = {
  DRAFT: "Vázlat",
  ACTIVE: "Aktív",
  ARCHIVED: "Archivált",
};

const optionListKeyByField: Record<ProductOptionGroup["fieldName"], OptionListKey> = {
  category: "categories",
  stoneType: "stoneTypes",
  color: "colors",
  style: "styles",
  occasion: "occasions",
  availability: "availability",
  tone: "tones",
};

const textEncoder = new TextEncoder();
const PRODUCT_IMAGE_DIRECT_UPLOAD_LIMIT_BYTES = 8 * 1024 * 1024;
const PRODUCT_IMAGE_TARGET_MAX_EDGE = 2400;
const PRODUCT_IMAGE_ENCODE_QUALITY = 0.86;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function truncateForPreview(value: string, limit = 120) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit)}...`;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function inspectSubmissionFormData(formData: FormData): SubmissionInspection {
  const byField = new Map<string, SubmissionEntrySummary>();
  let totalBytes = 0;
  let hasBinaryEntry = false;
  let hasInlineDataImage = false;
  let hasBase64DataUri = false;

  for (const [field, value] of formData.entries()) {
    const entry =
      byField.get(field) ??
      ({
        field,
        count: 0,
        bytes: 0,
        containsFile: false,
        containsBlob: false,
        containsDataImage: false,
        containsBase64DataUri: false,
        preview: "",
      } as SubmissionEntrySummary);

    entry.count += 1;

    if (typeof value === "string") {
      const bytes = textEncoder.encode(value).length;
      const containsDataImage = /data:image\//i.test(value);
      const containsBase64DataUri = /data:[^;,]+;base64,/i.test(value);
      entry.bytes += bytes;
      entry.containsDataImage ||= containsDataImage;
      entry.containsBase64DataUri ||= containsBase64DataUri;
      entry.preview ||= truncateForPreview(value);
      totalBytes += bytes;
      hasInlineDataImage ||= containsDataImage;
      hasBase64DataUri ||= containsBase64DataUri;
    } else {
      const bytes = value.size;
      const isFile = typeof File !== "undefined" && value instanceof File;
      entry.bytes += bytes;
      entry.containsBlob = true;
      entry.containsFile ||= isFile;
      entry.preview ||= isFile ? `File(${value.name}, ${formatBytes(value.size)})` : "Blob";
      totalBytes += bytes;
      hasBinaryEntry = true;
    }

    byField.set(field, entry);
  }

  return {
    totalBytes,
    fields: [...byField.values()].sort((l, r) => r.bytes - l.bytes),
    hasBinaryEntry,
    hasInlineDataImage,
    hasBase64DataUri,
  };
}

function getOptimizedImageFileName(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  return `${baseName || "product-image"}.jpg`;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("A kép optimalizálása nem sikerült."));
      },
      type,
      quality,
    );
  });
}

async function loadImageForCanvas(file: File) {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return {
      height: bitmap.height,
      image: bitmap,
      release: () => bitmap.close(),
      width: bitmap.width,
    };
  }

  const previewUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = previewUrl;
    await image.decode();
    return {
      height: image.naturalHeight,
      image,
      release: () => URL.revokeObjectURL(previewUrl),
      width: image.naturalWidth,
    };
  } catch (error) {
    URL.revokeObjectURL(previewUrl);
    throw error;
  }
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/admin/product-images/convert-heic", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "A HEIC konvertálása nem sikerült.");
  }
  const jpegBlob = await response.blob();
  return new File([jpegBlob], getOptimizedImageFileName(file.name), {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}

async function optimizeProductImageForUpload(file: File) {
  if (isHeicImageFile(file)) {
    file = await convertHeicToJpeg(file);
  }

  if (file.type === "image/gif") {
    return file;
  }

  const source = await loadImageForCanvas(file);
  try {
    const maxEdge = Math.max(source.width, source.height);
    const shouldOptimize =
      file.size > PRODUCT_IMAGE_DIRECT_UPLOAD_LIMIT_BYTES || maxEdge > PRODUCT_IMAGE_TARGET_MAX_EDGE;

    if (!shouldOptimize) {
      return file;
    }

    const scale = Math.min(1, PRODUCT_IMAGE_TARGET_MAX_EDGE / maxEdge);
    const targetWidth = Math.max(1, Math.round(source.width * scale));
    const targetHeight = Math.max(1, Math.round(source.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      return file;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.drawImage(source.image, 0, 0, targetWidth, targetHeight);

    const optimizedBlob = await canvasToBlob(
      canvas,
      "image/jpeg",
      PRODUCT_IMAGE_ENCODE_QUALITY,
    );

    if (optimizedBlob.size >= file.size && file.size <= PRODUCT_IMAGE_DIRECT_UPLOAD_LIMIT_BYTES) {
      return file;
    }

    return new File([optimizedBlob], getOptimizedImageFileName(file.name), {
      lastModified: file.lastModified,
      type: "image/jpeg",
    });
  } finally {
    source.release();
  }
}

function buildInitialFormState(values: AdminProductFormValues): ProductFormState {
  return {
    name: values.name,
    slug: values.slug,
    status: values.id ? values.status : "DRAFT",
    badge: values.badge,
    collectionLabel: values.collectionLabel,
    price: String(values.price),
    stockQuantity: String(values.stockQuantity),
    compareAtPrice: values.compareAtPrice,
    shortDescription: values.shortDescription,
    description: values.description,
    category: values.category,
    stoneType: values.stoneType,
    color: values.color,
    style: values.style,
    occasion: values.occasion,
    availability: values.availability,
    tone: values.tone,
    homepagePlacement: values.homepagePlacement,
    isNew: values.isNew,
    isGiftable: values.isGiftable,
    isOnSale: values.isOnSale,
    specialtyKey: values.specialtyKey,
    specialtyIds: values.specialtyIds,
  };
}

function validateFormState(
  formValues: ProductFormState,
  availableOptions: AdminProductFormOptions,
): FormErrorState {
  const errors: FormErrorState = {};

  for (const [fieldName, message] of Object.entries(requiredFieldMessages) as Array<
    [FormFieldName, string]
  >) {
    const isAlwaysRequired = fieldName === "name" || fieldName === "slug" || fieldName === "homepagePlacement";
    if (formValues.status === "DRAFT" && !isAlwaysRequired) {
      continue;
    }

    const value = formValues[fieldName];
    if (typeof value === "string" && value.trim().length === 0) {
      errors[fieldName] = message;
    }
  }

  const price = Number(formValues.price);
  if (!Number.isInteger(price) || price < 0 || (formValues.status === "ACTIVE" && price <= 0)) {
    errors.price =
      formValues.status === "ACTIVE"
        ? "Az aktív termék ára legyen pozitív egész Ft összeg."
        : "Az ár legyen nem negatív egész Ft összeg.";
  }

  const stockQuantity = Number(formValues.stockQuantity);
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    errors.stockQuantity = "A készlet legyen érvényes, nem negatív egész szám.";
  }

  if (formValues.compareAtPrice.trim().length > 0) {
    const compareAtPrice = Number(formValues.compareAtPrice);
    if (!Number.isInteger(compareAtPrice) || compareAtPrice <= price) {
      errors.compareAtPrice = "Az eredeti ár legyen üres vagy a termékárnál magasabb egész Ft összeg.";
    }
  }

  if (formValues.isOnSale && formValues.compareAtPrice.trim().length === 0) {
    errors.compareAtPrice = "Akciós termékhez adj meg a termékárnál magasabb eredeti árat.";
  }

  if (!availableOptions.homepagePlacements.includes(formValues.homepagePlacement)) {
    errors.homepagePlacement = "Érvénytelen kezdőlapi kihelyezés.";
  }

  const optionFields = Object.entries(optionListKeyByField) as Array<
    [ProductOptionGroup["fieldName"], OptionListKey]
  >;
  for (const [fieldName, optionsKey] of optionFields) {
    const selectedOptionId = formValues[fieldName];
    const hasMatch = availableOptions[optionsKey].some((option) => option.id === selectedOptionId);
    if (!hasMatch) {
      errors[fieldName] = requiredFieldMessages[fieldName] ?? "Érvénytelen választás.";
    }
  }

  return errors;
}

async function uploadProductImage(file: File) {
  const uploadFile = await optimizeProductImageForUpload(file);

  return upload(createProductImageUploadPathname(uploadFile.name), uploadFile, {
    access: "public",
    contentType: uploadFile.type || undefined,
    handleUploadUrl: "/api/admin/product-images/upload",
  });
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const inputCls =
  "h-11 w-full rounded-md border border-[var(--admin-line-200)] bg-white px-3.5 text-sm text-[var(--admin-ink-900)] outline-none transition-all placeholder:text-[var(--admin-ink-500)] focus:border-[var(--admin-blue-600)] focus:shadow-[0_0_0_3px_rgba(63,122,210,0.12)]";

const textareaCls =
  "w-full rounded-md border border-[var(--admin-line-200)] bg-white px-3.5 py-3 text-sm text-[var(--admin-ink-900)] outline-none transition-all resize-y placeholder:text-[var(--admin-ink-500)] focus:border-[var(--admin-blue-600)] focus:shadow-[0_0_0_3px_rgba(63,122,210,0.12)]";

const eyebrowCls = "text-[10px] uppercase tracking-[0.18em] text-[var(--admin-ink-500)] font-medium";

const ctaGradient = "#2a63b5";

// ─── Sub-components ───────────────────────────────────────────────────────────

function CardShell({
  children,
  eyebrow,
  subtitle,
  title,
}: {
  children: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <section className="border border-[var(--admin-line-100)] bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.03)] sm:p-5">
      <div className="mb-4">
        {eyebrow && <p className={`mb-1 ${eyebrowCls}`}>{eyebrow}</p>}
        <h2 className="text-[1rem] font-semibold tracking-[-0.01em] text-[var(--admin-ink-900)]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 max-w-[70ch] text-xs leading-5 text-[var(--admin-ink-600)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function FieldWrap({
  children,
  error,
  helper,
  label,
  required = false,
}: {
  children: ReactNode;
  error?: string;
  helper?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className={`mb-2 flex items-center gap-1 ${eyebrowCls}`}>
        {label}
        {required ? <span className="text-[#9b476f]">*</span> : null}
      </span>
      {children}
      {helper && !error ? (
        <p className="mt-1.5 text-xs leading-5 text-[var(--admin-ink-500)]">{helper}</p>
      ) : null}
      {error && <p className="mt-1.5 text-xs text-[#9b476f]">{error}</p>}
    </label>
  );
}

function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "good" | "warn" | "danger" | "neutral";
}) {
  const toneClass =
    tone === "good"
      ? "border-[#bdd7c8] bg-[#f2faf5] text-[#24533a]"
      : tone === "warn"
        ? "border-[#ead6a7] bg-[#fff9e8] text-[#765b18]"
        : tone === "danger"
          ? "border-[#e8c7d2] bg-[#fff5f8] text-[#9b476f]"
          : "border-[var(--admin-line-200)] bg-white text-[var(--admin-ink-700)]";

  return (
    <span className={`inline-flex items-center rounded-sm border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneClass}`}>
      {children}
    </span>
  );
}

function SummaryRow({
  label,
  tone,
  value,
}: {
  label: string;
  tone?: "good" | "warn" | "danger" | "neutral";
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--admin-line-100)] py-2.5 last:border-b-0">
      <span className="text-xs text-[var(--admin-ink-500)]">{label}</span>
      <StatusPill tone={tone}>{value}</StatusPill>
    </div>
  );
}

function ToggleSwitch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-left"
    >
      <div className="relative shrink-0">
        <div
          className="h-5 w-10 rounded-sm border transition-all duration-200"
          style={{
            background: checked ? "rgba(42,99,181,0.14)" : "#e7edf5",
            borderColor: checked ? "#2a63b5" : "var(--admin-line-200)",
          }}
        />
        <div
          className="absolute top-0.5 h-3.5 w-3.5 rounded-[2px] bg-white ring-1 ring-black/5 transition-all duration-200"
          style={{ left: checked ? "22px" : "2px" }}
        />
      </div>
      <span className="text-sm text-[var(--admin-ink-700)]">{label}</span>
    </button>
  );
}

function PillChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150"
      style={
        active
          ? { background: "#eef3fb", color: "#1f4f96", border: "1px solid rgba(42,99,181,0.24)" }
          : { background: "rgba(255,255,255,0.88)", color: "#42516a", border: "1px solid #d7dfeb" }
      }
    >
      {children}
    </button>
  );
}

function InlineOptionCreate({
  label,
  onCreated,
  optionType,
}: {
  optionType: ProductOptionGroup["type"];
  label: string;
  onCreated: (option: ProductOptionValue) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  function reset() {
    setIsOpen(false);
    setError(null);
    setName("");
    setSlug("");
  }

  async function handleCreate() {
    setError(null);
    const formData = new FormData();
    formData.append("type", optionType);
    formData.append("name", name);
    formData.append("slug", slug);

    startTransition(async () => {
      try {
        const created = await createProductOptionAction(formData);
        onCreated(created);
        reset();
      } catch (actionError) {
        setError(
          actionError instanceof Error ? actionError.message : "Nem sikerült létrehozni az opciót.",
        );
      }
    });
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-sm border border-[var(--admin-line-200)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--admin-blue-700)] transition hover:bg-[var(--admin-blue-050)]"
      >
        <Plus className="h-3 w-3" />
        Új hozzáadása
      </button>
    );
  }

  return (
    <div className="mt-3 border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--admin-ink-900)]">Új {label.toLowerCase()} hozzáadása</p>
        <button
          type="button"
          onClick={reset}
          className="flex h-7 w-7 items-center justify-center rounded-sm border border-[var(--admin-line-200)] bg-white text-[var(--admin-ink-600)] transition hover:bg-[var(--admin-surface-100)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {optionType === "CATEGORY" ? (
        <p className="mb-3 text-xs leading-5 text-[var(--admin-ink-600)]">
          Az új kategória boltoldalt kap, de a főmenübe csak külön bekapcsolva kerül.
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Megnevezés"
          className={inputCls}
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Slug (opcionális)"
          className={inputCls}
        />
      </div>

      {error && <p className="mt-2 text-xs text-[#9b476f]">{error}</p>}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={isPending || !name.trim()}
          onClick={handleCreate}
          className="inline-flex h-9 items-center rounded-sm border border-[#295da8] px-4 text-xs font-medium text-white transition disabled:opacity-70"
          style={{ background: ctaGradient }}
        >
          {isPending ? "Mentés..." : "Létrehozás"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center rounded-sm border border-[var(--admin-line-200)] bg-white px-4 text-xs font-medium text-[var(--admin-ink-700)] transition hover:bg-[var(--admin-surface-100)]"
        >
          Mégse
        </button>
      </div>
    </div>
  );
}

function PillSelectField({
  error,
  fieldName,
  label,
  onChange,
  onOptionCreated,
  onOptionDeleted,
  onOptionRestored,
  optionType,
  options,
  selectedValue,
}: SelectFieldProps) {
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function handleDelete(option: ProductOptionValue) {
    if (option.id === selectedValue) {
      setDeleteError("A kiválasztott érték nem törölhető.");
      return;
    }
    setDeleteError(null);
    onOptionDeleted(fieldName, option);
    const formData = new FormData();
    formData.append("optionId", option.id);
    setPendingDeleteId(option.id);

    startDeleteTransition(async () => {
      try {
        await deleteProductOptionAction(formData);
      } catch (actionError) {
        onOptionRestored(fieldName, option);
        setDeleteError(
          actionError instanceof Error ? actionError.message : "Nem sikerült törölni az opciót.",
        );
      } finally {
        setPendingDeleteId(null);
      }
    });
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className={eyebrowCls}>{label}</span>
        <button
          type="button"
          onClick={() => setIsManagerOpen(true)}
          className="inline-flex items-center gap-1 rounded-sm border border-[var(--admin-line-200)] bg-white px-2.5 py-1 text-[10px] font-medium text-[var(--admin-blue-700)] transition hover:bg-[var(--admin-blue-050)]"
        >
          <Plus className="h-3 w-3" />
          Kezelés
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <PillChip
            key={option.id}
            active={selectedValue === option.id}
            onClick={() => onChange(option.id)}
          >
            {option.name}
          </PillChip>
        ))}
        {options.length === 0 && (
          <p className="text-xs text-[#a08090]">Nincs elérhető opció.</p>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-[#9b476f]">{error}</p>}

      {isManagerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(23,32,51,0.16)] p-4 backdrop-blur-[2px]"
          onClick={() => setIsManagerOpen(false)}
        >
          <div
            className="w-full max-w-lg border border-[var(--admin-line-100)] bg-white p-6 shadow-[0_18px_36px_rgba(21,33,61,0.08)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className={eyebrowCls}>Opciókezelés</p>
                <h3 className="mt-1 text-lg font-semibold text-[var(--admin-ink-900)]">
                  {label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManagerOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-[var(--admin-line-200)] bg-white text-[var(--admin-ink-600)] transition hover:bg-[var(--admin-surface-100)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] p-2">
              {options.map((option) => {
                const isSelected = option.id === selectedValue;
                const isPendingDelete = isDeletePending && pendingDeleteId === option.id;
                return (
                  <div
                    key={option.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-[var(--admin-ink-700)] transition hover:bg-white"
                  >
                    <span className="truncate">
                      {option.name}
                      {isSelected ? " ✓" : ""}
                    </span>
                    <button
                      type="button"
                      disabled={isSelected || isPendingDelete}
                      onClick={() => handleDelete(option)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-[var(--admin-line-200)] bg-white text-[var(--admin-ink-600)] transition hover:border-[#e3c7cf] hover:bg-[#fbf5f6] disabled:cursor-not-allowed disabled:opacity-50"
                      title={isSelected ? "A kiválasztott érték nem törölhető" : "Opció törlése"}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>

            {deleteError && <p className="mt-3 text-sm text-[#9b476f]">{deleteError}</p>}

            <InlineOptionCreate
              optionType={optionType}
              label={label}
              onCreated={(option) => onOptionCreated(optionType, option)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminProductForm({
  action,
  options,
  optionGroups,
  values,
}: AdminProductFormProps) {
  const initialFormState = useMemo(() => buildInitialFormState(values), [values]);
  const initialExistingImages = useMemo<PendingImage[]>(
    () =>
      values.images.map((image) => ({
        id: image.id,
        previewUrl: image.url,
        name: image.alt,
        kind: "existing",
        uploadedUrl: image.url,
        status: "ready",
      })),
    [values],
  );
  const initialCoverImageKey = useMemo(
    () => values.images.find((image) => image.isCover)?.id ?? values.images[0]?.id ?? "",
    [values],
  );

  const [dynamicOptions, setDynamicOptions] = useState(options);
  const [formValues, setFormValues] = useState<ProductFormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrorState>({});
  const [existingImages, setExistingImages] = useState<PendingImage[]>(initialExistingImages);
  const [uploadedImages, setUploadedImages] = useState<PendingImage[]>([]);
  const [coverImageKey, setCoverImageKey] = useState<string>(initialCoverImageKey);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isArchiving, startArchiveTransition] = useTransition();
  const [slugUserEdited, setSlugUserEdited] = useState(!!values.slug);
  const [seoOpen, setSeoOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadedImagesRef = useRef(uploadedImages);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    uploadedImagesRef.current = uploadedImages;
  }, [uploadedImages]);

  useEffect(() => {
    return () => {
      for (const image of uploadedImagesRef.current) {
        URL.revokeObjectURL(image.previewUrl);
      }
    };
  }, []);

  const allImages = useMemo(
    () => [...existingImages, ...uploadedImages],
    [existingImages, uploadedImages],
  );
  const completedUploadedImages = useMemo(
    () => uploadedImages.filter((img) => img.status === "ready" && img.uploadedUrl.length > 0),
    [uploadedImages],
  );
  const hasUploadingImages = uploadedImages.some((img) => img.status === "uploading");
  const hasImageUploadErrors = uploadedImages.some((img) => img.status === "error");
  const hasPendingImageResolution = hasUploadingImages || hasImageUploadErrors;
  const uploadErrors = uploadedImages
    .filter((img) => img.status === "error" && img.errorMessage)
    .map((img) => img.errorMessage as string);
  const readyImageCount = allImages.filter((image) => image.status === "ready").length;
  const priceValue = Number(formValues.price);
  const stockValue = Number(formValues.stockQuantity);
  const compareAtPriceValue = Number(formValues.compareAtPrice);
  const hasValidPrice = Number.isInteger(priceValue) && priceValue > 0;
  const hasValidCompareAtPrice =
    formValues.compareAtPrice.trim().length === 0 ||
    (Number.isInteger(compareAtPriceValue) && compareAtPriceValue > priceValue);
  const hasValidSaleLogic = !formValues.isOnSale || (hasValidCompareAtPrice && formValues.compareAtPrice.trim().length > 0);
  const hasValidStock = Number.isInteger(stockValue) && stockValue >= 0;
  const readinessItems = [
    { key: "identity", label: "Alapadatok", ok: Boolean(formValues.name.trim() && formValues.slug.trim()), message: "Adj meg nevet és slugot." },
    { key: "pricing", label: "Árazás", ok: hasValidPrice && hasValidCompareAtPrice && hasValidSaleLogic, message: "Ellenőrizd az árat és az akciós árat." },
    { key: "media", label: "Média", ok: readyImageCount > 0, message: "Tölts fel legalább egy képet." },
    {
      key: "content",
      label: "Bolti tartalom",
      ok: Boolean(
        formValues.shortDescription.trim() &&
          formValues.description.trim() &&
          formValues.badge.trim() &&
          formValues.collectionLabel.trim(),
      ),
      message: "Adj meg leírást, badge-et és kollekciónevet.",
    },
    { key: "stock", label: "Készlet", ok: hasValidStock, message: "Ellenőrizd a készletet." },
  ];
  const readinessBlockers = readinessItems.filter((item) => !item.ok);
  const isReadinessReady = readinessBlockers.length === 0;
  const isStorefrontVisible = formValues.status === "ACTIVE" && isReadinessReady;
  const isPurchasable = isStorefrontVisible && stockValue > 0;
  const stockState =
    !hasValidStock
      ? "Hibás"
      : stockValue <= 0
        ? "Elfogyott"
        : stockValue <= 3
          ? "Korlátozott"
          : "Raktáron";
  const stockTone = !hasValidStock ? "danger" : stockValue <= 0 ? "warn" : stockValue <= 3 ? "warn" : "good";
  const lifecycleTone = formValues.status === "ACTIVE" ? "good" : formValues.status === "DRAFT" ? "warn" : "danger";
  const slugChanged = values.id && values.slug && formValues.slug.trim() !== values.slug;
  const canonicalUrl = `/product/${formValues.slug.trim() || "slug"}`;
  const isPersistedArchived = values.status === "ARCHIVED";
  const primarySaveLabel =
    hasUploadingImages
      ? "Képek feltöltése..."
      : isSubmitting
        ? "Mentés..."
        : formValues.status === "ACTIVE"
          ? "Aktív termék mentése"
          : formValues.status === "ARCHIVED"
            ? "Archivált termék mentése"
            : "Vázlat mentése";

  const effectiveCoverImageKey = useMemo(() => {
    if (allImages.some((img) => img.id === coverImageKey && img.status === "ready")) {
      return coverImageKey;
    }
    return allImages.find((img) => img.status === "ready")?.id ?? "";
  }, [allImages, coverImageKey]);

  const discountPercent = useMemo(() => {
    const price = Number(formValues.price);
    const compare = Number(formValues.compareAtPrice);
    if (price > 0 && compare > price) {
      return Math.round((1 - price / compare) * 100);
    }
    return null;
  }, [formValues.price, formValues.compareAtPrice]);

  const handleFieldChange = <K extends FormFieldName>(
    fieldName: K,
    nextValue: ProductFormState[K],
  ) => {
    setFormValues((cur) => ({ ...cur, [fieldName]: nextValue }));
    setErrors((cur) => {
      if (!cur[fieldName]) return cur;
      const next = { ...cur };
      delete next[fieldName];
      return next;
    });
  };

  const handleNameChange = (name: string) => {
    handleFieldChange("name", name);
    if (!slugUserEdited) {
      handleFieldChange("slug", generateSlug(name));
    }
  };

  const handleOptionCreated = (
    type: ProductOptionGroup["type"],
    option: ProductOptionValue,
  ) => {
    setDynamicOptions((cur) => {
      const fn = optionGroups.find((g) => g.type === type)?.fieldName;
      if (!fn) return cur;
      const key = optionListKeyByField[fn];
      if (cur[key].some((item) => item.id === option.id)) return cur;
      return { ...cur, [key]: [...cur[key], option] };
    });
    const fn = optionGroups.find((g) => g.type === type)?.fieldName;
    if (fn) handleFieldChange(fn, option.id);
  };

  const handleOptionDeleted = (
    fieldName: ProductOptionGroup["fieldName"],
    option: ProductOptionValue,
  ) => {
    const key = optionListKeyByField[fieldName];
    setDynamicOptions((cur) => ({ ...cur, [key]: cur[key].filter((item) => item.id !== option.id) }));
  };

  const handleOptionRestored = (
    fieldName: ProductOptionGroup["fieldName"],
    option: ProductOptionValue,
  ) => {
    const key = optionListKeyByField[fieldName];
    setDynamicOptions((cur) => {
      if (cur[key].some((item) => item.id === option.id)) return cur;
      return {
        ...cur,
        [key]: [...cur[key], option].sort((a, b) => a.sortOrder - b.sortOrder),
      };
    });
  };

  async function processFiles(files: File[]) {
    if (files.length === 0) return;
    setSubmitError(null);

    const acceptedFiles = files.filter(isUploadAcceptedImageFile);
    const rejectedFiles = files.filter((file) => !isUploadAcceptedImageFile(file));

    if (rejectedFiles.length > 0) {
      setSubmitError(getUnsafeProductImageMessage(rejectedFiles[0]?.name));
    }

    if (acceptedFiles.length === 0) return;

    const nextImages = acceptedFiles.map((file, i) => ({
      id: `upload:${Date.now()}-${i}`,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      kind: "upload" as const,
      uploadedUrl: "",
      status: "uploading" as const,
    }));

    setUploadedImages((cur) => [...cur, ...nextImages]);

    await Promise.all(
      nextImages.map(async (img, i) => {
        try {
          const blob = await uploadProductImage(acceptedFiles[i]);
          setUploadedImages((cur) =>
            cur.map((ci) =>
              ci.id === img.id ? { ...ci, uploadedUrl: blob.url, status: "ready" } : ci,
            ),
          );
        } catch (err) {
          setUploadedImages((cur) =>
            cur.map((ci) =>
              ci.id === img.id
                ? {
                    ...ci,
                    status: "error",
                    errorMessage:
                      err instanceof Error ? err.message : "A kép feltöltése nem sikerült.",
                  }
                : ci,
            ),
          );
        }
      }),
    );
  }

  async function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    await processFiles(files);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/") || isUploadAcceptedImageFile(f),
    );
    void processFiles(files);
  }

  function removeImage(image: PendingImage) {
    setSubmitError(null);
    if (image.kind === "existing") {
      setExistingImages((cur) => cur.filter((ei) => ei.id !== image.id));
      return;
    }
    URL.revokeObjectURL(image.previewUrl);
    setUploadedImages((cur) => cur.filter((ui) => ui.id !== image.id));
  }

  function buildSubmissionFormData() {
    const formData = new FormData();
    const retainedIds = existingImages.map((img) => img.id);
    const uploadPayload: UploadedImagePayload[] = completedUploadedImages.map((img) => ({
      key: img.id,
      url: img.uploadedUrl,
    }));

    if (values.id) formData.append("productId", values.id);
    formData.append("name", formValues.name);
    formData.append("slug", formValues.slug);
    formData.append("status", formValues.status);
    formData.append("badge", formValues.badge);
    formData.append("collectionLabel", formValues.collectionLabel);
    formData.append("price", formValues.price);
    formData.append("stockQuantity", formValues.stockQuantity);
    formData.append("compareAtPrice", formValues.compareAtPrice);
    formData.append("shortDescription", formValues.shortDescription);
    formData.append("description", formValues.description);
    formData.append("category", formValues.category);
    formData.append("stoneType", formValues.stoneType);
    formData.append("color", formValues.color);
    formData.append("style", formValues.style);
    formData.append("occasion", formValues.occasion);
    formData.append("availability", formValues.availability);
    formData.append("tone", formValues.tone);
    formData.append("homepagePlacement", formValues.homepagePlacement);
    if (formValues.isNew) formData.append("isNew", "on");
    if (formValues.isGiftable) formData.append("isGiftable", "on");
    if (formValues.isOnSale) formData.append("isOnSale", "on");
    formData.append("specialtyKey", formValues.specialtyKey);
    for (const specialtyId of formValues.specialtyIds) {
      formData.append("specialtyIds", specialtyId);
    }
    if (retainedIds.length > 0) formData.append("retainedImageIdsCsv", retainedIds.join(","));
    if (uploadPayload.length > 0) formData.append("uploadedImagesJson", JSON.stringify(uploadPayload));
    formData.append("coverImageKey", effectiveCoverImageKey);
    return formData;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateFormState(formValues, dynamicOptions);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitError("Javítsd a hibás mezőket mentés előtt.");
      return;
    }

    if (formValues.status === "ACTIVE" && allImages.filter((image) => image.status === "ready").length === 0) {
      setSubmitError("Aktív termékhez legalább egy kép kell.");
      return;
    }

    if (hasPendingImageResolution) {
      setSubmitError(
        hasUploadingImages
          ? "A mentés csak akkor folytatható, ha minden kép feltöltése befejeződött."
          : "A mentés előtt rendezd a hibás képfeltöltéseket.",
      );
      return;
    }

    setSubmitError(null);

    const formData = buildSubmissionFormData();
    const inspection = inspectSubmissionFormData(formData);
    const oversizedFields = inspection.fields.filter((f) => f.bytes >= 50 * 1024);

    console.groupCollapsed(
      `[AdminProductForm] Server Action payload ${formatBytes(inspection.totalBytes)}`,
    );
    console.table(
      inspection.fields.map((f) => ({
        field: f.field,
        count: f.count,
        size: formatBytes(f.bytes),
        file: f.containsFile,
        blob: f.containsBlob,
        dataImage: f.containsDataImage,
        preview: f.preview,
      })),
    );
    if (oversizedFields.length > 0) {
      console.warn(
        "[AdminProductForm] Oversized fields",
        oversizedFields.map((f) => ({ field: f.field, size: formatBytes(f.bytes) })),
      );
    }
    console.groupEnd();

    if (inspection.hasBinaryEntry || inspection.hasInlineDataImage || inspection.hasBase64DataUri) {
      setSubmitError(
        "A beküldés inline képadatot vagy bináris payloadot tartalmaz. Ellenőrizd a konzollogokat.",
      );
      return;
    }

    startSubmitTransition(async () => {
      try {
        await action(formData);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "A termék mentése nem sikerült.");
      }
    });
  }

  function handleArchiveProduct() {
    if (!values.id || isArchiving) {
      return;
    }

    const formData = new FormData();
    formData.append("productId", values.id);
    formData.append("nextArchived", String(!isPersistedArchived));
    if (!isPersistedArchived) {
      formData.append("archiveReason", "DISCONTINUED");
    }

    startArchiveTransition(async () => {
      try {
        await toggleProductArchiveAction(formData);
        window.location.assign(isPersistedArchived ? "/admin/products" : "/admin/products/archive");
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Az állapotművelet nem sikerült.");
      }
    });
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 border border-[var(--admin-line-100)] bg-white px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[var(--admin-blue-700)]" />
            <span className={eyebrowCls}>✦ Termékkezelés</span>
          </div>
          <h1 className="text-[1.875rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--admin-ink-900)] sm:text-[2.2rem]">
            {values.id ? "Termék szerkesztése" : "Új termék feltöltése"}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:pt-2">
          <button
            type="submit"
            disabled={hasUploadingImages || isSubmitting}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#295da8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#24579f] disabled:opacity-60 sm:w-auto"
            style={{ background: ctaGradient }}
          >
            <Save className="h-4 w-4" />
            {primarySaveLabel}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div className="space-y-5">
          <CardShell
            eyebrow="Alapadatok"
            title="Termék azonosítók"
            subtitle="A név és a slug adja a termék URL-jét. Slug váltáskor a régi link átirányít az újra."
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
              <FieldWrap label="Terméknév" error={errors.name} required>
                <input
                  name="name"
                  value={formValues.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Pl. Aurora Ribbon nyaklánc"
                  className={inputCls}
                />
              </FieldWrap>

              <FieldWrap
                label="Slug"
                error={errors.slug}
                required
                helper={slugChanged ? "A régi link átirányít az új URL-re." : "A termék publikus URL-je."}
              >
                <input
                  name="slug"
                  value={formValues.slug}
                  onChange={(e) => {
                    setSlugUserEdited(true);
                    handleFieldChange("slug", e.target.value);
                  }}
                  placeholder="aurora-ribbon-necklace"
                  className={`${inputCls} font-mono text-xs`}
                />
              </FieldWrap>
            </div>

            <div className="mt-4 border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] px-3 py-2 text-xs text-[var(--admin-ink-600)]">
              Canonical URL: <span className="font-mono text-[var(--admin-ink-900)]">{canonicalUrl}</span>
              {slugChanged ? (
                <span className="ml-2 text-[#765b18]">A régi URL átirányít.</span>
              ) : null}
            </div>
          </CardShell>

          <div className="grid gap-5 lg:grid-cols-2">
            <CardShell
              eyebrow="Árazás"
              title="Ár és akció"
              subtitle="Aktív terméknél pozitív ár kell. Az eredeti ár legyen magasabb az aktuálisnál."
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                <FieldWrap label="Aktuális ár" error={errors.price} required={formValues.status === "ACTIVE"}>
                  <div className="relative">
                    <input
                      name="price"
                      type="number"
                      min={0}
                      value={formValues.price}
                      onChange={(e) => handleFieldChange("price", e.target.value)}
                      placeholder="0"
                      className={`${inputCls} pr-12 font-semibold`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--admin-ink-500)]">
                      Ft
                    </span>
                  </div>
                </FieldWrap>

                <FieldWrap
                  label="Eredeti ár"
                  error={errors.compareAtPrice}
                  helper={discountPercent !== null ? `Számított kedvezmény: ${discountPercent}%` : "Akciós terméknél kötelező."}
                >
                  <div className="relative">
                    <input
                      name="compareAtPrice"
                      type="number"
                      min={0}
                      value={formValues.compareAtPrice}
                      onChange={(e) => handleFieldChange("compareAtPrice", e.target.value)}
                      placeholder="Opcionális"
                      className={`${inputCls} pr-12`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--admin-ink-500)]">
                      Ft
                    </span>
                  </div>
                </FieldWrap>
              </div>

              <div className="mt-4 flex items-center justify-between border border-[var(--admin-line-100)] bg-white px-3 py-2">
                <ToggleSwitch
                  checked={formValues.isOnSale}
                  onChange={(v) => handleFieldChange("isOnSale", v)}
                  label="Akciós termék"
                />
                <StatusPill tone={hasValidPrice && hasValidCompareAtPrice && hasValidSaleLogic ? "good" : "danger"}>
                  {hasValidPrice && hasValidCompareAtPrice && hasValidSaleLogic ? "Ár rendben" : "Ár hiba"}
                </StatusPill>
              </div>
            </CardShell>

            <CardShell
              eyebrow="Készlet"
              title="Készlet és elérhetőség"
              subtitle="Nulla készlettel a termék látható marad, de nem vásárolható."
            >
              <FieldWrap label="Raktárkészlet" error={errors.stockQuantity} required>
                <input
                  name="stockQuantity"
                  type="number"
                  min={0}
                  step={1}
                  value={formValues.stockQuantity}
                  onChange={(e) => handleFieldChange("stockQuantity", e.target.value)}
                  className={inputCls}
                />
              </FieldWrap>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="border border-[var(--admin-line-100)] bg-white px-3 py-3">
                  <p className={eyebrowCls}>Készletállapot</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--admin-ink-900)]">{stockState}</p>
                </div>
                <div className="border border-[var(--admin-line-100)] bg-white px-3 py-3">
                  <p className={eyebrowCls}>Elérhető</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--admin-ink-900)]">
                    {hasValidStock ? `${Math.max(0, stockValue)} db` : "Hibás"}
                  </p>
                </div>
              </div>
            </CardShell>
          </div>

          <CardShell
            eyebrow="Média"
            title="Termékképek"
            subtitle="Aktív termékhez legalább egy kép kell. A csillag jelöli a borítót."
          >
            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[170px] cursor-pointer flex-col items-center justify-center gap-3 border px-4 text-center transition-all duration-200"
                style={{
                  borderStyle: "dashed",
                  borderColor: isDragOver ? "#2a63b5" : readyImageCount > 0 ? "var(--admin-line-200)" : "#e8c7d2",
                  background: isDragOver ? "rgba(238,243,251,0.8)" : "rgba(255,255,255,0.72)",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={productImageInputAccept}
                  multiple
                  className="hidden"
                  onChange={handleImageSelection}
                />
                <ImagePlus className="h-8 w-8 text-[var(--admin-blue-700)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--admin-ink-900)]">
                    {isDragOver ? "Engedd el a képeket" : "Képek feltöltése"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--admin-ink-500)]">
                    {productImageFormatHelpText}
                  </p>
                </div>
              </div>

              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <StatusPill tone={readyImageCount > 0 ? "good" : "danger"}>
                    {readyImageCount > 0 ? `${readyImageCount} kép` : "Nincs kép"}
                  </StatusPill>
                  {hasUploadingImages ? <StatusPill tone="warn">Feltöltés folyamatban</StatusPill> : null}
                  {hasImageUploadErrors ? <StatusPill tone="danger">Képfeltöltési hiba</StatusPill> : null}
                </div>

                {hasUploadingImages ? (
                  <div className="mb-3 border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] px-4 py-3 text-sm text-[var(--admin-ink-700)]">
                    Képfeltöltés folyamatban...
                  </div>
                ) : null}

                {uploadErrors.length > 0 ? (
                  <div className="mb-3 border border-[#e3c7cf] bg-[#fbf5f6] px-4 py-3 text-sm text-[#ad4455]">
                    {uploadErrors[0]}
                  </div>
                ) : null}

                {allImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {allImages.map((image) => {
                      const isCover = effectiveCoverImageKey === image.id;
                      return (
                        <div
                          key={image.id}
                          className="group relative overflow-hidden border bg-white transition-all"
                          style={{
                            borderColor: isCover ? "#2a63b5" : "var(--admin-line-200)",
                            boxShadow: isCover ? "0 0 0 1px rgba(42,99,181,0.2)" : undefined,
                          }}
                        >
                          <div className="aspect-square">
                            <img
                              src={image.previewUrl}
                              alt={image.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCoverImageKey(image.id);
                              setSubmitError(null);
                            }}
                            disabled={image.status !== "ready"}
                            className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-sm border transition"
                            style={{
                              background: isCover ? ctaGradient : "rgba(255,255,255,0.95)",
                              borderColor: isCover ? "#295da8" : "var(--admin-line-200)",
                            }}
                            title={isCover ? "Borítókép" : "Beállítás borítóképnek"}
                          >
                            <Star
                              className="h-3 w-3"
                              style={{ color: isCover ? "white" : "#2a63b5" }}
                              fill={isCover ? "white" : "none"}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(image)}
                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-sm border border-[var(--admin-line-200)] bg-white/95 text-[var(--admin-ink-600)] transition hover:bg-white"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          {image.status === "uploading" ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                              <p className="text-xs text-[#7a6070]">Feltöltés...</p>
                            </div>
                          ) : null}
                          {image.status === "error" ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#fff4f7]/80 p-2">
                              <p className="text-center text-[10px] text-[#9b476f]">Feltöltési hiba</p>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex min-h-[120px] items-center justify-center border border-[#e8c7d2] bg-[#fff8fb] px-4 text-center text-sm text-[#9b476f]">
                    Aktív termékhez tölts fel legalább egy képet.
                  </div>
                )}
              </div>
            </div>
          </CardShell>

          <CardShell
            eyebrow="Storefront megjelenés"
            title="Kártya, címkék és leírások"
            subtitle="Ezek jelennek meg a termékkártyán és a termékoldalon."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldWrap label="Termék badge" error={errors.badge} required={formValues.status === "ACTIVE"}>
                <input
                  name="badge"
                  value={formValues.badge}
                  onChange={(e) => handleFieldChange("badge", e.target.value)}
                  placeholder="Pl. Újdonság"
                  className={inputCls}
                />
              </FieldWrap>

              <FieldWrap label="Kollekció label" error={errors.collectionLabel} required={formValues.status === "ACTIVE"}>
                <input
                  name="collectionLabel"
                  value={formValues.collectionLabel}
                  onChange={(e) => handleFieldChange("collectionLabel", e.target.value)}
                  placeholder="Pl. Beach"
                  className={inputCls}
                />
              </FieldWrap>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <FieldWrap label="Rövid leírás" error={errors.shortDescription} required={formValues.status === "ACTIVE"}>
                <textarea
                  name="shortDescription"
                  value={formValues.shortDescription}
                  onChange={(e) => handleFieldChange("shortDescription", e.target.value)}
                  placeholder="Rövid leírás a kártyákhoz..."
                  rows={4}
                  className={textareaCls}
                />
              </FieldWrap>

              <FieldWrap label="Teljes leírás" error={errors.description} required={formValues.status === "ACTIVE"}>
                <textarea
                  name="description"
                  value={formValues.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  placeholder="Anyagok, méret, gondozás, viselési ötletek..."
                  rows={4}
                  className={textareaCls}
                />
              </FieldWrap>
            </div>
          </CardShell>

          <CardShell eyebrow="SEO / URL" title="URL és előnézet">
            <button
              type="button"
              onClick={() => setSeoOpen((o) => !o)}
              className="flex w-full items-center justify-between border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] px-4 py-3 text-left"
            >
              <div>
                <p className="text-sm font-medium text-[var(--admin-ink-900)]">{formValues.name || "Terméknév"} - Chicks Jewelry</p>
                <p className="mt-1 font-mono text-xs text-[var(--admin-blue-700)]">{canonicalUrl}</p>
              </div>
              <ChevronDown
                className="h-5 w-5 shrink-0 text-[var(--admin-ink-500)] transition-transform duration-200"
                style={{ transform: seoOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            {seoOpen ? (
              <div className="mt-3 border border-[var(--admin-line-100)] bg-white p-4">
                <p className={eyebrowCls}>Előnézet</p>
                <p className="mt-2 text-sm font-medium text-[#1a0dab]">
                  {formValues.name || "Terméknév"} - Chicks Jewelry
                </p>
                <p className="mt-1 font-mono text-xs text-[#006621]">bubus.hu{canonicalUrl}</p>
                <p className="mt-2 text-xs leading-5 text-[#545454]">
                  {formValues.shortDescription || "A rövid leírás itt jelenik meg a keresési előnézetben."}
                </p>
                <p className="mt-3 text-xs leading-5 text-[var(--admin-ink-500)]">
                  Slug váltáskor a régi URL átirányít az új terméklinkre.
                </p>
              </div>
            ) : null}
          </CardShell>
        </div>

        <div className="space-y-4 xl:sticky xl:top-28">
          <CardShell eyebrow="Állapot" title="Publikálási összefoglaló">
            <div className="space-y-1">
              <SummaryRow label="Státusz" value={statusLabels[formValues.status]} tone={lifecycleTone} />
              <SummaryRow label="Kitöltés" value={isReadinessReady ? "Kész" : "Hiányos"} tone={isReadinessReady ? "good" : "danger"} />
              <SummaryRow label="Bolt" value={isStorefrontVisible ? "Látható" : "Nem látható"} tone={isStorefrontVisible ? "good" : "warn"} />
              <SummaryRow label="Vásárolhatóság" value={isPurchasable ? "Megvásárolható" : "Nem megvásárolható"} tone={isPurchasable ? "good" : "warn"} />
              <SummaryRow label="Készlet" value={stockState} tone={stockTone} />
            </div>

            {readinessBlockers.length > 0 ? (
              <div className="mt-4 border border-[#e8c7d2] bg-[#fff8fb] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b476f]">
                  Még hiányzik
                </p>
                <ul className="mt-2 space-y-1.5 text-xs leading-5 text-[#7a3d58]">
                  {readinessBlockers.map((item) => (
                    <li key={item.key}>- {item.message}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-4 border border-[#bdd7c8] bg-[#f2faf5] p-3 text-xs leading-5 text-[#24533a]">
                A termék aktív státusszal publikálható. Készlet nélkül látható marad, de nem vásárolható.
              </div>
            )}

            {submitError ? (
              <p className="mt-4 border border-[#e3c7cf] bg-[#fbf5f6] px-3 py-2 text-sm text-[#ad4455]">
                {submitError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={hasUploadingImages || isSubmitting}
              className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#295da8] py-3 text-sm font-semibold text-white transition hover:bg-[#24579f] disabled:opacity-60"
              style={{ background: ctaGradient }}
            >
              <Save className="h-4 w-4" />
              {primarySaveLabel}
            </button>
          </CardShell>

          <CardShell eyebrow="Állapot" title="Publikálás">
            <FieldWrap label="Termékstátusz" error={errors.status}>
              <select
                name="status"
                value={formValues.status}
                onChange={(e) =>
                  handleFieldChange(
                    "status",
                    e.target.value as ProductFormState["status"],
                  )
                }
                className={inputCls}
              >
                {dynamicOptions.statuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </FieldWrap>

            <FieldWrap label="Kezdőlapi kihelyezés" error={errors.homepagePlacement} helper="Csak kész, aktív terméknél látszik.">
              <select
                name="homepagePlacement"
                value={formValues.homepagePlacement}
                onChange={(e) =>
                  handleFieldChange(
                    "homepagePlacement",
                    e.target.value as ProductFormState["homepagePlacement"],
                  )
                }
                className={inputCls}
              >
                <option value="">Válassz kihelyezést...</option>
                {dynamicOptions.homepagePlacements.map((placement) => (
                  <option key={placement} value={placement}>
                    {homepagePlacementLabels[placement]}
                  </option>
                ))}
              </select>
            </FieldWrap>

            <div className="mt-4 grid gap-3 border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] p-4">
              <ToggleSwitch
                checked={formValues.isNew}
                onChange={(v) => handleFieldChange("isNew", v)}
                label="Új termék"
              />
              <ToggleSwitch
                checked={formValues.isGiftable}
                onChange={(v) => handleFieldChange("isGiftable", v)}
                label="Ajándékozható"
              />
            </div>
          </CardShell>

          <CardShell eyebrow="Besorolás" title="Kategóriák és attribútumok">
            <div className="space-y-5">
              <PillSelectField
                fieldName="category"
                label="Kategória"
                selectedValue={formValues.category}
                options={dynamicOptions.categories}
                optionType="CATEGORY"
                onChange={(v) => handleFieldChange("category", v)}
                onOptionDeleted={handleOptionDeleted}
                onOptionRestored={handleOptionRestored}
                onOptionCreated={handleOptionCreated}
                error={errors.category}
              />
              <PillSelectField
                fieldName="stoneType"
                label="Kőtípus"
                selectedValue={formValues.stoneType}
                options={dynamicOptions.stoneTypes}
                optionType="STONE_TYPE"
                onChange={(v) => handleFieldChange("stoneType", v)}
                onOptionDeleted={handleOptionDeleted}
                onOptionRestored={handleOptionRestored}
                onOptionCreated={handleOptionCreated}
                error={errors.stoneType}
              />
              <PillSelectField
                fieldName="color"
                label="Szín / Fém"
                selectedValue={formValues.color}
                options={dynamicOptions.colors}
                optionType="COLOR"
                onChange={(v) => handleFieldChange("color", v)}
                onOptionDeleted={handleOptionDeleted}
                onOptionRestored={handleOptionRestored}
                onOptionCreated={handleOptionCreated}
                error={errors.color}
              />
              <PillSelectField
                fieldName="style"
                label="Stílus"
                selectedValue={formValues.style}
                options={dynamicOptions.styles}
                optionType="STYLE"
                onChange={(v) => handleFieldChange("style", v)}
                onOptionDeleted={handleOptionDeleted}
                onOptionRestored={handleOptionRestored}
                onOptionCreated={handleOptionCreated}
                error={errors.style}
              />
              <PillSelectField
                fieldName="occasion"
                label="Alkalom"
                selectedValue={formValues.occasion}
                options={dynamicOptions.occasions}
                optionType="OCCASION"
                onChange={(v) => handleFieldChange("occasion", v)}
                onOptionDeleted={handleOptionDeleted}
                onOptionRestored={handleOptionRestored}
                onOptionCreated={handleOptionCreated}
                error={errors.occasion}
              />
              <PillSelectField
                fieldName="availability"
                label="Elérhetőség"
                selectedValue={formValues.availability}
                options={dynamicOptions.availability}
                optionType="AVAILABILITY"
                onChange={(v) => handleFieldChange("availability", v)}
                onOptionDeleted={handleOptionDeleted}
                onOptionRestored={handleOptionRestored}
                onOptionCreated={handleOptionCreated}
                error={errors.availability}
              />
              <PillSelectField
                fieldName="tone"
                label="Vizuális tónus"
                selectedValue={formValues.tone}
                options={dynamicOptions.tones}
                optionType="VISUAL_TONE"
                onChange={(v) => handleFieldChange("tone", v)}
                onOptionDeleted={handleOptionDeleted}
                onOptionRestored={handleOptionRestored}
                onOptionCreated={handleOptionCreated}
                error={errors.tone}
              />
            </div>
          </CardShell>

          <CardShell eyebrow="Különlegességek" title="Kollekció kapcsolatok">
            {dynamicOptions.specialties.length > 0 ? (
              <div className="space-y-2">
                {dynamicOptions.specialties.map((specialty) => {
                  const checked = formValues.specialtyIds.includes(specialty.id);

                  return (
                    <label
                      key={specialty.id}
                      className="flex items-start gap-3 border border-[var(--admin-line-100)] bg-white px-3 py-2 text-sm text-[var(--admin-ink-700)]"
                    >
                      <input
                        type="checkbox"
                        name="specialtyIds"
                        checked={checked}
                        onChange={(event) => {
                          handleFieldChange(
                            "specialtyIds",
                            event.target.checked
                              ? [...formValues.specialtyIds, specialty.id]
                              : formValues.specialtyIds.filter((id) => id !== specialty.id),
                          );
                        }}
                        className="mt-0.5 h-4 w-4"
                      />
                      <span>
                        <span className="font-medium">{specialty.name}</span>
                        <span className="ml-2 font-mono text-[11px] text-[var(--admin-ink-500)]">
                          /kulonlegessegek/{specialty.slug}
                        </span>
                        {!specialty.isVisible ? (
                          <span className="ml-2 text-[11px] text-[var(--admin-ink-500)]">rejtett</span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] px-3 py-2 text-xs text-[var(--admin-ink-600)]">
                Még nincs különlegesség csoport.
              </p>
            )}
          </CardShell>

          {values.id ? (
            <CardShell eyebrow="Veszélyzóna" title={isPersistedArchived ? "Visszaállítás" : "Archiválás"}>
              <p className="text-xs leading-5 text-[var(--admin-ink-600)]">
                {isPersistedArchived
                  ? "Visszaállítás után a termék draft lesz, így publikálás előtt újra ellenőrizhető."
                  : "Archiválás után a termék nem látszik és nem vásárolható. Visszaállításkor draftként tér vissza."}
              </p>
              <button
                type="button"
                disabled={isArchiving}
                onClick={handleArchiveProduct}
                className={`mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition disabled:opacity-60 ${
                  isPersistedArchived
                    ? "border-[var(--admin-line-200)] bg-white text-[var(--admin-ink-800)] hover:bg-[var(--admin-surface-050)]"
                    : "border-[#d7a9b8] bg-[#fff5f8] text-[#9b476f] hover:bg-[#ffedf3]"
                }`}
              >
                <Archive className="h-4 w-4" />
                {isArchiving
                  ? isPersistedArchived
                    ? "Visszaállítás..."
                    : "Archiválás..."
                  : isPersistedArchived
                    ? "Visszaállítás draftként"
                    : "Termék archiválása"}
              </button>
            </CardShell>
          ) : null}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-[var(--admin-line-100)] bg-[rgba(247,249,252,0.96)] px-4 py-3 shadow-[0_-12px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        <button
          type="submit"
          disabled={hasUploadingImages || isSubmitting}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#295da8] py-3 text-sm font-semibold text-white transition hover:bg-[#24579f] disabled:opacity-60"
          style={{ background: ctaGradient }}
        >
          <Save className="h-4 w-4" />
          {primarySaveLabel}
        </button>
      </div>
    </form>
  );
}
