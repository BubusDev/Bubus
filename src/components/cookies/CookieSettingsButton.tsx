"use client";

import type { ReactNode } from "react";

import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";

type CookieSettingsButtonProps = {
  children: ReactNode;
  className?: string;
};

export function CookieSettingsButton({ children, className }: CookieSettingsButtonProps) {
  const { openSettings } = useCookieConsent();

  return (
    <button type="button" onClick={openSettings} className={className}>
      {children}
    </button>
  );
}
