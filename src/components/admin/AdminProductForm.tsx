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
import { ChevronDown, ImagePlus, Plus, Save, Sparkles, Star, Trash2, X } from "lucide-react";

import {
  createProductOptionAction,
  deleteProductOptionAction,
} from "@/app/admin/products/actions";
import { createProductImageUploadPathname } from "@/lib/blob-upload";
import { homepagePlacementLabels } from "@/lib/catalog";
import {
  type AdminProductFormOptions,
  type AdminProductFormValues,
  type ProductOptionGroup,
  type ProductOptionValue,
} from "@/lib/products";

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
};

type FormFieldName = keyof ProductFormState;
type FormErrorState = Partial<Record<FormFieldName, string>>;
type OptionListKey = Exclude<keyof AdminProductFormOptions, "homepagePlacements">;

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

function buildInitialFormState(values: AdminProductFormValues): ProductFormState {
  return {
    name: values.name,
    slug: values.slug,
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
    const value = formValues[fieldName];
    if (typeof value === "string" && value.trim().length === 0) {
      errors[fieldName] = message;
    }
  }

  const price = Number(formValues.price);
  if (!Number.isInteger(price) || price < 0) {
    errors.price = "Az árnak érvényes, nem negatív egész Ft összegnek kell lennie.";
  }

  const stockQuantity = Number(formValues.stockQuantity);
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    errors.stockQuantity = "A készlet legyen érvényes, nem negatív egész szám.";
  }

  if (formValues.compareAtPrice.trim().length > 0) {
    const compareAtPrice = Number(formValues.compareAtPrice);
    if (!Number.isInteger(compareAtPrice) || compareAtPrice < 0) {
      errors.compareAtPrice = "Az eredeti ár legyen üres vagy nem negatív egész Ft összeg.";
    }
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
  return upload(createProductImageUploadPathname(file.name), file, {
    access: "public",
    contentType: file.type || undefined,
    handleUploadUrl: "/api/admin/product-images/upload",
  });
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const inputCls =
  "h-12 w-full rounded-[14px] border-[1.5px] border-[#f0d4e0] bg-white/80 px-4 text-sm text-[#4d2741] outline-none transition-all placeholder:text-[#c9a8ba] focus:border-[#c45a85] focus:shadow-[0_0_0_3px_rgba(196,90,133,0.12)]";

const textareaCls =
  "w-full rounded-[14px] border-[1.5px] border-[#f0d4e0] bg-white/80 px-4 py-3 text-sm text-[#4d2741] outline-none transition-all resize-y placeholder:text-[#c9a8ba] focus:border-[#c45a85] focus:shadow-[0_0_0_3px_rgba(196,90,133,0.12)]";

const eyebrowCls = "text-[9px] uppercase tracking-[0.3em] text-[#c0517a] font-medium";

const ctaGradient = "linear-gradient(135deg, #c45a85, #e07a70)";

// ─── Sub-components ───────────────────────────────────────────────────────────

function CardShell({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow?: string;
  title: string;
}) {
  return (
    <section className="rounded-[2.5rem] border border-white/80 bg-white/60 p-6 shadow-[0_16px_40px_rgba(196,90,133,0.07)] backdrop-blur-xl">
      <div className="mb-5">
        {eyebrow && <p className={`mb-1 ${eyebrowCls}`}>{eyebrow}</p>}
        <h2 className="font-[family:var(--font-display)] text-[1.1rem] font-semibold text-[#4d2741]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function FieldWrap({
  children,
  error,
  label,
}: {
  children: ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="block">
      <span className={`mb-2 block ${eyebrowCls}`}>{label}</span>
      {children}
      {error && <p className="mt-1.5 text-xs text-[#9b476f]">{error}</p>}
    </label>
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
          className="h-5 w-10 rounded-full transition-all duration-200"
          style={{ background: checked ? ctaGradient : "#f0d4e0" }}
        />
        <div
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200"
          style={{ left: checked ? "22px" : "2px" }}
        />
      </div>
      <span className="text-sm text-[#5a374e]">{label}</span>
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
      className="rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:scale-[1.03]"
      style={
        active
          ? { background: ctaGradient, color: "white", border: "1.5px solid transparent" }
          : { background: "rgba(255,255,255,0.7)", color: "#7a5a6c", border: "1.5px solid #f0d4e0" }
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
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#f0d4e0] bg-white/70 px-3 py-1.5 text-xs font-medium text-[#c0517a] transition hover:bg-white"
      >
        <Plus className="h-3 w-3" />
        Új hozzáadása
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-[1.2rem] border border-[#f0d8e5] bg-white/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-[#4d2741]">Új {label.toLowerCase()} hozzáadása</p>
        <button
          type="button"
          onClick={reset}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#f0d4e0] bg-white text-[#7b576a] transition hover:bg-[#fff8fb]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

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
          className="inline-flex h-9 items-center rounded-full px-4 text-xs font-medium text-white transition disabled:opacity-70"
          style={{ background: ctaGradient }}
        >
          {isPending ? "Mentés..." : "Létrehozás"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center rounded-full border border-[#f0d4e0] bg-white px-4 text-xs font-medium text-[#6b425a] transition hover:bg-[#fff8fb]"
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
          className="inline-flex items-center gap-1 rounded-full border border-[#f0d4e0] bg-white/70 px-2.5 py-1 text-[10px] font-medium text-[#c0517a] transition hover:bg-white"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3f2435]/20 p-4 backdrop-blur-[3px]"
          onClick={() => setIsManagerOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_24px_60px_rgba(120,52,88,0.18)] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className={eyebrowCls}>Opciókezelés</p>
                <h3 className="mt-1 font-[family:var(--font-display)] text-lg text-[#4d2741]">
                  {label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManagerOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#f0d4e0] bg-white text-[#7b576a] transition hover:bg-[#fff8fb]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-[1.2rem] border border-[#f0d4e0] bg-white/70 p-2">
              {options.map((option) => {
                const isSelected = option.id === selectedValue;
                const isPendingDelete = isDeletePending && pendingDeleteId === option.id;
                return (
                  <div
                    key={option.id}
                    className="flex items-center justify-between gap-3 rounded-[0.8rem] px-3 py-2 text-sm text-[#5a374e] transition hover:bg-[#fff8fb]"
                  >
                    <span className="truncate">
                      {option.name}
                      {isSelected ? " ✓" : ""}
                    </span>
                    <button
                      type="button"
                      disabled={isSelected || isPendingDelete}
                      onClick={() => handleDelete(option)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#f0d4e0] bg-white text-[#8a6178] transition hover:border-[#f0b3d1] hover:bg-[#fff8fb] disabled:cursor-not-allowed disabled:opacity-50"
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
  submitLabel,
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

    const nextImages = files.map((file, i) => ({
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
          const blob = await uploadProductImage(files[i]);
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
      f.type.startsWith("image/"),
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
      setSubmitError("Kérjük javítsd a hibás mezőket mentés előtt.");
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

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit}>
      <style>{`
        @keyframes blob-1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(30px,-50px) scale(1.05); }
          66%      { transform: translate(-20px,20px) scale(0.95); }
        }
        @keyframes blob-2 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(-40px,30px) scale(1.08); }
          66%      { transform: translate(25px,-35px) scale(0.92); }
        }
        @keyframes blob-3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(20px,40px) scale(1.06); }
        }
      `}</style>

      {/* ── Ambient blobs ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "12%",
            width: "500px",
            height: "500px",
            background: "#fbc7d8",
            borderRadius: "50%",
            filter: "blur(80px)",
            opacity: 0.45,
            animation: "blob-1 20s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "45%",
            right: "8%",
            width: "420px",
            height: "420px",
            background: "#fddcb0",
            borderRadius: "50%",
            filter: "blur(80px)",
            opacity: 0.4,
            animation: "blob-2 24s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "35%",
            width: "380px",
            height: "380px",
            background: "#d8c8f5",
            borderRadius: "50%",
            filter: "blur(80px)",
            opacity: 0.35,
            animation: "blob-3 17s ease-in-out infinite",
          }}
        />
      </div>

      {/* ── Page header ── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f0d4e0] bg-white/70 px-3.5 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#c45a85]" />
            <span className={eyebrowCls}>✦ Termékkezelés</span>
          </div>
          <h1 className="font-[family:var(--font-display)] text-[2rem] leading-tight tracking-[-0.03em] text-[#4d2741] sm:text-[2.5rem]">
            {values.id ? "Termék szerkesztése" : "Új termék feltöltése"}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:pt-2">
          <button
            type="submit"
            disabled={hasUploadingImages || isSubmitting}
            className="inline-flex items-center gap-2 rounded-[14px] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(196,90,133,0.25)] transition hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-60"
            style={{ background: ctaGradient }}
          >
            <Save className="h-4 w-4" />
            {hasUploadingImages
              ? "Képek feltöltése..."
              : isSubmitting
                ? "Mentés..."
                : submitLabel}
          </button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px] xl:items-start">

        {/* ════ LEFT COLUMN ════ */}
        <div className="space-y-6">

          {/* Alapadatok */}
          <CardShell eyebrow="Alapadatok" title="Termék információk">
            <div className="space-y-4">
              <FieldWrap label="Terméknév" error={errors.name}>
                <input
                  name="name"
                  value={formValues.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Pl. Aurora Ribbon nyaklánc"
                  className={inputCls}
                  style={{ fontSize: "17px", fontWeight: 500 }}
                />
              </FieldWrap>

              <FieldWrap label="Rövid leírás" error={errors.shortDescription}>
                <textarea
                  name="shortDescription"
                  value={formValues.shortDescription}
                  onChange={(e) => handleFieldChange("shortDescription", e.target.value)}
                  placeholder="Rövid, magával ragadó termékleírás a kártyákon..."
                  rows={3}
                  className={textareaCls}
                />
              </FieldWrap>

              <FieldWrap label="Slug (URL)" error={errors.slug}>
                <input
                  name="slug"
                  value={formValues.slug}
                  onChange={(e) => {
                    setSlugUserEdited(true);
                    handleFieldChange("slug", e.target.value);
                  }}
                  placeholder="aurora-ribbon-necklace"
                  className={`${inputCls} font-mono text-xs tracking-wide`}
                />
              </FieldWrap>

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldWrap label="Termék badge" error={errors.badge}>
                  <input
                    name="badge"
                    value={formValues.badge}
                    onChange={(e) => handleFieldChange("badge", e.target.value)}
                    placeholder="Pl. Újdonság"
                    className={inputCls}
                  />
                </FieldWrap>

                <FieldWrap label="Kollekció label" error={errors.collectionLabel}>
                  <input
                    name="collectionLabel"
                    value={formValues.collectionLabel}
                    onChange={(e) => handleFieldChange("collectionLabel", e.target.value)}
                    placeholder="Pl. Beach"
                    className={inputCls}
                  />
                </FieldWrap>
              </div>
            </div>
          </CardShell>

          {/* Médiatartalom */}
          <CardShell eyebrow="Média" title="Termékképek">
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] text-center transition-all duration-200"
                style={{
                  border: `2px dashed ${isDragOver ? "#c45a85" : "#f0d4e0"}`,
                  background: isDragOver
                    ? "rgba(253,240,245,0.7)"
                    : "rgba(255,255,255,0.5)",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelection}
                />
                <ImagePlus
                  className="h-9 w-9 transition-colors"
                  style={{ color: isDragOver ? "#c45a85" : "#e0a0bc" }}
                />
                <div>
                  <p className="text-sm font-medium text-[#5a374e]">
                    {isDragOver ? "Engedd el a képeket" : "Húzd ide a képeket"}
                  </p>
                  <p className="mt-0.5 text-xs text-[#a08090]">
                    PNG, JPG, WEBP — Vercel Blob tárhelyre töltődik
                  </p>
                </div>
              </div>

              {hasUploadingImages && (
                <div className="rounded-[1rem] border border-[#f2d7e6] bg-[#fff8fb] px-4 py-3 text-sm text-[#7a6070]">
                  Képfeltöltés folyamatban...
                </div>
              )}

              {uploadErrors.length > 0 && (
                <div className="rounded-[1rem] border border-[#f3ccd9] bg-[#fff4f7] px-4 py-3 text-sm text-[#9b476f]">
                  {uploadErrors[0]}
                </div>
              )}

              {allImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {allImages.map((image) => {
                    const isCover = effectiveCoverImageKey === image.id;
                    return (
                      <div
                        key={image.id}
                        className="group relative overflow-hidden rounded-[1.2rem] border bg-white transition-all"
                        style={{
                          borderColor: isCover ? "#c45a85" : "#f0d4e0",
                          boxShadow: isCover
                            ? "0 0 0 2px rgba(196,90,133,0.2)"
                            : undefined,
                        }}
                      >
                        <div className="aspect-square">
                          <img
                            src={image.previewUrl}
                            alt={image.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Cover star */}
                        <button
                          type="button"
                          onClick={() => {
                            setCoverImageKey(image.id);
                            setSubmitError(null);
                          }}
                          disabled={image.status !== "ready"}
                          className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition"
                          style={{
                            background: isCover ? ctaGradient : "rgba(255,255,255,0.9)",
                          }}
                          title={isCover ? "Borítókép" : "Beállítás borítóképnek"}
                        >
                          <Star
                            className="h-3 w-3"
                            style={{ color: isCover ? "white" : "#c0517a" }}
                            fill={isCover ? "white" : "none"}
                          />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => removeImage(image)}
                          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[#9b476f] shadow-sm transition hover:bg-white"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>

                        {image.status === "uploading" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                            <p className="text-xs text-[#7a6070]">Feltöltés...</p>
                          </div>
                        )}
                        {image.status === "error" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#fff4f7]/80 p-2">
                            <p className="text-center text-[10px] text-[#9b476f]">Feltöltési hiba</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardShell>

          {/* Árképzés */}
          <CardShell eyebrow="Árképzés" title="Ár és készlet">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldWrap label="Ár (HUF)" error={errors.price}>
                <div className="relative">
                  <input
                    name="price"
                    type="number"
                    min={0}
                    value={formValues.price}
                    onChange={(e) => handleFieldChange("price", e.target.value)}
                    placeholder="0"
                    className={`${inputCls} pr-14 text-lg font-semibold`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#c0517a]">
                    Ft
                  </span>
                </div>
              </FieldWrap>

              <FieldWrap label="Eredeti ár (HUF)" error={errors.compareAtPrice}>
                <div className="relative">
                  <input
                    name="compareAtPrice"
                    type="number"
                    min={0}
                    value={formValues.compareAtPrice}
                    onChange={(e) => handleFieldChange("compareAtPrice", e.target.value)}
                    placeholder="—"
                    className={`${inputCls} pr-14 text-[#a08090] line-through`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#c0517a]">
                    Ft
                  </span>
                  {discountPercent !== null && (
                    <span
                      className="absolute -top-3 right-3 rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
                      style={{ background: ctaGradient }}
                    >
                      -{discountPercent}%
                    </span>
                  )}
                </div>
              </FieldWrap>

              <FieldWrap label="Raktárkészlet (db)" error={errors.stockQuantity}>
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
            </div>
          </CardShell>

          {/* Teljes leírás */}
          <CardShell eyebrow="Tartalom" title="Teljes leírás">
            <FieldWrap label="Leírás" error={errors.description}>
              <textarea
                name="description"
                value={formValues.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Részletes termékleírás — anyagok, méret, gondozás..."
                rows={8}
                className={textareaCls}
                style={{ minHeight: "200px" }}
              />
            </FieldWrap>
          </CardShell>

          {/* SEO accordion */}
          <div className="rounded-[2rem] border border-white/80 bg-white/60 backdrop-blur-xl shadow-[0_16px_40px_rgba(196,90,133,0.07)] overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoOpen((o) => !o)}
              className="flex w-full items-center justify-between p-6 text-left"
            >
              <div>
                <p className={eyebrowCls}>SEO</p>
                <h2 className="font-[family:var(--font-display)] text-[1.1rem] font-semibold text-[#4d2741]">
                  Keresőoptimalizálás
                </h2>
              </div>
              <ChevronDown
                className="h-5 w-5 text-[#c0517a] transition-transform duration-200"
                style={{ transform: seoOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            <div
              className="overflow-hidden transition-all duration-300"
              style={{
                maxHeight: seoOpen ? "400px" : "0px",
                opacity: seoOpen ? 1 : 0,
              }}
            >
              <div className="space-y-4 px-6 pb-6">
                {/* Google snippet preview */}
                <div className="rounded-[1rem] border border-[#e8dff0] bg-white/80 p-4">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-[#8a7a9a]">
                    Google előnézet
                  </p>
                  <p className="text-sm font-medium text-[#1a0dab]">
                    {formValues.name || "Terméknév"} – Bubus
                  </p>
                  <p className="text-xs text-[#006621]">bubus.hu/termekek/{formValues.slug || "slug"}</p>
                  <p className="mt-1 text-xs text-[#545454] line-clamp-2">
                    {formValues.shortDescription || "Rövid leírás itt jelenik meg a találati listában..."}
                  </p>
                </div>

                <div className="rounded-[1rem] border border-[#f0d4e0] bg-[#fff8fb]/60 px-4 py-3 text-xs text-[#7a6070]">
                  A terméknév és rövid leírás mezők alapján generálódik az előnézet. Az alapadatoknál szerkesztheted őket.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT COLUMN (sticky) ════ */}
        <div className="space-y-4 xl:sticky xl:top-28">

          {/* Publikálás */}
          <CardShell eyebrow="Publikálás" title="Státusz és mentés">
            <div className="space-y-4">
              <FieldWrap label="Kezdőlapi kihelyezés" error={errors.homepagePlacement}>
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

              <div className="space-y-3 rounded-[1.2rem] border border-[#f0d4e0] bg-white/50 p-4">
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
                <ToggleSwitch
                  checked={formValues.isOnSale}
                  onChange={(v) => handleFieldChange("isOnSale", v)}
                  label="Akciós"
                />
              </div>

              {submitError && (
                <p className="rounded-[0.8rem] border border-[#f3ccd9] bg-[#fff4f7] px-3 py-2 text-sm text-[#9b476f]">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={hasUploadingImages || isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-[14px] py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(196,90,133,0.2)] transition hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-60"
                style={{ background: ctaGradient }}
              >
                <Save className="h-4 w-4" />
                {hasUploadingImages
                  ? "Képek feltöltése..."
                  : isSubmitting
                    ? "Mentés..."
                    : submitLabel}
              </button>
            </div>
          </CardShell>

          {/* Besorolás */}
          <CardShell eyebrow="Besorolás" title="Kategória & Kőtípus">
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
            </div>
          </CardShell>

          {/* Tulajdonságok */}
          <CardShell eyebrow="Tulajdonságok" title="Jellemzők">
            <div className="space-y-5">
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
        </div>
      </div>
    </form>
  );
}
