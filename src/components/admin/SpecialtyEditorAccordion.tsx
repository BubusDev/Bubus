"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { Check, ChevronDown, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

import type { SpecialtyActionResult } from "@/app/(admin)/admin/content/specialties/actions";

type SpecialtyAccordionContextValue = {
  accordionId: string;
  dirtySectionIds: Set<string>;
  hasUnsavedChanges: boolean;
  saveButtonStatuses: Record<string, SaveButtonStatus>;
  savedSpecialtyId?: string | null;
  savedStatus?: string | null;
  submitError: string | null;
  submittingFormId: string | null;
  markFormSaved: (formId: string) => void;
  openSectionId: string | null;
  setSaveButtonStatus: (formId: string, status: SaveButtonStatus) => void;
  setSubmitError: (message: string | null) => void;
  setOpenSectionId: (sectionId: string | null) => void;
};

const SpecialtyAccordionContext = createContext<SpecialtyAccordionContextValue | null>(null);

const SECTION_SELECTOR = "[data-specialty-section-id]";
const FIELD_SELECTOR = "input[name], textarea[name], select[name]";
const SUCCESS_STATE_MS = 1500;

type SaveButtonStatus = "idle" | "loading" | "success";

function useSpecialtyAccordion() {
  const context = useContext(SpecialtyAccordionContext);

  if (!context) {
    throw new Error("SpecialtyEditorSection must be used inside SpecialtyEditorAccordion.");
  }

  return context;
}

export function SpecialtyEditorAccordion({
  children,
  defaultOpenSectionId,
  savedMessage,
  savedSpecialtyId,
  savedStatus,
}: {
  children: ReactNode;
  defaultOpenSectionId?: string;
  savedMessage?: string | null;
  savedSpecialtyId?: string | null;
  savedStatus?: string | null;
}) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const initialSectionStateRef = useRef<Map<string, string>>(new Map());
  const isConfirmedNavigationRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const successTimeoutsRef = useRef<Map<string, number>>(new Map());
  const [dirtySectionIds, setDirtySectionIds] = useState<Set<string>>(new Set());
  const [openSectionId, setOpenSectionId] = useState<string | null>(defaultOpenSectionId ?? null);
  const [saveButtonStatuses, setSaveButtonStatuses] = useState<Record<string, SaveButtonStatus>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittingFormId, setSubmittingFormId] = useState<string | null>(null);
  const hasUnsavedChanges = dirtySectionIds.size > 0;

  const recomputeDirtySections = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const nextDirtySectionIds = new Set<string>();
    const sections = root.querySelectorAll<HTMLElement>(SECTION_SELECTOR);

    sections.forEach((section) => {
      const sectionId = section.dataset.specialtySectionId;
      if (!sectionId) return;

      const currentState = serializeSection(section);
      if (currentState !== initialSectionStateRef.current.get(sectionId)) {
        nextDirtySectionIds.add(sectionId);
      }
    });

    setDirtySectionIds(nextDirtySectionIds);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const initialSectionState = new Map<string, string>();
    root.querySelectorAll<HTMLElement>(SECTION_SELECTOR).forEach((section) => {
      const sectionId = section.dataset.specialtySectionId;
      if (sectionId) {
        initialSectionState.set(sectionId, serializeSection(section));
      }
    });
    initialSectionStateRef.current = initialSectionState;
  }, []);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (isSubmittingRef.current || isConfirmedNavigationRef.current) return;

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    function handleDocumentClick(event: MouseEvent) {
      if (isSubmittingRef.current || event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const link = target.closest("a[href]");
      if (!link) return;

      const targetAttribute = link.getAttribute("target");
      const href = link.getAttribute("href");
      if (!href || targetAttribute === "_blank" || href.startsWith("#")) return;

      const confirmed = window.confirm(
        "Nem mentett módosítások vannak az oldalon. Biztosan elhagyod az oldalt?",
      );

      if (!confirmed) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      isConfirmedNavigationRef.current = true;
    }

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [hasUnsavedChanges]);

  const setSaveButtonStatus = useCallback((formId: string, status: SaveButtonStatus) => {
    const existingTimeout = successTimeoutsRef.current.get(formId);
    if (existingTimeout) {
      window.clearTimeout(existingTimeout);
      successTimeoutsRef.current.delete(formId);
    }

    setSaveButtonStatuses((current) => {
      if (status === "idle") {
        const { [formId]: _removed, ...rest } = current;
        return rest;
      }

      return { ...current, [formId]: status };
    });

    if (status === "success") {
      const timeout = window.setTimeout(() => {
        setSaveButtonStatuses((current) => {
          const { [formId]: _removed, ...rest } = current;
          return rest;
        });
        successTimeoutsRef.current.delete(formId);
      }, SUCCESS_STATE_MS);
      successTimeoutsRef.current.set(formId, timeout);
    }
  }, []);

  const markFormSaved = useCallback((formId: string) => {
    const root = rootRef.current;
    if (!root) return;

    root.querySelectorAll<HTMLElement>(SECTION_SELECTOR).forEach((section) => {
      const sectionId = section.dataset.specialtySectionId;
      if (sectionId?.startsWith(`${formId}-`)) {
        initialSectionStateRef.current.set(sectionId, serializeSection(section));
      }
    });

    recomputeDirtySections();
  }, [recomputeDirtySections]);

  useEffect(() => {
    if (
      savedSpecialtyId &&
      (savedStatus === "updated" || savedStatus === "created")
    ) {
      const formId =
        savedStatus === "created" ? "specialty-create-form" : `specialty-item-${savedSpecialtyId}`;
      setSaveButtonStatus(formId, "success");
    }
  }, [savedSpecialtyId, savedStatus, setSaveButtonStatus]);

  useEffect(() => {
    const successTimeouts = successTimeoutsRef.current;
    return () => {
      for (const timeout of successTimeouts.values()) {
        window.clearTimeout(timeout);
      }
      successTimeouts.clear();
    };
  }, []);

  function handleEditorChange() {
    setSubmitError(null);
    window.requestAnimationFrame(recomputeDirtySections);
  }

  function handleEditorSubmit(event: FormEvent<HTMLDivElement>) {
    isSubmittingRef.current = true;
    if (event.target instanceof HTMLFormElement) {
      setSubmittingFormId(event.target.id);
      setSaveButtonStatus(event.target.id, "loading");
    } else {
      setSubmittingFormId(null);
    }
  }

  return (
    <SpecialtyAccordionContext.Provider
      value={{
        accordionId: generatedId,
        dirtySectionIds,
        hasUnsavedChanges,
        saveButtonStatuses,
        savedSpecialtyId,
        savedStatus,
        submitError,
        submittingFormId,
        markFormSaved,
        openSectionId,
        setSaveButtonStatus,
        setSubmitError,
        setOpenSectionId,
      }}
    >
      <div
        ref={rootRef}
        onChange={handleEditorChange}
        onInput={handleEditorChange}
        onSubmit={handleEditorSubmit}
      >
        <SpecialtyEditorSaveStatus savedMessage={savedMessage} />
        {children}
      </div>
    </SpecialtyAccordionContext.Provider>
  );
}

