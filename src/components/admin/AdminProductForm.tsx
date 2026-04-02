"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { Plus, Trash2, X } from "lucide-react";

import {
  createProductOptionAction,
  deleteProductOptionAction,
} from "@/app/admin/products/actions";
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
  url: string;
  name: string;
  kind: "existing" | "upload";
};

type ProductFormState = {
  name: string;
  slug: string;
  badge: string;
  collectionLabel: string;
  price: string;
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

const stepDefinitions: StepDefinition[] = [
  {
    id: "basics",
    eyebrow: "1. lepes",
    title: "Alapadatok",
    description: "A termek alap nevei es bolti cimkei.",
    fields: ["name", "slug", "badge", "collectionLabel"],
  },
  {
    id: "images",
    eyebrow: "2. lepes",
    title: "Kepek",
    description: "Tobb kep feltoltese es a boritokep kijelolese.",
    fields: [],
  },
  {
    id: "pricing",
    eyebrow: "3. lepes",
    title: "Arazas es statusz",
    description: "Ar, eredeti ar es kiemelt allapotok.",
    fields: ["price", "compareAtPrice", "isNew", "isGiftable", "isOnSale"],
  },
  {
    id: "content",
    eyebrow: "4. lepes",
    title: "Szovegek",
    description: "Rovid termekleiras es teljes leiras.",
    fields: ["shortDescription", "description"],
  },
  {
    id: "classification",
    eyebrow: "5. lepes",
    title: "Besorolas",
    description: "Kategoria, szureshez szukseges mezok es homepage kihelyezes.",
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
  name: "A termek neve kotelezo.",
  slug: "A slug kotelezo.",
  badge: "A badge cimke kotelezo.",
  collectionLabel: "A kollekcio cimke kotelezo.",
  price: "Az ar kotelezo.",
  shortDescription: "A rovid leiras kotelezo.",
  description: "A teljes leiras kotelezo.",
  category: "A kategoria kotelezo.",
  stoneType: "A kotipus kotelezo.",
  color: "A szin kotelezo.",
  style: "A stilus kotelezo.",
  occasion: "Az alkalom kotelezo.",
  availability: "Az elerhetoseg kotelezo.",
  tone: "A vizualis tonus kotelezo.",
  homepagePlacement: "A homepage kihelyezes kotelezo.",
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
          actionError instanceof Error ? actionError.message : "Nem sikerult letrehozni az opciot.",
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
          Uj hozzaadasa
        </button>
      ) : (
        <div className="rounded-[1.3rem] border border-[#f0d8e5] bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(255,246,250,0.94))] p-4 shadow-[0_8px_18px_rgba(191,117,162,0.06)]">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#4d2741]">Uj opcio hozzaadasa</p>
              <p className="mt-1 text-sm text-[#7a6070]">Uj ertek letrehozasa ehhez: {label.toLowerCase()}</p>
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
                placeholder="Megnevezes"
                className="h-11 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none transition focus:border-[#e9b6d0]"
              />
              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="Slug (opcionalis)"
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
                {isPending ? "Mentes..." : "Letrehozas"}
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
                Megse
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
      setDeleteError("A kivalasztott ertek nem torolheto.");
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
          actionError instanceof Error ? actionError.message : "Nem sikerult torolni az opciot.",
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
              value={selectedValue}
              onChange={(event) => onChange(event.target.value)}
              className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none transition focus:border-[#e9b6d0]"
            >
              <option value="">Valassz...</option>
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
          Kezeles
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
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#af7795]">Opciokezeles</p>
                <h3 className="mt-1 text-lg font-semibold text-[#4d2741]">{label}</h3>
                <p className="mt-1 text-sm text-[#7a6070]">
                  Itt adhatsz hozza uj erteket, vagy torolheted a meglevoket.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsManagerOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ecd3e3] bg-white text-[#7b576a] transition hover:bg-[#fff8fb]"
                aria-label="Opciokezelo bezarasa"
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
                        {isSelected ? " (kivalasztva)" : ""}
                      </span>

                      <button
                        type="button"
                        disabled={isSelected || isPendingDelete}
                        onClick={() => handleDelete(option)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ecd3e3] bg-white text-[#8a6178] transition hover:border-[#f0b3d1] hover:bg-[#fff8fb] disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`${option.name} torlese`}
                        title={isSelected ? "A kivalasztott ertek nem torolheto" : "Opcio torlese"}
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
  if (!Number.isFinite(price) || price < 0) {
    errors.price = "Az arnak ervenyes, nem negativ szamnak kell lennie.";
  }

  if (formValues.compareAtPrice.trim().length > 0) {
    const compareAtPrice = Number(formValues.compareAtPrice);
    if (!Number.isFinite(compareAtPrice) || compareAtPrice < 0) {
      errors.compareAtPrice = "Az eredeti ar ures vagy nem negativ szam lehet.";
    }
  }

  if (!availableOptions.homepagePlacements.includes(formValues.homepagePlacement)) {
    errors.homepagePlacement = "Ervenytelen homepage kihelyezes.";
  }

  const optionFields = Object.entries(optionListKeyByField) as Array<
    [ProductOptionGroup["fieldName"], OptionListKey]
  >;
  for (const [fieldName, optionsKey] of optionFields) {
    const selectedOptionId = formValues[fieldName];
    const hasMatch = availableOptions[optionsKey].some((option) => option.id === selectedOptionId);
    if (!hasMatch) {
      errors[fieldName] = requiredFieldMessages[fieldName] ?? "Ervenytelen valasztas.";
    }
  }

  return errors;
}

function getFirstInvalidStep(errors: FormErrorState) {
  return stepDefinitions.findIndex((step) => step.fields.some((field) => errors[field]));
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
        url: image.url,
        name: image.alt,
        kind: "existing",
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

  useEffect(() => {
    return () => {
      for (const image of uploadedImages) {
        URL.revokeObjectURL(image.url);
      }
    };
  }, [uploadedImages]);

  const allImages = useMemo(() => [...existingImages, ...uploadedImages], [existingImages, uploadedImages]);
  const effectiveCoverImageKey = useMemo(() => {
    if (allImages.some((image) => image.id === coverImageKey)) {
      return coverImageKey;
    }

    return allImages[0]?.id ?? "";
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

  const isFirstStep = step === 0;
  const isLastStep = step === stepDefinitions.length - 1;

  const validateAndSetErrors = () => {
    const nextErrors = validateFormState(formValues, dynamicOptions);
    setErrors(nextErrors);
    return nextErrors;
  };

  function handleNextStep() {
    const nextErrors = validateAndSetErrors();
    const currentStepHasErrors = stepDefinitions[step].fields.some((field) => nextErrors[field]);
    if (currentStepHasErrors) {
      return;
    }

    setStep((current) => Math.min(current + 1, stepDefinitions.length - 1));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const nextErrors = validateAndSetErrors();
    const firstInvalidStep = getFirstInvalidStep(nextErrors);

    if (firstInvalidStep !== -1) {
      event.preventDefault();
      setStep(firstInvalidStep);
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="space-y-6">
      {values.id ? <input type="hidden" name="productId" value={values.id} /> : null}

      {existingImages.map((image) => (
        <input key={image.id} type="hidden" name="retainedImageIds" value={image.id} />
      ))}

      <input type="hidden" name="name" value={formValues.name} />
      <input type="hidden" name="slug" value={formValues.slug} />
      <input type="hidden" name="badge" value={formValues.badge} />
      <input type="hidden" name="collectionLabel" value={formValues.collectionLabel} />
      <input type="hidden" name="price" value={formValues.price} />
      <input type="hidden" name="compareAtPrice" value={formValues.compareAtPrice} />
      <input type="hidden" name="shortDescription" value={formValues.shortDescription} />
      <input type="hidden" name="description" value={formValues.description} />
      <input type="hidden" name="category" value={formValues.category} />
      <input type="hidden" name="stoneType" value={formValues.stoneType} />
      <input type="hidden" name="color" value={formValues.color} />
      <input type="hidden" name="style" value={formValues.style} />
      <input type="hidden" name="occasion" value={formValues.occasion} />
      <input type="hidden" name="availability" value={formValues.availability} />
      <input type="hidden" name="tone" value={formValues.tone} />
      <input type="hidden" name="homepagePlacement" value={formValues.homepagePlacement} />
      <input type="hidden" name="coverImageKey" value={effectiveCoverImageKey} />
      {formValues.isNew ? <input type="hidden" name="isNew" value="on" /> : null}
      {formValues.isGiftable ? <input type="hidden" name="isGiftable" value="on" /> : null}
      {formValues.isOnSale ? <input type="hidden" name="isOnSale" value="on" /> : null}

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
          <InputShell label="Termek neve" error={errors.name}>
            <input
              value={formValues.name}
              onChange={(event) => handleFieldChange("name", event.target.value)}
              placeholder="Pl. Aurora Ribbon Necklace"
              className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none"
            />
          </InputShell>

          <InputShell label="Slug" error={errors.slug}>
            <input
              value={formValues.slug}
              onChange={(event) => handleFieldChange("slug", event.target.value)}
              placeholder="pl. aurora-ribbon-necklace"
              className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none"
            />
          </InputShell>

          <InputShell label="Badge cimke" error={errors.badge}>
            <input
              value={formValues.badge}
              onChange={(event) => handleFieldChange("badge", event.target.value)}
              placeholder="Pl. Ujdonsag"
              className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none"
            />
          </InputShell>

          <InputShell label="Kollekcio cimke" error={errors.collectionLabel}>
            <input
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
              name="images"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                setUploadedImages((current) => {
                  current.forEach((image) => URL.revokeObjectURL(image.url));
                  return files.map((file, index) => ({
                    id: `upload:${index}`,
                    url: URL.createObjectURL(file),
                    name: file.name,
                    kind: "upload",
                  }));
                });
              }}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#5a374e]">Termekkeppek kivalasztasa</p>
              <p className="text-sm text-[#7a6070]">PNG, JPG vagy WEBP. Tobb fajl is feltoltheto.</p>
            </div>
          </label>

          {allImages.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {allImages.map((image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-[1.35rem] border border-[#ecd3e3] bg-white"
                >
                  <div className="aspect-[4/4.2] bg-[#fff4f8]">
                    <img src={image.url} alt={image.name} className="h-full w-full object-cover" />
                  </div>

                  <div className="space-y-3 p-4">
                    <p className="truncate text-sm text-[#6d5260]">{image.name}</p>

                    <label className="flex items-center gap-2 text-sm text-[#5a374e]">
                      <input
                        type="radio"
                        checked={effectiveCoverImageKey === image.id}
                        onChange={() => setCoverImageKey(image.id)}
                        className="h-4 w-4 accent-[#f183bc]"
                      />
                      Boritokep
                    </label>

                    {image.kind === "existing" ? (
                      <button
                        type="button"
                        onClick={() =>
                          setExistingImages((current) =>
                            current.filter((existingImage) => existingImage.id !== image.id),
                          )
                        }
                        className="inline-flex h-10 items-center justify-center rounded-full border border-[#f1cedf] bg-[#fff3f8] px-4 text-sm font-medium text-[#9b476f] transition hover:bg-[#ffe8f2]"
                      >
                        Eltavolitas
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.3rem] border border-dashed border-[#e7cedb] bg-white/80 p-5 text-sm text-[#7a6070]">
              Meg nincs kivalasztott kep.
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
          <InputShell label="Ar" error={errors.price}>
            <input
              type="number"
              min={0}
              value={formValues.price}
              onChange={(event) => handleFieldChange("price", event.target.value)}
              className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none"
            />
          </InputShell>

          <InputShell label="Eredeti ar" error={errors.compareAtPrice}>
            <input
              type="number"
              min={0}
              value={formValues.compareAtPrice}
              onChange={(event) => handleFieldChange("compareAtPrice", event.target.value)}
              className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none"
            />
          </InputShell>

          <div className="sm:col-span-2 flex flex-wrap gap-3">
            {[
              { field: "isNew" as const, label: "Uj termek" },
              { field: "isGiftable" as const, label: "Ajandekozhato" },
              { field: "isOnSale" as const, label: "Akcios" },
            ].map((item) => (
              <label
                key={item.field}
                className="flex items-center gap-3 rounded-[1.2rem] border border-[#f2dce7] bg-[#fff8fb] px-4 py-3 text-sm text-[#5a374e]"
              >
                <input
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
          <InputShell label="Rovid leiras" error={errors.shortDescription}>
            <textarea
              value={formValues.shortDescription}
              onChange={(event) => handleFieldChange("shortDescription", event.target.value)}
              rows={3}
              className="w-full rounded-[1.25rem] border border-[#edd1e1] bg-white px-4 py-3 text-sm text-[#4d2741] outline-none"
            />
          </InputShell>

          <InputShell label="Leiras" error={errors.description}>
            <textarea
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
            label="Kategoria"
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
            label="Kotipus"
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
            label="Szin"
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
            label="Stilus"
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
            label="Elerhetoseg"
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
            label="Vizualis tonus"
            selectedValue={formValues.tone}
            options={dynamicOptions.tones}
            optionType="VISUAL_TONE"
            onChange={(value) => handleFieldChange("tone", value)}
            onOptionDeleted={handleOptionDeleted}
            onOptionRestored={handleOptionRestored}
            onOptionCreated={handleOptionCreated}
            error={errors.tone}
          />

          <InputShell label="Homepage kihelyezes" error={errors.homepagePlacement}>
            <select
              value={formValues.homepagePlacement}
              onChange={(event) =>
                handleFieldChange(
                  "homepagePlacement",
                  event.target.value as ProductFormState["homepagePlacement"],
                )
              }
              className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none"
            >
              <option value="">Valassz...</option>
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
          <p className="text-sm text-[#7a6070]">{stepDefinitions[step].title}</p>

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
                Tovabb
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#f183bc] px-6 text-sm font-medium text-white shadow-[0_12px_28px_rgba(241,131,188,0.22)] transition hover:bg-[#ea6fb0]"
              >
                {submitLabel}
              </button>
            )}
          </div>
        </div>
      </section>
    </form>
  );
}
