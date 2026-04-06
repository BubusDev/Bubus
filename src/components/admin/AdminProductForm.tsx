"use client";

import { upload } from "@vercel/blob/client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { Plus, Trash2, X } from "lucide-react";

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

type StepDefinition = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  fields: FormFieldName[];
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

const stepDefinitions: StepDefinition[] = [
  {
    id: "basics",
    eyebrow: "1. lépés",
    title: "Alapadatok",
    description: "A termék alapnevei és bolti címkéi.",
    fields: ["name", "slug", "badge", "collectionLabel"],
  },
  {
    id: "images",
    eyebrow: "2. lépés",
    title: "Képek",
    description: "Több kép feltöltése és a borítókép kijelölése.",
    fields: [],
  },
  {
    id: "pricing",
    eyebrow: "3. lépés",
    title: "Árazás és státusz",
    description: "Ár, eredeti ár és kiemelt állapotok.",
    fields: ["price", "stockQuantity", "compareAtPrice", "isNew", "isGiftable", "isOnSale"],
  },
  {
    id: "content",
    eyebrow: "4. lépés",
    title: "Szövegek",
    description: "Rövid termékleírás és teljes leírás.",
    fields: ["shortDescription", "description"],
  },
  {
    id: "classification",
    eyebrow: "5. lépés",
    title: "Besorolás",
    description: "Kategória, szűréshez szükséges mezők és kezdőlapi kihelyezés.",
    fields: [
      "category",
      "stoneType",
      "color",
      "style",
      "occasion",
      "availability",
      "tone",
      "homepagePlacement",
    ],
  },
];

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

const optionListKeyByField: Record<
  ProductOptionGroup["fieldName"],
  OptionListKey
> = {
  category: "categories",
  stoneType: "stoneTypes",
  color: "colors",
  style: "styles",
  occasion: "occasions",
  availability: "availability",
  tone: "tones",
};

