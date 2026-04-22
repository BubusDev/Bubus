"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  CONSENT_COOKIE_NAME,
  CONSENT_MAX_AGE_SECONDS,
  serializeStoredConsent,
  createStoredConsent,
  parseStoredConsentValue,
  CONSENT_VERSION,
  type ConsentState,
  type StoredConsent,
} from "@/lib/cookie-consent-client";

type Ctx = {
  consent: StoredConsent | null;
  isReady: boolean;
  setConsent: (state: ConsentState) => void;
  openSettings: () => void;
  settingsOpen: boolean;
  closeSettings: () => void;
  needsBanner: boolean;
  pendingReloadMessage: string | null;
};

const CookieConsentContext = createContext<Ctx | null>(null);

function readConsentFromDocumentCookie() {
  const entry = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));

  return parseStoredConsentValue(entry ? entry.slice(CONSENT_COOKIE_NAME.length + 1) : null);
}

function shouldReloadAfterConsentChange(previous: StoredConsent | null, next: ConsentState) {
  if (!previous) {
    return false;
  }

  return (previous.state.statistics && !next.statistics) || (previous.state.marketing && !next.marketing);
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);

  if (!ctx) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }

  return ctx;
}

export function CookieConsentProvider({
  children,
  initialConsent,
}: {
  children: ReactNode;
  initialConsent: StoredConsent | null;
}) {
  const [consent, setConsentState] = useState<StoredConsent | null>(() => {
    if (typeof document === "undefined") {
      return initialConsent;
    }

    return readConsentFromDocumentCookie() ?? initialConsent;
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingReloadMessage, setPendingReloadMessage] = useState<string | null>(null);
  const reloadTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (reloadTimeoutRef.current !== null) {
        window.clearTimeout(reloadTimeoutRef.current);
      }
    };
  }, []);

  const setConsent = (state: ConsentState) => {
    const previousConsent = consent;
    const stored = createStoredConsent(state);
    const secure = window.location.protocol === "https:" ? "; Secure" : "";

    document.cookie = `${CONSENT_COOKIE_NAME}=${serializeStoredConsent(stored)}; path=/; max-age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;

    setConsentState(stored);
    setSettingsOpen(false);

    window.dispatchEvent(new CustomEvent("consent:changed", { detail: state }));

    void fetch("/api/consent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        state,
        version: CONSENT_VERSION,
      }),
      keepalive: true,
    }).catch(() => {
      // Ignore logging failures. Consent UI must not block on audit logging.
    });

    if (shouldReloadAfterConsentChange(previousConsent, state)) {
      setPendingReloadMessage("A beállítások a következő oldalbetöltéskor lépnek életbe.");

      if (reloadTimeoutRef.current !== null) {
        window.clearTimeout(reloadTimeoutRef.current);
      }

      reloadTimeoutRef.current = window.setTimeout(() => {
        window.location.reload();
      }, 1200);

      return;
    }

    setPendingReloadMessage(null);
  };

  const isReady = true;
  const needsBanner = isReady && consent === null;

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        isReady,
        setConsent,
        openSettings: () => setSettingsOpen(true),
        closeSettings: () => setSettingsOpen(false),
        settingsOpen,
        needsBanner,
        pendingReloadMessage,
      }}
    >
      {children}
      {pendingReloadMessage ? (
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-[130] max-w-sm rounded-2xl border border-[#f0d5df] bg-white px-4 py-3 text-sm text-[#6b4255] shadow-[0_16px_40px_rgba(77,39,65,0.18)]"
        >
          {pendingReloadMessage}
        </div>
      ) : null}
    </CookieConsentContext.Provider>
  );
}