export function SpecialtyEditorForm({
  action,
  children,
  className,
  id,
}: {
  action: (formData: FormData) => Promise<SpecialtyActionResult>;
  children: ReactNode;
  className?: string;
  id: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const {
    markFormSaved,
    saveButtonStatuses,
    setSaveButtonStatus,
    setSubmitError,
  } = useSpecialtyAccordion();
  const isLoading = saveButtonStatuses[id] === "loading";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading) return;

    const formData = new FormData(event.currentTarget);
    formData.set("_clientSubmit", "1");
    setSubmitError(null);
    setSaveButtonStatus(id, "loading");

    startTransition(async () => {
      try {
        const result = await action(formData);
        if (!result.ok) {
          setSubmitError(result.error);
          setSaveButtonStatus(id, "idle");
          return;
        }

        markFormSaved(id);
        setSaveButtonStatus(id, "success");
        router.refresh();
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "A mentés nem sikerült.");
        setSaveButtonStatus(id, "idle");
      }
    });
  }

  return (
    <form id={id} onSubmit={handleSubmit} className={className}>
      <input type="hidden" name="_clientSubmit" value="1" />
      {children}
    </form>
  );
}

export function SpecialtyEditorSection({
  alwaysOpen = false,
  children,
  eyebrow,
  id,
  title,
}: {
  alwaysOpen?: boolean;
  children: ReactNode;
  eyebrow: string;
  id: string;
  title: string;
}) {
  const { accordionId, dirtySectionIds, openSectionId, setOpenSectionId } =
    useSpecialtyAccordion();
  const isOpen = alwaysOpen || openSectionId === id;
  const isDirty = dirtySectionIds.has(id);
  const panelId = `${accordionId}-${id}-panel`;
  const buttonId = `${accordionId}-${id}-button`;

  return (
    <section
      className={`overflow-hidden rounded-md border bg-white/82 shadow-[0_10px_24px_rgba(15,23,42,0.03)] transition duration-150 ease-out hover:-translate-y-0.5 hover:border-[#bfd0ea] hover:bg-white hover:shadow-[0_16px_32px_rgba(15,23,42,0.07)] focus-within:border-[rgba(42,99,181,0.28)] focus-within:shadow-[0_16px_32px_rgba(15,23,42,0.07)] motion-reduce:transform-none ${
        isOpen
          ? "border-[rgba(42,99,181,0.3)] bg-white shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
          : "border-[var(--admin-line-100)]"
      }`}
    >
      <button
        id={buttonId}
        type="button"
        aria-controls={panelId}
        aria-expanded={isOpen}
        className={`flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(63,122,210,0.18)] focus-visible:ring-offset-2 sm:px-5 ${
          isOpen ? "bg-[var(--admin-blue-050)]" : "hover:bg-[var(--admin-blue-050)]"
        }`}
        onClick={() => {
          if (!alwaysOpen) {
            setOpenSectionId(isOpen ? null : id);
          }
        }}
      >
        <span className="min-w-0">
          <span className="admin-eyebrow flex items-center gap-2">
            <span>{eyebrow}</span>
            {isDirty ? (
              <span className="rounded-sm border border-[#bfd0ea] bg-[#eef3fb] px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.12em] text-[var(--admin-blue-700)]">
                Módosult
              </span>
            ) : null}
          </span>
          <span className="mt-1 block truncate text-[1rem] font-semibold tracking-[-0.01em] text-[var(--admin-ink-900)]">
            {title}
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-[var(--admin-ink-500)]">
          <span>{alwaysOpen ? "Mindig nyitva" : isOpen ? "Nyitva" : "Zárva"}</span>
          {!alwaysOpen ? (
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          ) : null}
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        data-specialty-section-id={id}
        hidden={!isOpen}
        className="border-t border-[var(--admin-line-100)] px-4 py-4 sm:px-5"
      >
        {children}
      </div>
    </section>
  );
}

