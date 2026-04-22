export type ConsentCategory = "essential" | "statistics" | "marketing";

export type ConsentState = {
  essential: true;
  statistics: boolean;
  marketing: boolean;
};

export type StoredConsent = {
  version: number;
  consentedAt: string;
  expiresAt: string;
  state: ConsentState;
};

export const CONSENT_COOKIE_NAME = "chicks_cookie_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_DURATION_DAYS = 365;
export const CONSENT_MAX_AGE_SECONDS = CONSENT_DURATION_DAYS * 24 * 60 * 60;

export function createStoredConsent(state: ConsentState, now = new Date()): StoredConsent {
  const expiresAt = new Date(now.getTime() + CONSENT_DURATION_DAYS * 24 * 60 * 60 * 1000);

  return {
    version: CONSENT_VERSION,
    consentedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    state,
  };
}

export function isStoredConsentValid(value: StoredConsent) {
  return value.version === CONSENT_VERSION && new Date(value.expiresAt) > new Date();
}

export function parseStoredConsentValue(raw: string | null | undefined) {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as StoredConsent;
    return isStoredConsentValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function serializeStoredConsent(value: StoredConsent) {
  return encodeURIComponent(JSON.stringify(value));
}
