"use client";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";

import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";
import type { ConsentState } from "@/lib/cookie-consent-client";

const defaultState: ConsentState = {
  essential: true,
  statistics: false,
  marketing: false,
};

type ToggleRowProps = {
  title: string;
  description: string;
  providers: string;
  enabled: boolean;
  disabled?: boolean;
  onToggle?: () => void;
};

function ToggleRow({ title, description, providers, enabled, disabled = false, onToggle }: ToggleRowProps) {
  const descriptionId = useId();

  return (
    <div className="rounded-[1.5rem] border border-[#efd7e1] bg-[#fffafb] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-[30rem]">
          <div className="flex items-center gap-3">
            <h3 className="font-[family:var(--font-display)] text-[1.25rem] leading-tight text-[#2f1a27]">
              {title}
            </h3>
            {disabled ? (
              <span className="rounded-full bg-[#f7dbe6] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5168]">
                Mindig aktív
              </span>
            ) : null}
          </div>
          <p id={descriptionId} className="mt-2 text-sm leading-6 text-[#69485a]">
            {description}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#a47088]">
            Szolgáltatók: {providers}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-describedby={descriptionId}
          disabled={disabled}
          onClick={onToggle}
          className={`relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-[#d95587] focus:ring-offset-2 ${
            enabled ? "border-[#d95587] bg-[#d95587]" : "border-[#d7c3cd] bg-white"
          } ${disabled ? "cursor-not-allowed opacity-80" : ""}`}
        >
          <span
            className={`inline-block h-6 w-6 rounded-full bg-white shadow transition ${
              enabled ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export function CookieSettingsPanel() {
  const { consent, settingsOpen, closeSettings, setConsent } = useCookieConsent();
  const [draftState, setDraftState] = useState<ConsentState | null>(null);
  const draft = draftState ?? consent?.state ?? defaultState;

  useEffect(() => {
    if (!settingsOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSettings();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeSettings, consent, settingsOpen]);

  if (!settingsOpen) {
    return null;
  }

  const handleClose = () => {
    setDraftState(null);
    closeSettings();
  };

  const updateDraft = (updater: (current: ConsentState) => ConsentState) => {
    setDraftState((current) => updater(current ?? consent?.state ?? defaultState));
  };

  const saveConsent = (state: ConsentState) => {
    setDraftState(null);
    setConsent(state);
  };

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center bg-[#2f1a27]/45 p-4">
      <div
        className="absolute inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-settings-title"
        className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-[760px] overflow-y-auto rounded-[2rem] border border-[#efd6e0] bg-white p-6 shadow-[0_30px_80px_rgba(47,26,39,0.3)] sm:p-8"
    >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#af7795]">Cookie beállítások</p>
            <h2
              id="cookie-settings-title"
              className="mt-2 font-[family:var(--font-display)] text-[2rem] leading-tight text-[#2f1a27]"
            >
              Válassza ki, mely sütiket engedélyezi
            </h2>
            <p className="mt-3 max-w-[40rem] text-sm leading-6 text-[#69485a]">
              A szükséges sütik a webáruház alapvető működését szolgálják. A statisztikai és marketing
              sütik alapértelmezetten ki vannak kapcsolva, és csak az Ön jóváhagyása után aktiválódnak.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-[#ecd2dc] p-2 text-[#6f5160] transition hover:bg-[#fbf5f7] focus:outline-none focus:ring-2 focus:ring-[#d95587] focus:ring-offset-2"
            aria-label="Beállítások bezárása"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <ToggleRow
            title="Szükséges cookie-k"
            description="A weboldal alapvető működéséhez szükségesek, például a kosár, a bejelentkezés és a biztonsági folyamatok fenntartásához."
            providers="Chicks Jewelry, Stripe"
            enabled
            disabled
          />
          <ToggleRow
            title="Statisztikai cookie-k"
            description="Segítenek megérteni, hogyan használják a látogatók az oldalt. Az adatokat csak az Ön hozzájárulása után, anonimizált IP-kezeléssel gyűjtjük."
            providers="Google Analytics"
            enabled={draft.statistics}
            onToggle={() => updateDraft((current) => ({ ...current, statistics: !current.statistics }))}
          />
          <ToggleRow
            title="Marketing cookie-k"
            description="A kampányteljesítmény mérésére és a hirdetések személyre szabására szolgálnak. Ezek csak előzetes hozzájárulás után töltődnek be."
            providers="Google Ads"
            enabled={draft.marketing}
            onToggle={() => updateDraft((current) => ({ ...current, marketing: !current.marketing }))}
          />
        </div>

        <div className="mt-8 flex flex-col gap-2.5 border-t border-[#f1dde5] pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => saveConsent({ essential: true, statistics: false, marketing: false })}
            className="rounded-full border border-[#d8beca] px-5 py-3 text-sm font-medium text-[#432431] transition hover:bg-[#fff7fa] focus:outline-none focus:ring-2 focus:ring-[#d95587] focus:ring-offset-2"
          >
            Csak szükséges
          </button>
          <button
            type="button"
            onClick={() => saveConsent({ essential: true, statistics: true, marketing: true })}
            className="rounded-full border border-[#d95587] bg-[#d95587] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c54879] focus:outline-none focus:ring-2 focus:ring-[#d95587] focus:ring-offset-2"
          >
            Elfogadom az összeset
          </button>
          <button
            type="button"
            onClick={() => saveConsent(draft)}
            className="rounded-full border border-[#2f1a27] bg-[#2f1a27] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#24141e] focus:outline-none focus:ring-2 focus:ring-[#d95587] focus:ring-offset-2"
          >
            Beállítások mentése
          </button>
        </div>
      </div>
    </div>
  );
}