export function SpecialtyEditorSaveButton({
  formId,
}: {
  formId: string;
}) {
  const { dirtySectionIds, saveButtonStatuses, submittingFormId } = useSpecialtyAccordion();
  const isDirty = Array.from(dirtySectionIds).some((sectionId) =>
    sectionId.startsWith(`${formId}-`),
  );
  const status = isDirty ? "idle" : saveButtonStatuses[formId] ?? "idle";
  const isSubmitting = status === "loading" || submittingFormId === formId;
  const isSaved = status === "success";
  const disabled = isSubmitting;
  const className = isSaved
    ? "admin-control-sm min-w-[6.75rem] gap-1.5 border border-[#b8d9c6] bg-[#f2faf5] px-2.5 text-xs font-semibold text-[#24533a] shadow-[0_1px_0_rgba(15,23,42,0.03)] transition-colors duration-200 disabled:opacity-100"
    : "admin-button-primary admin-control-sm min-w-[6.75rem] gap-1.5 transition-colors duration-200";

  return (
    <button
      type="submit"
      form={formId}
      disabled={disabled}
      aria-live="polite"
      className={className}
    >
      {isSubmitting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isSaved ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Save className="h-3.5 w-3.5" />
      )}
      <span className="min-w-[3.65rem] text-center">
        {isSubmitting ? "Mentés..." : isSaved ? "Mentve" : "Mentés"}
      </span>
    </button>
  );
}

function SpecialtyEditorSaveStatus({ savedMessage }: { savedMessage?: string | null }) {
  const { hasUnsavedChanges, submitError } = useSpecialtyAccordion();

  return (
    <div
      aria-live="polite"
      className={`mb-4 rounded-md border px-4 py-2.5 text-sm transition ${
        submitError
          ? "border-[#e3c7cf] bg-[#fff1f3] text-[#99283d]"
          : hasUnsavedChanges
          ? "border-[#bfd0ea] bg-[#eef3fb] text-[var(--admin-blue-700)]"
          : savedMessage
            ? "border-[#bdd7c8] bg-[#f2faf5] text-[#24533a]"
            : "border-[var(--admin-line-100)] bg-white/72 text-[var(--admin-ink-600)]"
      }`}
    >
      {submitError ? (
        <span className="font-medium">{submitError}</span>
      ) : hasUnsavedChanges ? (
        <span className="font-medium">Nem mentett módosítások</span>
      ) : savedMessage ? (
        <span className="font-medium">{savedMessage}</span>
      ) : (
        <span>Minden változás mentve</span>
      )}
    </div>
  );
}

function serializeSection(section: HTMLElement) {
  const values: string[] = [];

  section.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    FIELD_SELECTOR,
  ).forEach((field) => {
    if (field.disabled || !field.name) return;

    if (field instanceof HTMLInputElement) {
      if (["button", "file", "image", "reset", "submit"].includes(field.type)) {
        return;
      }

      if (field.type === "checkbox" || field.type === "radio") {
        values.push(`${field.name}:${field.checked ? field.value || "on" : "__unchecked__"}`);
        return;
      }
    }

    if (field instanceof HTMLSelectElement && field.multiple) {
      const selectedValues = Array.from(field.selectedOptions).map((option) => option.value);
      values.push(`${field.name}:${selectedValues.join(",")}`);
      return;
    }

    values.push(`${field.name}:${field.value}`);
  });

  return values.sort().join("|");
}
