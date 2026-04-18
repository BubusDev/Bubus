"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";

type SpecialtyAccordionContextValue = {
  accordionId: string;
  dirtySectionIds: Set<string>;
  hasUnsavedChanges: boolean;
  openSectionId: string | null;
  setOpenSectionId: (sectionId: string | null) => void;
};

const SpecialtyAccordionContext = createContext<SpecialtyAccordionContextValue | null>(null);

const SECTION_SELECTOR = "[data-specialty-section-id]";
const FIELD_SELECTOR = "input[name], textarea[name], select[name]";

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
}: {
  children: ReactNode;
  defaultOpenSectionId?: string;
  savedMessage?: string | null;
}) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const initialSectionStateRef = useRef<Map<string, string>>(new Map());
  const isConfirmedNavigationRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const [dirtySectionIds, setDirtySectionIds] = useState<Set<string>>(new Set());
  const [openSectionId, setOpenSectionId] = useState<string | null>(defaultOpenSectionId ?? null);
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

  function handleEditorChange() {
    window.requestAnimationFrame(recomputeDirtySections);
  }

  function handleEditorSubmit(_event: FormEvent<HTMLDivElement>) {
    isSubmittingRef.current = true;
  }

  return (
    <SpecialtyAccordionContext.Provider
      value={{
        accordionId: generatedId,
        dirtySectionIds,
        hasUnsavedChanges,
        openSectionId,
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

export function SpecialtyEditorSection({
  children,
  eyebrow,
  id,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  id: string;
  title: string;
}) {
  const { accordionId, dirtySectionIds, openSectionId, setOpenSectionId } =
    useSpecialtyAccordion();
  const isOpen = openSectionId === id;
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
        onClick={() => setOpenSectionId(isOpen ? null : id)}
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
          <span>{isOpen ? "Nyitva" : "Zárva"}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
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

function SpecialtyEditorSaveStatus({ savedMessage }: { savedMessage?: string | null }) {
  const { hasUnsavedChanges } = useSpecialtyAccordion();

  return (
    <div
      aria-live="polite"
      className={`mb-4 rounded-md border px-4 py-2.5 text-sm transition ${
        hasUnsavedChanges
          ? "border-[#bfd0ea] bg-[#eef3fb] text-[var(--admin-blue-700)]"
          : savedMessage
            ? "border-[#bdd7c8] bg-[#f2faf5] text-[#24533a]"
            : "border-[var(--admin-line-100)] bg-white/72 text-[var(--admin-ink-600)]"
      }`}
    >
      {hasUnsavedChanges ? (
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