const textEncoder = new TextEncoder();

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function truncateForPreview(value: string, limit = 120) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit)}...`;
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
      {
        field,
        count: 0,
        bytes: 0,
        containsFile: false,
        containsBlob: false,
        containsDataImage: false,
        containsBase64DataUri: false,
        preview: "",
      };

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
    fields: [...byField.values()].sort((left, right) => right.bytes - left.bytes),
    hasBinaryEntry,
    hasInlineDataImage,
    hasBase64DataUri,
  };
}

function InputShell({
  children,
  error,
  label,
}: {
  children: ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-[#5a374e]">{label}</span>
      {children}
      {error ? <p className="text-sm text-[#9b476f]">{error}</p> : null}
    </label>
  );
}

function StepShell({
  active,
  children,
  description,
  eyebrow,
  title,
}: {
  active: boolean;
  children: ReactNode;
  description?: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section
      className={`rounded-[1.8rem] border border-[#efd8e5] bg-white/82 p-5 shadow-[0_10px_26px_rgba(191,117,162,0.06)] sm:p-6 ${
        active ? "block" : "hidden"
      }`}
    >
      <div className="mb-5 space-y-1.5">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#af7795]">{eyebrow}</p>
        <h2 className="text-lg font-semibold text-[#4d2741]">{title}</h2>
        {description ? <p className="text-sm leading-6 text-[#7a6070]">{description}</p> : null}
      </div>
      {children}
    </section>
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
        setName("");
        setSlug("");
        setIsOpen(false);
      } catch (actionError) {
        setError(
          actionError instanceof Error ? actionError.message : "Nem sikerült létrehozni az opciót.",
        );
      }
    });
  }

  return (
    <div className="mt-2">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[#ecd3e3] bg-white/92 px-4 text-sm font-medium text-[#6b425a] transition hover:border-[#f0b3d1] hover:bg-white"
        >
          <Plus className="h-4 w-4" />
          Új hozzáadása
        </button>
      ) : (
        <div className="rounded-[1.3rem] border border-[#f0d8e5] bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(255,246,250,0.94))] p-4 shadow-[0_8px_18px_rgba(191,117,162,0.06)]">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#4d2741]">Új opció hozzáadása</p>
              <p className="mt-1 text-sm text-[#7a6070]">Új érték létrehozása ehhez: {label.toLowerCase()}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError(null);
                setName("");
                setSlug("");
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ecd3e3] bg-white text-[#7b576a] transition hover:bg-[#fff8fb]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Megnevezés"
                className="h-11 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none transition focus:border-[#e9b6d0]"
              />
              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="Slug (opcionális)"
                className="h-11 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none transition focus:border-[#e9b6d0]"
              />
            </div>

            {error ? <p className="text-sm text-[#9b476f]">{error}</p> : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPending || !name.trim()}
                onClick={handleCreate}
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#f183bc] px-4 text-sm font-medium text-white transition hover:bg-[#ea6fb0] disabled:opacity-70"
              >
                {isPending ? "Mentés..." : "Létrehozás"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                  setName("");
                  setSlug("");
                }}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#ecd3e3] bg-white px-4 text-sm font-medium text-[#6b425a] transition hover:border-[#f0b3d1] hover:bg-white"
              >
                Mégse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type SelectFieldProps = {
  error?: string;
  fieldName: ProductOptionGroup["fieldName"];
  label: string;
  onChange: (nextValue: string) => void;
  onOptionCreated: (
    type: ProductOptionGroup["type"],
    option: ProductOptionValue,
  ) => void;
  onOptionDeleted: (
    fieldName: ProductOptionGroup["fieldName"],
    option: ProductOptionValue,
  ) => void;
  onOptionRestored: (
    fieldName: ProductOptionGroup["fieldName"],
    option: ProductOptionValue,
  ) => void;
  optionType: ProductOptionGroup["type"];
  options: ProductOptionValue[];
  selectedValue: string;
};

function SelectField({
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
    <div className="space-y-2">
      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <InputShell label={label} error={error}>
            <select
              name={fieldName}
              value={selectedValue}
              onChange={(event) => onChange(event.target.value)}
              className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none transition focus:border-[#e9b6d0]"
            >
              <option value="">Válassz...</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </InputShell>
        </div>

        <button
          type="button"
          onClick={() => setIsManagerOpen(true)}
          className="inline-flex h-12 shrink-0 items-center gap-2 rounded-2xl border border-[#ecd3e3] bg-white/92 px-4 text-sm font-medium text-[#6b425a] transition hover:border-[#f0b3d1] hover:bg-white"
        >
          <Plus className="h-4 w-4" />
          Kezelés
        </button>
      </div>

      {isManagerOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3f2435]/20 p-4 backdrop-blur-[2px]"
          onClick={() => setIsManagerOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-[1.8rem] border border-[#efd8e5] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,246,250,0.96))] p-5 shadow-[0_24px_60px_rgba(120,52,88,0.18)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#af7795]">Opciókezelés</p>
                <h3 className="mt-1 text-lg font-semibold text-[#4d2741]">{label}</h3>
                <p className="mt-1 text-sm text-[#7a6070]">
                  Itt adhatsz hozzá új értéket, vagy törölheted a meglévőket.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsManagerOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ecd3e3] bg-white text-[#7b576a] transition hover:bg-[#fff8fb]"
                aria-label="Opciókezelő bezárása"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-[1.2rem] border border-[#f0d8e5] bg-white/85 p-2">
              <div className="space-y-1">
                {options.map((option) => {
                  const isSelected = option.id === selectedValue;
                  const isPendingDelete = isDeletePending && pendingDeleteId === option.id;

                  return (
                    <div
                      key={option.id}
                      className="flex items-center justify-between gap-3 rounded-[1rem] px-3 py-2 text-sm text-[#5a374e] transition hover:bg-[#fff8fb]"
                    >
                      <span className="truncate">
                        {option.name}
                        {isSelected ? " (kiválasztva)" : ""}
                      </span>

                      <button
                        type="button"
                        disabled={isSelected || isPendingDelete}
                        onClick={() => handleDelete(option)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ecd3e3] bg-white text-[#8a6178] transition hover:border-[#f0b3d1] hover:bg-[#fff8fb] disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`${option.name} törlése`}
                        title={isSelected ? "A kiválasztott érték nem törölhető" : "Opció törlése"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {deleteError ? <p className="mt-3 text-sm text-[#9b476f]">{deleteError}</p> : null}

            <InlineOptionCreate
              optionType={optionType}
              label={label}
              onCreated={(option) => onOptionCreated(optionType, option)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
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

function getFirstInvalidStep(errors: FormErrorState) {
  return stepDefinitions.findIndex((step) => step.fields.some((field) => errors[field]));
}

function filterErrorsForStep(errors: FormErrorState, stepIndex: number) {
  const stepFields = new Set(stepDefinitions[stepIndex]?.fields ?? []);
  return Object.fromEntries(
    Object.entries(errors).filter(([fieldName]) => stepFields.has(fieldName as FormFieldName)),
  ) as FormErrorState;
}

async function uploadProductImage(file: File) {
  return upload(createProductImageUploadPathname(file.name), file, {
    access: "public",
    contentType: file.type || undefined,
    handleUploadUrl: "/api/admin/product-images/upload",
  });
}

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

  const [step, setStep] = useState(0);
  const [dynamicOptions, setDynamicOptions] = useState(options);
  const [formValues, setFormValues] = useState<ProductFormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrorState>({});
  const [existingImages, setExistingImages] = useState<PendingImage[]>(initialExistingImages);
  const [uploadedImages, setUploadedImages] = useState<PendingImage[]>([]);
  const [coverImageKey, setCoverImageKey] = useState<string>(initialCoverImageKey);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const uploadedImagesRef = useRef(uploadedImages);
  const formTopRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const allImages = useMemo(() => [...existingImages, ...uploadedImages], [existingImages, uploadedImages]);
  const completedUploadedImages = useMemo(
    () => uploadedImages.filter((image) => image.status === "ready" && image.uploadedUrl.length > 0),
    [uploadedImages],
  );
  const hasUploadingImages = uploadedImages.some((image) => image.status === "uploading");
  const hasImageUploadErrors = uploadedImages.some((image) => image.status === "error");
  const hasPendingImageResolution = hasUploadingImages || hasImageUploadErrors;
  const uploadErrors = uploadedImages
    .filter((image) => image.status === "error" && image.errorMessage)
    .map((image) => image.errorMessage as string);
  const effectiveCoverImageKey = useMemo(() => {
    if (allImages.some((image) => image.id === coverImageKey && image.status === "ready")) {
      return coverImageKey;
    }

    return allImages.find((image) => image.status === "ready")?.id ?? "";
  }, [allImages, coverImageKey]);

  const handleFieldChange = <K extends FormFieldName>(fieldName: K, nextValue: ProductFormState[K]) => {
    setFormValues((current) => ({ ...current, [fieldName]: nextValue }));
    setErrors((current) => {
      if (!current[fieldName]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[fieldName];
      return nextErrors;
    });
  };

  const handleOptionCreated = (
    type: ProductOptionGroup["type"],
    option: ProductOptionValue,
  ) => {
    setDynamicOptions((current) => {
      const fieldName = optionGroups.find((group) => group.type === type)?.fieldName;
      if (!fieldName) {
        return current;
      }

      const optionsKey = optionListKeyByField[fieldName];
      const currentOptions = current[optionsKey];
      if (currentOptions.some((item) => item.id === option.id)) {
        return current;
      }

      return {
        ...current,
        [optionsKey]: [...currentOptions, option],
      };
    });

    const fieldName = optionGroups.find((group) => group.type === type)?.fieldName;
    if (fieldName) {
      handleFieldChange(fieldName, option.id);
    }
  };

  const handleOptionDeleted = (
    fieldName: ProductOptionGroup["fieldName"],
    option: ProductOptionValue,
  ) => {
    const optionsKey = optionListKeyByField[fieldName];
    setDynamicOptions((current) => ({
      ...current,
      [optionsKey]: current[optionsKey].filter((item) => item.id !== option.id),
    }));
  };

  const handleOptionRestored = (
    fieldName: ProductOptionGroup["fieldName"],
    option: ProductOptionValue,
  ) => {
    const optionsKey = optionListKeyByField[fieldName];
    setDynamicOptions((current) => {
      if (current[optionsKey].some((item) => item.id === option.id)) {
        return current;
      }

      return {
        ...current,
        [optionsKey]: [...current[optionsKey], option].sort(
          (left, right) => left.sortOrder - right.sortOrder,
        ),
      };
    });
  };

  async function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    setSubmitError(null);

    const nextImages = files.map((file, index) => ({
      id: `upload:${Date.now()}-${index}`,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      kind: "upload" as const,
      uploadedUrl: "",
      status: "uploading" as const,
    }));

    setUploadedImages((current) => [...current, ...nextImages]);

    await Promise.all(
      nextImages.map(async (image, index) => {
        try {
          const blob = await uploadProductImage(files[index]);
          setUploadedImages((current) =>
            current.map((currentImage) =>
              currentImage.id === image.id
                ? {
                    ...currentImage,
                    uploadedUrl: blob.url,
                    status: "ready",
                  }
                : currentImage,
            ),
          );
        } catch (error) {
          setUploadedImages((current) =>
            current.map((currentImage) =>
              currentImage.id === image.id
                ? {
                    ...currentImage,
                    status: "error",
                    errorMessage:
                      error instanceof Error ? error.message : "A kép feltöltése nem sikerült.",
                  }
                : currentImage,
            ),
          );
        }
      }),
    );
  }

  function removeImage(image: PendingImage) {
    setSubmitError(null);

    if (image.kind === "existing") {
      setExistingImages((current) => current.filter((existingImage) => existingImage.id !== image.id));
      return;
    }

    URL.revokeObjectURL(image.previewUrl);
    setUploadedImages((current) => current.filter((uploadedImage) => uploadedImage.id !== image.id));
  }

  const isFirstStep = step === 0;
  const isLastStep = step === stepDefinitions.length - 1;

  const validateAndSetErrors = (stepIndex?: number) => {
    const nextErrors = validateFormState(formValues, dynamicOptions);
    setErrors(typeof stepIndex === "number" ? filterErrorsForStep(nextErrors, stepIndex) : nextErrors);
    return nextErrors;
  };

  function handleNextStep() {
    if (step === 1 && hasPendingImageResolution) {
      setSubmitError(
        hasUploadingImages
          ? "Várd meg, amíg az összes kép feltöltése befejeződik."
          : "A hibás képfeltöltéseket javítsd vagy távolítsd el, mielőtt továbblépsz.",
      );
      return;
    }

    const nextErrors = validateAndSetErrors(step);
    const currentStepHasErrors = stepDefinitions[step].fields.some((field) => nextErrors[field]);
    if (currentStepHasErrors) {
      return;
    }

    setSubmitError(null);
    setStep((current) => Math.min(current + 1, stepDefinitions.length - 1));
  }

  function buildSubmissionFormData() {
    const formData = new FormData();
    const retainedImageIds = existingImages.map((image) => image.id);
    const uploadedImagesPayload: UploadedImagePayload[] = completedUploadedImages.map((image) => ({
      key: image.id,
      url: image.uploadedUrl,
    }));

    if (values.id) {
      formData.append("productId", values.id);
    }

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

    if (formValues.isNew) {
      formData.append("isNew", "on");
    }

    if (formValues.isGiftable) {
      formData.append("isGiftable", "on");
    }

    if (formValues.isOnSale) {
      formData.append("isOnSale", "on");
    }

    if (retainedImageIds.length > 0) {
      formData.append("retainedImageIdsCsv", retainedImageIds.join(","));
    }

    if (uploadedImagesPayload.length > 0) {
      formData.append("uploadedImagesJson", JSON.stringify(uploadedImagesPayload));
    }

    formData.append("coverImageKey", effectiveCoverImageKey);

    return formData;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateAndSetErrors();
    const firstInvalidStep = getFirstInvalidStep(nextErrors);

    if (firstInvalidStep !== -1) {
      setStep(firstInvalidStep);
      return;
    }

    if (hasPendingImageResolution) {
      setStep(1);
      setSubmitError(
        hasUploadingImages
          ? "A mentés csak akkor folytatható, ha minden kiválasztott kép feltöltése befejeződött."
          : "A mentés előtt rendezd a hibás képfeltöltéseket: töltsd fel újra vagy távolítsd el őket.",
      );
      return;
    }

    setSubmitError(null);

    const formData = buildSubmissionFormData();
    const inspection = inspectSubmissionFormData(formData);
    const oversizedFields = inspection.fields.filter((field) => field.bytes >= 50 * 1024);

    console.groupCollapsed(
      `[AdminProductForm] Server Action payload ${formatBytes(inspection.totalBytes)}`,
    );
    console.table(
      inspection.fields.map((field) => ({
        field: field.field,
        count: field.count,
        bytes: field.bytes,
        size: formatBytes(field.bytes),
        file: field.containsFile,
        blob: field.containsBlob,
        dataImage: field.containsDataImage,
        base64DataUri: field.containsBase64DataUri,
        preview: field.preview,
      })),
    );
    if (oversizedFields.length > 0) {
      console.warn(
        "[AdminProductForm] Oversized fields",
        oversizedFields.map((field) => ({
          field: field.field,
          bytes: field.bytes,
          size: formatBytes(field.bytes),
        })),
      );
    }
    console.info("[AdminProductForm] Final request shape", {
      keys: inspection.fields.map((field) => field.field),
      totalBytes: inspection.totalBytes,
      totalSize: formatBytes(inspection.totalBytes),
      hasBinaryEntry: inspection.hasBinaryEntry,
      hasInlineDataImage: inspection.hasInlineDataImage,
      hasBase64DataUri: inspection.hasBase64DataUri,
    });
    console.groupEnd();

    if (inspection.hasBinaryEntry || inspection.hasInlineDataImage || inspection.hasBase64DataUri) {
      setSubmitError(
        "A beküldés még mindig inline képadatot vagy bináris payloadot tartalmaz. Ellenőrizd a konzollogokat.",
      );
      return;
    }

    startSubmitTransition(async () => {
      try {
        await action(formData);
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "A termék mentése nem sikerült.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div ref={formTopRef} />
      <section className="rounded-[1.8rem] border border-[#efd8e5] bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(255,245,250,0.92))] p-4 shadow-[0_10px_24px_rgba(191,117,162,0.06)] sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {stepDefinitions.map((item, index) => {
            const isActive = index === step;
            const isCompleted = index < step;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setStep(index)}
                className={`rounded-[1.2rem] border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-[#f1bfd8] bg-white shadow-[0_8px_18px_rgba(191,117,162,0.08)]"
                    : isCompleted
                      ? "border-[#f3d7e5] bg-[#fff8fb]"
                      : "border-transparent bg-white/50"
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#af7795]">{item.eyebrow}</p>
                <p className="mt-1 text-sm font-medium text-[#4d2741]">{item.title}</p>
              </button>
            );
          })}
        </div>
      </section>

      <StepShell
        active={step === 0}
        eyebrow={stepDefinitions[0].eyebrow}
        title={stepDefinitions[0].title}
        description={stepDefinitions[0].description}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <InputShell label="Termék neve" error={errors.name}>
            <input
              name="name"
              value={formValues.name}
              onChange={(event) => handleFieldChange("name", event.target.value)}
              placeholder="Pl. Aurora Ribbon nyaklánc"
              className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none"
            />
          </InputShell>

          <InputShell label="Slug" error={errors.slug}>
            <input
              name="slug"
              value={formValues.slug}
              onChange={(event) => handleFieldChange("slug", event.target.value)}
              placeholder="pl. aurora-ribbon-necklace"
              className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none"
            />
          </InputShell>

          <InputShell label="Címke" error={errors.badge}>
            <input
              name="badge"
              value={formValues.badge}
              onChange={(event) => handleFieldChange("badge", event.target.value)}
              placeholder="Pl. Újdonság"
              className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none"
            />
          </InputShell>

          <InputShell label="Kollekciócímke" error={errors.collectionLabel}>
            <input
              name="collectionLabel"
              value={formValues.collectionLabel}
              onChange={(event) => handleFieldChange("collectionLabel", event.target.value)}
              placeholder="Pl. Beach"
              className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none"
            />
          </InputShell>
        </div>
      </StepShell>

      <StepShell
        active={step === 1}
        eyebrow={stepDefinitions[1].eyebrow}
        title={stepDefinitions[1].title}
        description={stepDefinitions[1].description}
      >
        <div className="space-y-5">
          <label className="flex min-h-32 cursor-pointer items-center justify-center rounded-[1.4rem] border border-dashed border-[#e4bfd3] bg-[#fff8fb] px-5 py-6 text-center text-sm text-[#7a6070] transition hover:bg-white">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelection}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#5a374e]">Termékképek kiválasztása</p>
              <p className="text-sm text-[#7a6070]">
                PNG, JPG vagy WEBP. A kép közvetlenül a Vercel Blob tárhelyre töltődik fel.
              </p>
            </div>
          </label>

          {hasUploadingImages ? (
            <div className="rounded-[1.3rem] border border-[#f2d7e6] bg-[#fff8fb] px-4 py-3 text-sm text-[#7a6070]">
              Képfeltöltés folyamatban...
            </div>
          ) : null}

          {uploadErrors.length > 0 ? (
            <div className="rounded-[1.3rem] border border-[#f3ccd9] bg-[#fff4f7] px-4 py-3 text-sm text-[#9b476f]">
              {uploadErrors[0]}
            </div>
          ) : null}

          {allImages.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {allImages.map((image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-[1.35rem] border border-[#ecd3e3] bg-white"
                >
                  <div className="aspect-[4/4.2] bg-[#fff4f8]">
                    <img src={image.previewUrl} alt={image.name} className="h-full w-full object-cover" />
                  </div>

                  <div className="space-y-3 p-4">
                    <p className="truncate text-sm text-[#6d5260]">{image.name}</p>

                    {image.status === "uploading" ? (
                      <p className="text-sm text-[#7a6070]">Feltöltés...</p>
                    ) : null}

                    {image.status === "error" ? (
                      <p className="text-sm text-[#9b476f]">
                        {image.errorMessage ?? "A kép feltöltése nem sikerült."}
                      </p>
                    ) : null}

                    <label className="flex items-center gap-2 text-sm text-[#5a374e]">
                      <input
                        type="radio"
                        checked={effectiveCoverImageKey === image.id}
                        onChange={() => {
                          setCoverImageKey(image.id);
                          setSubmitError(null);
                        }}
                        disabled={image.status !== "ready"}
                        className="h-4 w-4 accent-[#f183bc]"
                      />
                      Borítókép
                    </label>

                    <button
                      type="button"
                      onClick={() => removeImage(image)}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-[#f1cedf] bg-[#fff3f8] px-4 text-sm font-medium text-[#9b476f] transition hover:bg-[#ffe8f2]"
                    >
                      Eltávolítás
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.3rem] border border-dashed border-[#e7cedb] bg-white/80 p-5 text-sm text-[#7a6070]">
              Még nincs kiválasztott kép.
            </div>
          )}
        </div>
      </StepShell>

      <StepShell
        active={step === 2}
        eyebrow={stepDefinitions[2].eyebrow}
        title={stepDefinitions[2].title}
        description={stepDefinitions[2].description}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <InputShell label="Ár" error={errors.price}>
            <input
              name="price"
              type="number"
              min={0}
              value={formValues.price}
              onChange={(event) => handleFieldChange("price", event.target.value)}
              className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none"
            />
          </InputShell>

          <InputShell label="Készlet (db)" error={errors.stockQuantity}>
            <input
              name="stockQuantity"
              type="number"
              min={0}
              step={1}
              value={formValues.stockQuantity}
              onChange={(event) => handleFieldChange("stockQuantity", event.target.value)}
              className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none"
            />
          </InputShell>

          <InputShell label="Eredeti ár" error={errors.compareAtPrice}>
            <input
              name="compareAtPrice"
              type="number"
              min={0}
              value={formValues.compareAtPrice}
              onChange={(event) => handleFieldChange("compareAtPrice", event.target.value)}
              className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none"
            />
          </InputShell>

          <div className="sm:col-span-2 flex flex-wrap gap-3">
            {[
              { field: "isNew" as const, label: "Új termék" },
              { field: "isGiftable" as const, label: "Ajándékozható" },
              { field: "isOnSale" as const, label: "Akciós" },
            ].map((item) => (
              <label
                key={item.field}
                className="flex items-center gap-3 rounded-[1.2rem] border border-[#f2dce7] bg-[#fff8fb] px-4 py-3 text-sm text-[#5a374e]"
              >
                <input
                  name={item.field}
                  type="checkbox"
                  checked={formValues[item.field]}
                  onChange={(event) => handleFieldChange(item.field, event.target.checked)}
                  className="h-4 w-4 accent-[#f183bc]"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </StepShell>

      <StepShell
        active={step === 3}
        eyebrow={stepDefinitions[3].eyebrow}
        title={stepDefinitions[3].title}
        description={stepDefinitions[3].description}
      >
        <div className="grid gap-4">
          <InputShell label="Rövid leírás" error={errors.shortDescription}>
            <textarea
              name="shortDescription"
              value={formValues.shortDescription}
              onChange={(event) => handleFieldChange("shortDescription", event.target.value)}
              rows={3}
              className="w-full rounded-[1.25rem] border border-[#edd1e1] bg-white px-4 py-3 text-sm text-[#4d2741] outline-none"
            />
          </InputShell>

          <InputShell label="Leírás" error={errors.description}>
            <textarea
              name="description"
              value={formValues.description}
              onChange={(event) => handleFieldChange("description", event.target.value)}
              rows={6}
              className="w-full rounded-[1.25rem] border border-[#edd1e1] bg-white px-4 py-3 text-sm text-[#4d2741] outline-none"
            />
          </InputShell>
        </div>
      </StepShell>

      <StepShell
        active={step === 4}
        eyebrow={stepDefinitions[4].eyebrow}
        title={stepDefinitions[4].title}
        description={stepDefinitions[4].description}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SelectField
            fieldName="category"
            label="Kategória"
            selectedValue={formValues.category}
            options={dynamicOptions.categories}
            optionType="CATEGORY"
            onChange={(value) => handleFieldChange("category", value)}
            onOptionDeleted={handleOptionDeleted}
            onOptionRestored={handleOptionRestored}
            onOptionCreated={handleOptionCreated}
            error={errors.category}
          />

          <SelectField
            fieldName="stoneType"
            label="Kőtípus"
            selectedValue={formValues.stoneType}
            options={dynamicOptions.stoneTypes}
            optionType="STONE_TYPE"
            onChange={(value) => handleFieldChange("stoneType", value)}
            onOptionDeleted={handleOptionDeleted}
            onOptionRestored={handleOptionRestored}
            onOptionCreated={handleOptionCreated}
            error={errors.stoneType}
          />

          <SelectField
            fieldName="color"
            label="Szín"
            selectedValue={formValues.color}
            options={dynamicOptions.colors}
            optionType="COLOR"
            onChange={(value) => handleFieldChange("color", value)}
            onOptionDeleted={handleOptionDeleted}
            onOptionRestored={handleOptionRestored}
            onOptionCreated={handleOptionCreated}
            error={errors.color}
          />

          <SelectField
            fieldName="style"
            label="Stílus"
            selectedValue={formValues.style}
            options={dynamicOptions.styles}
            optionType="STYLE"
            onChange={(value) => handleFieldChange("style", value)}
            onOptionDeleted={handleOptionDeleted}
            onOptionRestored={handleOptionRestored}
            onOptionCreated={handleOptionCreated}
            error={errors.style}
          />

          <SelectField
            fieldName="occasion"
            label="Alkalom"
            selectedValue={formValues.occasion}
            options={dynamicOptions.occasions}
            optionType="OCCASION"
            onChange={(value) => handleFieldChange("occasion", value)}
            onOptionDeleted={handleOptionDeleted}
            onOptionRestored={handleOptionRestored}
            onOptionCreated={handleOptionCreated}
            error={errors.occasion}
          />

          <SelectField
            fieldName="availability"
            label="Elérhetőség"
            selectedValue={formValues.availability}
            options={dynamicOptions.availability}
            optionType="AVAILABILITY"
            onChange={(value) => handleFieldChange("availability", value)}
            onOptionDeleted={handleOptionDeleted}
            onOptionRestored={handleOptionRestored}
            onOptionCreated={handleOptionCreated}
            error={errors.availability}
          />

          <SelectField
            fieldName="tone"
            label="Vizuális tónus"
            selectedValue={formValues.tone}
            options={dynamicOptions.tones}
            optionType="VISUAL_TONE"
            onChange={(value) => handleFieldChange("tone", value)}
            onOptionDeleted={handleOptionDeleted}
            onOptionRestored={handleOptionRestored}
            onOptionCreated={handleOptionCreated}
            error={errors.tone}
          />

          <InputShell label="Kezdőlapi kihelyezés" error={errors.homepagePlacement}>
            <select
              name="homepagePlacement"
              value={formValues.homepagePlacement}
              onChange={(event) =>
                handleFieldChange(
                  "homepagePlacement",
                  event.target.value as ProductFormState["homepagePlacement"],
                )
              }
              className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none"
            >
              <option value="">Válassz...</option>
              {dynamicOptions.homepagePlacements.map((option) => (
                <option key={option} value={option}>
                  {homepagePlacementLabels[option]}
                </option>
              ))}
            </select>
          </InputShell>
        </div>
      </StepShell>

      <section className="sticky bottom-4 rounded-[1.6rem] border border-[#efd8e5] bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(255,245,250,0.94))] p-4 shadow-[0_12px_30px_rgba(191,117,162,0.10)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-[#7a6070]">{stepDefinitions[step].title}</p>
            {submitError ? <p className="text-sm text-[#9b476f]">{submitError}</p> : null}
          </div>

          <div className="flex items-center gap-3">
            {!isFirstStep ? (
              <button
                type="button"
                onClick={() => setStep((current) => current - 1)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ecd3e3] bg-white px-5 text-sm font-medium text-[#6b425a] transition hover:border-[#f0b3d1] hover:bg-white"
              >
                Vissza
              </button>
            ) : null}

            {!isLastStep ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#f183bc] px-5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(241,131,188,0.22)] transition hover:bg-[#ea6fb0]"
              >
                Tovább
              </button>
            ) : (
              <button
                type="submit"
                disabled={hasUploadingImages || isSubmitting}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#f183bc] px-6 text-sm font-medium text-white shadow-[0_12px_28px_rgba(241,131,188,0.22)] transition hover:bg-[#ea6fb0]"
              >
                {hasUploadingImages
                  ? "Képek feltöltése..."
                  : isSubmitting
                    ? "Mentés..."
                    : submitLabel}
              </button>
            )}
          </div>
        </div>
      </section>
    </form>
  );
}
